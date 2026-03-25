create extension if not exists pgcrypto;

create type public.visibility as enum ('public', 'followers', 'private_group');
create type public.location_precision as enum ('exact', 'approximate');
create type public.walk_status as enum ('active', 'ended', 'expired');
create type public.group_privacy as enum ('public', 'private');
create type public.group_role as enum ('owner', 'admin', 'member');
create type public.group_member_status as enum ('invited', 'active', 'left');
create type public.message_type as enum ('text', 'system');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text not null,
  avatar_url text,
  bio text,
  city text,
  language text not null default 'en',
  default_visibility public.visibility not null default 'followers',
  default_location_precision public.location_precision not null default 'approximate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  breed text,
  age_years integer,
  size text,
  temperament text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.walk_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  status public.walk_status not null default 'active',
  visibility public.visibility not null default 'followers',
  location_precision public.location_precision not null default 'approximate',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  expires_at timestamptz not null,
  last_latitude double precision,
  last_longitude double precision,
  last_accuracy_meters double precision,
  created_at timestamptz not null default now(),
  constraint walk_sessions_ended_after_started check (
    ended_at is null or ended_at >= started_at
  ),
  constraint walk_sessions_expires_after_started check (expires_at >= started_at)
);

create table public.location_pings (
  id uuid primary key default gen_random_uuid(),
  walk_session_id uuid not null references public.walk_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_meters double precision,
  recorded_at timestamptz not null default now()
);

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  privacy public.group_privacy not null default 'private',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.group_role not null default 'member',
  status public.group_member_status not null default 'invited',
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  message_type public.message_type not null default 'text',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null,
  title text not null,
  body text,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_dogs_owner_id on public.dogs (owner_id);
create index idx_walk_sessions_user_id on public.walk_sessions (user_id);
create index idx_walk_sessions_status on public.walk_sessions (status);
create index idx_walk_sessions_visibility on public.walk_sessions (visibility);
create index idx_walk_sessions_expires_at on public.walk_sessions (expires_at);
create index idx_location_pings_walk_session_id on public.location_pings (walk_session_id);
create index idx_location_pings_user_id on public.location_pings (user_id);
create index idx_location_pings_recorded_at on public.location_pings (recorded_at desc);
create index idx_follows_following_id on public.follows (following_id);
create index idx_groups_owner_id on public.groups (owner_id);
create index idx_group_members_user_id on public.group_members (user_id);
create index idx_group_members_status on public.group_members (status);
create index idx_group_messages_group_id on public.group_messages (group_id);
create index idx_group_messages_created_at on public.group_messages (created_at desc);
create index idx_notifications_user_id on public.notifications (user_id);
create index idx_notifications_created_at on public.notifications (created_at desc);
