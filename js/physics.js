// Paper Nosedive — Collision shapes and checks, obstacle movement, steering and the per-frame update.
'use strict';

// ---------- collision ----------
// obstacles that never move keep their collision shapes instead of rebuilding them every step
const STATIC_SHAPES = new Set(['blot', 'protractor', 'band']);
function shapes(o) {
  if (!STATIC_SHAPES.has(o.type)) return computeShapes(o);
  return o.__shapes || (o.__shapes = computeShapes(o));
}
function computeShapes(o) {
  switch (o.type) {
    case 'gate': {
      const l = o.gx - o.gapW / 2, r = o.gx + o.gapW / 2;
      return [
        { k: 'b', x: (l - 20) / 2, y: o.y, hw: (l + 20) / 2, hh: 11, a: 0 },
        { k: 'b', x: (r + W + 20) / 2, y: o.y, hw: (W + 20 - r) / 2, hh: 11, a: 0 }
      ];
    }
    case 'erasers': {
      const l = o.cx - o.gap / 2, r = o.cx + o.gap / 2;
      return [
        { k: 'b', x: (l - 20) / 2, y: o.y, hw: (l + 20) / 2, hh: 14, a: 0 },
        { k: 'b', x: (r + W + 20) / 2, y: o.y, hw: (W + 20 - r) / 2, hh: 14, a: 0 }
      ];
    }
    case 'pencil': return [{ k: 'b', x: o.x, y: o.y, hw: o.len / 2, hh: 6.5, a: o.a }];
    case 'scissors': {
      const out = [];
      for (const s of [-1, 1]) {
        const a = o.rot + s * o.open / 2, dx = Math.cos(a), dy = Math.sin(a);
        out.push({ k: 'b', x: o.x + dx * 30, y: o.y + dy * 30, hw: 36, hh: 4, a });
        out.push({ k: 'c', x: o.x - dx * 22, y: o.y - dy * 22, r: 10 });
      }
      return out;
    }
    case 'blot': return [{ k: 'c', x: o.x, y: o.y, r: o.r * 0.88 }];
    case 'protractor': return [{ k: 'c', x: o.side < 0 ? 0 : W, y: o.y, r: o.r }];
    case 'wad': return [{ k: 'c', x: o.x, y: o.y, r: o.r * 0.9 }];
    case 'clips': return clipXs(o).map(x => ({ k: 'b', x, y: o.y, hw: 17, hh: 6, a: 0 }));
    case 'compass': {
      const c = Math.cos(o.ang), s = Math.sin(o.ang);
      return [{ k: 'b', x: o.x + c * o.L / 2, y: o.y + s * o.L / 2, hw: o.L / 2, hh: 4, a: o.ang },
              { k: 'c', x: o.x, y: o.y, r: 8 }];
    }
    case 'fan': return o.sea ? [] : [{ k: 'c', x: o.side < 0 ? 0 : W, y: o.y, r: 24 }];   // an ocean current has no body
    case 'starfish': return [{ k: 'c', x: o.x, y: o.y, r: 20 }];
    case 'zap': {
      const x0 = wallX(o), i = inward(o);
      const out = [{ k: 'b', x: x0 + i * ZAP_BODY / 2, y: o.y, hw: ZAP_BODY / 2, hh: 9, a: 0 }];
      if (o.phase === 'zap') out.push({ k: 'b', x: x0 + i * (ZAP_BODY + o.len / 2), y: o.y, hw: o.len / 2, hh: 6, a: 0 });
      return out;
    }
    case 'mine':
      if (o.phase === 'idle' || o.phase === 'blink') return [{ k: 'c', x: o.x, y: o.y, r: 16 }];
      if (o.phase === 'boom') return [{ k: 'c', x: o.x, y: o.y, r: o.blast * Math.min(1, o.t / 0.12) }];
      return [];
    case 'glue': {
      const x0 = wallX(o), i = inward(o);
      return [{ k: 'b', x: x0 + i * 31, y: o.y, hw: 31, hh: 11, a: 0 },
              { k: 'b', x: x0 + i * 70, y: o.y, hw: 8, hh: 4, a: 0 },
              ...o.blobs.map(b => ({ k: 'c', x: b.x, y: o.y, r: b.r * 0.9 }))];
    }
    case 'cutter': {
      const x0 = wallX(o), i = inward(o);
      const out = [{ k: 'b', x: x0 + i * CUTTER_HANDLE / 2, y: o.y, hw: CUTTER_HANDLE / 2, hh: 12, a: 0 }];
      if (o.ext > 1) out.push({ k: 'b', x: x0 + i * (CUTTER_HANDLE + o.ext / 2), y: o.y, hw: o.ext / 2, hh: 6, a: 0 });
      return out;
    }
    case 'stamp': return o.phase === 'down' ? [{ k: 'b', x: o.x, y: o.y, hw: 32, hh: 24, a: 0 }] : [];
    case 'note': return [{ k: 'b', x: o.x, y: o.y, hw: 21, hh: 21, a: o.rot }];
    case 'setsquare': {
      const c = Math.cos(o.rot), s = Math.sin(o.rot);
      return [{ k: 'p', pts: o.verts.map(([x, y]) => [o.x + x * c - y * s, o.y + x * s + y * c]) }];
    }
    case 'band': return [{ k: 'c', x: o.x1, y: o.y1, r: 9 }, { k: 'c', x: o.x2, y: o.y2, r: 9 }];   // the tacks
    case 'paw': {
      if (o.phase !== 'swipe') return [];
      const i = inward(o), x0 = wallX(o), dx = i * Math.cos(o.ang), dy = Math.sin(o.ang);
      return [{ k: 'b', x: x0 + dx * o.L / 2, y: o.y + dy * o.L / 2, hw: o.L / 2, hh: 11, a: Math.atan2(dy, dx) },
              { k: 'c', x: x0 + dx * o.L, y: o.y + dy * o.L, r: 18 }];
    }
    // coffee, bubble columns and the rubber band itself never crash the plane
  }
  return [];
}

