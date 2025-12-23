# Amaze — AI PDF Summarizer

An advanced AI-powered PDF summarization platform built with Next.js, LangChain, Google Gemini, Pinecone, and UploadThing. Users can securely upload PDFs, automatically extract their contents, and generate concise, high‑quality summaries and Q&A. The app features a modern, responsive UI built with Tailwind CSS and shadcn/ui, typed APIs with tRPC, and a PostgreSQL database via Prisma.

---

## Features

- **Secure Auth**: Kinde OAuth authentication with protected routes
- **Smart Uploads**: UploadThing for seamless PDF uploads with server callbacks
- **PDF Processing**: Page‑level extraction via LangChain `PDFLoader`
- **Embeddings + Search**: Gemini embeddings (normalized) stored in Pinecone namespaces
- **AI Answers**: Context‑aware responses using Gemini 2.5 Flash
- **Chat History**: Persist user/assistant messages per file
- **Dashboard**: Manage uploaded files, monitor processing status, delete files
- **Responsive UI**: Tailwind + shadcn/ui components and modern UX patterns

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI**: shadcn/ui, Radix UI primitives, `lucide-react`
- **State & Data**: tRPC 11, TanStack React Query
- **AI/LLM**: LangChain, Google Gemini (`@google/genai`, `@langchain/google-genai`), AI SDKs for OpenAI/Anthropic (available)
- **Vector DB**: Pinecone (`@pinecone-database/pinecone`)
- **Upload**: UploadThing (`uploadthing`, `@uploadthing/react`)
- **Database**: PostgreSQL + Prisma (adapter‑pg)
- **Validation**: Zod
- **PDF**: `react-pdf`, `pdf-parse`

---

## Project Structure

