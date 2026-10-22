-- Paper Nosedive — the Time played board (js/leaderboard.js, v149). Run once in the Supabase dashboard after
-- tools/supabase-levels.sql: SQL Editor → New query → paste all of this → Run. Safe to run again.
--
-- The top 10 players by the seconds of their counted runs (players.played_s, the total the server checks each run
-- against). It counts from when the player joined the leaderboards, or from v146 for players who joined earlier.

create or replace function public.lb_time(p_visitor uuid)
returns table (rank bigint, nickname text, depth bigint, me boolean)   -- "depth" holds the seconds, like the other boards
language sql stable security definer set search_path = public as $$
  select rank() over (order by played_s desc, xp_at asc), nickname, played_s, visitor_id = p_visitor
  from players where played_s > 0
  order by played_s desc, xp_at asc
  limit 10
$$;

revoke execute on function public.lb_time(uuid) from public;
grant execute on function public.lb_time(uuid) to anon;
