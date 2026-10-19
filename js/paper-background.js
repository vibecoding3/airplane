// Paper Nosedive — Paper map background: the pencil formulas, harder the deeper the page.
'use strict';

// ---------- background math: harder the deeper the page ----------
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const FORMULA_DEPTHS = [0, 150, 400, 800, 1500, 2500];   // metres where each level starts
const FORMULA_TIERS = [
  [ // arithmetic
    () => { const a = ri(2, 19), b = ri(2, 19); return `${a} + ${b} = ${a + b}`; },
    () => { const a = ri(10, 30), b = ri(1, 9); return `${a} − ${b} = ${a - b}`; },
    () => { const a = ri(2, 9), b = ri(2, 9); return `${a} × ${b} = ${a * b}`; },
    () => { const b = ri(2, 9), q = ri(2, 9); return `${b * q} ÷ ${b} = ${q}`; },
    '1/2 + 1/4 = 3/4', '100 − 37 = 63',
    '12 + 15 = 27', '9 + 9 = 18', '45 − 18 = 27', '6 × 7 = 42', '81 ÷ 9 = 9', '3 × 3 × 3 = 27',
    '50 + 50 = 100', '1000 − 1 = 999', '0.5 + 0.25 = 0.75', '12 × 12 = 144', '7 + 8 + 9 = 24',
    '64 ÷ 8 = 8', '11 × 11 = 121', '2 + 2 = 4', '99 + 1 = 100', '15 × 4 = 60',
    // number play
    '1 + 1 = 10₂', '2⁰ = 1', 'gcd(12, 18) = 6', 'lcm(4, 6) = 12'
  ],
  [ // fractions, percentages, first algebra
    'x + 7 = 12  →  x = 5', '3x = 21  →  x = 7', '2/3 + 1/6 = 5/6', '25% of 80 = 20',
    '√144 = 12', 'A = π r²', 'P = 2(l + w)', '2⁵ = 32', '−3 · (−4) = 12',
    '2x + 3 = 11  →  x = 4', 'x/4 = 5  →  x = 20', '3/4 = 0.75', '1/3 + 1/3 = 2/3', '50% of 64 = 32',
    '10% of 250 = 25', '√81 = 9', '3² + 4² = 25', '10³ = 1000', '5! = 120', 'C = 2πr', 'A = ½ b h',
    '(−2)³ = −8', '0.2 × 0.3 = 0.06', '5x − 7 = 18  →  x = 5', 'a/b ÷ c/d = ad / bc', '7/8 − 3/8 = 1/2',
    // first physics
    'v = d / t', 'ρ = m / V', 'P = F / A', 'W = F · d', 'a = Δv / Δt',
    // geometry basics
    'A = l × w', 'V = l × w × h', 'C = π d', 'A = s²', 'α + β + γ = 180°',
    // first statistics
    'x̄ = Σx / n', 'P(heads) = ½',
    // number theory
    '0.999… = 1', '1 + 2 + 3 + 4 = 10', 'Fₙ = Fₙ₋₁ + Fₙ₋₂', '17 ≡ 2 (mod 5)'
  ],
  [ // algebra, geometry, trig
    'x = (−b ± √(b² − 4ac)) / 2a', 'a² + b² = c²', '(a + b)² = a² + 2ab + b²', 'sin²θ + cos²θ = 1',
    'y = mx + b', 'log₂ 8 = 3', 'aᵐ · aⁿ = aᵐ⁺ⁿ', 'V = 4/3 π r³', 'tan θ = sin θ / cos θ',
    '(a − b)² = a² − 2ab + b²', 'a² − b² = (a + b)(a − b)', 'sin 30° = 1/2', 'cos 60° = 1/2', 'tan 45° = 1',
    'sin 2θ = 2 sin θ cos θ', 'cos 2θ = cos²θ − sin²θ', 'log(ab) = log a + log b', 'logₐ aˣ = x',
    'x² − 5x + 6 = (x − 2)(x − 3)', 'd = √((x₂ − x₁)² + (y₂ − y₁)²)', 'm = (y₂ − y₁) / (x₂ − x₁)',
    'Sₙ = n(a₁ + aₙ) / 2', 'aₙ = a₁ rⁿ⁻¹', 'a / sin A = b / sin B', 'c² = a² + b² − 2ab cos C', '180° = π rad',
    // mechanics and circuits
    'F = ma', 'p = mv', 'KE = ½ m v²', 'PE = m g h', 'V = I R', 'P = I V', 'λ = v / f', 'T = 2π √(L / g)',
    // engineering basics: stress, strain, moments, resistors
    'σ = F / A', 'ε = ΔL / L₀', 'σ = E ε', 'M = F · d', 'R = R₁ + R₂',
    // geometry: solids, sectors, trapezoids
    'V = ⅓ π r² h', 'S = 4π r²', 'A = ½ ab sin C', 'A = π r² θ / 360°', 'V = π r² h', 'd = a√2', 'A = ½ (a + b) h',
    // statistics and counting
    'z = (x − μ) / σ', 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)', 'P(A ∩ B) = P(A) · P(B|A)', 'σ² = Σ(x − μ)² / N',
    'nCr = n! / (r! (n − r)!)', 'nPr = n! / (n − r)!',
    // number theory
    '1, 1, 2, 3, 5, 8, 13, 21…', 'a ≡ b (mod n) ⇔ n | (a − b)',
    // astronomy basics
    'v = 2πr / T', 'g = GM / r²', '1 AU ≈ 1.496 × 10⁸ km', '1 ly ≈ 9.46 × 10¹² km'
  ],
  [ // calculus
    'd/dx xⁿ = n xⁿ⁻¹', '∫ x² dx = x³/3 + C', 'lim x→0  sin x / x = 1', 'd/dx eˣ = eˣ',
    '∫₀¹ x dx = 1/2', "f′(x) = lim h→0 (f(x+h) − f(x)) / h", "(fg)′ = f′g + fg′", '∫ 1/x dx = ln|x| + C',
    'd/dx sin x = cos x', 'd/dx cos x = −sin x', 'd/dx ln x = 1/x', 'd/dx tan x = sec²x', '∫ cos x dx = sin x + C',
    '∫ eˣ dx = eˣ + C', '∫₀^π sin x dx = 2', "(f/g)′ = (f′g − fg′) / g²", "(f ∘ g)′ = f′(g(x)) · g′(x)",
    'lim n→∞ (1 + 1/n)ⁿ = e', '∫ u dv = uv − ∫ v du', "∫ₐᵇ f′(x) dx = f(b) − f(a)", 'd/dx arctan x = 1 / (1 + x²)',
    'lim x→0 (eˣ − 1) / x = 1', '∫ 1/(1 + x²) dx = arctan x + C', '∂/∂x (x²y) = 2xy', '∫₀¹ x² dx = 1/3',
    // physics: springs, rotation, motion, optics, fields
    'F = −kx', 'τ = r F sin θ', 'a = v² / r', 'v² = u² + 2as', 's = ut + ½at²', 'n₁ sin θ₁ = n₂ sin θ₂',
    'F = qE', 'F = q v × B',
    // engineering: circuits, drives, flow, beams, wind
    '1/R = 1/R₁ + 1/R₂', 'τ = RC', 'P = τ ω', 'Q = A v', 'δ = FL³ / (3EI)', 'σ = M y / I', 'P = ½ ρ A v³',
    // geometry: Heron, Euler's polyhedra, Pick, polygon angles
    'A = √(s(s−a)(s−b)(s−c))', 'V − E + F = 2', 'A = i + b/2 − 1', 'Σ angles = (n − 2) · 180°',
    // probability
    'P(A|B) = P(B|A) P(A) / P(B)', 'P(k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ', 'E[X] = Σ x · P(x)', 'Var(X) = E[X²] − (E[X])²',
    'r = cov(X,Y) / (σₓ σᵧ)',
    // orbits and the expanding universe
    'T² = 4π² a³ / (GM)', 'v = H₀ d', 'vₑ = √(2GM / r)', 'v = √(GM / r)'
  ],
  [ // series, complex numbers, linear algebra
    'e^(iπ) + 1 = 0', '∑ 1/n² = π²/6', 'eˣ = ∑ xⁿ / n!', '∫ e^(−x²) dx = √π', 'det(A − λI) = 0',
    'e^(iθ) = cos θ + i sin θ', 'Γ(n) = (n − 1)!', '∑ (−1)ⁿ / (2n+1) = π/4',
    '∑ₙ₌₁^∞ 1/2ⁿ = 1', '∑ₖ₌₁ⁿ k = n(n+1)/2', '∑ₖ₌₁ⁿ k² = n(n+1)(2n+1)/6', 'sin x = x − x³/3! + x⁵/5! − …',
    'cos x = 1 − x²/2! + x⁴/4! − …', 'ln(1 + x) = x − x²/2 + x³/3 − …', '1/(1 − x) = ∑ xⁿ,  |x| < 1', 'i² = −1',
    '|a + bi| = √(a² + b²)', '(cos θ + i sin θ)ⁿ = cos nθ + i sin nθ', 'det [[a, b], [c, d]] = ad − bc',
    '(AB)ᵀ = BᵀAᵀ', 'A A⁻¹ = I', 'Γ(1/2) = √π', '∏ₚ (1 − 1/p²) = 6/π²', '∑ 1/n diverges', 'φ = (1 + √5) / 2',
    // physics: rotation, heat, capacitors, induction
    'L = Iω', 'Q = m c ΔT', 'η = 1 − T_c / T_h', 'E = ½ C V²', 'Φ = B A cos θ', 'ε = −dΦ/dt', 'U = ½ k x²',
    // engineering: fluids, heat flow, buckling, AC circuits
    'P + ½ρv² + ρgh = const', 'Re = ρ v L / μ', 'q = −k ∇T', 'P_cr = π² E I / (K L)²', 'f = 1 / (2π √(LC))',
    'X_C = 1 / (2π f C)', 'Z = R + jX',
    // distributions
    'f(x) = e^(−(x−μ)² / 2σ²) / (σ√(2π))', 'P(k) = λᵏ e^(−λ) / k!', 'SE = σ / √n',
    // number theory
    'aᵖ⁻¹ ≡ 1 (mod p)', 'Fₙ = (φⁿ − ψⁿ) / √5', 'φ(p) = p − 1', '∑ 1/p diverges',
    // stars and light
    'L = 4π R² σ T⁴', 'λ_max T = b', 'm − M = 5 log₁₀(d / 10 pc)', 'z = Δλ / λ'
  ],
  [ // physics and the scary stuff
    'iℏ ∂Ψ/∂t = ĤΨ', 'ζ(s) = ∑ 1/nˢ', '∇ × B = μ₀J + μ₀ε₀ ∂E/∂t', '∇ · E = ρ / ε₀',
    'ρ(∂u/∂t + u·∇u) = −∇p + μ∇²u', 'Gμν + Λgμν = (8πG/c⁴) Tμν', 'f̂(ξ) = ∫ f(x) e^(−2πixξ) dx',
    'P = NP ?',
    'E = mc²', 'F = G m₁m₂ / r²', '∇ · B = 0', '∇ × E = −∂B/∂t', 'E = hν', 'Δx Δp ≥ ℏ/2', 'S = k ln W',
    'PV = nRT', 'dS ≥ δQ / T', '∂u/∂t = α ∇²u', '∂²u/∂t² = c² ∇²u', '(iγ^μ ∂_μ − m) ψ = 0', '∮ B · dl = μ₀ I',
    'L = T − V', 'd/dt (∂L/∂q̇) = ∂L/∂q', 'N(t) = N₀ e^(−λt)',
    // physics: Doppler, relativity, matter waves
    'f′ = f (v + v_o) / (v − v_s)', 'γ = 1 / √(1 − v²/c²)', 'λ = h / p',
    // engineering: control systems, signals, pipe flow, convection
    'H(s) = Y(s) / X(s)', 'ℒ{f′(t)} = s F(s) − f(0)', 'G(s) = ωₙ² / (s² + 2ζωₙs + ωₙ²)',
    'Δp = f (L/D) (ρv² / 2)', 'Nu = h L / k',
    // prime counting, black holes, starlight
    'π(x) ~ x / ln x', 'r_s = 2GM / c²', 'F = L / (4π d²)'
  ]
];
const formulaFont = size => `${size}px Kalam, "Cambria Math", "Segoe UI Symbol", cursive`;
let formulas = [], nextFormulaY = 60;
const usedFormulas = new Set();   // each formula appears at most once per run

