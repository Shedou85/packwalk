import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type PillProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Pill({ children, className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-[rgba(123,167,209,0.28)] bg-white/56 px-3 py-1 text-xs font-medium text-[var(--text-strong)]",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
