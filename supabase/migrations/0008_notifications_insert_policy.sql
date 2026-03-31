-- Allow authenticated users to insert notifications where they are the actor.
-- This covers: follow notifications, group join notifications, etc.
create policy "authenticated users can send notifications"
  on public.notifications
  for insert
  to authenticated
  with check (auth.uid() = actor_id);
