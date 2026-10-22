-- Paper Nosedive — the anonymous play log (js/playlog.js, v142). Run once in the Supabase dashboard:
-- SQL Editor → New query → paste all of this → Run. Safe to run again (it skips what already exists).
-- The game's public key may only add rows; reading them needs the dashboard (or the secret key, never in the game).

create table if not exists public.visits (
  id          uuid primary key,
  visitor_id  uuid not null,                       -- random id kept on the player's device: same device, same id
  created_at  timestamptz not null default now(),
  version     text check (char_length(version) <= 20),
  device      text check (device in ('touch', 'mouse')),
  user_agent  text check (char_length(user_agent) <= 300),
  language    text check (char_length(language) <= 35),
  screen_w    int check (screen_w between 0 and 20000),
  screen_h    int check (screen_h between 0 and 20000),
  pixel_ratio real check (pixel_ratio between 0 and 10),
  referrer    text check (char_length(referrer) <= 300)
);

create table if not exists public.runs (
  id          bigint generated always as identity primary key,
  visit_id    uuid,
  visitor_id  uuid not null,
  created_at  timestamptz not null default now(),
  map         text not null check (map in ('notebook', 'sea', 'space', 'dungeon', 'city', 'forest', 'desert', 'volcano', 'kitchen')),
  depth       int not null check (depth between 0 and 1000000),   -- metres
  stars       int not null check (stars between 0 and 100000),
  duration_s  int check (duration_s between 0 and 1000000),
  ended       text check (ended in ('crash', 'exit'))
);

create index if not exists visits_created_at on public.visits (created_at);
create index if not exists runs_created_at on public.runs (created_at);

alter table public.visits enable row level security;
alter table public.runs enable row level security;

drop policy if exists "the game adds visits" on public.visits;
create policy "the game adds visits" on public.visits for insert to anon with check (true);
drop policy if exists "the game adds runs" on public.runs;
create policy "the game adds runs" on public.runs for insert to anon with check (true);

-- insert only: no select, update or delete for the public key
revoke all on public.visits, public.runs from anon;
grant insert on public.visits, public.runs to anon;