// an unused formula from this level; once it runs dry, borrow from harder levels, then easier ones
function pickFormula(tier) {
  const order = [tier];
  for (let i = tier + 1; i < FORMULA_TIERS.length; i++) order.push(i);
  for (let i = tier - 1; i >= 0; i--) order.push(i);
  for (const t of order) {
    const options = [];
    for (const item of FORMULA_TIERS[t]) {
      if (typeof item === 'function') {
        for (let n = 0; n < 5; n++) {
          const s = item();
          if (!usedFormulas.has(s)) { options.push(s); break; }
        }
      } else if (!usedFormulas.has(item)) {
        options.push(item);
      }
    }
    if (options.length) return options[Math.floor(Math.random() * options.length)];
  }
  return null;
}

function spawnFormula(lineY) {
  const m = lineY / PX_PER_M;
  let tier = 0;
  for (let i = 1; i < FORMULA_DEPTHS.length; i++) if (m >= FORMULA_DEPTHS[i]) tier = i;
  const text = pickFormula(tier);
  if (!text) return;
  usedFormulas.add(text);
  let size = 19;
  ctx.font = formulaFont(size);
  let w = ctx.measureText(text).width;
  const rot = formulaAngle();
  const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot));
  // shrink the formula until its rotated box fits between the red margin and the right edge
  let ex = w * c + size * s;
  const room = W - 66 - 12;
  if (ex > room) { const k = room / ex; size *= k; w *= k; ex = room; }
  const ey = w * s + size * c;
  formulas.push({ text, size, w, ext: ey, x: rand(66 + ex / 2, W - 12 - ex / 2), y: lineY - size * 0.35, rot,
    underline: Math.random() < 0.2 });
  return ey;
}

