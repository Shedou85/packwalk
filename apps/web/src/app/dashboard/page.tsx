import { redirect } from "next/navigation";

import {
  createDogProfile,
  endWalkSession,
  startWalkSession,
} from "@/app/dashboard/actions";
import { DashboardActionTile } from "@/components/dashboard/dashboard-action-tile";
import { DashboardStatChip } from "@/components/dashboard/dashboard-stat-chip";
import { AppNav } from "@/components/navigation/app-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import { CompactSelect } from "@/components/ui/compact-select";
import { Field, TextInput } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";
import { ensureProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{
    message?: string;
    dogMessage?: string;
    dogError?: string;
    walkMessage?: string;
    walkError?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
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

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, breed, age_years, size, temperament, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const { data: activeWalk } = await supabase
    .from("walk_sessions")
    .select("id, title, visibility, location_precision, started_at, expires_at, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const dogList = dogs ?? [];
  const dogsCount = dogs?.length ?? 0;
  const welcomeName = profile?.display_name ?? user.email ?? "walker";
  const cityLabel = profile?.city ?? "City not set";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6">
      <SurfaceCard
        strong
        className="overflow-hidden rounded-[28px] px-4 py-5 sm:px-6 sm:py-6"
      >
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
              PackWalk dashboard
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
              Ready to head out, {welcomeName}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
              Go live, manage your dogs, and adjust your settings from one place.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{activeWalk ? "Walking live" : "Offline"}</Pill>
              <Pill>{dogsCount} dogs ready</Pill>
              <Pill>{cityLabel}</Pill>
            </div>

            <div className="mt-5 sm:hidden">
              <ButtonLink
                href="#walk-setup"
                variant="primary"
                className="w-full px-4 py-3 text-center"
              >
                {activeWalk ? "View live walk" : "Start walk"}
              </ButtonLink>
            </div>

            <div className="mt-5 hidden sm:flex sm:flex-wrap sm:gap-3">
              <ButtonLink
                href="#walk-setup"
                variant="primary"
                className="px-4 py-3 text-center"
              >
                {activeWalk ? "View live walk" : "Start walk"}
              </ButtonLink>
              <ButtonLink href="/profile" className="w-full px-4 py-3 text-center sm:w-auto">
                Profile
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <DashboardStatChip
              label="Walk status"
              value={activeWalk ? "Live now" : "Ready to start"}
            />
            <DashboardStatChip label="Visibility" value={profile?.default_visibility ?? "followers"} />
            <DashboardStatChip
              label="Location mode"
              value={profile?.default_location_precision ?? "approximate"}
            />
          </div>
        </div>
      </SurfaceCard>

      <section className="mt-4 flex flex-1 flex-col gap-4 sm:mt-6 sm:gap-6">
        {(params.message || params.walkMessage || params.walkError) && (
          <SurfaceCard className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-strong)]">
                  Status
                </p>
              </div>
              <ButtonLink href="/profile" className="px-4 py-2">
                Profile
              </ButtonLink>
            </div>

            {params.message ? <Notice className="mt-5">{params.message}</Notice> : null}
            {params.walkMessage ? <Notice className="mt-5">{params.walkMessage}</Notice> : null}
            {params.walkError ? (
              <Notice variant="error" className="mt-5">
                {params.walkError}
              </Notice>
            ) : null}
          </SurfaceCard>
        )}

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <DashboardActionTile
            eyebrow="Map"
            title="Open live map"
            description="See nearby walkers and check your live presence on the map."
            action={
              <ButtonLink href="/map" className="w-full px-4 py-3 text-center">
                Open map
              </ButtonLink>
            }
          />

          <DashboardActionTile
            eyebrow="Live"
            title={activeWalk ? "Your walk is already live" : "Start a live walk"}
            description={
              activeWalk
                ? "Jump into the live walk card to see timing and stop it when you're done."
                : "Open the walk setup and go visible to nearby walkers in a couple of taps."
            }
            action={
              <ButtonLink
                href="#walk-setup"
                variant="primary"
                className="w-full px-4 py-3 text-center"
              >
                {activeWalk ? "Open live walk" : "Open walk setup"}
              </ButtonLink>
            }
          />

          <DashboardActionTile
            eyebrow="Dogs"
            title={dogsCount ? "Your dogs are ready" : "Add your first dog"}
            description={
              dogsCount
                ? "View and manage your dogs."
                : "Create a dog profile to personalize your PackWalk presence."
            }
            action={
              <ButtonLink href="#dog-form" className="w-full px-4 py-3 text-center">
                {dogsCount ? "Manage dogs" : "Add a dog"}
              </ButtonLink>
            }
          />

          <DashboardActionTile
            eyebrow="Profile"
            title="Privacy and defaults"
            description="Update your account details, visibility, and location defaults."
            action={
              <ButtonLink href="/profile" className="w-full px-4 py-3 text-center">
                Open profile
              </ButtonLink>
            }
          />
        </div>

        <SurfaceCard id="walk-setup" className="p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                Go for a walk
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-body)]">
                Start a live walk session so nearby users can discover you based
                on your chosen visibility and location precision.
              </p>
            </div>
            <div className="rounded-full border border-[rgba(123,167,209,0.28)] bg-white/64 px-3 py-1 text-xs font-medium text-[var(--text-strong)]">
              {activeWalk ? "Live now" : "Offline"}
            </div>
          </div>

          {activeWalk ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[26px] border border-white/70 bg-white/68 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>{activeWalk.visibility}</Pill>
                  <Pill>{activeWalk.location_precision}</Pill>
                </div>
                <p className="mt-4 text-lg font-semibold text-[var(--text-strong)]">
                  {activeWalk.title || "Active walk"}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  Your walk is live now. Nearby people can discover you based on
                  your chosen visibility and precision settings.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <DashboardStatChip
                    label="Started"
                    value={new Date(activeWalk.started_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                  <DashboardStatChip
                    label="Ends"
                    value={new Date(activeWalk.expires_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                  <DashboardStatChip
                    label="Mode"
                    value={activeWalk.location_precision}
                  />
                </div>
              </div>

              <form action={endWalkSession} className="sm:max-w-[220px]">
                <Button className="w-full" variant="secondary">
                  End walk
                </Button>
              </form>
            </div>
          ) : (
            <form action={startWalkSession} className="mt-5 space-y-4">
              <Field htmlFor="title" label="Title">
                <TextInput
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Morning park walk"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field htmlFor="visibility" label="Visibility">
                  <CompactSelect
                    name="visibility"
                    defaultValue="followers"
                    placeholder="Choose visibility"
                    options={[
                      {
                        value: "public",
                        label: "Public",
                        description: "Visible to everyone nearby.",
                      },
                      {
                        value: "followers",
                        label: "Followers",
                        description: "Only followers can discover your walk.",
                      },
                      {
                        value: "private_group",
                        label: "Private group",
                        description: "Keep this walk inside a private context.",
                      },
                    ]}
                  />
                </Field>

                <Field htmlFor="locationPrecision" label="Precision">
                  <CompactSelect
                    name="locationPrecision"
                    defaultValue="approximate"
                    placeholder="Choose precision"
                    options={[
                      {
                        value: "approximate",
                        label: "Approximate",
                        description: "Share a softer, privacy-friendly area.",
                      },
                      {
                        value: "exact",
                        label: "Exact",
                        description: "Use your precise walk position.",
                      },
                    ]}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-[auto_auto] sm:items-end sm:justify-start">
                <Field
                  htmlFor="durationMinutes"
                  label="Duration"
                  className="sm:w-[220px]"
                >
                  <CompactSelect
                    name="durationMinutes"
                    defaultValue="60"
                    placeholder="Choose duration"
                    options={[
                      { value: "30", label: "30 minutes" },
                      { value: "45", label: "45 minutes" },
                      { value: "60", label: "60 minutes" },
                      { value: "90", label: "90 minutes" },
                      { value: "120", label: "120 minutes" },
                    ]}
                  />
                </Field>

                <Button className="w-full sm:min-w-[170px] sm:w-auto sm:px-6">
                  Start walk
                </Button>
              </div>
            </form>
          )}
        </SurfaceCard>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard className="order-2 p-5 lg:order-1 lg:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-strong)]">
                  Your dogs
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  View and update your dogs.
                </p>
              </div>
              <div className="rounded-full border border-[rgba(123,167,209,0.28)] bg-white/64 px-3 py-1 text-xs font-medium text-[var(--text-strong)]">
                {dogsCount} saved
              </div>
            </div>

            {dogsCount ? (
              <div className="mt-5 grid gap-3">
                {dogList.map((dog) => (
                  <div
                    key={dog.id}
                    className="rounded-[24px] border border-white/70 bg-white/65 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--text-strong)]">
                        {dog.name}
                      </p>
                      <span className="rounded-full border border-[rgba(123,167,209,0.28)] bg-white/74 px-3 py-1 text-xs font-medium text-[var(--text-body)]">
                        {dog.size ?? "size not set"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--text-soft)]">
                      {dog.breed ? <span>{dog.breed}</span> : null}
                      {dog.age_years !== null ? <span>{dog.age_years} years old</span> : null}
                      {dog.temperament ? <span>{dog.temperament}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-[var(--text-body)]">
                No dog profiles yet. Add your first dog to personalize your
                PackWalk presence.
              </p>
            )}
          </SurfaceCard>

          <SurfaceCard id="dog-form" className="order-1 p-5 lg:order-2 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-strong)]">
                  Add a dog
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  Add the dogs you actually walk with so the rest of the app can
                  feel personal and ready for meetups.
                </p>
              </div>
              <div className="rounded-full border border-[rgba(123,167,209,0.28)] bg-white/64 px-3 py-1 text-xs font-medium text-[var(--text-strong)] sm:hidden">
                {dogsCount}
              </div>
            </div>

            {params.dogMessage ? (
              <Notice className="mt-5">{params.dogMessage}</Notice>
            ) : null}

            {params.dogError ? (
              <Notice variant="error" className="mt-5">
                {params.dogError}
              </Notice>
            ) : null}

            <form action={createDogProfile} className="mt-5 space-y-4">
              <Field htmlFor="name" label="Dog name">
                <TextInput
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Milo"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field htmlFor="breed" label="Breed">
                  <TextInput
                    id="breed"
                    name="breed"
                    type="text"
                    placeholder="Golden Retriever"
                  />
                </Field>

                <Field htmlFor="ageYears" label="Age">
                  <TextInput
                    id="ageYears"
                    name="ageYears"
                    type="number"
                    min="0"
                    max="30"
                    placeholder="4"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field htmlFor="size" label="Size">
                  <CompactSelect
                    name="size"
                    defaultValue=""
                    placeholder="Select size"
                    options={[
                      { value: "", label: "Not set" },
                      { value: "small", label: "Small" },
                      { value: "medium", label: "Medium" },
                      { value: "large", label: "Large" },
                    ]}
                  />
                </Field>

                <Field htmlFor="temperament" label="Temperament">
                  <TextInput
                    id="temperament"
                    name="temperament"
                    type="text"
                    placeholder="Friendly, playful"
                  />
                </Field>
              </div>

              <Button className="w-full">Add dog profile</Button>
            </form>
          </SurfaceCard>
        </div>
      </section>

      <AppNav />
    </main>
  );
}
