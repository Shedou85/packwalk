-- Fix infinite recursion between groups and group_members SELECT policies.
--
-- Root cause:
--   groups SELECT policy     → subquery to group_members
--   group_members SELECT policy → subquery to groups
--   PostgreSQL detects the cycle and raises "infinite recursion"
--
-- Fix: replace the group_members SELECT policy with one that calls a
-- security definer function. security definer bypasses RLS internally,
-- breaking the cycle while preserving the same access rules.

create or replace function public.group_is_accessible(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    exists (
      select 1 from public.groups
      where id = gid
        and (privacy = 'public' or owner_id = auth.uid())
    )
    or exists (
      select 1 from public.group_members
      where group_id = gid
        and user_id = auth.uid()
        and status = 'active'
    )
$$;

drop policy if exists "users can view members of groups they can access"
  on public.group_members;

create policy "users can view members of groups they can access"
  on public.group_members
  for select
  using (public.group_is_accessible(group_members.group_id));
