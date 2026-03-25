import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { createDogProfile } from "@/app/dashboard/actions";
import { ensureProfile } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

type DashboardPageProps = {
  searchParams: Promise<{
    message?: string;
    dogMessage?: string;
    dogError?: string;
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <header className="glass-panel-strong flex flex-col gap-4 rounded-[28px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
            PackWalk dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            Welcome, {profile?.display_name ?? user.email ?? "walker"}.
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
          >
            Home
          </Link>
          <form action={signOut}>
            <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-[32px] p-6 sm:p-8">
          <p className="text-sm font-semibold text-slate-900">Account ready</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Your account is connected to Supabase auth and your PackWalk profile
            record exists in the database. This is the base we will use for dog
            profiles, walk sessions, groups, and live map presence.
          </p>

          {params.message ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {params.message}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/70 bg-white/65 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Email
              </p>
              <p className="mt-2 text-sm text-slate-900">{user.email}</p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/65 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Username
              </p>
              <p className="mt-2 text-sm text-slate-900">
                {profile?.username ?? "Not set yet"}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/65 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Default visibility
              </p>
              <p className="mt-2 text-sm text-slate-900">
                {profile?.default_visibility ?? "followers"}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/65 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Location precision
              </p>
              <p className="mt-2 text-sm text-slate-900">
                {profile?.default_location_precision ?? "approximate"}
              </p>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="glass-panel rounded-[28px] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Dog profiles
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Add your first dog so walks, groups, and meetups feel tied to
                  a real profile.
                </p>
              </div>
              <div className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
                {dogs?.length ?? 0} saved
              </div>
            </div>

            {params.dogMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {params.dogMessage}
              </div>
            ) : null}

            {params.dogError ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {params.dogError}
              </div>
            ) : null}

            <form action={createDogProfile} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Dog name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                  placeholder="Milo"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="breed"
                    className="text-sm font-medium text-slate-700"
                  >
                    Breed
                  </label>
                  <input
                    id="breed"
                    name="breed"
                    type="text"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                    placeholder="Golden Retriever"
                  />
                </div>

                <div>
                  <label
                    htmlFor="ageYears"
                    className="text-sm font-medium text-slate-700"
                  >
                    Age
                  </label>
                  <input
                    id="ageYears"
                    name="ageYears"
                    type="number"
                    min="0"
                    max="30"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                    placeholder="4"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="size"
                    className="text-sm font-medium text-slate-700"
                  >
                    Size
                  </label>
                  <select
                    id="size"
                    name="size"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                    defaultValue=""
                  >
                    <option value="">Select size</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="temperament"
                    className="text-sm font-medium text-slate-700"
                  >
                    Temperament
                  </label>
                  <input
                    id="temperament"
                    name="temperament"
                    type="text"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                    placeholder="Friendly, playful"
                  />
                </div>
              </div>

              <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
                Add dog profile
              </button>
            </form>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <p className="text-sm font-semibold text-slate-900">
              Your dogs
            </p>
            {dogs?.length ? (
              <div className="mt-4 space-y-3">
                {dogs.map((dog) => (
                  <div
                    key={dog.id}
                    className="rounded-[24px] border border-white/70 bg-white/65 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {dog.name}
                      </p>
                      <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                        {dog.size ?? "size not set"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      {dog.breed ? <span>{dog.breed}</span> : null}
                      {dog.age_years !== null ? <span>{dog.age_years} years old</span> : null}
                      {dog.temperament ? <span>{dog.temperament}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">
                No dog profiles yet. Add your first dog to personalize your
                PackWalk presence.
              </p>
            )}
          </div>

          <div className="rounded-[28px] border border-dashed border-slate-300/80 bg-white/40 p-6">
            <p className="text-sm font-semibold text-slate-900">Next step</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Build the first live walk session flow on top of your dog profile
              and account settings.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
