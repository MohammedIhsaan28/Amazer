import db from "@/lib/index";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pinecone } from "@/lib/pinecone";
import { GoogleGenAI } from "@google/genai";


const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user?.id) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }: any) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.ufsUrl,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        const response = await fetch(file.ufsUrl);
        const blob = await response.blob();
        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();
        const pagesAmt = pageLevelDocs.length;

        console.log("Pages:", pagesAmt);

        //vectorize and index entire document

        const pineconeIndex = pinecone.index("gemini");

        const ai = new GoogleGenAI({
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
        });

        const texts = pageLevelDocs.map((doc) => doc.pageContent);

        const embedResponse = await ai.models.embedContent({
          model: "gemini-embedding-001",
          contents: texts,
          taskType: "RETRIEVAL_DOCUMENT",
        });

        // Normalize vectors (required for dimensions other than 3072)
        function normalizeVector(vec: number[]): number[] {
          const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
          return vec.map((v) => v / norm);
        }

        const vectors = embedResponse.embeddings!.map((e, i) => ({
          id: `${createdFile.id}-page-${i}`,
          values: normalizeVector(e.values!.slice(0, 768)),
          metadata: {
            fileId: createdFile.id,
            page: i + 1,
            text: texts[i],
          },
        }));

        await pineconeIndex.namespace(createdFile.id).upsert(vectors);

        console.log("Stored in Pinecone successfully");

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
      } catch (err) {
        console.error("Error during document processing:", err);
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });
      }

      return { success: true, userId: metadata.userId, file };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
