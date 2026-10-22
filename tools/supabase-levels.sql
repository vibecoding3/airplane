-- Paper Nosedive — server-side XP and the Level board (js/leaderboard.js, v146). Run once in the Supabase dashboard
-- after tools/supabase-leaderboards.sql: SQL Editor → New query → paste all of this → Run. Safe to run again.
--
-- For players with a nickname the server keeps the XP: the game reports each finished run and the server adds it,
-- after checking it could have happened:
--   * a run can't be deeper than the plane falls in that time (top speed about 15.4 m/s with a speed boost, so 16 m/s
--     plus 30 m of slack);
--   * the seconds of all counted runs can't add up to more than the real time since the player joined (plus 10 min);
--   * each run has its own id and counts once, however often the game retries sending it.
-- The XP a device had before joining is carried over once, as it was (the player's choice; it can't be checked).
-- It can't be made cheat-proof (the game runs on the player's device), but nobody can jump levels: faking has to
-- keep a believable pace in real time.

alter table public.players add column if not exists xp bigint not null default 0;
alter table public.players add column if not exists played_s bigint not null default 0;      -- seconds of counted runs
alter table public.players add column if not exists xp_imported boolean not null default false;
alter table public.players add column if not exists xp_at timestamptz not null default now();  -- last XP change (ties)
do $$ begin
  alter table public.players add constraint players_xp_range check (xp between 0 and 1000000000);
exception when duplicate_object then null; end $$;

create table if not exists public.counted_runs (
  id          uuid primary key,                -- made by the game for each run
  visitor_id  uuid not null references public.players (visitor_id) on delete cascade,
  at          timestamptz not null default now()
);
alter table public.counted_runs enable row level security;
revoke all on public.counted_runs from anon, authenticated;

-- the XP the device had before joining, added once; returns the server's XP (null: no nickname)
create or replace function public.lb_xp_start(p_visitor uuid, p_xp bigint) returns bigint
language plpgsql security definer set search_path = public as $$
declare total bigint;
begin
  update players set xp = least(xp + greatest(coalesce(p_xp, 0), 0), 1000000000), xp_imported = true, xp_at = now()
    where visitor_id = p_visitor and not xp_imported;
  select xp into total from players where visitor_id = p_visitor;
  return total;
end $$;

-- one finished run: returns the server's XP after it, -1 if the run was refused, null if the player has no nickname.
-- A counted run also counts as a best on its map.
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
  insert into counted_runs (id, visitor_id) values (p_run, p_visitor) on conflict (id) do nothing;
  if not found then return p.xp; end if;      -- already counted: a retry
  update players set xp = least(xp + p_depth, 1000000000), played_s = played_s + p_duration, xp_at = now()
    where visitor_id = p_visitor returning xp into p.xp;
  if p_depth > 0 and p_map = any (array['notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen']) then
    insert into scores (visitor_id, map, depth) values (p_visitor, p_map, p_depth)
    on conflict (visitor_id, map) do update set depth = excluded.depth, updated_at = now() where scores.depth < excluded.depth;
  end if;
  return p.xp;
end $$;

-- the server's XP for this player (null: no nickname)
create or replace function public.lb_my_xp(p_visitor uuid) returns bigint
language sql stable security definer set search_path = public as $$
  select xp from players where visitor_id = p_visitor
$$;

-- the Level board: the top 10 by XP (the game turns XP into a level); ties go to whoever got there first
create or replace function public.lb_levels(p_visitor uuid)
returns table (rank bigint, nickname text, depth bigint, me boolean)
language sql stable security definer set search_path = public as $$
  select rank() over (order by xp desc, xp_at asc), nickname, xp, visitor_id = p_visitor
  from players where xp > 0
  order by xp desc, xp_at asc
  limit 10
$$;

revoke execute on function public.lb_xp_start(uuid, bigint), public.lb_run(uuid, uuid, text, int, int), public.lb_my_xp(uuid), public.lb_levels(uuid) from public;
grant execute on function public.lb_xp_start(uuid, bigint), public.lb_run(uuid, uuid, text, int, int), public.lb_my_xp(uuid), public.lb_levels(uuid) to anon;
