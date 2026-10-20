# Space map (`space`)

**Theme:** falling past space stations, satellites and planets. By design it has no wind and no explosions (v55).

**Verdict:** a good mix of real space objects and sci-fi. There are two real problems. First, two obstacles copy famous film designs very closely, which goes against the "original designs only" rule for Google Play. Second, one obstacle uses a brand name. There is also one physics joke that may feel wrong to players.

Fit: ✅ fits well · ⚠️ works, but something is off · ❌ doesn't fit

| Obstacle | Mechanic | What it does | Starts | Fit | Opinion |
|---|---|---|---|---|---|
| Station girders | Gap Wall | Steel trusses with blinking end lights | 0 m | ✅ | Looks like a station under construction. Good. |
| Asteroids | Static Hazards | 1–3 cratered rocks with minerals | 0 m | ✅ | Classic. The minerals are a nice detail. |
| Ice chunks | Drifting Swarm | Hexagonal ice drifting and swaying | 0 m | ⚠️ | Fine as comet ice. "Drifting down" has no meaning in space, but the whole map has that issue. |
| Tumbling asteroid | Spinning Drifter | Spins while drifting | 0 m | ✅ | Tumbling rocks are how real asteroids move. |
| Planet | Wall Bulge | A real planet bulging in from a side | 0 m | ✅ | Wild sense of scale (Jupiter next to a satellite), but it's a joyful cartoon idea and educational. Keep it. |
| GPS satellite | Bouncing Slider | Sliding side to side | 0 m | ✅ | Good. |
| Low-gravity field | Effect Zone | Slows the fall | 0 m | ✅ | Very intuitive in space. |
| Rocket | Rising Projectile | Launched up toward the plane | ~35 m | ✅ | Rockets go up. Perfect. |
| Starlink train | Conveyor | A line of flat satellites crossing | ~50 m | ⚠️ | A great real-life idea (they really do fly in a line), but **"Starlink" is a SpaceX brand**. Call it a "satellite train" anywhere players can see the name. |
| Moon edge | Wall Bulge | A cratered moon from one side | ~65 m | ✅ | Good. Also the fallback when all planets are collected. |
| ISS | Bouncing Slider | A long station sliding side to side | ~65 m | ⚠️ | A real public object, so it's fine to draw. A station "sliding" sideways is odd, but it's a cartoon. |
| Airlock doors | Closing Jaws | Hazard-striped doors shut and open | ~100 m | ✅ | Airlocks open and close. Natural. |
| Docking probe | Wall Piston | Shoots out of a hull | ~100 m | ✅ | Good. |
| Black hole | Static Hazards | Deadly core that does **not** pull | ~100 m | ⚠️ | Pulling is the one thing everyone knows about black holes, so players may expect it. Pulling is banned (sharpener), so maybe use a look that doesn't promise gravity, such as a **dead star** or a **wormhole**. |
| Laser gate | Charged Beam | Charges, then fires a beam | ~135 m | ✅ | Classic sci-fi. |
| Twin-wing fighter | Wall Turret | A fighter firing laser bolts | ~135 m | ❌ | The README calls it "space-opera style". If it resembles a famous film fighter, it **breaks the original-designs rule** for Google Play. Worth checking the drawing, or replacing it with a turret on the station hull. |
| Energy blade | Telegraphed Sweep | A glowing coloured blade swings out of a hilt | ~170 m | ❌ | A coloured glowing blade on a hilt is the trademark weapon of a very famous film series. This is the riskiest design in the game for the store. A **robotic welding torch**, or a **solar flare** licking out, would be original. |
| Battle station | Wall Bulge | A big grey sphere with a dish and a trench | ~170 m | ❌ | A grey sphere with a dish and a trench describes one specific famous film station. Same store risk. An **asteroid base** or a **gas giant's moon with a mining rig** would be safe. |
| Robot arm | Sweeping Arm | A station arm with a claw swinging round | ~215 m | ✅ | Real stations have robot arms. Great. |

## Spawn chances (v127)
The chance that a new row is this obstacle, measured by running the game's own spawner 40,000 times at each depth (so ±0.5% or so). Each depth adds up to 100%. Since v125 there are no start depths: every obstacle can appear from 0 m (the "Starts" column above is how it was before). What still changes with depth:
- **Every obstacle has the same weight** (since v127), so they are all equally likely: 1 in 19 (about 5%) when every obstacle is allowed. Until v126 some had more weight, and three grew more common with depth.
- **Wind stops at 700 m** and **conveyors stop at 1,500 m** ("—"); the other obstacles share their place, so each gets a little more there.
- **Never the same obstacle twice in a row**, which slightly evens out the numbers.
- **Planets (collectible):** a "Planet" row shows a planet not yet seen this run; once all 8 have appeared it becomes a moon edge.

| Obstacle | 0 m | 500 m | 1,000 m | 2,000 m |
|---|---|---|---|---|
| Airlock doors | 5% | 5% | 5% | 6% |
| Asteroids | 5% | 5% | 5% | 6% |
| Battle station | 5% | 5% | 5% | 6% |
| Black hole | 5% | 5% | 6% | 5% |
| Docking probe | 5% | 5% | 5% | 6% |
| Energy blade | 5% | 5% | 5% | 6% |
| GPS satellite | 5% | 5% | 5% | 5% |
| Ice chunks | 5% | 5% | 5% | 6% |
| ISS | 5% | 5% | 5% | 6% |
| Laser gate | 5% | 5% | 5% | 6% |
| Low-gravity field | 5% | 5% | 5% | 6% |
| Moon edge | 5% | 5% | 5% | 6% |
| Planet | 5% | 5% | 5% | 6% |
| Robot arm | 6% | 5% | 5% | 6% |
| Rocket | 5% | 5% | 5% | 6% |
| Station girders | 5% | 5% | 5% | 6% |
| Tumbling asteroid | 5% | 5% | 5% | 6% |
| Twin-wing fighter | 5% | 5% | 5% | 6% |
| Starlink train | 5% | 5% | 5% | — |

## Gaps and ideas
- Unused mechanics apart from the ones banned on purpose (wind, explosions):
  - **Spring Line:** a tether cable between two satellites. Fits the theme perfectly.
  - **Spinning Blades:** a satellite with two solar panels spinning.
- **Priority:** redesign or rename the three ❌ obstacles and the "Starlink" name before the Google Play release.
