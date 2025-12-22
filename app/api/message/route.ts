import db from "@/lib";
import { sendMessageValidator } from "@/lib/validators/sendMessageValidator";
import { GoogleGenAI } from "@google/genai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";
import { pinecone } from "@/lib/pinecone";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { fileId, message } = sendMessageValidator.parse(body);

    const file = await db.file.findFirst({
      where: { id: fileId, userId: user.id },
    });

    if (!file) {
      return new Response("Not found", { status: 404 });
    }

    // Save user message
    await db.message.create({
      data: {
        text: message,
        isUserMessage: true,
        userId: user.id,
        fileId,
      },
    });

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    });

    // Embed query
    const embedQuery = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: message,
      taskType: "RETRIEVAL_QUERY",
    });

    const normalizeVector = (vec: number[]) => {
      const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
      return vec.map((v) => v / norm);
    };

    const queryVector = normalizeVector(
      embedQuery.embeddings![0].values!.slice(0, 768)
    );

    // Pinecone search
    const pineconeIndex = pinecone.index("gemini");
    const results = await pineconeIndex.namespace(fileId).query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const context =
      results.matches?.map((m) => m.metadata?.text).join("\n\n") ?? "";

    // Previous messages (short history)
    const prevMessages = await db.message.findMany({
      where: { fileId },
      orderBy: { createdAt: "asc" },
      take: 6,
    });

    const contents = [
      ...prevMessages.map((m) => ({
        role: m.isUserMessage ? "user" : "model",
        parts: [{ text: m.text }],
      })),
      {
        role: "user",
        parts: [
          {
            text: `CONTEXT:\n${context}\n\nUSER QUESTION:\n${message}`,
          },
        ],
      },
    ];

    const completion = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: `
You are an expert teacher and explainer.

Explain everything in full detail:
- Start from basics
- Do not skip steps
- Explain intuition and reasoning
- Use examples
- Use markdown formatting
- Explain code line by line when present
If a concept can be misunderstood, explain it twice:
1) Simple intuition
2) Formal explanation
If the answer is not explicitly in the CONTEXT,
say: "I don't know based on the given context."


    `.trim(),
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const aiResponse = completion.text ?? "No response generated.";

    await db.message.create({
      data: {
        text: aiResponse,
        isUserMessage: false,
        userId: user.id,
        fileId,
      },
    });

    return Response.json({ answer: aiResponse });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
