import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 sm:px-10">
      <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel hidden rounded-[32px] p-8 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
            PackWalk
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
            Sign in and rejoin the live dog-walking map.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
            Track active walks, coordinate with nearby dog owners, and keep your
            visibility fully under your control.
          </p>
        </section>

        <section className="glass-panel-strong rounded-[32px] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Welcome back</p>
              <h2 className="mt-1 text-3xl font-semibold text-slate-950">
                Sign in
              </h2>
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
            >
              Home
            </Link>
          </div>

          <form action={signIn} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                placeholder="marius@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                placeholder="Your password"
              />
            </div>

            {params.error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {params.error}
              </p>
            ) : null}

            {params.message ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {params.message}
              </p>
            ) : null}

            <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
              Sign in
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            New here?{" "}
            <Link href="/sign-up" className="font-medium text-sky-700">
              Create your account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
