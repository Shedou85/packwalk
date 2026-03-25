import { ReactNode } from "react";

import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/cn";

type DashboardActionTileProps = {
  eyebrow: string;
  title: string;
  description: string;
  action: ReactNode;
  className?: string;
};

export function DashboardActionTile({
  eyebrow,
  title,
  description,
  action,
  className,
}: DashboardActionTileProps) {
  return (
    <SurfaceCard className={cn("p-4 sm:p-5", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
        {eyebrow}
      </p>
      <p className="mt-3 text-base font-semibold text-[var(--text-strong)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
        {description}
      </p>
      <div className="mt-4">{action}</div>
    </SurfaceCard>
  );
}
