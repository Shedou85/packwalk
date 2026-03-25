create or replace function public.generate_unique_profile_username(base_value text, user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_base text;
  candidate text;
  suffix integer := 0;
begin
  normalized_base := lower(coalesce(base_value, ''));
  normalized_base := regexp_replace(normalized_base, '[^a-z0-9_]+', '-', 'g');
  normalized_base := regexp_replace(normalized_base, '(^-+|-+$)', '', 'g');

  if normalized_base = '' then
    normalized_base := 'walker';
  end if;

  candidate := left(normalized_base, 24);

  loop
    exit when not exists (
      select 1
      from public.profiles p
      where p.username = candidate
        and p.id <> user_id
    );

    suffix := suffix + 1;
    candidate := left(normalized_base, greatest(1, 24 - length(suffix::text) - 1)) || '-' || suffix::text;
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  resolved_username text;
  resolved_display_name text;
begin
  base_username := coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1),
    'walker-' || left(new.id::text, 8)
  );

  resolved_username := public.generate_unique_profile_username(base_username, new.id);
  resolved_display_name := coalesce(
    new.raw_user_meta_data ->> 'display_name',
    split_part(new.email, '@', 1),
    'Walker'
  );

  insert into public.profiles (
    id,
    username,
    display_name
  )
  values (
    new.id,
    resolved_username,
    resolved_display_name
  )
  on conflict (id) do update
  set
    username = excluded.username,
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();

  return new;
end;
$$;
