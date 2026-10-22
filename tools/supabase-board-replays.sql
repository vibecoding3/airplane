-- Paper Nosedive — leaderboard replays (js/replay.js, js/leaderboard.js, v158). Run once in the Supabase dashboard
-- after tools/supabase-levels.sql (it replaces tools/supabase-replays.sql): SQL Editor → New query → paste → Run.
-- Safe to run again.
--
-- Only runs that are on the leaderboards keep a replay: one per player and map, their best. A deeper run replaces it
-- (the old one is deleted). The game sends a replay only for a run the server has already counted (lb_run), and the
-- server checks the replay's run id, map and depth against that counted run. Everyone can watch the replays on the
-- map boards; nobody can read or change the table directly.

-- 1. the v157 replays (one for every run) go: replaced by one per player and map
drop trigger if exists replays_cleanup on public.replays;
drop function if exists public.replays_cleanup();
drop table if exists public.replays;

-- 2. counted runs remember their map and depth, so a replay can be matched to the run it records
alter table public.counted_runs add column if not exists map text;
alter table public.counted_runs add column if not exists depth int;

create or replace function public.lb_run(p_visitor uuid, p_run uuid, p_map text, p_depth int, p_duration int) returns bigint
language plpgsql security definer set search_path = public as $$
declare p players%rowtype;
begin
  select * into p from players where visitor_id = p_visitor for update;
  if not found then return null; end if;
  if p_run is null or p_depth is null or p_duration is null or p_depth < 0 or p_duration < 0
     or p_depth > p_duration * 16 + 30
     or p.played_s + p_duration > extract(epoch from now() - p.created_at) + 600 then
    return -1;
  end if;
  insert into counted_runs (id, visitor_id, map, depth) values (p_run, p_visitor, p_map, p_depth) on conflict (id) do nothing;
  if not found then return p.xp; end if;      -- already counted: a retry
  update players set xp = least(xp + p_depth, 1000000000), played_s = played_s + p_duration, xp_at = now()
    where visitor_id = p_visitor returning xp into p.xp;
  if p_depth > 0 and p_map = any (array['notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen']) then
    insert into scores (visitor_id, map, depth) values (p_visitor, p_map, p_depth)
    on conflict (visitor_id, map) do update set depth = excluded.depth, updated_at = now() where scores.depth < excluded.depth;
  end if;
  return p.xp;
end $$;

-- 3. one replay per player and map
create table public.replays (
  visitor_id  uuid not null references public.players (visitor_id) on delete cascade,
  map         text not null check (map in ('notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen')),
  id          uuid not null unique,                 -- what the boards hand out; new for every replacement
  depth       int not null check (depth between 0 and 1000000),
  sv          int not null,                         -- the game's simulation version (SIM_VERSION in js/replay.js)
  version     text check (char_length(version) <= 20),
  data        jsonb not null check (pg_column_size(data) < 300000),
  created_at  timestamptz not null default now(),
  primary key (visitor_id, map)
);
alter table public.replays enable row level security;      -- no policies: only the functions below reach it
revoke all on public.replays from anon, authenticated;

-- save a replay for a counted run: kept only if it is deeper than the player's stored one on that map
-- ('ok', 'kept' = a deeper one is already stored, 'unknown' = no such counted run)
create or replace function public.lb_save_replay(p_visitor uuid, p_run uuid, p_map text, p_depth int, p_sv int, p_version text, p_data jsonb)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from counted_runs where id = p_run and visitor_id = p_visitor and map = p_map and depth = p_depth) then
    return 'unknown';
  end if;
  insert into replays (visitor_id, map, id, depth, sv, version, data)
  values (p_visitor, p_map, gen_random_uuid(), p_depth, p_sv, left(p_version, 20), p_data)
  on conflict (visitor_id, map) do update
    set id = excluded.id, depth = excluded.depth, sv = excluded.sv, version = excluded.version, data = excluded.data, created_at = now()
    where replays.depth < excluded.depth;
  return case when found then 'ok' else 'kept' end;
end $$;

-- a replay to watch, by the id a board handed out
create or replace function public.lb_get_replay(p_id uuid)
returns table (map text, depth int, sv int, nickname text, data jsonb)
language sql stable security definer set search_path = public as $$
  select r.map, r.depth, r.sv, p.nickname, r.data from replays r join players p using (visitor_id) where r.id = p_id
$$;

-- 4. the boards now say which rows have a replay (map boards only: a replay of exactly the row's depth)
drop function if exists public.lb_board(text, uuid);
create function public.lb_board(p_map text, p_visitor uuid)
returns table (rank bigint, nickname text, depth bigint, me boolean, replay uuid, replay_sv int)
language sql stable security definer set search_path = public as $$
  with totals as (
    select s.visitor_id, sum(s.depth)::bigint as depth, max(s.updated_at) as at
    from scores s where p_map = 'total' group by s.visitor_id
    union all
    select s.visitor_id, s.depth::bigint, s.updated_at from scores s where s.map = p_map and p_map <> 'total'
  ), ranked as (
    select t.visitor_id, p.nickname, t.depth, rank() over (order by t.depth desc, t.at asc) as rank
    from totals t join players p using (visitor_id) where t.depth > 0
  )
  select r.rank, r.nickname, r.depth, r.visitor_id = p_visitor as me, rp.id, rp.sv
  from ranked r left join replays rp on rp.visitor_id = r.visitor_id and rp.map = p_map and rp.depth = r.depth
  where r.rank <= 20 or r.visitor_id = p_visitor
  order by r.rank
$$;

revoke execute on function public.lb_save_replay(uuid, uuid, text, int, int, text, jsonb), public.lb_get_replay(uuid), public.lb_board(text, uuid) from public;
grant execute on function public.lb_save_replay(uuid, uuid, text, int, int, text, jsonb), public.lb_get_replay(uuid), public.lb_board(text, uuid) to anon;
