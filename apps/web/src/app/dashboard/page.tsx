import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import {
  createDogProfile,
  endWalkSession,
  startWalkSession,
} from "@/app/dashboard/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, SelectInput, TextInput } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
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

  const profileFacts = [
    {
      label: "Email",
      value: user.email ?? "No email",
    },
    {
      label: "Username",
      value: profile?.username ?? "Not set yet",
    },
    {
      label: "Default visibility",
      value: profile?.default_visibility ?? "followers",
    },
    {
      label: "Location precision",
      value: profile?.default_location_precision ?? "approximate",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 sm:px-6 sm:py-6">
      <SurfaceCard
        strong
        className="flex flex-col gap-4 rounded-[28px] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
            PackWalk dashboard
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
            Welcome, {profile?.display_name ?? user.email ?? "walker"}.
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 sm:flex-nowrap">
          <ButtonLink href="/" className="px-4 py-2">
            Home
          </ButtonLink>
          <form action={signOut}>
            <Button className="px-4 py-2">Sign out</Button>
          </form>
        </div>
      </SurfaceCard>

      <section className="mt-4 flex flex-1 flex-col gap-4 sm:mt-6 sm:gap-6">
        <SurfaceCard id="walk-setup" className="p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                Account ready
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
                Your account is connected to Supabase auth and your PackWalk
                profile exists in the database. From here we can move into dog
                profiles, walk sessions, groups, and live map presence.
              </p>
            </div>
            <div className="hidden rounded-full border border-[rgba(123,167,209,0.28)] bg-white/64 px-3 py-1 text-xs font-medium text-[var(--text-strong)] sm:block">
              {dogs?.length ?? 0} dogs
            </div>
          </div>

          {params.message ? <Notice className="mt-5">{params.message}</Notice> : null}
          {params.walkMessage ? <Notice className="mt-5">{params.walkMessage}</Notice> : null}
          {params.walkError ? (
            <Notice variant="error" className="mt-5">
              {params.walkError}
            </Notice>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {profileFacts.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-white/70 bg-white/65 p-4"
              >
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm text-[var(--text-strong)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                Go for a walk
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
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
              <div className="rounded-[24px] border border-white/70 bg-white/65 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--text-strong)]">
                    {activeWalk.title || "Active walk"}
                  </p>
                  <span className="rounded-full border border-[rgba(123,167,209,0.28)] bg-white/74 px-3 py-1 text-xs font-medium text-[var(--text-body)]">
                    {activeWalk.visibility}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                      Started
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-strong)]">
                      {new Date(activeWalk.started_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                      Ends
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-strong)]">
                      {new Date(activeWalk.expires_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-soft)]">
                      Precision
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-strong)]">
                      {activeWalk.location_precision}
                    </p>
                  </div>
                </div>
              </div>

              <form action={endWalkSession}>
                <Button className="w-full" variant="secondary">
                  End walk
                </Button>
              </form>
            </div>
          ) : (
            <form action={startWalkSession} className="mt-5 space-y-4">
              <Field htmlFor="title" label="Walk title">
                <TextInput
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Morning park walk"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field htmlFor="visibility" label="Who can see this walk">
                  <SelectInput id="visibility" name="visibility" defaultValue="followers">
                    <option value="public">Public</option>
                    <option value="followers">Followers</option>
                    <option value="private_group">Private group</option>
                  </SelectInput>
                </Field>

                <Field htmlFor="locationPrecision" label="Location precision">
                  <SelectInput
                    id="locationPrecision"
                    name="locationPrecision"
                    defaultValue="approximate"
                  >
                    <option value="approximate">Approximate</option>
                    <option value="exact">Exact</option>
                  </SelectInput>
                </Field>
              </div>

              <Field htmlFor="durationMinutes" label="Walk duration">
                <SelectInput
                  id="durationMinutes"
                  name="durationMinutes"
                  defaultValue="60"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </SelectInput>
              </Field>

              <Button className="w-full">Start walk</Button>
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
                  Keep your dog profiles ready before building live walk and
                  meetup features.
                </p>
              </div>
              <div className="rounded-full border border-[rgba(123,167,209,0.28)] bg-white/64 px-3 py-1 text-xs font-medium text-[var(--text-strong)]">
                {dogs?.length ?? 0} saved
              </div>
            </div>

            {dogs?.length ? (
              <div className="mt-5 space-y-3">
                {dogs.map((dog) => (
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

          <SurfaceCard className="order-1 p-5 lg:order-2 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-strong)]">
                  Add a dog
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                  This is the next real profile step after signup.
                </p>
              </div>
              <div className="rounded-full border border-[rgba(123,167,209,0.28)] bg-white/64 px-3 py-1 text-xs font-medium text-[var(--text-strong)] sm:hidden">
                {dogs?.length ?? 0}
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
                  <SelectInput id="size" name="size" defaultValue="">
                    <option value="">Select size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </SelectInput>
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

        <div className="rounded-[28px] border border-dashed border-[rgba(123,167,209,0.4)] bg-white/34 p-5 sm:p-6">
          <p className="text-sm font-semibold text-[var(--text-strong)]">
            Next step
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
            Build the first live walk session flow on top of your dog profile
            and account settings.
          </p>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 mt-auto pt-2 sm:hidden">
        <SurfaceCard strong className="p-3">
          <div className="grid grid-cols-2 gap-3">
            {activeWalk ? (
              <form action={endWalkSession}>
                <Button className="w-full" variant="secondary">
                  End walk
                </Button>
              </form>
            ) : (
              <ButtonLink
                href="#walk-setup"
                variant="primary"
                className="w-full px-4 py-3 text-center"
              >
                Start walk
              </ButtonLink>
            )}
            <ButtonLink href="/" className="w-full px-4 py-3 text-center">
              Home
            </ButtonLink>
          </div>
        </SurfaceCard>
      </div>
    </main>
  );
}
