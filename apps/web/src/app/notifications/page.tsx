import Link from "next/link";
import { redirect } from "next/navigation";

import { AppNav } from "@/components/navigation/app-nav";
import { Pill } from "@/components/ui/pill";
import { SurfaceCard } from "@/components/ui/surface-card";
import { createClient } from "@/lib/supabase/server";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
  actor: { display_name: string | null; username: string } | null;
  payload: Record<string, unknown>;
};

const TYPE_ICONS: Record<string, string> = {
  follow: "👋",
  group_join: "🐾",
  group_invite: "✉️",
  group_message: "💬",
};

function typeIcon(type: string): string {
  return TYPE_ICONS[type] ?? "🔔";
}

function getNotificationLink(n: Notification): string | null {
  switch (n.type) {
    case "follow":
      return "/map";
    case "group_message":
    case "group_invite":
    case "group_join": {
      const groupId = n.payload?.group_id;
      return typeof groupId === "string" ? `/groups/${groupId}` : null;
    }
    default:
      return null;
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: rawNotifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, read_at, created_at, payload, actor:profiles!actor_id(display_name, username)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications: Notification[] = (rawNotifications ?? []).map((n) => ({
    ...n,
    actor: Array.isArray(n.actor) ? (n.actor[0] ?? null) : n.actor,
    payload: (n.payload ?? {}) as Record<string, unknown>,
  }));

  // Mark all unread as read now that the page is being viewed
  const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
  if (unreadIds.length > 0) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .eq("user_id", user.id);
  }

  const unreadCount = unreadIds.length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 pb-28 sm:px-6 sm:py-6 sm:pb-6">
      <SurfaceCard
        strong
        className="overflow-hidden rounded-[28px] px-4 py-5 sm:px-6 sm:py-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
          PackWalk
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
          Notifications
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-body)]">
          Follows, group activity, and other updates.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill>{notifications.length} total</Pill>
          {unreadCount > 0 && <Pill>{unreadCount} new</Pill>}
        </div>
      </SurfaceCard>

      <section className="mt-4 flex flex-1 flex-col gap-4 sm:mt-6 sm:gap-6">
        <SurfaceCard className="p-5 sm:p-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="text-4xl">🔔</span>
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                No notifications yet
              </p>
              <p className="max-w-xs text-sm leading-6 text-[var(--text-body)]">
                When someone follows you or there&apos;s activity in your groups,
                it will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[rgba(123,167,209,0.15)]">
              {notifications.map((n) => {
                const wasUnread = unreadIds.includes(n.id);
                const link = getNotificationLink(n);
                const inner = (
                  <>
                    {/* Icon bubble */}
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(109,150,189,0.2)] bg-[rgba(255,255,255,0.6)] text-[18px]"
                      aria-hidden="true"
                    >
                      {typeIcon(n.type)}
                    </span>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={
                            wasUnread
                              ? "flex-1 text-sm font-semibold text-[var(--text-strong)]"
                              : "flex-1 text-sm text-[var(--text-body)]"
                          }
                        >
                          {n.title}
                        </p>
                        {wasUnread && (
                          <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[var(--accent-strong)]" />
                        )}
                      </div>
                      {n.body ? (
                        <p className="mt-0.5 text-xs text-[var(--text-soft)]">
                          {n.body}
                        </p>
                      ) : null}
                      <p className="mt-1 text-[11px] text-[var(--text-soft)]">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>

                    {/* Chevron for clickable rows */}
                    {link && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 shrink-0 text-[var(--text-soft)] opacity-50"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </>
                );

                const rowClass = `flex items-center gap-4 py-4 first:pt-0 last:pb-0${link ? " -mx-1 rounded-xl px-1 transition-colors hover:bg-[rgba(109,150,189,0.08)] active:bg-[rgba(109,150,189,0.15)]" : ""}`;

                return (
                  <li key={n.id}>
                    {link ? (
                      <Link href={link} className={rowClass}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={rowClass}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </SurfaceCard>
      </section>

      <AppNav />
    </main>
  );
}
