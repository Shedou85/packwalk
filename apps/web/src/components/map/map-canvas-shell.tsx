import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";

type MapCanvasShellProps = {
  hasActiveWalk: boolean;
  hasToken: boolean;
};

export function MapCanvasShell({
  hasActiveWalk,
  hasToken,
}: MapCanvasShellProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="relative min-h-[340px] bg-[linear-gradient(180deg,rgba(212,229,245,0.82)_0%,rgba(183,209,231,0.9)_100%)]">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.72),transparent_22%),radial-gradient(circle_at_80%_26%,rgba(121,196,235,0.4),transparent_18%),radial-gradient(circle_at_56%_74%,rgba(255,255,255,0.42),transparent_18%),linear-gradient(135deg,rgba(255,255,255,0.16)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.16)_50%,rgba(255,255,255,0.16)_75%,transparent_75%,transparent)] bg-[length:120px_120px]" />
        </div>

        <div className="absolute left-[16%] top-[22%] h-14 w-14 rounded-full border border-white/80 bg-white/38 backdrop-blur-md" />
        <div className="absolute right-[12%] top-[18%] h-20 w-20 rounded-full border border-white/70 bg-[rgba(130,200,232,0.2)] backdrop-blur-md" />
        <div className="absolute bottom-[22%] left-[20%] h-16 w-16 rounded-full border border-white/70 bg-[rgba(255,255,255,0.24)] backdrop-blur-md" />
        <div className="absolute bottom-[18%] right-[18%] h-24 w-24 rounded-full border border-white/70 bg-[rgba(142,214,205,0.22)] backdrop-blur-md" />

        <div className="absolute left-[24%] top-[46%] h-4 w-4 rounded-full bg-[var(--accent-strong)] shadow-[0_0_0_8px_rgba(77,168,218,0.18)]" />
        <div className="absolute right-[28%] top-[38%] h-3 w-3 rounded-full bg-white/86 shadow-[0_0_0_6px_rgba(255,255,255,0.2)]" />
        <div className="absolute left-[48%] bottom-[28%] h-3 w-3 rounded-full bg-white/86 shadow-[0_0_0_6px_rgba(255,255,255,0.2)]" />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <Pill>{hasToken ? "Map token ready" : "Map shell mode"}</Pill>
          <Pill>{hasActiveWalk ? "Live presence on" : "No live walk yet"}</Pill>
        </div>

        <div className="absolute inset-x-4 bottom-4">
          <div className="rounded-[24px] border border-white/70 bg-white/68 p-4 shadow-[0_20px_44px_rgba(44,72,102,0.14)] backdrop-blur-xl">
            <p className="text-sm font-semibold text-[var(--text-strong)]">
              Live map preview
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
              This first version focuses on the map surface, live session context,
              and quick scanning on mobile. Nearby walkers will plug in next once
              we open visibility-safe read policies.
            </p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
