import { createClient } from "@/lib/supabase/server";

import { appNavItems } from "./app-nav-items";
import { MobileBottomNav } from "./mobile-bottom-nav";

/**
 * Server component wrapper for MobileBottomNav.
 * Fetches unread notification count and injects it as a badge on the alerts item.
 * Replace all direct <MobileBottomNav items={appNavItems} /> usages with <AppNav />.
 */
export async function AppNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unreadCount = 0;

  if (user) {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);
    unreadCount = count ?? 0;
  }

  const items = appNavItems.map((item) =>
    item.href === "/notifications" && unreadCount > 0
      ? { ...item, badge: unreadCount }
      : item,
  );

  return <MobileBottomNav items={items} />;
}