function circleHits(cx, cy, r, s) {
  if (s.k === 'p') {                 // convex polygon: touching an edge, or fully inside
    let pos = false, neg = false;
    for (let i = 0; i < s.pts.length; i++) {
      const [ax, ay] = s.pts[i], [bx, by] = s.pts[(i + 1) % s.pts.length];
      const ex = bx - ax, ey = by - ay;
      const t = clamp(((cx - ax) * ex + (cy - ay) * ey) / (ex * ex + ey * ey), 0, 1);
      if (Math.hypot(cx - (ax + ex * t), cy - (ay + ey * t)) < r) return true;
      if (ex * (cy - ay) - ey * (cx - ax) > 0) pos = true; else neg = true;
    }
    return !(pos && neg);
  }
  const dx = cx - s.x, dy = cy - s.y;
  if (s.k === 'c') { const rr = r + s.r; return dx * dx + dy * dy < rr * rr; }
  const c = Math.cos(s.a), sn = Math.sin(s.a);
  const lx = dx * c + dy * sn, ly = -dx * sn + dy * c;
  const ex = lx - clamp(lx, -s.hw, s.hw), ey = ly - clamp(ly, -s.hh, s.hh);
  return ex * ex + ey * ey < r * r;
}

// plane hit circles in local space (nose points to +y)
const PLANE_HIT = [[0, 11, 4], [0, -2, 6], [-8, -10, 4], [8, -10, 4]];
const planeHitCircles = PLANE_HIT.map(() => ({ x: 0, y: 0, r: 0 }));   // reused every step
function planeCircles() {
  const th = -plane.ang, c = Math.cos(th), s = Math.sin(th);
  const py = dist + planeScreenY();
  PLANE_HIT.forEach(([lx, ly, r], i) => {
    const h = planeHitCircles[i];
    h.x = plane.x + lx * c - ly * s; h.y = py + lx * s + ly * c; h.r = r;
  });
  return planeHitCircles;
}

