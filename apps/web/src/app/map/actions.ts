"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const getText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

export async function followWalker(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?error=Please sign in before following walkers.");
  }

  const followingId = getText(formData.get("followingId"));

  if (!followingId || followingId === user.id) {
    redirect("/map?followError=Invalid follow target.");
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: followingId,
  });

  if (error) {
    redirect(`/map?followError=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/map");
  revalidatePath("/profile");
  redirect("/map?followMessage=Walker followed.");
}

export async function unfollowWalker(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?error=Please sign in before updating follows.");
  }

  const followingId = getText(formData.get("followingId"));

  if (!followingId || followingId === user.id) {
    redirect("/map?followError=Invalid follow target.");
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId);

  if (error) {
    redirect(`/map?followError=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/map");
  revalidatePath("/profile");
  redirect("/map?followMessage=Walker unfollowed.");
}
