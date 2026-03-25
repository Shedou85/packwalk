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
