import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  body: string;
  meta?: ReactNode;
};

export function FeatureCard({ title, body, meta }: FeatureCardProps) {
  return (
    <div className="rounded-[24px] border border-[rgba(123,167,209,0.2)] bg-white/46 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--text-strong)]">
          {title}
        </h3>
        {meta}
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{body}</p>
    </div>
  );
}
