import Link from "next/link";
import { redirect } from "next/navigation";

import { signUp } from "@/app/auth/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
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
    <AuthShell
      reverse
      side={
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
            Privacy first
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-[var(--text-strong)]">
            Share your walk only on your terms.
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-[var(--text-body)]">
            <li>Choose public, followers-only, or private-group visibility.</li>
            <li>Use approximate location instead of exact positioning.</li>
            <li>Join public or private dog-walking groups in real time.</li>
          </ul>
        </>
      }
    >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-soft)]">Get started</p>
              <h1 className="mt-1 text-3xl font-semibold text-[var(--text-strong)]">
                Create your PackWalk account
              </h1>
            </div>
            <ButtonLink href="/">Home</ButtonLink>
          </div>

          <form action={signUp} className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field htmlFor="displayName" label="Display name" className="sm:col-span-2">
              <TextInput
                id="displayName"
                name="displayName"
                type="text"
                required
                placeholder="Marius"
              />
            </Field>

            <Field htmlFor="username" label="Username" className="sm:col-span-2">
              <TextInput
                id="username"
                name="username"
                type="text"
                placeholder="packwalker85"
              />
            </Field>

            <Field htmlFor="email" label="Email" className="sm:col-span-2">
              <TextInput
                id="email"
                name="email"
                type="email"
                required
                placeholder="marius@example.com"
              />
            </Field>

            <Field htmlFor="password" label="Password" className="sm:col-span-2">
              <TextInput
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Choose a secure password"
              />
            </Field>

            {params.error ? (
              <Notice variant="error" className="sm:col-span-2">
                {params.error}
              </Notice>
            ) : null}

            <div className="sm:col-span-2">
              <Button className="w-full">
                Create account
              </Button>
            </div>
          </form>

          <p className="mt-6 text-sm text-[var(--text-body)]">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-[var(--accent-strong)]">
              Sign in
            </Link>
          </p>
    </AuthShell>
  );
}