// a mix of handwriting angles, never tilted more than 45° so every formula stays readable
const MAX_TILT = Math.PI / 4;
function formulaAngle() {
  const r = Math.random(), sign = Math.random() < 0.5 ? -1 : 1;
  if (r < 0.4) return sign * rand(0.04, 0.15);       // a little crooked
  if (r < 0.75) return sign * rand(0.25, 0.5);       // clearly slanted
  return sign * rand(0.55, MAX_TILT);                // steep, up to 45°
}

// formulas start on the ruled lines (every 30 units of world y); tall rotated ones push the next one down
// the notebook gets formulas, the ocean gets fish; both use the same spacing down the page
function updateFormulas(dt = 0) {
  while (nextFormulaY < dist + H + 140) {
    const ext = (mapId === 'sea' ? spawnFish(nextFormulaY) : mapId === 'space' ? spawnSpaceThing(nextFormulaY) : mapId === 'dungeon' ? spawnDungeonThing(nextFormulaY) : mapId === 'city' ? spawnCityThing(nextFormulaY) : mapId === 'forest' ? spawnForestThing(nextFormulaY) : mapId === 'desert' ? spawnDesertThing(nextFormulaY) : spawnFormula(nextFormulaY)) || 0;
    nextFormulaY += Math.max(30 * ri(4, 7), 30 * Math.ceil((ext / 2 + 105) / 30));
  }
  prune(formulas, f => f.y + f.ext / 2 > dist - 20);
  for (const f of fishes) { f.x += f.vx * dt; f.t += dt; }
  prune(fishes, f => f.y + f.ext / 2 > dist - 20 && f.x > -f.w && f.x < W + f.w);
}

