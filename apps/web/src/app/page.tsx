import { redirect } from "next/navigation";

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

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6">
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

          <div className="mt-6 sm:hidden">
            <ButtonLink
              href="/sign-up"
              variant="primary"
              className="w-full px-5 py-3 text-center"
            >
              Create account
            </ButtonLink>
          </div>

          <div className="mt-6 hidden sm:flex sm:flex-wrap sm:gap-3">
            <ButtonLink
              href="/sign-up"
              variant="primary"
              className="px-5 py-3 text-center"
            >
              Create account
            </ButtonLink>
            <ButtonLink href="/sign-in" className="px-5 py-3 text-center">
              Sign in
            </ButtonLink>
          </div>
        </SurfaceCard>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {features.map((item) => (
            <FeatureCard key={item.title} title={item.title} body={item.body} />
          ))}
        </div>

        <InfoBlock title="Why this feels mobile-first">
          <ul className="space-y-3 text-sm text-[var(--text-body)]">
            <li>Realtime walk sessions with quick privacy controls</li>
            <li>Map discovery designed for people already outside</li>
            <li>Groups and chat built around on-the-go coordination</li>
            <li>Primary actions stay reachable without complex menus</li>
          </ul>
        </InfoBlock>
      </section>

      <div className="sticky bottom-4 mt-auto pt-2 sm:hidden">
        <SurfaceCard strong className="p-3">
          <div className="grid grid-cols-2 gap-3">
            <ButtonLink
              href="/sign-up"
              variant="primary"
              className="w-full px-4 py-3 text-center"
            >
              Join now
            </ButtonLink>
            <ButtonLink href="/sign-in" className="w-full px-4 py-3 text-center">
              Sign in
            </ButtonLink>
          </div>
        </SurfaceCard>
      </div>
    </main>
  );
}
