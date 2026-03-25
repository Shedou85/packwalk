create policy "users can view visible active walk sessions"
  on public.walk_sessions
  for select
  using (
    auth.uid() = user_id
    or (
      status = 'active'
      and visibility = 'public'
    )
    or (
      status = 'active'
      and visibility = 'followers'
      and exists (
        select 1
        from public.follows f
        where f.follower_id = auth.uid()
          and f.following_id = walk_sessions.user_id
      )
    )
  );

create policy "users can view visible location pings"
  on public.location_pings
  for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.walk_sessions ws
      where ws.id = location_pings.walk_session_id
        and (
          ws.user_id = auth.uid()
          or (
            ws.status = 'active'
            and ws.visibility = 'public'
          )
          or (
            ws.status = 'active'
            and ws.visibility = 'followers'
            and exists (
              select 1
              from public.follows f
              where f.follower_id = auth.uid()
                and f.following_id = ws.user_id
            )
          )
        )
    )
  );
