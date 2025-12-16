// components/PdfRenderer.tsx
"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const PdfRendererClient = dynamic(() => import('./PdfRendererClient'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[80vh]">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
    </div>
  ),
});

interface PdfRendererProps {
  url: string;
}

export default function PdfRenderer({ url }: PdfRendererProps) {
  return <PdfRendererClient url={url} />;
}