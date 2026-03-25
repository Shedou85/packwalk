import { ButtonLink } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { InfoBlock } from "@/components/ui/info-block";
import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";
import { createClient } from "@/lib/supabase/server";

const features = [
  {
    title: "Go for a walk",
    body: "Start a live session with exact or approximate sharing.",
  },
  {
    title: "Meet nearby",
    body: "Discover walkers on the map based on visibility rules.",
  },
  {
    title: "Coordinate groups",
    body: "Use private or public group chat with live ETA context.",
  },
];

const stack = [
  "Next.js",
  "TypeScript",
  "Tailwind",
  "TanStack Query",
  "Zustand",
  "Supabase",
  "Mapbox",
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-6">
      <SurfaceCard
        strong
        className="flex items-center justify-between rounded-[28px] px-4 py-4 sm:px-5"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
            PackWalk
          </p>
          <h1 className="mt-1 text-lg font-semibold text-[var(--text-strong)] sm:text-2xl">
            Realtime dog-walking meetups.
          </h1>
        </div>
        <Pill className="px-3 py-1.5 text-[11px] sm:px-4 sm:py-2 sm:text-sm">
          MVP setup
        </Pill>
      </SurfaceCard>

      <section className="flex flex-1 flex-col gap-4 py-4 sm:gap-6 sm:py-6">
        <SurfaceCard className="p-5 sm:p-8">
          <Pill className="bg-white/52 text-[var(--text-body)]">
            Live map + groups + privacy-first presence
          </Pill>

          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-5xl">
            See who is walking now and meet nearby dog owners without planning
            from a desktop.
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-body)] sm:text-lg">
            PackWalk is built for people already outside with their phone in
            hand. Go live, see who is nearby, coordinate a meetup, and keep
            location sharing under your control.
          </p>

          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <ButtonLink
              href={user ? "/dashboard" : "/sign-up"}
              variant="primary"
              className="w-full px-5 py-3 text-center sm:w-auto"
            >
              {user ? "Open dashboard" : "Create account"}
            </ButtonLink>
            <ButtonLink
              href={user ? "/dashboard" : "/sign-in"}
              className="w-full px-5 py-3 text-center sm:w-auto"
            >
              {user ? "View session" : "Sign in"}
            </ButtonLink>
          </div>
        </SurfaceCard>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {features.map((item) => (
            <FeatureCard key={item.title} title={item.title} body={item.body} />
          ))}
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <InfoBlock title="Why this feels mobile-first">
            <ul className="space-y-3 text-sm text-[var(--text-body)]">
              <li>Realtime walk sessions with quick privacy controls</li>
              <li>Map discovery designed for people already outside</li>
              <li>Groups and chat built around on-the-go coordination</li>
              <li>Primary actions stay reachable without complex menus</li>
            </ul>
          </InfoBlock>

          <InfoBlock title="Current stack">
            <div className="flex flex-wrap gap-2">
              {stack.map((item) => (
                <Pill key={item}>{item}</Pill>
              ))}
            </div>
          </InfoBlock>

          <InfoBlock title="Backend connection">
            <p className="text-sm leading-6 text-[var(--text-body)]">
              Supabase environment variables are configured and SSR helpers are
              ready for auth, profiles, and walk session queries.
            </p>
            <div className="mt-4 rounded-2xl border border-[rgba(123,167,209,0.28)] bg-white/64 px-4 py-3 text-sm text-[var(--text-strong)]">
              {user
                ? `Signed in as ${user.email ?? "an authenticated user"}`
                : "No active session yet. Auth wiring is ready."}
            </div>
          </InfoBlock>

          <div className="rounded-[28px] border border-dashed border-[rgba(123,167,209,0.4)] bg-white/34 p-5 sm:p-6">
            <p className="text-sm font-semibold text-[var(--text-strong)]">
              Next up
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
              Build the first live map and `Go for a walk` flow around the same
              mobile-first logic.
            </p>
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 mt-auto pt-2 sm:hidden">
        <SurfaceCard strong className="p-3">
          <div className="grid grid-cols-2 gap-3">
            <ButtonLink
              href={user ? "/dashboard" : "/sign-up"}
              variant="primary"
              className="w-full px-4 py-3 text-center"
            >
              {user ? "Dashboard" : "Join now"}
            </ButtonLink>
            <ButtonLink
              href={user ? "/dashboard" : "/sign-in"}
              className="w-full px-4 py-3 text-center"
            >
              {user ? "Session" : "Sign in"}
            </ButtonLink>
          </div>
        </SurfaceCard>
      </div>
    </main>
  );
}
