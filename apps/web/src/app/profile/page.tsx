import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { appNavItems } from "@/components/navigation/app-nav-items";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { ProfileFactGrid } from "@/components/profile/profile-fact-grid";
import { ProfileShortcutCard } from "@/components/profile/profile-shortcut-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";
import { ensureProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  await ensureProfile(user);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, city, default_visibility, default_location_precision")
    .eq("id", user.id)
    .single();

  const [
    { count: dogsCount },
    { count: activeWalkCount },
    { count: followingCount },
    { count: followersCount },
  ] = await Promise.all([
    supabase
      .from("dogs")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id),
    supabase
      .from("walk_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active"),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id),
  ]);

  const accountFacts = [
    {
      label: "Email",
      value: user.email ?? "No email",
    },
    {
      label: "Username",
      value: profile?.username ?? "Not set yet",
    },
    {
      label: "Display name",
      value: profile?.display_name ?? "Not set yet",
    },
    {
      label: "City",
      value: profile?.city ?? "Not set yet",
    },
  ];

  const preferences = [
    {
      label: "Default visibility",
      value: profile?.default_visibility ?? "followers",
    },
    {
      label: "Location precision",
      value: profile?.default_location_precision ?? "approximate",
    },
    {
      label: "Dogs",
      value: `${dogsCount ?? 0} saved`,
    },
    {
      label: "Active walks",
      value: `${activeWalkCount ?? 0} live`,
    },
    {
      label: "Following",
      value: `${followingCount ?? 0} walkers`,
    },
    {
      label: "Followers",
      value: `${followersCount ?? 0} walkers`,
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6">
      <SurfaceCard
        strong
        className="flex flex-col gap-4 rounded-[28px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
            PackWalk profile
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
            Account, privacy, and walking defaults.
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>{dogsCount ?? 0} dogs</Pill>
            <Pill>{activeWalkCount ?? 0} live walks</Pill>
          </div>
        </div>

        <div className="hidden flex-wrap gap-3 sm:flex sm:flex-nowrap">
          <ButtonLink href="/dashboard" className="px-4 py-2">
            Dashboard
          </ButtonLink>
          <ButtonLink href="/" className="px-4 py-2">
            Home
          </ButtonLink>
          <form action={signOut}>
            <Button className="px-4 py-2">Sign out</Button>
          </form>
        </div>
      </SurfaceCard>

      <div className="mt-4 sm:hidden">
        <ButtonLink
          href="/dashboard#walk-setup"
          variant="primary"
          className="w-full px-4 py-3 text-center"
        >
          {activeWalkCount ? "Open live walk" : "Start walk"}
        </ButtonLink>
      </div>

      <section className="mt-4 flex flex-1 flex-col gap-4 sm:mt-6 sm:gap-6">
        <SurfaceCard className="overflow-hidden p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
                Profile hub
              </p>
              <h2 className="mt-3 text-xl font-semibold text-[var(--text-strong)] sm:text-2xl">
                Keep account details out of the way, but close when you need them.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
                This space now holds your identity, visibility defaults, and quick
                shortcuts so the dashboard can stay focused on going live and moving.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] border border-white/70 bg-white/65 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                  Current visibility
                </p>
                <p className="mt-2 text-base font-semibold capitalize text-[var(--text-strong)]">
                  {profile?.default_visibility ?? "followers"}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/65 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                  Location mode
                </p>
                <p className="mt-2 text-base font-semibold capitalize text-[var(--text-strong)]">
                  {profile?.default_location_precision ?? "approximate"}
                </p>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1fr]">
          <ProfileFactGrid
            title="Account"
            description="Your identity block stays here so the main dashboard can focus on motion, not setup."
            facts={accountFacts}
            badge="Ready"
          />

          <ProfileFactGrid
            title="Privacy"
            description="These defaults shape how a fresh walk behaves until we add editable settings."
            facts={preferences}
            badge="Live ready"
          />
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1fr]">
          <ProfileShortcutCard
            title="Start a walk"
            description="Jump straight into the live flow with your current defaults and dog setup."
            badge={activeWalkCount ? "Live now" : "Offline"}
            tone="accent"
            action={
              <ButtonLink
                href="/dashboard#walk-setup"
                variant="primary"
                className="w-full px-4 py-3 text-center"
              >
                Open walk setup
              </ButtonLink>
            }
          />

          <ProfileShortcutCard
            title="Dogs and dashboard"
            description="Manage your dog profiles or head back to the main PackWalk surface."
            action={
              <div className="grid gap-3 sm:grid-cols-2">
                <ButtonLink href="/dashboard" className="w-full px-4 py-3 text-center">
                  View dogs
                </ButtonLink>
                <ButtonLink href="/map" className="w-full px-4 py-3 text-center">
                  Open map
                </ButtonLink>
              </div>
            }
          />
        </div>
      </section>

      <MobileBottomNav items={appNavItems} />
    </main>
  );
}
