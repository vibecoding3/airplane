-- Paper Nosedive — the Daily dive and its ghosts (js/daily.js, v160). Run once in the Supabase dashboard after
-- tools/supabase-board-replays.sql: SQL Editor → New query → paste all of this → Run. Safe to run again.
--
-- Every UTC day has one map and one obstacle course, the same for everyone (worked out from the date, in the game and
-- here). A joined player's daily run goes up after the server has counted it (lb_run): its depth and its flight path
-- (the plane's x and depth 4 times a second), the player's best of the day kept. The flight paths are the ghosts:
-- during a daily dive the game shows today's top 3 and the player's own best. Days older than 7 are deleted.

create table if not exists public.daily_runs (
  day         date not null,
  visitor_id  uuid not null references public.players (visitor_id) on delete cascade,
  map         text not null,
  depth       int not null check (depth between 0 and 1000000),
  track       jsonb not null check (pg_column_size(track) < 200000),
  created_at  timestamptz not null default now(),
  primary key (day, visitor_id)
);
create index if not exists daily_runs_board on public.daily_runs (day, depth desc);
alter table public.daily_runs enable row level security;      -- no policies: only the functions below reach it
revoke all on public.daily_runs from anon, authenticated;

-- the day's map: the same formula as dailyMap() in js/daily.js (days since 1970 through a multiplicative hash)
create or replace function public.daily_map(p_day date) returns text
language sql immutable as $$
  select (array['notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen'])
    [1 + (((((p_day - date '1970-01-01')::bigint * 2654435761) % 4294967296) / 65536) % 9)::int]
$$;

-- a counted run as today's (or yesterday's, for a run sent late) daily dive: 'ok', 'kept' (a deeper one is stored),
-- 'day' (too old or in the future), 'map' (not that day's map) or 'unknown' (no such counted run)
create or replace function public.lb_daily_submit(p_visitor uuid, p_run uuid, p_day date, p_map text, p_depth int, p_track jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare today date := (now() at time zone 'utc')::date; saved boolean;
begin
  if p_day is null or p_day < today - 1 or p_day > today then return 'day'; end if;
  if p_map is distinct from daily_map(p_day) then return 'map'; end if;
  if not exists (select 1 from counted_runs where id = p_run and visitor_id = p_visitor and map = p_map and depth = p_depth) then
    return 'unknown';
  end if;
  insert into daily_runs (day, visitor_id, map, depth, track) values (p_day, p_visitor, p_map, p_depth, p_track)
  on conflict (day, visitor_id) do update set depth = excluded.depth, track = excluded.track, created_at = now()
    where daily_runs.depth < excluded.depth;
  saved := found;
  delete from daily_runs where day < today - 7;
  return case when saved then 'ok' else 'kept' end;
end $$;

-- the day's board: the top 20 and the caller's own row; ties go to whoever got there first
create or replace function public.lb_daily_board(p_day date, p_visitor uuid)
returns table (rank bigint, nickname text, depth bigint, me boolean)
language sql stable security definer set search_path = public as $$
  with r as (
    select d.visitor_id, p.nickname, d.depth, rank() over (order by d.depth desc, d.created_at asc) as rank
    from daily_runs d join players p using (visitor_id) where d.day = p_day
  )
  select r.rank, r.nickname, r.depth::bigint, r.visitor_id = p_visitor from r
  where r.rank <= 20 or r.visitor_id = p_visitor order by r.rank
$$;

-- the ghosts for a daily dive: the day's top 3 other players and the caller's own best
create or replace function public.lb_daily_ghosts(p_day date, p_visitor uuid)
returns table (nickname text, depth int, me boolean, track jsonb)
language sql stable security definer set search_path = public as $$
  (select p.nickname, d.depth, false, d.track from daily_runs d join players p using (visitor_id)
   where d.day = p_day and d.visitor_id is distinct from p_visitor order by d.depth desc, d.created_at asc limit 3)
  union all
  (select p.nickname, d.depth, true, d.track from daily_runs d join players p using (visitor_id)
   where d.day = p_day and d.visitor_id = p_visitor)
$$;

revoke execute on function public.lb_daily_submit(uuid, uuid, date, text, int, jsonb), public.lb_daily_board(date, uuid), public.lb_daily_ghosts(date, uuid) from public;
grant execute on function public.lb_daily_submit(uuid, uuid, date, text, int, jsonb), public.lb_daily_board(date, uuid), public.lb_daily_ghosts(date, uuid), public.daily_map(date) to anon;
