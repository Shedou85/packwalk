"use server";

import { createClient } from "./server";

type NotificationInput = {
  /** Recipient user id */
  userId: string;
  /** The user who triggered the notification (must equal auth.uid() at call time) */
  actorId: string;
  /** e.g. 'follow' | 'group_invite' | 'group_message' */
  type: string;
  title: string;
  body?: string;
  payload?: Record<string, unknown>;
};

/**
 * Insert a notification row. The calling user must be the actor.
 * RLS enforces: actor_id = auth.uid().
 */
export async function sendNotification(input: NotificationInput): Promise<void> {
  const supabase = await createClient();
  await supabase.from("notifications").insert({
    user_id: input.userId,
    actor_id: input.actorId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    payload: input.payload ?? {},
  });
}

/** Convenience: notify a user that someone followed them. */
export async function notifyFollow(opts: {
  followerId: string;
  followerDisplayName: string;
  followedUserId: string;
}): Promise<void> {
  await sendNotification({
    userId: opts.followedUserId,
    actorId: opts.followerId,
    type: "follow",
    title: `${opts.followerDisplayName} started following you`,
    payload: { follower_id: opts.followerId },
  });
}

/** Convenience: notify a group owner that someone joined. */
export async function notifyGroupJoin(opts: {
  joinerId: string;
  joinerDisplayName: string;
  groupOwnerId: string;
  groupId: string;
  groupName: string;
}): Promise<void> {
  if (opts.joinerId === opts.groupOwnerId) return; // owner joining their own group — skip
  await sendNotification({
    userId: opts.groupOwnerId,
    actorId: opts.joinerId,
    type: "group_join",
    title: `${opts.joinerDisplayName} joined ${opts.groupName}`,
    payload: { group_id: opts.groupId, joiner_id: opts.joinerId },
  });
}

/**
 * Notify all active members of a group about a new message.
 * Call this from a future sendGroupMessage action.
 */
export async function notifyGroupMessage(opts: {
  senderId: string;
  senderDisplayName: string;
  groupId: string;
  groupName: string;
  memberIds: string[];
}): Promise<void> {
  const recipients = opts.memberIds.filter((id) => id !== opts.senderId);
  if (recipients.length === 0) return;

  const supabase = await createClient();
  await supabase.from("notifications").insert(
    recipients.map((userId) => ({
      user_id: userId,
      actor_id: opts.senderId,
      type: "group_message",
      title: `New message in ${opts.groupName}`,
      body: `${opts.senderDisplayName} sent a message`,
      payload: { group_id: opts.groupId, sender_id: opts.senderId },
    })),
  );
}

/** Notify a user they were invited to a private group. */
export async function notifyGroupInvite(opts: {
  inviterId: string;
  inviterDisplayName: string;
  inviteeId: string;
  groupId: string;
  groupName: string;
}): Promise<void> {
  await sendNotification({
    userId: opts.inviteeId,
    actorId: opts.inviterId,
    type: "group_invite",
    title: `${opts.inviterDisplayName} invited you to ${opts.groupName}`,
    payload: { group_id: opts.groupId, inviter_id: opts.inviterId },
  });
}
