import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
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
    <AuthShell
      side={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
            PackWalk
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--text-strong)]">
            Sign in and rejoin the live dog-walking map.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-[var(--text-body)]">
            Track active walks, coordinate with nearby dog owners, and keep your
            visibility fully under your control.
          </p>
        </>
      }
    >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-soft)]">Welcome back</p>
              <h2 className="mt-1 text-3xl font-semibold text-[var(--text-strong)]">
                Sign in
              </h2>
            </div>
            <ButtonLink href="/">Home</ButtonLink>
          </div>

          <form action={signIn} className="mt-8 space-y-5">
            <Field htmlFor="email" label="Email">
              <TextInput
                id="email"
                name="email"
                type="email"
                required
                placeholder="marius@example.com"
              />
            </Field>

            <Field htmlFor="password" label="Password">
              <TextInput
                id="password"
                name="password"
                type="password"
                required
                placeholder="Your password"
              />
            </Field>

            {params.error ? (
              <Notice variant="error">{params.error}</Notice>
            ) : null}

            {params.message ? (
              <Notice>{params.message}</Notice>
            ) : null}

            <Button className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-sm text-[var(--text-body)]">
            New here?{" "}
            <Link href="/sign-up" className="font-medium text-[var(--accent-strong)]">
              Create your account
            </Link>
          </p>
    </AuthShell>
  );
}
