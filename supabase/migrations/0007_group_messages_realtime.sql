-- Enable Realtime for group_messages so clients can subscribe to INSERT events.
-- RLS policies on group_messages already restrict which rows each user can see,
-- so broadcasting all inserts is safe — Supabase filters by the authenticated
-- user's RLS context before delivering events to subscribers.
alter publication supabase_realtime add table public.group_messages;
