-- Paper Nosedive — leaderboards (js/leaderboard.js, v144). Run once in the Supabase dashboard after tools/supabase.sql:
-- SQL Editor → New query → paste all of this → Run. Safe to run again.
--
-- A player who wants to see the leaderboards picks a unique nickname, tied to their anonymous visitor id (the random
-- id kept on their device). The id works as their private key: it is never shown to anyone, and the leaderboard
-- functions only ever return nicknames. The game's public key can't touch these tables directly: it can only call the
-- four functions below, which check everything they're given.

create table if not exists public.players (
  visitor_id  uuid primary key,
  nickname    text not null check (nickname ~ '^[A-Za-z0-9_.-]([A-Za-z0-9_. -]{1,14})[A-Za-z0-9_.-]$'),   -- 3–16, no edge spaces
  created_at  timestamptz not null default now()
);
create unique index if not exists players_nickname_unique on public.players (lower(nickname));   -- "Kite" and "kite" are one name

create table if not exists public.scores (
  visitor_id  uuid not null references public.players (visitor_id) on delete cascade,
  map         text not null check (map in ('notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen')),
  depth       int not null check (depth between 0 and 100000),   -- best depth on that map, metres
  updated_at  timestamptz not null default now(),
  primary key (visitor_id, map)
);
create index if not exists scores_map_depth on public.scores (map, depth desc);

alter table public.players enable row level security;   -- no policies: nothing reaches the tables except the functions
alter table public.scores enable row level security;
revoke all on public.players, public.scores from anon, authenticated;

-- claim a nickname: 'ok', 'taken', 'invalid', or 'already' (this id already has one; it keeps it)
create or replace function public.lb_claim(p_visitor uuid, p_nickname text) returns text
language plpgsql security definer set search_path = public as $$
declare nick text := btrim(regexp_replace(coalesce(p_nickname, ''), '\s+', ' ', 'g'));
begin
  if p_visitor is null or nick !~ '^[A-Za-z0-9_.-]([A-Za-z0-9_. -]{1,14})[A-Za-z0-9_.-]$' then return 'invalid'; end if;
  if exists (select 1 from players where visitor_id = p_visitor) then return 'already'; end if;
  insert into players (visitor_id, nickname) values (p_visitor, nick);
  return 'ok';
exception when unique_violation then
  return 'taken';
end $$;

-- this device's nickname, or null (restores it if the game forgot it)
create or replace function public.lb_me(p_visitor uuid) returns text
language sql stable security definer set search_path = public as $$
  select nickname from players where visitor_id = p_visitor
$$;

-- a best depth: kept only if it beats the stored one (players without a nickname are ignored)
create or replace function public.lb_submit(p_visitor uuid, p_map text, p_depth int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from players where visitor_id = p_visitor) then return; end if;
  insert into scores (visitor_id, map, depth) values (p_visitor, p_map, p_depth)
  on conflict (visitor_id, map) do update set depth = excluded.depth, updated_at = now()
    where scores.depth < excluded.depth;
end $$;

-- a board: the top 20 and the caller's own row (me = true), for one map or 'total' (all maps' bests added up).
-- Ties go to whoever got there first.
create or replace function public.lb_board(p_map text, p_visitor uuid)
returns table (rank bigint, nickname text, depth bigint, me boolean)
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
  select r.rank, r.nickname, r.depth, r.visitor_id = p_visitor as me
  from ranked r where r.rank <= 20 or r.visitor_id = p_visitor
  order by r.rank
$$;

revoke execute on function public.lb_claim(uuid, text), public.lb_me(uuid), public.lb_submit(uuid, text, int), public.lb_board(text, uuid) from public;
grant execute on function public.lb_claim(uuid, text), public.lb_me(uuid), public.lb_submit(uuid, text, int), public.lb_board(text, uuid) to anon;
