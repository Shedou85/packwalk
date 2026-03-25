import Link from "next/link";
import { redirect } from "next/navigation";

import { signUp } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

type SignUpPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
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
      <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel-strong rounded-[32px] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Get started</p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-950">
                Create your PackWalk account
              </h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
            >
              Home
            </Link>
          </div>

          <form action={signUp} className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="displayName"
                className="text-sm font-medium text-slate-700"
              >
                Display name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                placeholder="Marius"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-slate-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                placeholder="packwalker85"
              />
            </div>

            <div className="sm:col-span-2">
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

            <div className="sm:col-span-2">
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
                minLength={6}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-sky-400"
                placeholder="Choose a secure password"
              />
            </div>

            {params.error ? (
              <p className="sm:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {params.error}
              </p>
            ) : null}

            <div className="sm:col-span-2">
              <button className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
                Create account
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-sky-700">
              Sign in
            </Link>
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            If email confirmation is enabled in Supabase, you will need to
            confirm your address before the dashboard becomes available.
          </p>
        </section>

        <section className="glass-panel rounded-[32px] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
            Privacy first
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
            Share your walk only on your terms.
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
            <li>Choose public, followers-only, or private-group visibility.</li>
            <li>Use approximate location instead of exact positioning.</li>
            <li>Join public or private dog-walking groups in real time.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
