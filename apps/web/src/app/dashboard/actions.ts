"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const dogSchema = z.object({
  name: z.string().trim().min(2, "Dog name must be at least 2 characters."),
  breed: z.string().trim().max(80).optional(),
  ageYears: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) {
        return null;
      }

      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    })
    .refine(
      (value) => value === null || (Number.isInteger(value) && value >= 0 && value <= 30),
      "Age must be a whole number between 0 and 30.",
    ),
  size: z.string().trim().max(40).optional(),
  temperament: z.string().trim().max(120).optional(),
});

const walkSchema = z.object({
  title: z.string().trim().max(80).optional(),
  visibility: z.enum(["public", "followers", "private_group"]),
  locationPrecision: z.enum(["exact", "approximate"]),
  durationMinutes: z
    .string()
    .trim()
    .transform((value) => Number(value))
    .refine(
      (value) => Number.isInteger(value) && value >= 15 && value <= 240,
      "Walk duration must be between 15 and 240 minutes.",
    ),
});

const getText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

export async function createDogProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?error=Please sign in before adding a dog.");
  }

  const parsed = dogSchema.safeParse({
    name: getText(formData.get("name")),
    breed: getText(formData.get("breed")) || undefined,
    ageYears: getText(formData.get("ageYears")) || undefined,
    size: getText(formData.get("size")) || undefined,
    temperament: getText(formData.get("temperament")) || undefined,
  });

  if (!parsed.success) {
    redirect(
      `/dashboard?dogError=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid dog profile.")}`,
    );
  }

  const { error } = await supabase.from("dogs").insert({
    owner_id: user.id,
    name: parsed.data.name,
    breed: parsed.data.breed || null,
    age_years: parsed.data.ageYears,
    size: parsed.data.size || null,
    temperament: parsed.data.temperament || null,
  });

  if (error) {
    redirect(`/dashboard?dogError=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?dogMessage=Dog profile created.");
}

export async function startWalkSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?error=Please sign in before starting a walk.");
  }

  const { data: activeWalk } = await supabase
    .from("walk_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (activeWalk) {
    redirect("/dashboard?walkError=You already have an active walk.");
  }

  const parsed = walkSchema.safeParse({
    title: getText(formData.get("title")) || undefined,
    visibility: getText(formData.get("visibility")),
    locationPrecision: getText(formData.get("locationPrecision")),
    durationMinutes: getText(formData.get("durationMinutes")),
  });

  if (!parsed.success) {
    redirect(
      `/dashboard?walkError=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid walk setup.")}`,
    );
  }

  const expiresAt = new Date(Date.now() + parsed.data.durationMinutes * 60 * 1000);

  const { error } = await supabase.from("walk_sessions").insert({
    user_id: user.id,
    title: parsed.data.title || null,
    visibility: parsed.data.visibility,
    location_precision: parsed.data.locationPrecision,
    status: "active",
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    redirect(`/dashboard?walkError=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?walkMessage=Walk started. You are now live.");
}

export async function endWalkSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?error=Please sign in before ending a walk.");
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("walk_sessions")
    .update({
      status: "ended",
      ended_at: now,
    })
    .eq("user_id", user.id)
    .eq("status", "active");

  if (error) {
    redirect(`/dashboard?walkError=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard?walkMessage=Walk ended.");
}
