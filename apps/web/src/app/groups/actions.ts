"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const groupSchema = z.object({
  name: z.string().trim().min(2, "Group name must be at least 2 characters.").max(80),
  description: z.string().trim().max(500).optional(),
  privacy: z.enum(["public", "private"]),
});

const getText = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value : "";

export async function createGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?error=Please sign in before creating a group.");
  }

  const parsed = groupSchema.safeParse({
    name: getText(formData.get("name")),
    description: getText(formData.get("description")) || undefined,
    privacy: getText(formData.get("privacy")),
  });

  if (!parsed.success) {
    redirect(
      `/groups?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid group.")}`,
    );
  }

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      privacy: parsed.data.privacy,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/groups?error=${encodeURIComponent(error.message)}`);
  }

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  if (memberError) {
    redirect(`/groups?error=${encodeURIComponent(memberError.message)}`);
  }

  revalidatePath("/groups");
  redirect("/groups?message=Group created.");
}

export async function joinGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?error=Please sign in before joining a group.");
  }

  const groupId = getText(formData.get("groupId"));

  if (!groupId) {
    redirect("/groups?error=Missing group.");
  }

  // Try updating an existing row first (re-join after leaving)
  const { data: updated } = await supabase
    .from("group_members")
    .update({
      status: "active",
      role: "member",
      joined_at: new Date().toISOString(),
    })
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .select("group_id");

  if (updated && updated.length > 0) {
    revalidatePath("/groups");
    revalidatePath(`/groups/${groupId}`);
    redirect(`/groups/${groupId}?message=Joined group.`);
  }

  // No existing row — insert a new membership
  const { error } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: user.id,
    role: "member",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  if (error) {
    const msg =
      error.code === "23505"
        ? "You are already a member of this group."
        : error.message;
    redirect(`/groups/${groupId}?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}?message=Joined group.`);
}

export async function sendGroupMessage(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in first." };
  }

  const groupId = getText(formData.get("groupId"));
  const body = getText(formData.get("body")).trim();

  if (!groupId || !body) {
    return { error: "Missing required fields." };
  }

  if (body.length > 2000) {
    return { error: "Message too long (max 2000 characters)." };
  }

  const { error } = await supabase.from("group_messages").insert({
    group_id: groupId,
    sender_id: user.id,
    body,
    message_type: "text",
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function leaveGroup(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?error=Please sign in first.");
  }

  const groupId = getText(formData.get("groupId"));

  if (!groupId) {
    redirect("/groups?error=Missing group.");
  }

  // Prevent the owner from leaving
  const { data: group } = await supabase
    .from("groups")
    .select("owner_id")
    .eq("id", groupId)
    .single();

  if (group?.owner_id === user.id) {
    redirect(
      `/groups/${groupId}?error=${encodeURIComponent("Owners cannot leave their own group.")}`,
    );
  }

  const { error } = await supabase
    .from("group_members")
    .update({ status: "left" })
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  redirect("/groups?message=Left group.");
}
