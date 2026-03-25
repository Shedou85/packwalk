import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <header className="glass-panel-strong flex items-center justify-between rounded-[28px] px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
            PackWalk
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
            Realtime dog-walking meetups.
          </h1>
        </div>
        <div className="rounded-full border border-white/60 bg-white/65 px-4 py-2 text-sm font-medium text-slate-700">
          MVP setup in progress
        </div>
      </header>

      <section className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[32px] p-6 sm:p-8 lg:p-10">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-white/70 bg-white/60 px-3 py-1 text-xs font-medium text-slate-600">
              Live map + groups + privacy-first presence
            </p>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              See who is walking now, meet nearby dog owners, and coordinate
              together.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              PackWalk helps people go live while walking, control who can see
              them, join public or private groups, and coordinate meetups with
              distance and ETA awareness.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
              Start building auth
            </button>
            <button className="rounded-full border border-slate-200 bg-white/75 px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-white">
              Review schema
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
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
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-white/60 bg-white/55 p-4"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="glass-panel rounded-[28px] p-6">
            <p className="text-sm font-semibold text-slate-900">MVP pillars</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Realtime walk sessions with privacy controls</li>
              <li>Live map discovery for nearby walkers</li>
              <li>Public and private groups with chat</li>
              <li>Supabase-backed auth, presence, and storage</li>
            </ul>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <p className="text-sm font-semibold text-slate-900">
              Initial stack
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Next.js",
                "TypeScript",
                "Tailwind",
                "TanStack Query",
                "Zustand",
                "Supabase",
                "Mapbox",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/70 bg-white/65 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[28px] p-6">
            <p className="text-sm font-semibold text-slate-900">
              Backend connection
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Supabase environment variables are configured and SSR client
              helpers are ready for auth, profiles, and walk session queries.
            </p>
            <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-slate-700">
              {user
                ? `Signed in as ${user.email ?? "an authenticated user"}`
                : "No active session yet. Auth wiring is ready."}
            </div>
          </div>

          <div className="rounded-[28px] border border-dashed border-slate-300/80 bg-white/40 p-6">
            <p className="text-sm font-semibold text-slate-900">Next up</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Build authentication, profile creation, and the first live map
              shell on top of the schema and project structure already added to
              the workspace.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
