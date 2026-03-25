import type { ReactNode } from "react";

import { SurfaceCard } from "@/components/ui/surface-card";

type InfoBlockProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function InfoBlock({ title, children, className }: InfoBlockProps) {
  return (
    <SurfaceCard className={`rounded-[28px] p-6 ${className ?? ""}`}>
      <p className="text-sm font-semibold text-[var(--text-strong)]">{title}</p>
      <div className="mt-4">{children}</div>
    </SurfaceCard>
  );
}
