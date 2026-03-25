import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

const buildUsername = (user: User) => {
  const metadataUsername =
    typeof user.user_metadata.username === "string"
      ? user.user_metadata.username
      : undefined;

  const emailPrefix = user.email?.split("@")[0];
  const fallback = metadataUsername ?? emailPrefix ?? `walker-${user.id.slice(0, 8)}`;

  return fallback
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
};

export const ensureProfile = async (user: User) => {
  const supabase = await createClient();

  const payload = {
    id: user.id,
    username: buildUsername(user),
    display_name:
      typeof user.user_metadata.display_name === "string"
        ? user.user_metadata.display_name
        : user.email?.split("@")[0] ?? "Walker",
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(error.message);
  }
};
