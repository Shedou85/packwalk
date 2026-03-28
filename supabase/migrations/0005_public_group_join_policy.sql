-- Allow authenticated users to join public groups by inserting themselves
-- as a regular member with active status.
create policy "users can join public groups"
  on public.group_members
  for insert
  with check (
    auth.uid() = user_id
    and role = 'member'
    and status = 'active'
    and exists (
      select 1 from public.groups g
      where g.id = group_members.group_id
        and g.privacy = 'public'
    )
  );
