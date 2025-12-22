"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollDownButtonProps {
  visible: boolean;
  onClick: () => void;
}

export default function ScrollDownButton({
  visible,
  onClick,
}: ScrollDownButtonProps) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute bottom-28 right-4 z-50",
        "rounded-full bg-cyan-600 p-2 shadow-lg",
        "hover:bg-cyan-700 transition"
      )}
      aria-label="Scroll to bottom"
    >
      <ChevronDown className="h-5 w-5 text-white" />
    </button>
  );
}
