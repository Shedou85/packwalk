import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { updateProfile } from "@/app/profile/actions";
import { AppNav } from "@/components/navigation/app-nav";
import { ProfileConnectionList } from "@/components/profile/profile-connection-list";
import { ProfileFactGrid } from "@/components/profile/profile-fact-grid";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";
import { ensureProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

type ProfilePageProps = {
  searchParams: Promise<{ saved?: string; error?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
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
    { data: followingRows },
    { data: followerRows },
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
    supabase
      .from("follows")
      .select("following_id, created_at")
      .eq("follower_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("follows")
      .select("follower_id, created_at")
      .eq("following_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const { saved, error: profileError } = await searchParams;

  const connectionProfileIds = [
    ...new Set([
      ...(followingRows ?? []).map((row) => row.following_id),
      ...(followerRows ?? []).map((row) => row.follower_id),
    ]),
  ];

  const { data: connectionProfiles } = connectionProfileIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, username, city")
        .in("id", connectionProfileIds)
    : { data: [] };

  const connectionProfileMap = new Map(
    (connectionProfiles ?? []).map((item) => [item.id, item]),
  );

  const followingItems = (followingRows ?? []).map((row) => {
    const connectionProfile = connectionProfileMap.get(row.following_id);

    return {
      id: row.following_id,
      title:
        connectionProfile?.display_name ??
        connectionProfile?.username ??
        "Walker",
      subtitle: connectionProfile?.city ?? "City not set",
      meta: "following",
    };
  });

  const followerItems = (followerRows ?? []).map((row) => {
    const connectionProfile = connectionProfileMap.get(row.follower_id);

    return {
      id: row.follower_id,
      title:
        connectionProfile?.display_name ??
        connectionProfile?.username ??
        "Walker",
      subtitle: connectionProfile?.city ?? "City not set",
      meta: "follower",
    };
  });

  const accountFacts = [
    {
      label: "Email",
      value: user.email ?? "No email",
    },
    {
      label: "Username",
      value: profile?.username ?? "Not set yet",
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

        <div className="flex flex-wrap gap-3 sm:flex-nowrap">
          <ButtonLink href="/dashboard" className="px-4 py-2">
            Dashboard
          </ButtonLink>
          <form action={signOut}>
            <Button className="px-4 py-2">Sign out</Button>
          </form>
        </div>
      </SurfaceCard>

      {saved ? (
        <div className="mt-4 rounded-2xl border border-[rgba(77,168,218,0.3)] bg-[rgba(77,168,218,0.08)] px-4 py-3 text-sm text-[var(--accent-strong)]">
          Profile saved.
        </div>
      ) : null}

      {profileError ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(profileError)}
        </div>
      ) : null}

      <section className="mt-4 flex flex-1 flex-col gap-4 sm:mt-6 sm:gap-6">
        <SurfaceCard className="p-5 sm:p-7">
          <p className="text-sm font-semibold text-[var(--text-strong)]">Edit profile</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text-body)]">
            Changes apply to future walk sessions.
          </p>

          <form action={updateProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Display name" htmlFor="display_name">
              <TextInput
                id="display_name"
                name="display_name"
                defaultValue={profile?.display_name ?? ""}
                placeholder="Your name"
                maxLength={80}
              />
            </Field>

            <Field label="City" htmlFor="city">
              <TextInput
                id="city"
                name="city"
                defaultValue={profile?.city ?? ""}
                placeholder="e.g. Berlin"
                maxLength={80}
              />
            </Field>

            <Field label="Default visibility" htmlFor="default_visibility">
              <SelectInput
                id="default_visibility"
                name="default_visibility"
                defaultValue={profile?.default_visibility ?? "followers"}
              >
                <option value="public">Public</option>
                <option value="followers">Followers only</option>
                <option value="private_group">Private group</option>
              </SelectInput>
            </Field>

            <Field label="Location precision" htmlFor="default_location_precision">
              <SelectInput
                id="default_location_precision"
                name="default_location_precision"
                defaultValue={profile?.default_location_precision ?? "approximate"}
              >
                <option value="approximate">Approximate</option>
                <option value="exact">Exact</option>
              </SelectInput>
            </Field>

            <div className="sm:col-span-2">
              <Button type="submit" variant="primary" className="px-6 py-2.5">
                Save changes
              </Button>
            </div>
          </form>
        </SurfaceCard>

        <ProfileFactGrid
          title="Account"
          description="Your login details."
          facts={accountFacts}
          badge="Read only"
        />

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_1fr]">
          <ProfileConnectionList
            title="Following"
            description="People you already keep on your map radar."
            badge={`${followingCount ?? 0}`}
            emptyText="You are not following anyone yet. Follow walkers from the map to build your nearby circle."
            items={followingItems}
          />

          <ProfileConnectionList
            title="Followers"
            description="People who can find you faster when your walk is visible."
            badge={`${followersCount ?? 0}`}
            emptyText="No followers yet. Once someone follows you, they will show up here."
            items={followerItems}
          />
        </div>
      </section>

      <AppNav />
    </main>
  );
}
