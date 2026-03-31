import { redirect } from "next/navigation";

import { joinGroup, leaveGroup } from "@/app/groups/actions";
import { AppNav } from "@/components/navigation/app-nav";
import { GroupChat } from "@/components/groups/group-chat";
import type { ChatMessage } from "@/components/groups/group-chat";
import { ProfileConnectionList } from "@/components/profile/profile-connection-list";
import { Button, ButtonLink } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";
import { createClient } from "@/lib/supabase/server";

type GroupDetailPageProps = {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

export default async function GroupDetailPage({
  params,
  searchParams,
}: GroupDetailPageProps) {
  const { groupId } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [
    { data: group },
    { data: members },
    { data: membership },
    { data: rawMessages },
    { data: currentProfile },
  ] = await Promise.all([
    supabase
      .from("groups")
      .select("id, name, description, privacy, owner_id, created_at")
      .eq("id", groupId)
      .single(),
    supabase
      .from("group_members")
      .select("user_id, role, joined_at")
      .eq("group_id", groupId)
      .eq("status", "active"),
    supabase
      .from("group_members")
      .select("role, status")
      .eq("group_id", groupId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("group_messages")
      .select("id, sender_id, body, created_at, profiles(display_name)")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true })
      .limit(50),
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single(),
  ]);

  if (!group) {
    redirect("/groups?error=Group not found.");
  }

  // Resolve member profiles
  const memberUserIds = (members ?? []).map((m) => m.user_id);

  const { data: profiles } = memberUserIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, username, city")
        .in("id", memberUserIds)
    : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p]),
  );

  const memberItems = (members ?? []).map((m) => {
    const profile = profileMap.get(m.user_id);
    return {
      id: m.user_id,
      title: profile?.display_name ?? profile?.username ?? "Walker",
      subtitle: profile?.city ?? "City not set",
      meta: m.role,
    };
  });

  const isOwner = group.owner_id === user.id;
  const isActiveMember = membership?.status === "active";
  const canJoin = !isActiveMember && group.privacy === "public";
  const canLeave = isActiveMember && !isOwner;

  const initialMessages: ChatMessage[] = (rawMessages ?? []).map((m) => ({
    id: m.id,
    sender_id: m.sender_id,
    body: m.body,
    created_at: m.created_at,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sender: (m.profiles as any) ?? null,
  }));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6">
      <SurfaceCard
        strong
        className="overflow-hidden rounded-[28px] px-4 py-5 sm:px-6 sm:py-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
              Group
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
              {group.name}
            </h1>
            {group.description ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
                {group.description}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>{group.privacy}</Pill>
              <Pill>{memberItems.length} members</Pill>
              {isOwner ? <Pill>owner</Pill> : null}
            </div>
          </div>

          <ButtonLink href="/groups" className="hidden px-4 py-2 sm:inline-flex">
            All groups
          </ButtonLink>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 sm:hidden">
          <ButtonLink href="/groups" className="px-4 py-2">
            All groups
          </ButtonLink>
        </div>
      </SurfaceCard>

      <section className="mt-4 flex flex-1 flex-col gap-4 sm:mt-6 sm:gap-6">
        {(sp.message || sp.error) && (
          <SurfaceCard className="p-5 sm:p-6">
            {sp.message ? <Notice>{sp.message}</Notice> : null}
            {sp.error ? (
              <Notice variant="error">{sp.error}</Notice>
            ) : null}
          </SurfaceCard>
        )}

        {(canJoin || canLeave || isOwner) && (
          <SurfaceCard className="p-5 sm:p-6">
            {canJoin ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm leading-6 text-[var(--text-body)]">
                  This group is public. Join to become a member.
                </p>
                <form action={joinGroup}>
                  <input type="hidden" name="groupId" value={group.id} />
                  <Button className="whitespace-nowrap px-4 py-2">
                    Join group
                  </Button>
                </form>
              </div>
            ) : null}

            {canLeave ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm leading-6 text-[var(--text-body)]">
                  You are a member of this group.
                </p>
                <form action={leaveGroup}>
                  <input type="hidden" name="groupId" value={group.id} />
                  <Button
                    variant="secondary"
                    className="whitespace-nowrap px-4 py-2"
                  >
                    Leave group
                  </Button>
                </form>
              </div>
            ) : null}

            {isOwner ? (
              <p className="text-sm leading-6 text-[var(--text-body)]">
                You own this group.
              </p>
            ) : null}
          </SurfaceCard>
        )}

        <ProfileConnectionList
          title="Members"
          description="People who are part of this group."
          badge={`${memberItems.length}`}
          emptyText="No members yet."
          items={memberItems}
        />

        <GroupChat
          groupId={group.id}
          currentUserId={user.id}
          currentUserName={currentProfile?.display_name ?? "You"}
          initialMessages={initialMessages}
          isMember={isActiveMember}
        />
      </section>

      <AppNav />
    </main>
  );
}
