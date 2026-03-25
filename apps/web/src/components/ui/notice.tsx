import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

const noticeVariants = {
  success:
    "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]",
  error: "border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error-text)]",
};

type NoticeProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: keyof typeof noticeVariants;
};

export function Notice({
  children,
  className,
  variant = "success",
  ...props
}: NoticeProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        noticeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
