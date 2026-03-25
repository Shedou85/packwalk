type DashboardStatChipProps = {
  label: string;
  value: string;
};

export function DashboardStatChip({
  label,
  value,
}: DashboardStatChipProps) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/60 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.36)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-[var(--text-strong)]">
        {value}
      </p>
    </div>
  );
}
