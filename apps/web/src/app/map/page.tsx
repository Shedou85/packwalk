import { redirect } from "next/navigation";

import { followWalker, unfollowWalker } from "@/app/map/actions";
import { LiveLocationSync } from "@/components/map/live-location-sync";
import { MapCanvasShell } from "@/components/map/map-canvas-shell";
import { MapLiveView } from "@/components/map/map-live-view";
import { AppNav } from "@/components/navigation/app-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";
import { ensureProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

type MapPageProps = {
  searchParams: Promise<{
    followMessage?: string;
    followError?: string;
    mockWalker?: string;
    mockFollow?: string;
  }>;
};

const mockWalkerId = "mock-walker-dev";
const fallbackMockCoordinates = {
  latitude: 54.6872,
  longitude: 25.2797,
};
const mockWalkTiming = {
  startedAt: "2026-03-26T16:18:00.000Z",
  expiresAt: "2026-03-26T17:18:00.000Z",
};

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  await ensureProfile(user);

  const [{ data: profile }, { data: activeWalk }, { count: dogsCount }, { data: visibleWalks }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, city, default_visibility, default_location_precision")
        .eq("id", user.id)
        .single(),
      supabase
        .from("walk_sessions")
        .select("id, title, visibility, location_precision, started_at, expires_at, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("dogs")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id),
      supabase
        .from("walk_sessions")
        .select(
          "id, user_id, title, visibility, location_precision, started_at, expires_at, last_latitude, last_longitude",
        )
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(12),
    ]);

  const walkUserIds = [...new Set((visibleWalks ?? []).map((walk) => walk.user_id))];
  const { data: visibleProfiles } = walkUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, username, city")
        .in("id", walkUserIds)
    : { data: [] };
  const { data: currentFollows } = walkUserIds.length
    ? await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id)
        .in("following_id", walkUserIds)
    : { data: [] };

  const profileMap = new Map((visibleProfiles ?? []).map((item) => [item.id, item]));
  const followedIds = new Set((currentFollows ?? []).map((item) => item.following_id));

  const baseWalkFeed = (visibleWalks ?? []).map((walk) => ({
    ...walk,
    profile: profileMap.get(walk.user_id),
    isYou: walk.user_id === user.id,
    isFollowed: followedIds.has(walk.user_id),
    isMock: false,
  }));

  const walkersWithCoordinates = baseWalkFeed
    .filter(
      (walk) =>
        typeof walk.last_latitude === "number" &&
        typeof walk.last_longitude === "number",
    )
    .map((walk) => ({
      id: walk.id,
      name:
        walk.profile?.display_name ??
        walk.profile?.username ??
        walk.title ??
        "Walker",
      city: walk.profile?.city ?? "City not set",
      visibility: walk.visibility,
      precision: walk.location_precision,
      latitude: walk.last_latitude as number,
      longitude: walk.last_longitude as number,
      isYou: walk.isYou,
    }));

  const isMockWalkerEnabled =
    process.env.NODE_ENV !== "production" && params.mockWalker === "1";
  const isMockFollowed = params.mockFollow === "1";
  const anchorCoordinates = walkersWithCoordinates[0] ?? {
    latitude: fallbackMockCoordinates.latitude,
    longitude: fallbackMockCoordinates.longitude,
  };

  const mockWalk = isMockWalkerEnabled
    ? {
        id: mockWalkerId,
        user_id: mockWalkerId,
        title: "Evening park loop",
        visibility: "public",
        location_precision: "approximate",
        started_at: mockWalkTiming.startedAt,
        expires_at: mockWalkTiming.expiresAt,
        last_latitude: anchorCoordinates.latitude + 0.008,
        last_longitude: anchorCoordinates.longitude + 0.01,
        profile: {
          id: mockWalkerId,
          display_name: "Test walker",
          username: "test-walker",
          city: profile?.city ?? "Nearby area",
        },
        isYou: false,
        isFollowed: isMockFollowed,
        isMock: true,
      }
    : null;

  const walkFeed = mockWalk ? [mockWalk, ...baseWalkFeed] : baseWalkFeed;

  const mapWalkers = mockWalk
    ? [
        {
          id: mockWalk.id,
          name: mockWalk.profile.display_name,
          city: mockWalk.profile.city,
          visibility: mockWalk.visibility,
          precision: mockWalk.location_precision,
          latitude: mockWalk.last_latitude,
          longitude: mockWalk.last_longitude,
          isYou: false,
          isMock: true,
          isFollowed: isMockFollowed,
        },
        ...walkersWithCoordinates,
      ]
    : walkersWithCoordinates;

  const walkerName = profile?.display_name ?? user.email ?? "walker";
  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const hasToken = Boolean(mapToken);
  const mapFacts = [
    {
      label: "Presence",
      value: activeWalk ? "Live now" : "Offline",
    },
    {
      label: "City",
      value: profile?.city ?? "City not set",
    },
    {
      label: "Visibility",
      value: activeWalk?.visibility ?? profile?.default_visibility ?? "followers",
    },
    {
      label: "Precision",
      value:
        activeWalk?.location_precision ??
        profile?.default_location_precision ??
        "approximate",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6">
      <SurfaceCard
        strong
        className="overflow-hidden rounded-[28px] px-4 py-5 sm:px-6 sm:py-6"
      >
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
              PackWalk map
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
              Scan the area around you, {walkerName}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
              This screen is built for fast outdoor checking: where you are,
              whether your walk is live, and when nearby discovery is ready to
              plug in.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{activeWalk ? "Live walk active" : "Not live yet"}</Pill>
              <Pill>{dogsCount ?? 0} dogs ready</Pill>
              <Pill>{hasToken ? "Mapbox ready" : "Map shell only"}</Pill>
            </div>

            <div className="mt-5 sm:hidden">
              <ButtonLink
                href="/dashboard#walk-setup"
                variant="primary"
                className="w-full px-4 py-3 text-center"
              >
                {activeWalk ? "Open live walk" : "Start walk"}
              </ButtonLink>
            </div>

            <div className="mt-5 hidden sm:flex sm:flex-wrap sm:gap-3">
              <ButtonLink
                href="/dashboard#walk-setup"
                variant="primary"
                className="px-4 py-3 text-center"
              >
                {activeWalk ? "Open live walk" : "Start walk"}
              </ButtonLink>
              <ButtonLink href="/dashboard" className="px-4 py-3 text-center">
                Dashboard
              </ButtonLink>
              <ButtonLink href="/profile" className="px-4 py-3 text-center">
                Profile
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {mapFacts.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-white/70 bg-white/60 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.36)]"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                  {item.label}
                </p>
                <p className="mt-1.5 text-sm font-semibold capitalize text-[var(--text-strong)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <section className="mt-4 flex flex-1 flex-col gap-4 sm:mt-6 sm:gap-6">
        {(params.followMessage || params.followError) && (
          <SurfaceCard className="p-5 sm:p-6">
            {params.followMessage ? <Notice>{params.followMessage}</Notice> : null}
            {params.followError ? (
              <Notice variant="error">{params.followError}</Notice>
            ) : null}
          </SurfaceCard>
        )}

        {hasToken ? (
          <SurfaceCard className="overflow-hidden p-0">
            <MapLiveView token={mapToken} walkers={mapWalkers} />
          </SurfaceCard>
        ) : (
          <MapCanvasShell hasActiveWalk={Boolean(activeWalk)} hasToken={hasToken} />
        )}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-strong)]">
                  Your live presence
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  This is the state that will anchor your position on the map as
                  realtime sharing expands.
                </p>
              </div>
              <Pill>{activeWalk ? "Online" : "Waiting"}</Pill>
            </div>

            {activeWalk ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/70 bg-white/65 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                    Walk
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">
                    {activeWalk.title || "Active walk"}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/70 bg-white/65 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                    Ends
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">
                    {new Date(activeWalk.expires_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-[rgba(123,167,209,0.32)] bg-white/38 p-4">
                <p className="text-sm text-[var(--text-body)]">
                  You are not sharing a live walk yet. Start one from the dashboard
                  to place yourself on the map and prepare for nearby discovery.
                </p>
              </div>
            )}

            <div className="mt-4">
              <LiveLocationSync walkId={activeWalk?.id ?? null} userId={user.id} />
            </div>
          </SurfaceCard>

        </div>

        <SurfaceCard className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                Visible walkers
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                This feed reflects what your current policies allow you to see right now.
              </p>
            </div>
            <Pill>{walkFeed.length} live</Pill>
          </div>

          {walkFeed.length ? (
            <div className="mt-5 grid gap-3">
              {walkFeed.map((walk) => (
                <div
                  key={walk.id}
                  id={`walker-${walk.id}`}
                  className="rounded-[24px] border border-white/70 bg-white/65 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-strong)]">
                        {walk.profile?.display_name ||
                          walk.profile?.username ||
                          walk.title ||
                          "Walker"}
                        {walk.isYou ? " · You" : ""}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-soft)]">
                        {walk.profile?.city ?? "City not set"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Pill>{walk.visibility}</Pill>
                      <Pill>{walk.location_precision}</Pill>
                      {walk.isMock ? <Pill>test</Pill> : null}
                    </div>
                  </div>

                  {!walk.isYou && !walk.isMock ? (
                    <div className="mt-4">
                      <form action={walk.isFollowed ? unfollowWalker : followWalker}>
                        <input type="hidden" name="followingId" value={walk.user_id} />
                        <Button
                          type="submit"
                          variant={walk.isFollowed ? "secondary" : "primary"}
                          className="px-4 py-2.5"
                        >
                          {walk.isFollowed ? "Following" : "Follow"}
                        </Button>
                      </form>
                    </div>
                  ) : null}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                        Started
                      </p>
                      <p className="mt-1.5 text-sm text-[var(--text-strong)]">
                        {new Date(walk.started_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                        Ends
                      </p>
                      <p className="mt-1.5 text-sm text-[var(--text-strong)]">
                        {new Date(walk.expires_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-[rgba(123,167,209,0.32)] bg-white/38 p-4">
              <p className="text-sm text-[var(--text-body)]">
                No visible walkers nearby. Once walkers go live and you follow them,
                they will appear here.
              </p>
            </div>
          )}
        </SurfaceCard>
      </section>

      <AppNav />
    </main>
  );
}
