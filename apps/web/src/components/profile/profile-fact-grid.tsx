import { SurfaceCard } from "@/components/ui/surface-card";

type ProfileFact = {
  label: string;
  value: string;
};

type ProfileFactGridProps = {
  title: string;
  description: string;
  facts: ProfileFact[];
  badge?: string;
};

export function ProfileFactGrid({
  title,
  description,
  facts,
  badge,
}: ProfileFactGridProps) {
  return (
    <SurfaceCard className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text-strong)]">
            {title}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            {description}
          </p>
        </div>
        {badge ? (
          <div className="rounded-full border border-[rgba(123,167,209,0.28)] bg-white/64 px-3 py-1 text-xs font-medium text-[var(--text-strong)]">
            {badge}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {facts.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-white/70 bg-white/65 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
              {item.label}
            </p>
            <p className="mt-2 text-sm text-[var(--text-strong)]">{item.value}</p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
