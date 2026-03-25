create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    username,
    display_name
  )
  values (
    new.id,
    lower(
      regexp_replace(
        coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), 'walker-' || left(new.id::text, 8)),
        '[^a-z0-9_]+',
        '-',
        'g'
      )
    ),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'Walker')
  )
  on conflict (id) do update
  set
    username = excluded.username,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.dogs enable row level security;
alter table public.walk_sessions enable row level security;
alter table public.location_pings enable row level security;
alter table public.follows enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_messages enable row level security;
alter table public.notifications enable row level security;

create policy "profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

create policy "users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users can view their own dogs"
  on public.dogs
  for select
  using (auth.uid() = owner_id);

create policy "users can manage their own dogs"
  on public.dogs
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "users can view their own walk sessions"
  on public.walk_sessions
  for select
  using (auth.uid() = user_id);

create policy "users can manage their own walk sessions"
  on public.walk_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can view their own location pings"
  on public.location_pings
  for select
  using (auth.uid() = user_id);

create policy "users can manage their own location pings"
  on public.location_pings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can view follows they participate in"
  on public.follows
  for select
  using (auth.uid() = follower_id or auth.uid() = following_id);

create policy "users can create follows for themselves"
  on public.follows
  for insert
  with check (auth.uid() = follower_id);

create policy "users can delete follows they created"
  on public.follows
  for delete
  using (auth.uid() = follower_id);

create policy "public groups are viewable by everyone"
  on public.groups
  for select
  using (
    privacy = 'public'
    or owner_id = auth.uid()
    or exists (
      select 1
      from public.group_members gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
        and gm.status = 'active'
    )
  );

create policy "authenticated users can create groups"
  on public.groups
  for insert
  with check (auth.uid() = owner_id);

create policy "group owners can update their groups"
  on public.groups
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "group owners can delete their groups"
  on public.groups
  for delete
  using (auth.uid() = owner_id);

create policy "users can view members of groups they can access"
  on public.group_members
  for select
  using (
    exists (
      select 1
      from public.groups g
      where g.id = group_members.group_id
        and (
          g.privacy = 'public'
          or g.owner_id = auth.uid()
          or exists (
            select 1
            from public.group_members gm
            where gm.group_id = g.id
              and gm.user_id = auth.uid()
              and gm.status = 'active'
          )
        )
    )
  );

create policy "owners can add group members"
  on public.group_members
  for insert
  with check (
    exists (
      select 1
      from public.groups g
      where g.id = group_members.group_id
        and g.owner_id = auth.uid()
    )
  );

create policy "owners and members can update membership state"
  on public.group_members
  for update
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.groups g
      where g.id = group_members.group_id
        and g.owner_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1
      from public.groups g
      where g.id = group_members.group_id
        and g.owner_id = auth.uid()
    )
  );

create policy "members can read group messages"
  on public.group_messages
  for select
  using (
    exists (
      select 1
      from public.group_members gm
      where gm.group_id = group_messages.group_id
        and gm.user_id = auth.uid()
        and gm.status = 'active'
    )
  );

create policy "members can send group messages"
  on public.group_messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.group_members gm
      where gm.group_id = group_messages.group_id
        and gm.user_id = auth.uid()
        and gm.status = 'active'
    )
  );

create policy "users can view their own notifications"
  on public.notifications
  for select
  using (auth.uid() = user_id);

create policy "users can update their own notifications"
  on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
