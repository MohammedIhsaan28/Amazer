import { cn } from "@/lib/utils";

export default function Maxwidthwrapper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-4 md:px-20 lg:px-0",
        className
      )}
    >
      {children}
    </div>
  );
}