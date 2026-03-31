"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { sendGroupMessage } from "@/app/groups/actions";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

export type ChatMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender: { display_name: string } | null;
};

type GroupChatProps = {
  groupId: string;
  currentUserId: string;
  currentUserName: string;
  initialMessages: ChatMessage[];
  isMember: boolean;
};

export function GroupChat({
  groupId,
  currentUserId,
  currentUserName,
  initialMessages,
  isMember,
}: GroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef(createClient());

  // useActionState — React 19 auto-resets the form after the action resolves,
  // so no controlled-input/setState-in-effect pattern needed.
  const [state, formAction, isPending] = useActionState(sendGroupMessage, null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Realtime subscription for new messages
  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const raw = payload.new as {
            id: string;
            sender_id: string;
            body: string;
            created_at: string;
          };

          // Deduplicate: server action + realtime may both fire for own messages
          setMessages((prev) => {
            if (prev.some((m) => m.id === raw.id)) return prev;
            // Placeholder while we fetch the profile
            return [
              ...prev,
              { ...raw, sender: null },
            ];
          });

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", raw.sender_id)
            .single();

          setMessages((prev) =>
            prev.map((m) =>
              m.id === raw.id
                ? { ...m, sender: profile ?? { display_name: "Walker" } }
                : m,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="glass-panel rounded-[32px] p-5 sm:p-6">
      <p className="text-sm font-semibold text-[var(--text-strong)]">
        Group chat
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--text-body)]">
        {isMember
          ? "Chat with group members in real time."
          : "Join this group to read and send messages."}
      </p>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="mt-4 flex h-72 flex-col gap-3 overflow-y-auto"
      >
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center rounded-[24px] border border-dashed border-[rgba(123,167,209,0.28)] bg-white/42 p-6">
            <p className="text-sm text-[var(--text-soft)]">
              {isMember
                ? "No messages yet. Start the conversation!"
                : "No messages to show."}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            const senderName = isOwn
              ? currentUserName
              : (message.sender?.display_name ?? "Walker");
            const initial = senderName.slice(0, 1).toUpperCase();

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2.5",
                  isOwn ? "flex-row-reverse" : "flex-row",
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    isOwn
                      ? "bg-[linear-gradient(135deg,#4da8da_0%,#256ea8_100%)] text-white"
                      : "border border-white/70 bg-white/82 text-[var(--text-strong)]",
                  )}
                >
                  {initial}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    "flex max-w-[72%] flex-col gap-1",
                    isOwn ? "items-end" : "items-start",
                  )}
                >
                  <div className="flex items-baseline gap-2">
                    {!isOwn && (
                      <span className="text-[11px] font-semibold text-[var(--text-strong)]">
                        {senderName}
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--text-soft)]">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "rounded-[18px] px-3.5 py-2 text-sm leading-6",
                      isOwn
                        ? "border border-[rgba(77,168,218,0.22)] bg-[linear-gradient(135deg,rgba(77,168,218,0.18)_0%,rgba(37,110,168,0.14)_100%)] text-[var(--text-strong)]"
                        : "border border-white/70 bg-white/65 text-[var(--text-strong)]",
                    )}
                  >
                    {message.body}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input area */}
      {isMember ? (
        <form action={formAction} className="mt-4 flex gap-2">
          <input type="hidden" name="groupId" value={groupId} />
          <input
            name="body"
            type="text"
            required
            placeholder="Send a message…"
            disabled={isPending}
            maxLength={2000}
            autoComplete="off"
            className="flex-1 rounded-2xl border border-[rgba(123,167,209,0.24)] bg-white/72 px-4 py-3 text-sm text-[var(--text-strong)] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[var(--text-soft)] focus:border-[var(--accent)] focus:bg-white/88 focus:shadow-[0_0_0_4px_rgba(77,168,218,0.14)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="flex-shrink-0 cursor-pointer rounded-full bg-[linear-gradient(135deg,#4da8da_0%,#256ea8_100%)] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(77,168,218,0.28)] transition-[transform,box-shadow,opacity] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(77,168,218,0.32)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "…" : "Send"}
          </button>
        </form>
      ) : (
        <div className="mt-4 rounded-[18px] border border-dashed border-[rgba(123,167,209,0.28)] bg-white/42 px-4 py-3">
          <p className="text-sm text-[var(--text-body)]">
            Join this group to send messages.
          </p>
        </div>
      )}

      {state?.error ? (
        <p className="mt-2 text-xs text-red-500">{state.error}</p>
      ) : null}
    </div>
  );
}
