import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type SurfaceCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  strong?: boolean;
};

export function SurfaceCard({
  children,
  className,
  strong = false,
  ...props
}: SurfaceCardProps) {
  return (
    <section
      className={cn(
        strong ? "glass-panel-strong" : "glass-panel",
        "rounded-[32px]",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}
