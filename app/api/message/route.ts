import db from "@/lib";
import { sendMessageValidator } from "@/lib/validators/sendMessageValidator";
import { GoogleGenAI } from "@google/genai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
import { pinecone } from "@/lib/pinecone";
// import { streamText } from "ai";
// import { google } from "@ai-sdk/google";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) return new Response("Unauthorized", { status: 401 });
    const { id: userId } = user;

    const { fileId, message } = sendMessageValidator.parse(body);

    const file = await db.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });

    if (!file) return new Response("Not found", { status: 404 });

    await db.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId,
        fileId,
      },
    });

    // vectorize the message
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    });

    const embedQuery = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: message,
      taskType: "RETRIEVAL_QUERY",
    });
    function normalizeVector(vec: number[]) {
      const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
      return vec.map((v) => v / norm);
    }

    const queryVector = normalizeVector(
      embedQuery.embeddings![0].values!.slice(0, 768)
    );

    // Query Pinecone
    const pineconeIndex = pinecone.index("gemini");
    const results = await pineconeIndex.namespace(fileId).query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const context = results.matches?.map((m) => m.metadata?.text).join("\n\n");

    const prevMessages = await db.message.findMany({
      where: {
        fileId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 6,
    });

    const formattedMessages = prevMessages.map((msg) => ({
      role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
      content: msg.text,
    }));
    const formattedPrevMessages = formattedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const systemInstruction =
      "Use the provided context and previous conversation to answer the user's question in markdown format. If the answer is not present, say that you don't know.";

    const contents = [
      {
        role: "user",
        parts: [{ text: `CONTEXT:\n${context}` }],
      },
      ...prevMessages.reverse().map((m) => ({
        role: m.isUserMessage ? "user" : "model",
        parts: [{ text: m.text }],
      })),
      {
        role: "user",
        parts: [{ text: `USER QUESTION:\n${message}` }],
      },
    ];

    // AI response(problem)
    const completion = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingBudget: 0, // faster + cheaper
        },
      },
    });

    const aiResponse = completion.text ?? "No response generated.";

    await db.message.create({
      data: {
        text: aiResponse,
        isUserMessage: false,
        userId,
        fileId,
      },
    });
    console.log("AI Response:", aiResponse);
    return Response.json({ answer: aiResponse });
  } catch (error) {
    return new Response(`Internal Server Error: ${error}`, { status: 500 });
  }
};