// ---------- update ----------
function updateObstacle(o, dt) {
  switch (o.type) {
    case 'gate': o.gx = o.base + Math.sin(time * o.freq + o.ph) * o.amp; break;
    case 'erasers': o.gap = lerp(o.gapMin, o.gapMax, 0.5 + 0.5 * Math.sin(time * o.freq + o.ph)); break;
    case 'pencil': {
      o.x += o.vx * dt;
      const ext = o.len / 2 * Math.abs(Math.cos(o.a));
      if (o.x - ext < 4) o.vx = Math.abs(o.vx);
      if (o.x + ext > W - 4) o.vx = -Math.abs(o.vx);
      break;
    }
    case 'scissors':
      o.rot += o.spin * dt;
      o.open = 0.12 + 0.45 * (0.5 + 0.5 * Math.sin(time * 3 + o.ph));
      o.x += o.vx * dt;
      if (o.x < 70) o.vx = Math.abs(o.vx);
      if (o.x > W - 70) o.vx = -Math.abs(o.vx);
      break;
    case 'wad':          // starts flying once it reaches the bottom of the screen
      if (!o.active && o.y - dist < H + 20) o.active = true;
      if (o.active) {
        o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt;
        if (o.x < o.r) o.vx = Math.abs(o.vx);
        if (o.x > W - o.r) o.vx = -Math.abs(o.vx);
      }
      break;
    case 'clips': o.off += o.v * dt; break;
    case 'compass':
      o.ang += o.spin * dt;
      o.swept = Math.min(Math.PI * 2, o.swept + Math.abs(o.spin) * dt);
      break;
    case 'fan': o.blade += 22 * dt; o.t += dt; break;
    case 'starfish':
      o.rot += o.spin * dt;
      o.x += o.vx * dt;
      if (o.x < 34) o.vx = Math.abs(o.vx);
      if (o.x > W - 34) o.vx = -Math.abs(o.vx);
      break;
    case 'zap':                    // rest -> charge (dashed preview) -> zap (deadly) -> rest
      if (o.y - dist < H + 40) {
        o.t += dt;
        if (o.phase === 'rest' && o.t >= o.rest) { o.phase = 'charge'; o.t = 0; }
        else if (o.phase === 'charge' && o.t >= 0.7) {
          o.phase = 'zap'; o.t = 0;
          if (o.y - dist < H) tone(1200, 300, 0.25, 'sawtooth', 0.03);
        } else if (o.phase === 'zap' && o.t >= 0.45) { o.phase = 'rest'; o.t = 0; }
      }
      break;
    case 'mine': {                 // arms when the plane is about to pass, so the blast lands as it arrives
      o.t += dt;
      const dy = o.y - (dist + planeScreenY());
      if (o.phase === 'idle' && dy < speed * 0.95 + 40 && dy > -60) { o.phase = 'blink'; o.t = 0; }
      else if (o.phase === 'blink' && o.t >= 0.6) {
        o.phase = 'boom'; o.t = 0;
        if (o.y - dist < H) { crunch(); tone(90, 40, 0.4, 'sawtooth', 0.06); shake = Math.max(shake, 4); }
      } else if (o.phase === 'boom' && o.t >= 0.35) { o.phase = 'gone'; o.t = 0; }
      break;
    }
    case 'bubbles': o.t += dt; break;
    case 'glue':
      if (o.y - dist < H + 40) {
        o.timer -= dt;
        if (o.timer <= 0) {
          o.timer = o.every;
          o.squeeze = 1;
          o.blobs.push({ x: wallX(o) + inward(o) * 78, r: rand(7, 10), wob: rand(0, 6) });
        }
      }
      o.squeeze = Math.max(0, o.squeeze - 4 * dt);
      for (const b of o.blobs) { b.x += inward(o) * o.blobV * dt; b.wob += 8 * dt; }
      prune(o.blobs, b => b.x > -20 && b.x < W + 20);
      break;
    case 'cutter': {
      o.t += dt;
      const p = (o.t % o.period) / o.period;   // snap out fast, hold, slide back slowly
      const f = p < 0.15 ? 1 - (1 - p / 0.15) ** 2 : p < 0.45 ? 1 : 1 - (p - 0.45) / 0.55;
      o.ext = o.maxExt * f;
      break;
    }
    case 'stamp':        // warn (shadow grows) -> down (deadly) -> lift -> warn again somewhere else
      if (o.y - dist < H + 40) {
        o.t += dt;
        if (o.phase === 'warn' && o.t >= o.warn) {
          o.phase = 'down'; o.t = 0;
          o.marks.push({ x: o.x, rot: rand(-0.3, 0.3) });
          if (o.marks.length > 4) o.marks.shift();
          if (o.y - dist < H) tone(140, 60, 0.12, 'square', 0.05);
        } else if (o.phase === 'down' && o.t >= 0.3) {
          o.phase = 'lift'; o.t = 0;
        } else if (o.phase === 'lift' && o.t >= 0.45) {
          o.phase = 'warn'; o.t = 0; o.x = rand(60, W - 60);
        }
      }
      break;
    case 'setsquare':
      o.rot += o.spin * dt;
      o.x += o.vx * dt;
      if (o.x < o.R + 4) o.vx = Math.abs(o.vx);
      if (o.x > W - o.R - 4) o.vx = -Math.abs(o.vx);
      break;
    case 'band':
      o.t += dt; o.cool -= dt; o.wob *= Math.exp(-4 * dt);
      break;
    case 'paw':
      if (o.y - dist < H + 40) {
        o.t += dt;
        if (o.phase === 'rest' && o.t >= PAW_TIMES.rest) {
          o.phase = 'warn'; o.t = 0;
        } else if (o.phase === 'warn' && o.t >= o.warn) {
          o.phase = 'swipe'; o.t = 0;
          if (o.y - dist < H) tone(700, 220, 0.16, 'sawtooth', 0.03);
        } else if (o.phase === 'swipe' && o.t >= PAW_TIMES.swipe) {
          o.phase = 'retract'; o.t = 0;
        } else if (o.phase === 'retract' && o.t >= PAW_TIMES.retract) {
          o.phase = 'rest'; o.t = 0;
        }
      }
      if (o.phase === 'warn') { o.ang = -PAW_SWEEP; o.ext = 0.16; }
      else if (o.phase === 'swipe') {
        const k = Math.min(1, o.t / PAW_TIMES.swipe);
        o.ang = -PAW_SWEEP + 2 * PAW_SWEEP * (1 - (1 - k) ** 2); o.ext = 1;
      } else if (o.phase === 'retract') { o.ext = 1 - Math.min(1, o.t / PAW_TIMES.retract); }
      else o.ext = 0;
      break;
    case 'note':
      o.ph += o.f * dt;
      o.x = clamp(o.bx + Math.sin(o.ph) * o.amp, 26, W - 26);
      o.rot = Math.sin(o.ph) * 0.35;
      if (o.y - dist < H + 30) o.y += speed * o.fall * dt;   // drifts down, slower than the plane
      break;
  }
}

