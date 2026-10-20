# Volcano map (`volcano`)

**Theme:** diving into a tropical volcano's crater and falling down its throat, from the jungle slope to the glowing magma chamber. Rock, ash, steam and lava only.

**Verdict:** the newest map, and very consistent: almost everything is a real volcanic thing (bombs, pumice, basalt columns, mud pots, volcanic lightning). The weak spots are the invented creatures (**cinder moths, fire beetles, lava frog**). They are cute, but they stretch "rock, ash, steam and lava only". A few lava objects also behave like solid things.

Fit: ✅ fits well · ⚠️ works, but something is off · ❌ doesn't fit

| Obstacle | Mechanic | Looks | Starts | Fit | Opinion |
|---|---|---|---|---|---|
| Basalt ledges | Gap Wall | Basalt column ledges / lava crust | 0 m | ✅ | Basalt columns are real and look great. |
| Bombs | Static Hazards | Volcanic bomb / sulfur crystals / pumice | 0 m | ⚠️ | Volcanic bombs fit. Sulfur and pumice are harmless, and pumice even floats, so they don't feel dangerous. Still, they add colour. |
| Raft | Bouncing Slider | Charred log / lava raft | 0 m | ⚠️ | A charred log near the jungle is fine. A raft of lava sliding through the air is odd, since lava rafts float on lava. |
| Dome | Wall Bulge | Lava dome / basalt columns / steaming mound | 0 m | ✅ | Lava domes are real and bulge. Perfect. |
| Lava bombs | Rising Projectile | Lava bomb / glowing rock; volcanic stones | 0 m | ✅ | A volcano throwing rocks *up* is the most natural rising projectile in the game. |
| Steam column | Effect Zone | Rising steam, slows the fall | 0 m | ✅ | Hot rising steam slowing a paper plane is believable. |
| Rope lava | Spring Line | Rope lava / jungle vine | ~30 m | ⚠️ | The vine is great near the top. Rope lava is a real lava texture (on the ground), but a *bouncy* strand of it in the air doesn't make sense. |
| Moths | Drifting Swarm | Cinder moths / fire beetles / ash puffs | ~35 m | ⚠️ | Ash puffs drifting down is real. Cinder moths and fire beetles are invented creatures. Cute, but **falling embers** or **ash flakes** would follow the "no creatures" idea better. |
| Spindle | Spinning Drifter | Spindle bomb / obsidian star | ~50 m | ✅ | Spindle bombs really are twisted spinning rocks. Clever. |
| Rollers | Conveyor | Lava rocks / fire beetles | ~50 m | ⚠️ | Rolling rocks need a slope. In mid-air they just look like a row. Acceptable. |
| Lava vent | Wall Turret | Lava vent / lava frog | ~65 m | ⚠️ | The vent spitting lava blobs is perfect. The lava frog is an invented creature. Fun, but off theme. |
| Shards | Spinning Blades | Two obsidian shards spinning | ~80 m | ⚠️ | Obsidian is sharp, so they are scary. But nothing makes two shards spin like scissors. |
| Ash gust | Push Zone | Ash streaks (before 700 m) | ~80 m | ✅ | Natural. |
| Lava tongue | Wall Piston | Lava tongue / basalt column | ~100 m | ✅ | Lava squirting from a crack and pulling back reads well. |
| Mud pot | Proximity Blast | Mud pot / gas pocket | ~120 m | ✅ | Both burst for real. Perfect fit. |
| Lightning | Charged Beam | Volcanic lightning / steam jet | ~135 m | ✅ | Volcanic lightning is real and spectacular. |
| Lava wave | Telegraphed Sweep | Lava wave / toppling basalt pillar | ~135 m | ✅ | A toppling pillar is a great visual. |
| Plates | Closing Jaws | Grinding rock plates / obsidian slabs | ~150 m | ✅ | Grinding rock plates suggest tectonics. Nice. |
| Steam arm | Sweeping Arm | Steam jet / lava spout | ~215 m | ⚠️ | A rotating jet is a bit mechanical, as if a sprinkler were in the volcano. It reads fine. |

> **Done in v129:** added embers (swarm) and a fumarole (turret) so not every swarm or turret is a creature; the critters stay. In the magma layer the red-hot rocks get a dark crust and the lava tongue a dark edge.

## Spawn chances (v129)
The chance that a new row is this obstacle, measured by running the game's own spawner 40,000 times at each depth (so ±0.5% or so). Each depth adds up to 100%. Since v125 there are no start depths: every obstacle can appear from 0 m (the "Starts" column above is how it was before). What still changes with depth:
- **Every obstacle has the same weight** (since v127), so they are all equally likely: 1 in 19 (about 5%) when every obstacle is allowed. Until v126 some had more weight, and three grew more common with depth.
- **Wind stops at 700 m** and **conveyors stop at 1,500 m** ("—"); the other obstacles share their place, so each gets a little more there.
- **Never the same obstacle twice in a row**, which slightly evens out the numbers.
- **Looks:** each row picks one look, all looks allowed in that layer being equally likely.
- **Volcanic stones (collectible):** each lava bomb has a 50% chance to be a stone not yet seen this run, until all 8 have appeared.

| Obstacle | 0 m | 500 m | 1,000 m | 2,000 m |
|---|---|---|---|---|
| Basalt ledges | 6% | 5% | 6% | 6% |
| Bombs | 5% | 5% | 6% | 6% |
| Dome | 5% | 5% | 6% | 6% |
| Lava bombs | 5% | 5% | 5% | 6% |
| Lava tongue | 5% | 5% | 6% | 6% |
| Lava vent | 5% | 5% | 6% | 6% |
| Lava wave | 6% | 5% | 6% | 6% |
| Lightning | 5% | 5% | 6% | 6% |
| Moths | 5% | 5% | 6% | 6% |
| Mud pot | 5% | 5% | 6% | 6% |
| Plates | 5% | 5% | 6% | 6% |
| Raft | 5% | 5% | 6% | 6% |
| Rope lava | 5% | 5% | 6% | 6% |
| Shards | 5% | 5% | 5% | 6% |
| Spindle | 5% | 5% | 6% | 6% |
| Steam arm | 5% | 5% | 5% | 6% |
| Steam column | 5% | 5% | 5% | 6% |
| Rollers | 5% | 6% | 6% | — |
| Ash gust | 5% | 5% | — | — |

## Gaps and ideas
- Decide whether invented volcanic creatures are OK. If they are, they could become a feature (a "volcano critters" collection). If not, swap the moths, beetles and frog for embers, ash and a second vent look.
- The magma chamber (1,500 m+) is very orange, and some orange obstacles (glowing rock, lava tongue) lose contrast there. The magma-layer looks could use darker crusts.
