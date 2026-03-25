"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const getText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

export async function signUp(formData: FormData) {
  const email = getText(formData.get("email"));
  const password = getText(formData.get("password"));
  const displayName = getText(formData.get("displayName"));
  const username = getText(formData.get("username"));

  if (!email || !password || !displayName) {
    redirect("/sign-up?error=Please fill in your name, email, and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        username,
      },
    },
  });

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect(
    "/sign-in?message=Account created. Check your email to confirm it, then sign in.",
  );
}

export async function signIn(formData: FormData) {
  const email = getText(formData.get("email"));
  const password = getText(formData.get("password"));

  if (!email || !password) {
    redirect("/sign-in?error=Enter your email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
