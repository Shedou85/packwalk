import { ReactNode } from "react";

import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";
import { cn } from "@/lib/cn";

type ProfileShortcutCardProps = {
  title: string;
  description: string;
  badge?: string;
  tone?: "default" | "accent";
  action: ReactNode;
};

export function ProfileShortcutCard({
  title,
  description,
  badge,
  tone = "default",
  action,
}: ProfileShortcutCardProps) {
  return (
    <SurfaceCard
      className={cn(
        "p-5 sm:p-6",
        tone === "accent" && "border-[rgba(77,168,218,0.24)] bg-white/72",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text-strong)]">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            {description}
          </p>
        </div>
        {badge ? <Pill>{badge}</Pill> : null}
      </div>

      <div className="mt-5">{action}</div>
    </SurfaceCard>
  );
}