```
Amaze/
├── app/
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Landing/dashboard
│   ├── _trpc/
│   │   └── client.ts                  # tRPC React client
│   ├── api/
│   │   ├── auth/[kindeAuth]/route.ts  # Kinde auth handler
│   │   ├── message/route.ts           # POST: AI Q&A for a file
│   │   ├── trpc/[trpc]/route.ts       # tRPC HTTP endpoint
│   │   └── uploadthing/
│   │       ├── core.ts                # UploadThing router + PDF ingest
│   │       └── route.ts               # UploadThing GET/POST route handler
│   ├── auth-callback/page.tsx         # Auth callback page
│   ├── dashboard/page.tsx             # Files dashboard
│   └── [fileid]/page.tsx              # File detail + chat
├── components/
│   ├── ui/                            # shadcn/ui primitives
│   ├── chat/                          # Chat components
│   ├── PdfRenderer.tsx                # PDF viewer (server)
│   ├── PdfRendererClient.tsx          # PDF viewer (client)
│   ├── PdfFullscreen.tsx              # Fullscreen reader
│   └── UploadButton.tsx               # UploadThing button
├── config/infinite-query.ts           # Query pagination config
├── lib/
│   ├── index.ts                       # Prisma client (adapter-pg)
│   ├── pinecone.ts                    # Pinecone client
│   ├── uploadthing.ts                 # UploadThing helpers
│   ├── utils.ts                       # Utility functions
│   └── validators/sendMessageValidator.ts # Zod validator
├── prisma/
│   └── schema.prisma                  # Prisma schema (PostgreSQL)
├── trpc/
│   ├── trpc.ts                        # tRPC init + auth middleware
│   └── index.ts                       # App router (files, messages)
├── public/                            # Static assets
├── tailwind/postcss/eslint configs
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database (Neon/Cloud or local)
- Pinecone account + index
- Google Gemini API key
- Kinde OAuth application
- UploadThing account

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd Amaze
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`

   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:port/db

   # Auth (Kinde)
   KINDE_SITE_URL=
   KINDE_ISSUER_URL=
   KINDE_CLIENT_ID=
   KINDE_CLIENT_SECRET=
   KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/auth-callback
   KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000

   # Google Gemini
   GOOGLE_GENERATIVE_AI_API_KEY=

   # Pinecone
   PINECONE_API_KEY=
   # Ensure your Pinecone index exists and matches code usage
   # e.g. index name: "amaze" (see lib/pinecone.ts)

   # UploadThing
   UPLOADTHING_SECRET=
   UPLOADTHING_APP_ID=

   # Optional: Stripe (planned/present in schema)
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   ```

4. Run database migrations (after adjusting `prisma/schema.prisma` if needed)

   ```bash
   npx prisma migrate dev
   ```

5. Run the development server

   ```bash
   npm run dev
   ```

6. Open the app
   - http://localhost:3000

---

## API Endpoints

### Auth

- **GET `/api/auth/[kindeAuth]`** — Kinde Next.js auth handler (login/register/logout via redirects in `next.config.ts`)

### Uploads

- **GET/POST `/api/uploadthing`** — UploadThing route handler
- Upload router: `pdfUploader` (single PDF up to 32MB) with authenticated middleware

### Messages

- **POST `/api/message`** — Ask a question about a PDF. Body:
  ```json
  {
    "fileId": "<file-id>",
    "message": "<user question>"
  }
  ```
  - Auth required; stores user message, performs Pinecone similarity search, and returns AI answer

### tRPC

- **GET/POST `/api/trpc`** — tRPC endpoint
  - `authCallback` — ensures a `User` record exists post‑auth
  - `getUserFiles` — list files for authenticated user
  - `deleteFile` — delete a file by id
  - `getFile` — fetch file by key
  - `getFileUploadStatus` — poll file processing status
  - `getFileMessages` — paginated messages for a file

---

## Database Schemas (Prisma)

### `User`

```prisma
id                String   @id @unique
email             String   @unique
files             File[]
Message           Message[]
stripeCustomerId  String?  @unique @map("stripe_customer_id")
stripeSubscriptionId String? @unique @map("stripe_subscription_id")
stripePriceId     String?  @map("stripe_price_id")
stripeCurrentPeriodEnd DateTime? @map("stripe_current_period_end")
```

### `File`

```prisma
id           String   @id @unique @default(cuid())
name         String
uploadStatus UploadStatus @default(PENDING)
url          String
key          String
messages     Message[]
createdAt    DateTime @default(now())
updatedAt    DateTime @updatedAt
userId       String?
User         User?    @relation(fields: [userId], references: [id])
```

### `Message`

```prisma
id            String   @id @default(cuid())
text          String   @db.Text()
isUserMessage Boolean
createdAt     DateTime @default(now())
updatedAt     DateTime @updatedAt
userId        String?
fileId        String?
User          User?    @relation(fields: [userId], references: [id])
File          File?    @relation(fields: [fileId], references: [id])
```

### `UploadStatus`

```prisma
enum UploadStatus { PENDING PROCESSING FAILED SUCCESS }
```

---

## Key Features Explained

### Upload & Ingest

- Auth‑gated UploadThing router (`pdfUploader`) creates a `File` with `PROCESSING` status
- Fetches UFS URL, loads pages via LangChain `PDFLoader`, vectors computed with Gemini
- Normalizes embedding vectors and upserts to Pinecone under a per‑file namespace
- Updates `uploadStatus` to `SUCCESS` or `FAILED`

### Retrieval‑Augmented Answers

- On question: store user message, embed query, search Pinecone for top‑K context
- Build short history + context prompt, generate answer with Gemini 2.5 Flash
- Persist assistant reply

### tRPC + Auth

- Kinde server session middleware enforces auth on private procedures
- `authCallback` ensures `User` record exists for authenticated sessions

### UI/UX

- Tailwind v4 + shadcn/ui primitives for consistent, accessible components
- PDF viewer components for reading and full‑screen experiences

---

## Development Notes

### Known Patterns

1. Normalize Gemini embeddings (e.g., slice to 768 dims) before Pinecone upsert
2. Use per‑file namespaces in Pinecone to scope search results
3. Keep chat history short to limit token usage while preserving context
4. Validate inputs with Zod (`sendMessageValidator`) on message POST

### Common Issues & Solutions

| Issue                        | Solution                                                              |
| ---------------------------- | --------------------------------------------------------------------- |
| Pinecone index name mismatch | Ensure index name in code and dashboard match (see `lib/pinecone.ts`) |
| Unauthorized API calls       | Verify Kinde env vars and session; protect routes via tRPC middleware |
| Missing AI responses         | Confirm `GOOGLE_GENERATIVE_AI_API_KEY` and model names are valid      |
| Upload failures              | Check UploadThing credentials and file size/type constraints          |

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

---

## Future Enhancements

- [ ] Stripe billing for premium plans
- [ ] Summarization presets (bullets, technical, executive)
- [ ] Multi‑file cross‑document search
- [ ] Better citation formatting and page anchors
- [ ] Export summaries to PDF/Markdown
- [ ] Fine‑grained role‑based access controls

---

## Contributing

Contributions are welcome! Please:

1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -am "Add your feature"`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Open a Pull Request

---

## Acknowledgments

- Next.js — https://nextjs.org
- Kinde — https://kinde.com
- LangChain — https://www.langchain.com
- Google Gemini — https://deepmind.google/technologies/gemini
- Pinecone — https://www.pinecone.io
- UploadThing — https://uploadthing.com
- shadcn/ui — https://ui.shadcn.com
- Tailwind CSS — https://tailwindcss.com
- tRPC — https://trpc.io
- Prisma — https://www.prisma.io

# Amaze Project

## Overview

Amaze is a modern web application built using Next.js, designed to provide a seamless user experience with advanced features and integrations.

## Technologies Used

### Frontend

- **Next.js**: A React framework for server-rendered applications.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Tailwind CSS**: A utility-first CSS framework for styling.

### Backend

- **Prisma**: An ORM for Node.js and TypeScript, used for database access.
- **PostgreSQL**: A powerful, open-source relational database.

### Libraries and Dependencies

- **@google/genai**: Google’s generative AI SDK.
- **@hookform/resolvers**: Resolver library for React Hook Form.
- **@kinde-oss/kinde-auth-nextjs**: Authentication library for Next.js applications.
- **@langchain/classic**: Classic library for LangChain.
- **@langchain/community**: Community resources for LangChain.
- **@langchain/core**: Core functionalities of LangChain.

## Configuration Files

- **`tsconfig.json`**: TypeScript configuration file.
- **`next.config.ts`**: Next.js configuration file for custom settings and redirects.
- **`prisma/schema.prisma`**: Prisma schema file defining the data model and database connection.

## Getting Started

To get started with the project, clone the repository and install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```