// the start of a Paper run: the top of the notebook page, with its spiral binding and a handwritten header,
// lying on a wooden desk with a pencil and an eraser. It slides up out of view within the first ~35 m, like the
// Earth in Space. Desk things sit above the page edge, so they never look like obstacles on the page.
const paperStartY = () => planeScreenY() - 80 - dist * 0.22;       // the page's top edge on screen
function drawPaperStart() {
  const y = paperStartY();
  if (y < -60) return;
  blit(sharedSprite('paperTop', W, 420, 0, 360, () => {
    const desk = ctx.createLinearGradient(0, -360, 0, 0);
    desk.addColorStop(0, '#c99a6b'); desk.addColorStop(1, '#ddb38a');
    ctx.fillStyle = desk; ctx.fillRect(0, -360, W, 360);
    ctx.strokeStyle = 'rgba(120,70,30,.18)'; ctx.lineWidth = 1.5; ctx.beginPath();           // wood grain
    for (const gy of [-300, -240, -170, -110, -55]) { ctx.moveTo(0, gy); ctx.bezierCurveTo(W * 0.3, gy - 8, W * 0.6, gy + 8, W, gy - 3); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(0, -3, W, 3);                              // the page's edge
    // a pencil and an eraser lying on the desk
    ctx.save(); ctx.translate(150, -26); ctx.rotate(-0.08);
    ctx.fillStyle = '#f4c430'; ctx.fillRect(-55, -5, 92, 10);
    ctx.fillStyle = '#d9a520'; ctx.fillRect(-55, 1.5, 92, 3.5);
    ctx.fillStyle = '#ecc99a'; ctx.beginPath(); ctx.moveTo(37, -5); ctx.lineTo(54, 0); ctx.lineTo(37, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.moveTo(48, -1.8); ctx.lineTo(54, 0); ctx.lineTo(48, 1.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c3c9d3'; ctx.fillRect(-63, -5, 8, 10); ctx.fillStyle = '#f29fae'; ctx.fillRect(-72, -5, 9, 10);
    ctx.beginPath(); ctx.rect(-72, -5, 109, 10); ctx.moveTo(37, -5); ctx.lineTo(54, 0); ctx.lineTo(37, 5); inkStroke(1.2);
    ctx.restore();
    ctx.save(); ctx.translate(300, -30); ctx.rotate(0.12);
    ctx.fillStyle = '#f2a7b5'; ctx.beginPath(); roundRectPath(-20, -9, 40, 18, 4); ctx.fill(); inkStroke(1.2);
    ctx.fillStyle = '#3a66c4'; ctx.fillRect(-4, -9, 24, 18); ctx.beginPath(); ctx.rect(-4, -9, 24, 18); inkStroke(1);
    ctx.restore();
    // the spiral binding: punched holes just below the edge, with a wire coil looping through each
    for (let x = 18; x < W; x += 24) {
      ctx.fillStyle = '#c99a6b'; ctx.beginPath(); ctx.arc(x, 9, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6b7078'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - 1, 9); ctx.bezierCurveTo(x - 4, -6, x + 8, -14, x + 6, 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.stroke();
    }
    // the page header, handwritten
    ctx.font = '700 16px Kalam, cursive'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(85,88,94,.75)'; ctx.fillText('Name:', 70, 42); ctx.fillText('Date:', 262, 42);
    ctx.strokeStyle = 'rgba(85,88,94,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(118, 44); ctx.lineTo(248, 44); ctx.moveTo(305, 44); ctx.lineTo(385, 44); ctx.stroke();
    ctx.fillStyle = COL.ink; ctx.font = '400 18px Kalam, cursive'; ctx.fillText('Paper plane', 124, 40); ctx.fillText('today', 312, 40);
  }), 0, y);
}
