# Builds depth-art.css (v134): one faint background pattern per map layer, as SVG data URLs.
# Run from the repo root: python tools/depth-art.py depth-art.css
import math, urllib.parse

def enc(s):
    return 'url("data:image/svg+xml,' + urllib.parse.quote(s, safe='').replace('(', '%28').replace(')', '%29') + '")'

def h(n):
    v = math.sin(n * 127.1) * 43758.5453
    return v - math.floor(v)

def svg(w, ht, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{ht}">{body}</svg>'

def scatter(n, w, ht, seed, f):
    return ''.join(f(h(i * 7.3 + seed) * w, h(i * 3.1 + seed * 2) * ht, h(i * 5.7 + seed * 3), i) for i in range(n))

A = {}   # (map, layer) -> (svg, w, h)
def pat(w, ht, pw, ph, cell, extra=''):
    return svg(w, ht, f'<defs><pattern id="p" width="{pw}" height="{ph}" patternUnits="userSpaceOnUse">{cell}</pattern></defs><rect width="{w}" height="{ht}" fill="url(#p)"/>' + extra)

# ---------- Paper: lined (kept as CSS), graph paper, dot grid, music staves, blueprint ----------
grid = lambda step, stroke, w=400, ht=250: ''.join(f'<path d="M{x} 0 V{ht}" stroke="{stroke}" stroke-width="1"/>' for x in range(0, w, step)) + ''.join(f'<path d="M0 {y} H{w}" stroke="{stroke}" stroke-width="1"/>' for y in range(0, ht, step))
A[('notebook', 1)] = (pat(400, 250, 25, 25, '<path d="M0 0.5 H25 M0.5 0 V25" stroke="rgba(80,130,200,.28)" stroke-width="1"/>', ''.join(f'<path d="M0 {y} H400" stroke="rgba(80,130,200,.4)" stroke-width="1.6"/>' for y in (0.8, 125))), 400, 250)
A[('notebook', 2)] = (pat(400, 250, 25, 25, '<circle cx="12.5" cy="12.5" r="1.6" fill="rgba(80,110,160,.45)"/>'), 400, 250)
A[('notebook', 3)] = (svg(400, 250, ''.join(f'<path d="M0 {y0 + k * 6} H400" stroke="rgba(60,60,80,.3)" stroke-width="1"/>' for y0 in range(12, 250, 50) for k in range(5))), 400, 250)
A[('notebook', 4)] = (svg(400, 250, '<defs><pattern id="p" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M0 0.5 H25 M0.5 0 V25" stroke="rgba(255,255,255,.35)" stroke-width="1"/></pattern></defs><rect width="400" height="250" fill="rgba(30,80,170,.22)"/><rect width="400" height="250" fill="url(#p)"/>' + ''.join(f'<path d="M0 {y} H400" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/>' for y in (0, 125)) + ''.join(f'<path d="M{x} 0 V250" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/>' for x in (0, 100, 200, 300))), 400, 250)

# ---------- Ocean (over the bubbles): caustics, sand ripples, ruin blocks, dome glass, bioluminescence ----------
A[('sea', 0)] = (svg(400, 250, ''.join(f'<path d="M{x} {y} q20 -12 40 0 t40 0 q-10 20 -40 18 t-40 -18" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2"/>' for x, y in [(10, 30), (190, 20), (300, 90), (60, 140), (230, 170), (130, 220), (340, 210)])), 400, 250)
A[('sea', 1)] = (svg(400, 250, ''.join(f'<path d="M{(h(i) * 200 - 100):.0f} {12 + i * 25} q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="rgba(255,240,200,.12)" stroke-width="1.6"/>' for i in range(10))), 400, 250)
blocks = ''.join(f'<rect x="{x + (50 if r % 2 else 0) - 100}" y="{r * 50 + 1}" width="98" height="48" rx="3" fill="none" stroke="rgba(230,220,200,.1)" stroke-width="1.6"/>' for r in range(5) for x in range(0, 600, 100))
A[('sea', 2)] = (svg(400, 250, blocks), 400, 250)
def hexes(r, stroke, w=400, ht=250, dx=None):
    dx = dx or w / 8; hh = ht / 5; rr = dx / 1.5
    out = []
    for c in range(-1, int(w / dx) + 2):
        for row in range(-1, int(ht / hh) + 2):
            cx, cy = c * dx, row * hh + (hh / 2 if c % 2 else 0)
            pts = ' '.join(f'{cx + math.cos(i / 6 * 2 * math.pi) * (rr - 2):.1f},{cy + math.sin(i / 6 * 2 * math.pi) * (hh / 2 - 2):.1f}' for i in range(6))
            out.append(f'<polygon points="{pts}" fill="none" stroke="{stroke}" stroke-width="1.6"/>')
    return ''.join(out)
A[('sea', 3)] = (pat(400, 250, 100, 50, ''.join(f'<polygon points="' + ' '.join(f'{cx + math.cos(i / 6 * 2 * math.pi) * 31:.1f},{cy + math.sin(i / 6 * 2 * math.pi) * 23:.1f}' for i in range(6)) + '" fill="none" stroke="rgba(220,180,90,.14)" stroke-width="1.6"/>' for cx, cy in [(0, 0), (0, 50), (100, 0), (100, 50), (50, 25)])), 400, 250)
A[('sea', 4)] = (svg(400, 375, scatter(26, 400, 375, 4, lambda x, y, s, i: f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{1 + s * 1.6:.1f}" fill="{["rgba(120,255,220,.35)", "rgba(140,200,255,.3)", "rgba(200,140,255,.28)"][i % 3]}"/>')), 400, 375)

# ---------- Space (over the stars): cloud bands, (plain stars), nebula, a spiral galaxy, distant galaxies ----------
A[('space', 0)] = (svg(400, 750, ''.join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="rgba(255,255,255,.06)"/>' for x, y, rx, ry in [(80, 90, 160, 18), (300, 240, 190, 22), (140, 420, 170, 16), (330, 580, 150, 20), (60, 700, 120, 14)])), 400, 750)
A[('space', 2)] = (svg(400, 750, '<defs><radialGradient id="n"><stop offset="0" stop-color="rgba(220,120,255,.16)"/><stop offset="1" stop-color="rgba(220,120,255,0)"/></radialGradient><radialGradient id="m"><stop offset="0" stop-color="rgba(90,170,255,.14)"/><stop offset="1" stop-color="rgba(90,170,255,0)"/></radialGradient></defs>'
                       '<ellipse cx="110" cy="160" rx="160" ry="110" fill="url(#n)"/><ellipse cx="300" cy="300" rx="150" ry="120" fill="url(#m)"/><ellipse cx="160" cy="560" rx="190" ry="120" fill="url(#n)"/><ellipse cx="330" cy="690" rx="120" ry="90" fill="url(#m)"/>'), 400, 750)
spiral = ''.join(f'<path d="M{200 + math.cos(a) * a * 9:.1f} {375 + math.sin(a) * a * 5:.1f} L{200 + math.cos(a + 0.25) * (a + 0.25) * 9:.1f} {375 + math.sin(a + 0.25) * (a + 0.25) * 5:.1f}" stroke="rgba(230,220,255,.16)" stroke-width="{6 - a * 0.35:.1f}" stroke-linecap="round"/>' for k in (0, math.pi) for a in [k + i * 0.25 for i in range(0, 48)] if a - k < 12)
spiral = ''.join(f'<path d="' + ' '.join(('M' if i == 0 else 'L') + f'{200 + math.cos(k + t) * t * 11:.1f} {375 + math.sin(k + t) * t * 6:.1f}' for i, t in enumerate([j * 0.2 for j in range(60)])) + '" fill="none" stroke="rgba(230,220,255,.14)" stroke-width="5" stroke-linecap="round"/>' for k in (0, math.pi))
A[('space', 3)] = (svg(400, 750, '<defs><radialGradient id="c"><stop offset="0" stop-color="rgba(255,240,220,.3)"/><stop offset="1" stop-color="rgba(255,240,220,0)"/></radialGradient></defs><ellipse cx="200" cy="375" rx="60" ry="34" fill="url(#c)"/>' + spiral), 400, 750)
A[('space', 4)] = (svg(400, 375, scatter(14, 400, 375, 9, lambda x, y, s, i: f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{4 + s * 6:.1f}" ry="{1.5 + s * 2:.1f}" transform="rotate({s * 180:.0f} {x:.0f} {y:.0f})" fill="rgba(220,210,255,.22)"/>')), 400, 375)

# ---------- Dungeon (bricks at the top): wooden planks, crypt arches, crystal facets, rune bands ----------
A[('dungeon', 1)] = (svg(400, 250, ''.join(f'<rect x="{x + 1}" y="0" width="38" height="250" fill="rgba(255,220,170,{0.03 + 0.03 * (x // 40 % 2)})"/><path d="M{x + 1} 0 V250" stroke="rgba(0,0,0,.25)" stroke-width="2"/><circle cx="{x + 8}" cy="40" r="1.6" fill="rgba(255,255,255,.18)"/><circle cx="{x + 32}" cy="40" r="1.6" fill="rgba(255,255,255,.18)"/><circle cx="{x + 8}" cy="200" r="1.6" fill="rgba(255,255,255,.18)"/><circle cx="{x + 32}" cy="200" r="1.6" fill="rgba(255,255,255,.18)"/><path d="M{x + 14} {(h(x) * 200):.0f} q4 20 0 40" stroke="rgba(0,0,0,.18)" fill="none" stroke-width="1.2"/>' for x in range(0, 400, 40))), 400, 250)
A[('dungeon', 2)] = (svg(400, 250, ''.join(f'<path d="M{x + 8} {y + 110} V{y + 45} Q{x + 8} {y + 8} {x + 40} {y + 8} Q{x + 72} {y + 8} {x + 72} {y + 45} V{y + 110}" fill="rgba(0,0,0,.07)" stroke="rgba(255,255,255,.05)" stroke-width="1.6"/>' for x in range(0, 400, 80) for y in (5, 130))), 400, 250)
tri = []
pts = [[(x * 80 + (40 if y % 2 else 0) + (h(x * 9 + y) - 0.5) * 20, y * 62.5 + (h(x * 3 + y * 7) - 0.5) * 20) for x in range(-1, 7)] for y in range(-1, 6)]
for y in range(len(pts) - 1):
    for x in range(len(pts[0]) - 1):
        a, b, c, d = pts[y][x], pts[y][x + 1], pts[y + 1][x], pts[y + 1][x + 1]
        for t in ((a, b, c), (b, d, c)):
            tri.append('<polygon points="' + ' '.join(f'{p[0]:.0f},{p[1]:.0f}' for p in t) + f'" fill="rgba({"150,220,255" if (x + y) % 3 else "200,150,255"},{0.02 + 0.04 * h(x * 13 + y):.3f})" stroke="rgba(170,220,255,.1)" stroke-width="1"/>')
A[('dungeon', 3)] = (svg(400, 250, ''.join(tri)), 400, 250)
runes = ''.join(f'<path d="M{x} 106 l6 -12 l6 12 M{x + 3} 100 h6 M{x + 20} 94 v12 l6 -6 l-6 -6" stroke="rgba(120,255,210,.2)" stroke-width="1.6" fill="none"/>' for x in range(4, 400, 40))
A[('dungeon', 4)] = (svg(400, 250, '<rect x="0" y="86" width="400" height="28" fill="rgba(0,0,0,.14)"/><path d="M0 86 H400 M0 114 H400" stroke="rgba(120,255,210,.12)" stroke-width="1.4"/>' + runes), 400, 250)

# ---------- Neon City (skyline at the top): brick walls with posters, subway tiles, arcade carpet, circuit board ----------
bricks = ''.join(f'<rect x="{x + (20 if r % 2 else 0) - 40}" y="{r * 25 + 1}" width="38" height="23" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1.4"/>' for r in range(10) for x in range(0, 480, 40))
posters = ''.join(f'<rect x="{x}" y="{y}" width="46" height="62" rx="2" fill="{c}"/>' for x, y, c in [(30, 40, 'rgba(255,79,216,.1)'), (230, 120, 'rgba(63,240,255,.1)'), (330, 10, 'rgba(255,176,63,.1)')])
A[('city', 1)] = (pat(400, 250, 40, 50, '<rect x="1" y="1" width="38" height="23" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1.4"/><rect x="-19" y="26" width="38" height="23" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1.4"/><rect x="21" y="26" width="38" height="23" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="1.4"/>', posters), 400, 250)
A[('city', 2)] = (pat(400, 250, 50, 25, '<rect x="1" y="1" width="48" height="23" rx="3" fill="none" stroke="rgba(220,255,250,.08)" stroke-width="1.4"/>', '<rect x="0" y="112" width="400" height="12" fill="rgba(255,196,60,.12)"/>'), 400, 250)
def conf(x, y, s, i):
    c = ['rgba(255,79,216,.14)', 'rgba(63,240,255,.14)', 'rgba(182,255,63,.12)', 'rgba(255,210,63,.12)'][i % 4]
    if i % 3 == 0: return f'<circle cx="{x:.0f}" cy="{y:.0f}" r="4" fill="none" stroke="{c}" stroke-width="2"/>'
    if i % 3 == 1: return f'<path d="M{x:.0f} {y:.0f} l5 -8 l5 8 z" fill="{c}"/>'
    return f'<path d="M{x:.0f} {y:.0f} q4 -5 8 0 t8 0" fill="none" stroke="{c}" stroke-width="2"/>'
A[('city', 3)] = (svg(400, 250, scatter(30, 400, 250, 13, conf)), 400, 250)
traces = []
for i in range(12):
    x, y = h(i * 4.1) * 400, h(i * 2.7) * 250
    d = f'M{x:.0f} {y:.0f} h{(h(i * 6) - 0.5) * 160:.0f} v{(h(i * 8) - 0.5) * 120:.0f} h{(h(i * 9) - 0.5) * 120:.0f}'
    traces.append(f'<path d="{d}" fill="none" stroke="rgba(63,255,138,.14)" stroke-width="1.6"/><circle cx="{x:.0f}" cy="{y:.0f}" r="3" fill="none" stroke="rgba(63,255,138,.2)" stroke-width="1.4"/>')
A[('city', 4)] = (svg(400, 250, ''.join(traces)), 400, 250)

# ---------- Forest (over the trunks): spring blossoms, summer leaves, autumn leaves, snow; the night layer exists ----------
def blossom(x, y, s, i):
    r = 2.6 + s * 1.4
    return ''.join(f'<circle cx="{x + math.cos(k * 1.2566) * r:.1f}" cy="{y + math.sin(k * 1.2566) * r:.1f}" r="{r * 0.7:.1f}" fill="rgba(255,170,200,.3)"/>' for k in range(5)) + f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.4" fill="rgba(255,230,140,.4)"/>'
A[('forest', 0)] = (svg(400, 375, scatter(13, 400, 375, 21, blossom)), 400, 375)
A[('forest', 1)] = (svg(400, 250, scatter(26, 400, 250, 22, lambda x, y, s, i: f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{8 + s * 6:.1f}" ry="{3.5 + s * 2:.1f}" transform="rotate({s * 180:.0f} {x:.0f} {y:.0f})" fill="rgba(40,110,40,.1)"/>')), 400, 250)
A[('forest', 2)] = (svg(400, 375, scatter(24, 400, 375, 23, lambda x, y, s, i: f'<path d="M{x:.0f} {y - 6:.0f} q6 6 0 12 q-6 -6 0 -12" transform="rotate({s * 360:.0f} {x:.0f} {y:.0f})" fill="{["rgba(230,110,40,.3)", "rgba(200,60,40,.28)", "rgba(240,180,60,.3)"][i % 3]}"/>')), 400, 375)
A[('forest', 3)] = (svg(400, 250, scatter(40, 400, 250, 24, lambda x, y, s, i: f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{1 + s * 2:.1f}" fill="rgba(255,255,255,.45)"/>')), 400, 250)

# ---------- Desert (ripples at the top): sandstone strata, palm shadows, shells in the rock, amber bubbles ----------
A[('desert', 1)] = (svg(400, 250, ''.join(f'<path d="M0 {y} q100 {(h(y) - 0.5) * 14:.0f} 200 0 t200 0 V{y + 18} q-100 {(h(y + 1) - 0.5) * 12:.0f} -200 0 t-200 0 Z" fill="rgba(120,60,20,{0.04 + 0.03 * (y // 50 % 2):.2f})"/>' for y in range(10, 250, 50))), 400, 250)
frond = lambda x, y, a: f'<g transform="rotate({a} {x} {y})" fill="rgba(40,60,30,.08)">' + ''.join(f'<ellipse cx="{x + k * 14}" cy="{y + (k % 2) * 8 - 4}" rx="10" ry="3.5" transform="rotate({(k % 2) * 50 - 25} {x + k * 14} {y + (k % 2) * 8 - 4})"/>' for k in range(9)) + f'<path d="M{x - 6} {y} H{x + 124}" stroke="rgba(40,60,30,.1)" stroke-width="2"/></g>'
A[('desert', 2)] = (svg(400, 375, frond(20, 60, 20) + frond(240, 160, -25) + frond(60, 280, 10) + frond(260, 340, 30)), 400, 375)
def shell(x, y, s, i):
    if i % 2: return f'<path d="M{x:.0f} {y:.0f} m-6 0 a6 6 0 1 1 6 6 a4 4 0 1 1 -4 -4 a2 2 0 1 1 2 2" fill="none" stroke="rgba(70,50,30,.16)" stroke-width="1.4"/>'
    return f'<path d="M{x:.0f} {y - 10:.0f} V{y + 10:.0f}" stroke="rgba(70,50,30,.14)" stroke-width="1.2"/>' + ''.join(f'<path d="M{x:.0f} {y + k * 4:.0f} l{d * 6} -4" stroke="rgba(70,50,30,.14)" stroke-width="1.2"/>' for k in range(-2, 3) for d in (-1, 1))
A[('desert', 3)] = (svg(400, 375, scatter(11, 400, 375, 31, shell)), 400, 375)
A[('desert', 4)] = (svg(400, 375, scatter(20, 400, 375, 32, lambda x, y, s, i: f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{4 + s * 10:.1f}" fill="rgba(255,190,60,.08)" stroke="rgba(255,220,120,.18)" stroke-width="1.2"/>')), 400, 375)

# ---------- Volcano (basalt hexagons in the crater): jungle leaves, ash-streaked rock, lava-tube ribs, magma cells ----------
leaf = lambda x, y, s, i: f'<path d="M{x:.0f} {y:.0f} q{18 + s * 10:.0f} -{14 + s * 8:.0f} {36 + s * 18:.0f} 0 q-{18 + s * 10:.0f} {14 + s * 8:.0f} -{36 + s * 18:.0f} 0" transform="rotate({s * 360:.0f} {x:.0f} {y:.0f})" fill="rgba(30,80,30,.08)"/>'
A[('volcano', 0)] = (svg(400, 375, scatter(16, 400, 375, 41, leaf)), 400, 375)
A[('volcano', 1)] = (svg(400, 250, ''.join(f'<path d="M{(h(i) * 400):.0f} {(h(i * 2) * 250):.0f} l{40 + h(i * 3) * 40:.0f} {20 + h(i * 4) * 20:.0f}" stroke="rgba(60,55,50,.12)" stroke-width="{2 + h(i * 5) * 3:.1f}" stroke-linecap="round"/>' for i in range(24))), 400, 250)
A[('volcano', 3)] = (svg(400, 250, ''.join(f'<path d="M0 {y} Q200 {y - 22} 400 {y}" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3"/><path d="M0 {y + 4} Q200 {y - 18} 400 {y + 4}" fill="none" stroke="rgba(255,130,40,.12)" stroke-width="1.4"/>' for y in range(30, 250, 50))), 400, 250)
cells = ''.join(f'<polygon points="' + ' '.join(f'{cx + math.cos(k / 6 * 2 * math.pi + h(cx) ) * (22 + 8 * h(cx + k)):.0f},{cy + math.sin(k / 6 * 2 * math.pi + h(cx)) * (22 + 8 * h(cy + k)):.0f}' for k in range(6)) + '" fill="rgba(255,220,120,.05)" stroke="rgba(140,40,10,.14)" stroke-width="2"/>' for cx in range(25, 400, 60) for cy in range(25, 250, 55))
A[('volcano', 4)] = (svg(400, 250, cells), 400, 250)

# ---------- Kitchen (checker tiles by the stove): flower wallpaper, wood grain, blue mosaic, ridged fridge wall ----------
def flower(x, y):
    return ''.join(f'<circle cx="{x + math.cos(k * 1.2566) * 3:.1f}" cy="{y + math.sin(k * 1.2566) * 3:.1f}" r="2.2" fill="rgba(220,110,120,.16)"/>' for k in range(5)) + f'<circle cx="{x}" cy="{y}" r="1.4" fill="rgba(240,190,80,.25)"/>'
A[('kitchen', 0)] = (pat(400, 250, 50, 50, flower(25, 25) + '<path d="M0.5 0 V50" stroke="rgba(200,140,120,.08)" stroke-width="1"/>'), 400, 250)
A[('kitchen', 1)] = (svg(400, 250, ''.join(f'<path d="M{x} 0 V250" stroke="rgba(120,70,30,.12)" stroke-width="1.6"/>' + ''.join(f'<path d="M{x + 10 + k * 12} 0 C{x + 4 + k * 12} 80 {x + 18 + k * 12} 170 {x + 10 + k * 12} 250" fill="none" stroke="rgba(120,70,30,.07)" stroke-width="1.2"/>' for k in range(3)) for x in range(0, 400, 50))), 400, 250)
A[('kitchen', 3)] = (pat(400, 250, 50, 50, ''.join(f'<rect x="{x + 0.75}" y="{y + 0.75}" width="11" height="11" fill="rgba(60,130,200,{0.03 + 0.08 * h(x * 0.37 + y * 1.3):.2f})"/>' for x in [i * 12.5 for i in range(4)] for y in [j * 12.5 for j in range(4)])), 400, 250)
A[('kitchen', 4)] = (svg(400, 250, ''.join(f'<path d="M0 {y} H400" stroke="rgba(255,255,255,.4)" stroke-width="2"/><path d="M0 {y + 3} H400" stroke="rgba(80,130,170,.1)" stroke-width="1.4"/>' for y in range(10, 250, 25)) + scatter(16, 400, 250, 51, lambda x, y, s, i: f'<path d="M{x - 4:.0f} {y:.0f} h8 M{x:.0f} {y - 4:.0f} v8" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/>')), 400, 250)

css = ['/* Depth art (v134): one faint pattern per map layer, cross-faded by syncDepthArt in render.js on the two .depth-art layers. */',
       '.depth-art { visibility: hidden; background-repeat: repeat; }',
       '.art-notebook-0 { background-image: repeating-linear-gradient(to bottom, var(--rule) 0, var(--rule) calc(var(--u) * 1), transparent calc(var(--u) * 1), transparent calc(var(--u) * 30)); background-size: 100% calc(var(--u) * 30); }']
for (m, k), (s, w, ht) in sorted(A.items()):
    assert 750 % ht == 0, (m, k, ht)
    css.append(f'.art-{m}-{k} {{ background-image: {enc(s)}; background-size: calc(var(--u) * {w}) calc(var(--u) * {ht}); }}')
open(__import__('sys').argv[1], 'w', encoding='utf-8').write('\n'.join(css) + '\n')
print(len(A) + 1, 'patterns', sum(len(c) for c in css) // 1024, 'KB')
