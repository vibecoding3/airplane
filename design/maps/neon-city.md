# Neon City map (`city`)

**Theme:** falling down through a night city, from the rooftops to the data core underneath.

**Verdict:** a lively, colourful map, and most obstacles are clever city objects. The big issue is that **the obstacles don't change with depth**: you see street-level traffic cones and fire hydrants even in the "data core" at the bottom. The layers are only in the background colour. Some street objects (manhole covers, vending machines) also float in mid-air, which is odd.

Fit: ✅ fits well · ⚠️ works, but something is off · ❌ doesn't fit

| Obstacle | Mechanic | Looks | Starts | Fit | Opinion |
|---|---|---|---|---|---|
| Signs | Gap Wall | Neon shop signs / steel balconies | 0 m | ✅ | Signs and balconies sticking out of buildings is exactly what a city shaft looks like. |
| Cones | Static Hazards | Traffic cones / manhole covers / vending machines | 0 m | ⚠️ | All are ground-level objects floating in the air. Cones are fine as a cartoon. Hovering manhole covers and vending machines feel random. **Hover drones or holographic warning signs** would fit better. |
| Tram | Bouncing Slider | Hover tram / neon tube | 0 m | ✅ | Futuristic transport is a natural slider. |
| Bulge | Wall Bulge | Satellite dish / AC unit / station clock | 0 m | ✅ | Things bolted to buildings. Great. The clock showing the real time is a lovely detail. |
| Neon signs | Wall Bulge | 8 round neon signs (collectible) | 0 m | ✅ | The perfect collectible for a neon city. |
| Cans | Rising Projectile | Soda can / arcade token / bouncy ball | 0 m | ⚠️ | Fun, but it's unclear who throws them up. A **vending machine on the wall firing cans** would be funnier and would fit the turret instead. |
| Hologram field | Effect Zone | Scanlines and chevrons, slows the fall | 0 m | ✅ | Good sci-fi touch. |
| Cable | Spring Line | Power cable / string of lights | ~30 m | ✅ | Cables strung between buildings. Perfect, and bouncy cables make sense. |
| Drones | Drifting Swarm | Delivery drones / paper lanterns / umbrellas | ~35 m | ✅ | Umbrellas floating down a city at night is a beautiful image. |
| Fan | Spinning Drifter | Vent fan / neon hubcap / vinyl record | ~50 m | ⚠️ | Vent fans fit. Flying hubcaps and records are random. |
| Taxis | Conveyor | Hover taxis / pods | ~50 m | ✅ | Traffic lanes in the air. Great. |
| Camera | Wall Turret | Security camera / dumpling steamer / spray can | ~65 m | ⚠️ | The camera firing lasers is fine, and the spray can is graffiti culture. A steamer "firing dumplings" is funny, but it's the least believable "weapon" in the game. |
| Rotors | Spinning Blades | Drone rotors / neon tubes | ~80 m | ✅ | Good. |
| Vent | Push Zone | Street steam vent / AC exhaust | ~80 m | ✅ | Steam from grates is iconic city imagery. |
| Ladder | Wall Piston | Fire escape ladder / neon arrow / antenna | ~100 m | ✅ | Fire escape ladders really do slide down. Clever. |
| Transformer | Proximity Blast | Transformer box / fire hydrant | ~120 m | ✅ | Both burst for real. Good. |
| Laser | Charged Beam | Laser emitter / sparking neon sign | ~135 m | ✅ | The broken sign arcing is a great idea. |
| Barrier | Telegraphed Sweep | Traffic barrier with STOP sign / sweeper robot arm | ~135 m | ✅ | Parking barriers really do swing. Clever. |
| Shutters | Closing Jaws | Rolling shutters / subway doors | ~150 m | ✅ | Subway doors closing in your face is a feeling everyone knows. |
| Crane | Sweeping Arm | Crane boom / street lamp arm | ~215 m | ✅ | Construction cranes rotate. Good. |

## Spawn chances (v126)
The chance that a new row is this obstacle, measured by running the game's own spawner 40,000 times at each depth (so ±0.5% or so). Each depth adds up to 100%. Since v125 there are no start depths: every obstacle can appear from 0 m (the "Starts" column above is how it was before). What still changes with depth:
- **Weights grow with depth** for some obstacles (the slider, the projectile and the spinning blades), so they get more common as you fall.
- **Wind stops at 700 m** and **conveyors stop at 1,500 m** ("—"); the other obstacles share their place.
- **Never the same obstacle twice in a row**, which slightly evens out the numbers.
- **Looks:** each row picks one look, all looks being equally likely.
- **Neon signs (collectible)** have their own row type: a sign not yet seen this run, then a regular Bulge once all 8 have appeared.

| Obstacle | 0 m | 500 m | 1,000 m | 2,000 m |
|---|---|---|---|---|
| Signs | 11% | 10% | 10% | 10% |
| Cones | 8% | 7% | 7% | 7% |
| Tram | 4% | 6% | 8% | 8% |
| Cans | 4% | 6% | 6% | 7% |
| Rotors | 2% | 5% | 6% | 8% |
| Shutters | 5% | 5% | 5% | 5% |
| Taxis | 5% | 5% | 5% | — |
| Ladder | 5% | 5% | 5% | 5% |
| Barrier | 5% | 5% | 5% | 5% |
| Neon signs (collectible) | 5% | 5% | 4% | 5% |
| Drones | 5% | 5% | 5% | 5% |
| Crane | 5% | 4% | 5% | 5% |
| Fan | 5% | 4% | 4% | 4% |
| Transformer | 5% | 4% | 4% | 4% |
| Camera | 5% | 4% | 4% | 4% |
| Cable | 5% | 4% | 4% | 4% |
| Laser | 5% | 4% | 4% | 5% |
| Bulge | 4% | 4% | 4% | 4% |
| Vent | 4% | 4% | — | — |
| Hologram field | 4% | 4% | 4% | 4% |

## Gaps and ideas
- **Biggest win: make the looks follow the layers**, the way Forest (seasons), Desert (rock layers) and Volcano already do. Roughly:
  - rooftops: antennas and AC units
  - streets: cones, taxis, umbrellas
  - subway: tunnels, trains, ticket gates
  - sewers: pipes, rats, steam
  - data core: server racks, cables, laser grids
- Then the fall would feel like a journey, not the same street repeated for 2,500 m.
