-- Paper Nosedive — replays (js/replay.js, v157). Run once in the Supabase dashboard after tools/supabase.sql:
-- SQL Editor → New query → paste all of this → Run. Safe to run again.
--
-- Every finished run on the website sends its replay: the random seed, the world height, one character per frame
-- (its time step in ms), the steering inputs and a check value every 60 frames, about 1 KB per 15 s of play.
-- A replay only plays back on the game version it was recorded with (`version`).
-- The game's public key may only add rows. Old replays clean themselves up: each new one removes up to 200 replays
-- older than 30 days, never a player's best run on a map.

create table if not exists public.replays (
  id          uuid primary key,
  visit_id    uuid,
  visitor_id  uuid not null,
  created_at  timestamptz not null default now(),
  version     text check (char_length(version) <= 20),
  map         text not null check (map in ('notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen')),
  depth       int not null check (depth between 0 and 1000000),     -- metres
  frames      int not null check (frames between 0 and 2000000),
  data        jsonb not null check (pg_column_size(data) < 300000)    -- about 6 hours of play at most
);
create index if not exists replays_best on public.replays (visitor_id, map, depth desc);
create index if not exists replays_created_at on public.replays (created_at);

alter table public.replays enable row level security;
drop policy if exists "the game adds replays" on public.replays;
create policy "the game adds replays" on public.replays for insert to anon with check (true);
revoke all on public.replays from anon;
grant insert on public.replays to anon;

-- after each insert: up to 200 replays older than 30 days go, unless one is its player's best on that map
-- (ties keep the earliest)
create or replace function public.replays_cleanup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from replays where id in (
    select r.id from replays r
    where r.created_at < now() - interval '30 days'
      and exists (select 1 from replays b where b.visitor_id = r.visitor_id and b.map = r.map
                  and (b.depth > r.depth or (b.depth = r.depth and b.created_at < r.created_at)))
    limit 200);
  return null;
end $$;
drop trigger if exists replays_cleanup on public.replays;
create trigger replays_cleanup after insert on public.replays for each statement execute function public.replays_cleanup();
