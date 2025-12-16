"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";
interface PdfFullScreenProps {
  fileUrl: string;
}
export default function PdfFullscreen({ fileUrl }: PdfFullScreenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { width, ref } = useResizeDetector();
  const [numPages, setNumPages] = useState<number>();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button  aria-label="fullscreen" variant={"ghost"} className="gap-1.5">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent fullscreen className="w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] md:w-[75vw] md:h-auto md:max-h-full">
        <DialogTitle>Your PDF</DialogTitle>
        <DialogDescription>Your PDF in Fullscreen</DialogDescription>

        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={(error) => {
                console.error("PDF load error:", error);
                toast.error("Error loading PDF. Please try again.");
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={fileUrl}
              className="max-h-full max-w-full"
            >
              {new Array(numPages).fill(0).map((_, idx) => (
                <Page
                  key={`page_${idx + 1}`}
                  width={width ? width : 1}
                  pageNumber={idx + 1}
                />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
}
