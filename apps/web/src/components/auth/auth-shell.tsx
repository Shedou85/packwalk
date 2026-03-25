import type { ReactNode } from "react";

import { SurfaceCard } from "@/components/ui/surface-card";

type AuthShellProps = {
  children: ReactNode;
  side: ReactNode;
  reverse?: boolean;
};

export function AuthShell({ children, side, reverse = false }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 sm:px-10">
      <div
        className={`grid w-full gap-6 ${reverse ? "lg:grid-cols-[1.05fr_0.95fr]" : "lg:grid-cols-[0.9fr_1.1fr]"}`}
      >
        {reverse ? (
          <>
            <SurfaceCard strong className="p-6 sm:p-8">
              {children}
            </SurfaceCard>
            <SurfaceCard className="p-8">{side}</SurfaceCard>
          </>
        ) : (
          <>
            <SurfaceCard className="hidden p-8 lg:block">{side}</SurfaceCard>
            <SurfaceCard strong className="p-6 sm:p-8">
              {children}
            </SurfaceCard>
          </>
        )}
      </div>
    </main>
  );
}