function steer(dt) {
  let target = 0;
  const maxV = maxSideSpeed() * (plane.soggy > 0 ? 0.6 : 1);   // a coffee-soaked plane steers sluggishly
  if (holdSide && performance.now() - holdStart > HOLD_MS) {
    drift = holdSide;
    target = holdSide * maxV;
    plane.vx += (target - plane.vx) * Math.min(1, 9 * dt);
  } else if (drift) {
    target = drift * maxV * 0.7;
    plane.vx += (target - plane.vx) * Math.min(1, 6 * dt);
  } else {
    plane.vx += (0 - plane.vx) * Math.min(1, 8 * dt);
  }
  // desk fans push the plane while it is inside their wind band
  const py = dist + planeScreenY();
  for (const o of obstacles) {
    if (o.type === 'fan' && Math.abs(o.y - py) < o.band / 2) plane.vx += -o.side * o.force * dt;
  }
  plane.x += plane.vx * dt;
  if (plane.x < 16) { plane.x = 16; plane.vx = Math.max(0, plane.vx); }
  if (plane.x > W - 16) { plane.x = W - 16; plane.vx = Math.min(0, plane.vx); }
}

function update(dt) {
  updateFormulas(dt);
  if (state === 'title' || state === 'over') {
    titleTime += dt;
    if (state === 'title') {
      dist += 70 * dt;
      const nx = W / 2 + Math.sin(titleTime * 0.9) * 80;
      plane.vx = (nx - plane.x) / Math.max(dt, 1e-3);
      plane.x = nx;
      plane.ang = Math.atan2(plane.vx, 150);
    }
    updateParticles(dt);
    return;
  }
  if (state === 'paused') return;

  if (state === 'dying') {
    speed *= Math.exp(-5 * dt);
    dist += speed * dt;
    shake = Math.max(0, shake - 40 * dt);
    updateParticles(dt);
    overTimer -= dt;
    if (overTimer <= 0) gameOver();
    return;
  }

  // playing
  time += dt;
  plane.invuln = Math.max(0, plane.invuln - dt);
  shake = Math.max(0, shake - 40 * dt);
  steer(dt);
  // gliding sideways trades fall speed for horizontal speed
  const sideways = Math.min(1, Math.abs(plane.vx) / maxSideSpeed());
  speed = baseFallSpeed() * (1 - SIDE_SLOWDOWN * sideways);
  if (plane.soggy > 0) speed *= 1.25;          // wet paper drops faster
  if (plane.bubbled > 0) speed *= 0.5;         // rising bubbles hold the plane up
  dist += speed * dt;
  // flying through a coffee spill soaks the plane
  plane.soggy = Math.max(0, plane.soggy - dt);
  plane.bubbled = Math.max(0, plane.bubbled - dt);
  for (const o of obstacles) {
    if (o.type !== 'bubbles' || Math.abs(plane.x - o.x) > o.w / 2 || Math.abs(dist + planeScreenY() - o.y) > o.h / 2) continue;
    plane.bubbled = 0.3;
    if (Math.random() < dt * 12) {             // bubbles fizzing around the plane
      particles.push({ kind: 'spark', col: 'rgba(235,250,255,.9)', x: plane.x + rand(-10, 10), y: dist + planeScreenY() + rand(-6, 10),
        vx: rand(-15, 15), vy: -rand(60, 120), g: 0, rot: 0, vr: 0, life: 1, ttl: 0.5, size: rand(2, 3.5) });
    }
  }
  const planeY = dist + planeScreenY();
  for (const o of obstacles) {
    if (o.type !== 'coffee' || Math.hypot(plane.x - o.x, planeY - o.y) > o.r * 0.85) continue;
    plane.soggyCol = `rgb(${(o.pal || PALETTES.coffee[0]).fill})`;   // stained the colour of the drink
    if (plane.soggy <= 0) floaters.push({ x: clamp(plane.x, 50, W - 50), y: planeY - 30, text: 'Soggy!', life: 1.2, col: plane.soggyCol });
    plane.soggy = SOGGY_TIME;
  }
  // rubber bands kick the plane sideways, toward the nearer end of the band
  for (const o of obstacles) {
    if (o.type !== 'band' || o.cool > 0 || plane.invuln > 0) continue;
    const bx = o.x2 - o.x1, by = o.y2 - o.y1;
    const k = clamp(((plane.x - o.x1) * bx + (planeY - o.y1) * by) / (bx * bx + by * by), 0, 1);
    if (Math.hypot(plane.x - (o.x1 + bx * k), planeY - (o.y1 + by * k)) > 9) continue;
    const side = plane.x < (o.x1 + o.x2) / 2 ? -1 : 1;
    plane.vx = side * maxSideSpeed() * 1.4;
    o.wob = 1; o.hitX = plane.x; o.cool = 0.6;
    sfx.twang();
  }
  if (plane.soggy > 0 && Math.random() < dt * 8) {   // coffee drips
    particles.push({ kind: 'spark', col: plane.soggyCol || '#7a4a22', x: plane.x + rand(-8, 8), y: planeY - 4, vx: rand(-20, 20), vy: -rand(20, 60),
      g: 0, rot: 0, vr: 0, life: 1, ttl: 0.6, size: rand(2, 3.5) });
  }
  const targetAng = Math.atan2(plane.vx, speed + 60);
  plane.ang += (targetAng - plane.ang) * Math.min(1, 12 * dt);

  spawnRows();
  for (const o of obstacles) updateObstacle(o, dt);
  prune(obstacles, o => o.y > dist - 160);
  prune(pickups, p => p.y > dist - 60);

  const circles = planeCircles();
  // stars
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i]; p.spin += dt * 2;
    if (has('magnet') && plane.alive) {
      const py = dist + planeScreenY(), dx = plane.x - p.x, dy = py - p.y, dd = Math.hypot(dx, dy);
      if (dd < magnetRange() && dd > 1) {
        const step = Math.min(dd, (300 + speed) * dt);
        p.x += dx / dd * step; p.y += dy / dd * step;
      }
    }
    if (circles.some(c => (c.x - p.x) ** 2 + (c.y - p.y) ** 2 < (c.r + p.r + 4) ** 2)) {
      pickups.splice(i, 1);
      stars++;
      floaters.push({ x: p.x, y: p.y, text: '+1 ★', life: 1 });   // stars are Shop money; they no longer add metres
      for (let k = 0; k < 8; k++) particles.push(spark(p.x, p.y));
      sfx.star();
    }
  }
  // obstacles
  outer:
  for (const o of obstacles) {
    if (plane.invuln > 0) break;   // still blinking after using the extra life
    if (Math.abs(o.y - (dist + planeScreenY())) > 160) continue;
    for (const s of shapes(o)) {
      for (const c of circles) {
        if (circleHits(c.x, c.y, c.r, s)) { plane.lives > 0 ? useExtraLife() : crash(); break outer; }
      }
    }
  }
  updateParticles(dt);
}

