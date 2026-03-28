import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";

type ProfileConnectionItem = {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
};

type ProfileConnectionListProps = {
  title: string;
  description: string;
  badge?: string;
  emptyText: string;
  items: ProfileConnectionItem[];
};

export function ProfileConnectionList({
  title,
  description,
  badge,
  emptyText,
  items,
}: ProfileConnectionListProps) {
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
        {badge ? <Pill>{badge}</Pill> : null}
      </div>

      {items.length ? (
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-[22px] border border-white/70 bg-white/65 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-strong)]">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--text-soft)]">
                    {item.subtitle}
                  </p>
                </div>
                {item.meta ? <Pill>{item.meta}</Pill> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[22px] border border-dashed border-[rgba(123,167,209,0.28)] bg-white/42 px-4 py-4">
          <p className="text-sm leading-6 text-[var(--text-body)]">{emptyText}</p>
        </div>
      )}
    </SurfaceCard>
  );
}
