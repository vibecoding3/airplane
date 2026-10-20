# Dungeon map (`dungeon`)

**Theme:** falling down a fantasy dungeon shaft, with traps, monsters and magic.

**Verdict:** the richest map, with 20 obstacles and about 65 looks. Traps are exactly what a dungeon is about, so the mechanics fit better here than anywhere else. The weak spot is the **Halloween looks** (pumpkins, witch hats, brooms). They are fun, but they make the dungeon feel like a mix of two themes. The sheer number of looks may also make obstacles harder to recognise at speed.

Fit: ✅ fits well · ⚠️ works, but something is off · ❌ doesn't fit

| Obstacle | Mechanic | Looks | Starts | Fit | Opinion |
|---|---|---|---|---|---|
| Stone ledges | Gap Wall | Stone ledges / wooden beams / iron girders / goblin scaffolding | 0 m | ✅ | All belong in a dungeon. |
| Spiked iron balls | Static Hazards | Spiked balls / cauldrons / boulders / tombstones | 0 m | ⚠️ | The spiked balls are perfect. Cauldrons and tombstones floating in mid-air are odd, because they are floor objects. |
| Wooden plank | Bouncing Slider | Plank / bone / wizard staff / broom / mage staffs | 0 m | ✅ | Good, and the mage staffs make a nice collection. |
| Rock outcrop | Wall Bulge | Outcrop / giant shield / barrel end / jack-o'-lantern | 0 m | ⚠️ | Outcrop, shield and barrel fit. A giant jack-o'-lantern in a wall is Halloween, not dungeon. |
| Bouncing skull | Rising Projectile | Skull / jack-o'-lantern / slime / potion | 0 m | ✅ | Thrown skulls and potions feel like a goblin attacking you. Fun. |
| Magic rings | Rising Projectile | 9 ring designs (collectible) | ~65 m | ⚠️ | A great collection, but there's no reason rings fly upward. They'd make more sense spilling out of a **treasure chest** on the wall (a turret). |
| Ghosts | Drifting Swarm | Ghosts / spellbooks / wisps / witch hats / goblins | ~35 m | ⚠️ | Ghosts, spellbooks and wisps drifting are great. Witch hats are Halloween. "Goblins drifting down" is odd: goblins don't float. |
| Dragon statue | Wall Turret | Dragon head / gargoyle / cannon / slingshot goblin | ~65 m | ✅ | All classic dungeon traps. The best obstacle on the map. |
| Spear trap | Wall Piston | Spear / trident / sword / goblin club | ~100 m | ✅ | Spears shooting out of walls is the iconic dungeon trap. |
| Flamethrower | Wall Piston | Iron nozzle shooting flame | ~120 m | ✅ | A great trap with a clear warning (pilot light). |
| Spiked crusher | Closing Jaws | Crushers / iron doors / battering rams / barricade | ~150 m | ✅ | The classic crushing-walls trap. Perfect. |
| Fire bar | Sweeping Arm | Fire bar / chain with spiked ball | ~215 m | ✅ | A well-known platformer trap that fits a dungeon perfectly. |
| Spider web | Spring Line | Web between spiders / slime strand | ~30 m | ✅ | Webs in dark corners. Great, and bouncy webs make sense. |
| Saw blade | Spinning Drifter | Saw / spiked wheel / eyeball / goblin shield | ~50 m | ⚠️ | Saw blades and spiked wheels fit. A rolling eyeball is creepy-funny but random. |
| Flying daggers | Conveyor | Daggers / arrows / keys | ~50 m | ✅ | Arrow volleys are a classic trap. Flying keys are a cute magical touch. |
| Crossed swords | Spinning Blades | Swords / spears / staffs | ~80 m | ✅ | Good. |
| Cold draft | Push Zone | Cold draft / steam from a grate | ~80 m | ✅ | Drafts in old stone corridors are believable. |
| Cursed rune | Proximity Blast | Rune / spore mushroom | ~120 m | ✅ | Magic mines feel right. |
| Rune beam | Charged Beam | Rune stone / crystal cluster | ~135 m | ✅ | Good. |
| Skeleton arm | Telegraphed Sweep | Skeleton arm / tentacle / thorny vine / reaper's scythe | ~135 m | ✅ | A bony arm swiping out of a crack is spooky and fun. |

## Spawn chances (v126)
The chance that a new row is this obstacle, measured by running the game's own spawner 40,000 times at each depth (so ±0.5% or so). Each depth adds up to 100%. Since v125 there are no start depths: every obstacle can appear from 0 m (the "Starts" column above is how it was before). What still changes with depth:
- **Weights grow with depth** for some obstacles (the slider, the projectile and the spinning blades), so they get more common as you fall.
- **Wind stops at 700 m** and **conveyors stop at 1,500 m** ("—"); the other obstacles share their place.
- **Never the same obstacle twice in a row**, which slightly evens out the numbers.
- **Looks:** each row picks one look, all looks being equally likely (for example 1 in 4 for the four Gap Wall looks). The two mage staffs are Wooden plank looks and appear at most once each per run.
- **Magic rings (collectible)** have the highest weight on the map: a ring row shows a ring not yet seen this run, then regular Rising Projectiles once all 9 have appeared. **Legendary swords:** each Crossed swords row has a 70% chance to be a pair not yet seen this run.

| Obstacle | 0 m | 500 m | 1,000 m | 2,000 m |
|---|---|---|---|---|
| Magic rings | 10% | 10% | 10% | 10% |
| Stone ledges | 10% | 9% | 9% | 10% |
| Spiked iron balls | 7% | 7% | 6% | 7% |
| Wooden plank | 4% | 6% | 7% | 8% |
| Bouncing skull | 4% | 5% | 6% | 7% |
| Crossed swords | 2% | 5% | 6% | 7% |
| Spiked crusher | 5% | 5% | 5% | 5% |
| Rock outcrop | 5% | 5% | 5% | 5% |
| Spear trap | 5% | 4% | 4% | 5% |
| Fire bar | 5% | 4% | 4% | 4% |
| Ghosts | 5% | 4% | 4% | 4% |
| Flying daggers | 5% | 4% | 4% | — |
| Skeleton arm | 5% | 4% | 5% | 4% |
| Flamethrower | 4% | 4% | 4% | 4% |
| Rune beam | 4% | 4% | 4% | 4% |
| Saw blade | 4% | 4% | 4% | 4% |
| Cursed rune | 4% | 4% | 4% | 4% |
| Spider web | 4% | 4% | 4% | 4% |
| Dragon statue | 5% | 4% | 4% | 4% |
| Cold draft | 4% | 4% | — | — |

## Gaps and ideas
- The **Effect Zone** was left out on purpose. A "healing fountain mist" could be a nice exception if you ever want one.
- **Consider moving the Halloween looks into a seasonal event** (October only, or a future "Haunted" map). The dungeon would then read as one clear theme.
- **Readability:** with up to 5 looks per obstacle, new players may struggle to learn what each thing does. Maybe limit the number of looks shown early in a run.
