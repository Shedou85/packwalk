"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  display_name: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  default_visibility: z.enum(["public", "followers", "private_group"]),
  default_location_precision: z.enum(["exact", "approximate"]),
});

const getText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const parsed = profileSchema.safeParse({
    display_name: getText(formData.get("display_name")) || undefined,
    city: getText(formData.get("city")) || undefined,
    default_visibility: getText(formData.get("default_visibility")),
    default_location_precision: getText(formData.get("default_location_precision")),
  });

  if (!parsed.success) {
    redirect(
      `/profile?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid profile data.")}`,
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name ?? null,
      city: parsed.data.city ?? null,
      default_visibility: parsed.data.default_visibility,
      default_location_precision: parsed.data.default_location_precision,
    })
    .eq("id", user.id);

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}