function updateParticles(dt) {
  for (const p of particles) {
    p.life -= dt / p.ttl;
    p.vy += p.g * dt;
    p.vx *= Math.exp(-1.5 * dt);
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
  }
  prune(particles, p => p.life > 0);
  for (const f of floaters) { f.life -= dt; f.y -= 0; }
  prune(floaters, f => f.life > 0);
}

function spark(x, y) {
  const a = rand(0, 6.28), v = rand(60, 160);
  return { kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0, rot: 0, vr: 0, life: 1, ttl: 0.45, size: rand(2, 4) };
}

// the Extra life upgrade: the hit is forgiven and the plane blinks through obstacles for a moment
function useExtraLife() {
  plane.lives--;
  plane.invuln = 2;
  shake = 7;
  const px = plane.x, py = dist + planeScreenY();
  for (let i = 0; i < 16; i++) { const p = spark(px, py); p.col = '#2f8fe0'; p.size += 1; particles.push(p); }
  floaters.push({ x: clamp(px, 90, W - 90), y: py - 30, life: 1.4, col: '#2f6fb8',
    text: plane.lives > 0 ? `Extra life used! ${plane.lives} left` : 'Extra life used!' });
  sfx.save();
}

function crash() {
  plane.alive = false;
  state = 'dying';
  overTimer = 0.95;
  shake = 12;
  const px = plane.x, py = dist + planeScreenY();
  for (let i = 0; i < 22; i++) {
    const a = rand(0, 6.28), v = rand(80, 260);
    particles.push({ kind: 'scrap', x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: 420,
      rot: rand(0, 6.28), vr: rand(-10, 10), life: 1, ttl: rand(0.7, 1.2), size: rand(4, 9) });
  }
  sfx.crash();
}
