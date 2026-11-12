// toys.js — «Іграшкова кімната»: килим-«місто» — сірі дороги з пунктиром і смужками трави вздовж кубиків, стовпи —
// дерев'яні кубики з літерами (на всю клітинку), рамка — дерев'яний бортик; блоки — предмети з тінню: пірамідки з кілець,
// скрині з іграшками, м'ячі, барабани; стіни — стоси книжок. Гравці — олов'яні солдатики, ківер і мундир кольору гравця;
// заводна мишка, машинка на пульті, повітряна кулька з намальованим обличчям. Бомби — коробки з пружинним сюрпризом.
// Тло — нічна дитяча кімната: шпалери із зірками, полиці з іграшками, нічник-грибок, дитячі малюнки.
// Бонуси: 🎁 бомба, 🎉 вогонь (хлопавка), 🛴 швидкість, 🪁 прохід, 🧸 стійкість, 🎮 детонатор (пульт).
import { DX, DY, PILLAR, IT_BOMB, IT_FIRE, IT_SPEED, IT_PASS, IT_RESIST, IT_REMOTE } from '../sim.js';
import { TAU, rr, rnd, luma, shade, circle, ellipse, line, poly, bombBeat, bombFlash } from './common.js';

const ROAD = '#737a88', ROAD2 = '#6f7684', GRASS = '#6fb64f';
const WOOD = '#b48653', WOOD_HI = '#cfa26c', WOOD_LO = '#7f5a2e';
const FRAME = '#6e4627', FRAME_HI = '#93633b', FRAME_LO = '#472b16';
const SKIN = '#f6cba4', GOLD = '#e8b630', INK = '#1d1b24';
const FACE = ['#a5574b', '#4b6c9a', '#58864b', '#b08a3b', '#77598f'];
const LETTERS = 'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЮЯ';
const FONT = '"Trebuchet MS", Verdana, sans-serif';
const RAINBOW = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5'];

function star(g, x, y, r, color) {
  g.fillStyle = color;
  g.beginPath();
  for (let j = 0; j < 10; j++) {
    const a = -Math.PI / 2 + j * TAU / 10, q = j % 2 ? r * 0.45 : r;
    if (j) g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); else g.moveTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
  }
  g.closePath(); g.fill();
}

// Кубик з літерою: (x, y) — кут, s — сторона
function cube(g, x, y, s, face, ch) {
  const d = Math.max(1, Math.round(s * 0.07)), m = s * 0.15;
  g.fillStyle = WOOD_LO; g.fillRect(x, y, s, s);
  g.fillStyle = WOOD_HI; g.fillRect(x, y, s - d, s - d);
  g.fillStyle = WOOD; g.fillRect(x + d, y + d, s - 2 * d, s - 2 * d);
  g.fillStyle = face; rr(g, x + m, y + m, s - 2 * m, s - 2 * m, s * 0.07); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = Math.max(1, s * 0.02);
  rr(g, x + m + s * 0.035, y + m + s * 0.035, s - 2 * m - s * 0.07, s - 2 * m - s * 0.07, s * 0.05); g.stroke();
  g.font = `bold ${Math.max(5, Math.round(s * 0.4))}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillText(ch, x + s * 0.52, y + s * 0.55);
  g.fillStyle = '#f3e6c8'; g.fillText(ch, x + s / 2, y + s * 0.53);
}

// Ведмедик, що сидить: cx — центр, base — низ, k — масштаб (висота ~75k)
function teddy(g, cx, base, k) {
  const B = '#b0743f', L = '#dcae7c';
  for (const sx of [-1, 1]) ellipse(g, cx + sx * 15 * k, base - 7 * k, 9 * k, 7 * k, B);
  ellipse(g, cx, base - 24 * k, 19 * k, 21 * k, B);
  ellipse(g, cx, base - 21 * k, 11 * k, 13 * k, L);
  for (const sx of [-1, 1]) { ellipse(g, cx + sx * 18 * k, base - 27 * k, 6 * k, 11 * k, B, sx * -0.5); circle(g, cx + sx * 15 * k, base - 6 * k, 4 * k, L); }
  for (const sx of [-1, 1]) { circle(g, cx + sx * 13 * k, base - 66 * k, 7 * k, B); circle(g, cx + sx * 13 * k, base - 66 * k, 3.5 * k, L); }
  circle(g, cx, base - 52 * k, 17 * k, B);
  ellipse(g, cx, base - 46 * k, 8 * k, 6 * k, L);
  ellipse(g, cx, base - 48 * k, 3.5 * k, 2.5 * k, INK);
  for (const sx of [-1, 1]) circle(g, cx + sx * 7 * k, base - 56 * k, 2.2 * k, INK);
  poly(g, [[cx, base - 36 * k], [cx - 9 * k, base - 41 * k], [cx - 9 * k, base - 31 * k]], '#e53935');
  poly(g, [[cx, base - 36 * k], [cx + 9 * k, base - 41 * k], [cx + 9 * k, base - 31 * k]], '#e53935');
}
// Гумова качечка: cx — центр, base — низ, k — масштаб
function duck(g, cx, base, k) {
  ellipse(g, cx, base - 10 * k, 18 * k, 10 * k, '#ffd23f');
  poly(g, [[cx + 14 * k, base - 14 * k], [cx + 22 * k, base - 22 * k], [cx + 18 * k, base - 10 * k]], '#ffd23f');
  circle(g, cx - 6 * k, base - 24 * k, 10 * k, '#ffd23f');
  ellipse(g, cx - 17 * k, base - 22 * k, 6 * k, 3 * k, '#fb8c00');
  circle(g, cx - 8 * k, base - 27 * k, 1.8 * k, INK);
  ellipse(g, cx + 2 * k, base - 12 * k, 8 * k, 4 * k, '#f2b90f', -0.3);
}
// Полиця з кронштейнами
function shelf(g, x, y, w, k) {
  g.fillStyle = '#4a2d17';
  for (const fx of [0.18, 0.82]) poly(g, [[x + w * fx - 4 * k, y + 8 * k], [x + w * fx + 4 * k, y + 8 * k], [x + w * fx, y + 30 * k]], '#4a2d17');
  g.fillStyle = '#6b4426'; g.fillRect(x, y, w, 9 * k);
  g.fillStyle = '#8f5f37'; g.fillRect(x, y, w, 3.5 * k);
}
// Дитячий малюнок на скотчі: (x, y) — центр; лишає систему координат з центром аркуша (g.restore() — після вмісту)
function paper(g, x, y, w, h, rot, k) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-w / 2 + 3 * k, -h / 2 + 4 * k, w, h);
  g.fillStyle = '#fbf6e8'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(255,240,170,0.65)';
  g.fillRect(-w / 2 - 6 * k, -h / 2 - 4 * k, 22 * k, 9 * k); g.fillRect(w / 2 - 16 * k, -h / 2 - 4 * k, 22 * k, 9 * k);
  g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = Math.max(1, 3 * k);
}

function backdrop(g, W, H, dpr) {
  const u = H / 900, k = Math.min(u, W * 0.11 / 150);
  g.fillStyle = '#202a4e'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,0.025)';                           // смужки шпалер
  for (let x = 0; x < W; x += 64 * u) g.fillRect(x, 0, 32 * u, H);
  for (let r = 0, y = 40 * u; y < H * 0.9; r++, y += 110 * u) {      // зірочки й місяці
    for (let x = (r % 2) * 55 * u + 30 * u; x < W; x += 110 * u) {
      if ((r + Math.round(x / u)) % 3) star(g, x, y, 7 * u, 'rgba(255,225,140,0.16)');
      else { circle(g, x, y, 8 * u, 'rgba(255,225,140,0.16)'); circle(g, x + 4 * u, y - 3 * u, 7 * u, '#202a4e'); }
    }
  }
  const fy = H * 0.94;                                               // підлога й плінтус
  g.fillStyle = '#5b3a20'; g.fillRect(0, fy, W, H - fy);
  g.fillStyle = 'rgba(0,0,0,0.25)';
  for (let x = 0; x < W; x += 140 * u) g.fillRect(x, fy, Math.max(1, 2 * u), H - fy);
  g.fillStyle = '#e9dfc8'; g.fillRect(0, fy - 12 * u, W, 12 * u);
  g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(0, fy - 2 * u, W, 2 * u);

  // ліворуч: малюнок (будиночок і сонце), полиця з ведмедиком і кубиками, полиця з книжками й м'ячем, м'яч на підлозі
  const xl = W * 0.012, wl = 150 * k;
  paper(g, xl + 75 * k, H * 0.13, 120 * k, 92 * k, -0.06, k);
  g.strokeStyle = '#43a047'; g.beginPath(); g.moveTo(-55 * k, 32 * k); g.quadraticCurveTo(-20 * k, 26 * k, 10 * k, 33 * k); g.quadraticCurveTo(35 * k, 38 * k, 55 * k, 30 * k); g.stroke();
  g.strokeStyle = '#e53935'; g.strokeRect(-42 * k, -2 * k, 40 * k, 32 * k);
  g.beginPath(); g.moveTo(-48 * k, 0); g.lineTo(-22 * k, -24 * k); g.lineTo(4 * k, 0); g.stroke();
  g.strokeStyle = '#1e88e5'; g.strokeRect(-28 * k, 12 * k, 12 * k, 18 * k);
  circle(g, 30 * k, -18 * k, 12 * k, '#fdd835');
  g.strokeStyle = '#fdd835';
  for (let j = 0; j < 8; j++) { const a = j * TAU / 8; g.beginPath(); g.moveTo(30 * k + Math.cos(a) * 16 * k, -18 * k + Math.sin(a) * 16 * k); g.lineTo(30 * k + Math.cos(a) * 23 * k, -18 * k + Math.sin(a) * 23 * k); g.stroke(); }
  g.restore();
  const s1 = H * 0.38;
  shelf(g, xl, s1, wl, k);
  teddy(g, xl + 42 * k, s1, k * 1.05);
  cube(g, xl + 88 * k, s1 - 32 * k, 32 * k, FACE[1], 'А');
  cube(g, xl + 121 * k, s1 - 32 * k, 28 * k, FACE[0], 'Б');
  cube(g, xl + 102 * k, s1 - 62 * k, 30 * k, FACE[2], 'В');
  const s2 = H * 0.62;
  shelf(g, xl, s2, wl, k);
  [['#c0392b', 58], ['#2e6db4', 50], ['#d4a72c', 62], ['#2f8f4e', 46], ['#8e44ad', 55]].forEach(([c, h], j) => {
    const bx = xl + 10 * k + j * 15 * k;
    g.fillStyle = c; g.fillRect(bx, s2 - h * k, 13 * k, h * k);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(bx, s2 - h * k + 6 * k, 13 * k, 3 * k); g.fillRect(bx, s2 - 12 * k, 13 * k, 3 * k);
  });
  g.save(); g.translate(xl + 92 * k, s2 - 0.86 * 60 * k); block(g, 60 * k, 2); g.restore();
  g.save(); g.translate(xl + 20 * k, fy - 0.86 * 90 * k); block(g, 90 * k, 3); g.restore();

  // праворуч: малюнок (веселка), нічник-грибок, полиця з качечкою й пірамідкою, скриня з іграшками на підлозі
  const xr = W - W * 0.012 - 150 * k;
  paper(g, xr + 75 * k, H * 0.14, 118 * k, 86 * k, 0.05, k);
  g.lineWidth = Math.max(1, 5 * k);
  RAINBOW.forEach((c, j) => { g.strokeStyle = c; g.beginPath(); g.arc(0, 26 * k, (44 - j * 6) * k, Math.PI, TAU); g.stroke(); });
  g.lineWidth = Math.max(1, 3 * k); g.strokeStyle = '#64b5f6';
  for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 40 * k, 26 * k, 9 * k, Math.PI, TAU); g.arc(sx * 40 * k + 10 * k, 28 * k, 7 * k, Math.PI * 1.2, TAU + 0.3); g.stroke(); }
  g.restore();
  const s3 = H * 0.42, lx = xr + 45 * k, ly = s3 - 38 * k;
  const glow = g.createRadialGradient(lx, ly, 4 * k, lx, ly, 150 * k);
  glow.addColorStop(0, 'rgba(255,205,130,0.55)'); glow.addColorStop(1, 'rgba(255,205,130,0)');
  g.fillStyle = glow; g.fillRect(lx - 150 * k, ly - 150 * k, 300 * k, 300 * k);
  shelf(g, xr, s3, 150 * k, k);
  g.fillStyle = '#f3e3c6'; rr(g, lx - 9 * k, s3 - 34 * k, 18 * k, 34 * k, 6 * k); g.fill();
  g.fillStyle = '#ff7a5c';
  g.beginPath(); g.moveTo(lx - 34 * k, s3 - 30 * k); g.quadraticCurveTo(lx - 34 * k, s3 - 70 * k, lx, s3 - 70 * k); g.quadraticCurveTo(lx + 34 * k, s3 - 70 * k, lx + 34 * k, s3 - 30 * k); g.closePath(); g.fill();
  g.fillStyle = '#ffd9a0'; g.fillRect(lx - 34 * k, s3 - 33 * k, 68 * k, 4 * k);
  for (const [dx, dy, r] of [[-18, -48, 6], [4, -58, 5], [18, -42, 6], [-4, -40, 4]]) circle(g, lx + dx * k, s3 + dy * k, r * k, '#fff4e0');
  duck(g, xr + 115 * k, s3, k * 1.2);
  const s4 = H * 0.66;
  shelf(g, xr, s4, 150 * k, k);
  g.save(); g.translate(xr + 10 * k, s4 - 0.86 * 70 * k); block(g, 70 * k, 0); g.restore();
  g.save(); g.translate(xr + 78 * k, s4 - 0.86 * 66 * k); block(g, 66 * k, 3); g.restore();
  g.save(); g.translate(xr + 40 * k, fy - 0.86 * 100 * k); block(g, 100 * k, 1); g.restore();
}

// Килим: сірі дороги, вздовж кубиків — смужки трави, посередині коридорів — пунктир
function floor(g, px, py, s, x, y, map) {
  const i = y * map.GW + x, GW = map.GW, c = map.cell;
  g.fillStyle = (x + y) % 2 ? ROAD : ROAD2; g.fillRect(px, py, s, s);
  g.fillStyle = 'rgba(255,255,255,0.05)';                            // ворс
  for (let j = 0; j < 6; j++) g.fillRect(px + s * rnd(i, 10 + j), py + s * rnd(i, 20 + j), Math.max(1, s * 0.03), Math.max(1, s * 0.03));
  const up = c[i - GW] === PILLAR, dn = c[i + GW] === PILLAR, lf = c[i - 1] === PILLAR, rt = c[i + 1] === PILLAR, v = s * 0.14, e = Math.max(1, s * 0.02);
  g.fillStyle = GRASS;
  if (up) g.fillRect(px, py, s, v);
  if (dn) g.fillRect(px, py + s - v, s, v);
  if (lf) g.fillRect(px, py, v, s);
  if (rt) g.fillRect(px + s - v, py, v, s);
  const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]].filter(([dx, dy]) => c[i + dy * GW + dx] === PILLAR && !(dy < 0 ? up : dn) && !(dx < 0 ? lf : rt));
  for (const [dx, dy] of corners) g.fillRect(dx < 0 ? px : px + s - v, dy < 0 ? py : py + s - v, v, v);
  g.fillStyle = 'rgba(255,255,255,0.3)';                             // кромка трави
  const x0 = lf ? px + v : px, x1 = rt ? px + s - v : px + s, y0 = up ? py + v : py, y1 = dn ? py + s - v : py + s;
  if (up) g.fillRect(x0, py + v, x1 - x0, e);
  if (dn) g.fillRect(x0, py + s - v - e, x1 - x0, e);
  if (lf) g.fillRect(px + v, y0, e, y1 - y0);
  if (rt) g.fillRect(px + s - v - e, y0, e, y1 - y0);
  for (const [dx, dy] of corners) {
    const cx = dx < 0 ? px + v : px + s - v, cy = dy < 0 ? py + v : py + s - v;
    g.fillRect(Math.min(cx, cx - dx * v), dy < 0 ? cy : cy - e, v, e);
    g.fillRect(dx < 0 ? cx : cx - e, Math.min(cy, cy - dy * v), e, v);
  }
  g.fillStyle = 'rgba(255,248,220,0.7)';                             // розмітка
  const t = Math.max(1, Math.round(s * 0.045));
  if (up && dn && !lf && !rt) for (const fx of [0.1, 0.6]) g.fillRect(px + s * fx, py + s / 2 - t / 2, s * 0.3, t);
  else if (lf && rt && !up && !dn) for (const fy of [0.1, 0.6]) g.fillRect(px + s / 2 - t / 2, py + s * fy, t, s * 0.3);
  g.fillStyle = 'rgba(20,30,15,0.18)';                               // тінь від кубиків
  if (up) g.fillRect(px, py, s, s * 0.05);
  if (lf) g.fillRect(px, py, s * 0.04, s);
}

// Рамка — дерев'яний бортик (дошки, волокна, світла кромка до поля); стовп — дерев'яний кубик з літерою на всю клітинку
function stone(g, x, y, s, border, cx, cy, map) {
  const i = cy * map.GW + cx, d = Math.max(1, Math.round(s * 0.07));
  if (!border) { cube(g, x, y, s, FACE[Math.floor(rnd(i, 1) * FACE.length)], LETTERS[Math.floor(rnd(i, 2) * LETTERS.length)]); return; }
  const vert = cx === 0 || cx === map.GW - 1;
  g.fillStyle = FRAME; g.fillRect(x, y, s, s);
  g.strokeStyle = 'rgba(0,0,0,0.16)'; g.lineWidth = Math.max(1, s * 0.015);
  for (let j = 0; j < 4; j++) {
    const o = 0.1 + j * 0.22 + rnd(i, j) * 0.06, w = (rnd(i, j + 5) - 0.5) * 0.1;
    g.beginPath();
    if (vert) { g.moveTo(x + s * o, y); g.bezierCurveTo(x + s * (o + w), y + s * 0.3, x + s * (o - w), y + s * 0.7, x + s * o, y + s); }
    else { g.moveTo(x, y + s * o); g.bezierCurveTo(x + s * 0.3, y + s * (o + w), x + s * 0.7, y + s * (o - w), x + s, y + s * o); }
    g.stroke();
  }
  g.fillStyle = FRAME_LO;                                            // шов між дошками
  if (vert) g.fillRect(x + s / 2 - d / 2, y, d, s); else g.fillRect(x, y + s / 2 - d / 2, s, d);
  g.fillStyle = FRAME_HI;
  if (cy === 0) g.fillRect(x, y + s - d, s, d); else if (cy === map.GH - 1) g.fillRect(x, y, s, d);
  if (cx === 0) g.fillRect(x + s - d, y, d, s); else if (cx === map.GW - 1) g.fillRect(x, y, d, s);
  if (rnd(i, 7) < 0.35) for (const f of [0.25, 0.75]) circle(g, x + s * (vert ? 0.25 : f), y + s * (vert ? f : 0.25), s * 0.03, '#c9b48a');
}

// Блоки: 0 — пірамідка з кілець, 1 — скриня з іграшками, 2 — м'яч, 3 — барабан
function block(g, s, v) {
  ellipse(g, s / 2, s * 0.86, s * 0.34, s * 0.085, 'rgba(15,20,35,0.35)');
  if (v === 0) {
    g.fillStyle = '#c99a5e'; rr(g, s * 0.2, s * 0.74, s * 0.6, s * 0.09, s * 0.035); g.fill();
    line(g, s / 2, s * 0.14, s / 2, s * 0.76, s * 0.05, '#e0bc84');
    RAINBOW.forEach((c, j) => {
      const w = s * (0.58 - j * 0.08), h = s * 0.115, yy = s * (0.62 - j * 0.11);
      g.fillStyle = c; rr(g, s / 2 - w / 2, yy, w, h, h / 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.35)'; rr(g, s / 2 - w / 2 + h * 0.4, yy + h * 0.18, w * 0.35, h * 0.24, h * 0.12); g.fill();
    });
    circle(g, s / 2, s * 0.14, s * 0.075, '#e53935');
    circle(g, s * 0.475, s * 0.115, s * 0.022, 'rgba(255,255,255,0.6)');
    return;
  }
  if (v === 1) {
    circle(g, s * 0.34, s * 0.32, s * 0.13, '#e53935');                // м'ячик і качечка визирають
    g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, s * 0.03);
    g.beginPath(); g.arc(s * 0.34, s * 0.32, s * 0.13, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    duck(g, s * 0.64, s * 0.42, s * 0.009);
    g.fillStyle = '#2f7fd0'; rr(g, s * 0.12, s * 0.38, s * 0.76, s * 0.46, s * 0.05); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(s * 0.12, s * 0.42, s * 0.76, s * 0.08);
    g.fillStyle = '#ffd23f'; rr(g, s * 0.09, s * 0.35, s * 0.82, s * 0.08, s * 0.03); g.fill();
    g.fillStyle = '#ffd23f'; g.fillRect(s * 0.12, s * 0.78, s * 0.76, s * 0.05);
    star(g, s * 0.5, s * 0.6, s * 0.12, '#ffd23f');
    star(g, s * 0.25, s * 0.55, s * 0.05, '#fff');
    star(g, s * 0.75, s * 0.66, s * 0.05, '#fff');
    return;
  }
  if (v === 2) {
    const cx = s / 2, cy = s * 0.52, r = s * 0.31, px = cx - r * 0.3, py = cy - r * 0.38;
    circle(g, cx, cy, r, '#fafafa');
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.clip();
    ['#e53935', '#fdd835', '#1e88e5'].forEach((c, j) => {
      const a0 = j * TAU / 3 - 0.2;
      g.fillStyle = c; g.beginPath(); g.moveTo(px, py); g.arc(cx, cy, r * 1.1, a0, a0 + TAU / 6); g.closePath(); g.fill();
    });
    g.restore();
    circle(g, px, py, r * 0.14, '#fafafa');
    ellipse(g, cx - r * 0.45, cy - r * 0.1, r * 0.12, r * 0.28, 'rgba(255,255,255,0.45)', 0.4);
    g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = Math.max(1, s * 0.015);
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
    return;
  }
  const cx = s / 2;
  g.fillStyle = '#d32f2f'; g.fillRect(s * 0.2, s * 0.36, s * 0.6, s * 0.38);
  ellipse(g, cx, s * 0.74, s * 0.3, s * 0.08, '#d32f2f');
  g.fillStyle = GOLD; g.fillRect(s * 0.2, s * 0.69, s * 0.6, s * 0.05);
  ellipse(g, cx, s * 0.74, s * 0.3, s * 0.08, GOLD);
  g.fillStyle = '#d32f2f'; g.fillRect(s * 0.2, s * 0.66, s * 0.6, s * 0.04);
  g.strokeStyle = '#fff'; g.lineWidth = Math.max(1, s * 0.022); g.lineJoin = 'round';
  g.beginPath(); for (let j = 0; j <= 6; j++) { const xx = s * (0.2 + j * 0.1), yy = s * (j % 2 ? 0.64 : 0.42); if (j) g.lineTo(xx, yy); else g.moveTo(xx, yy); } g.stroke();
  ellipse(g, cx, s * 0.36, s * 0.3, s * 0.08, GOLD);
  ellipse(g, cx, s * 0.355, s * 0.26, s * 0.06, '#f5efe0');
  g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(s * 0.26, s * 0.42, s * 0.05, s * 0.26);
  line(g, s * 0.3, s * 0.16, s * 0.56, s * 0.34, s * 0.035, '#c99a5e');
  line(g, s * 0.72, s * 0.14, s * 0.48, s * 0.33, s * 0.035, '#c99a5e');
  circle(g, s * 0.3, s * 0.16, s * 0.04, '#fff'); circle(g, s * 0.72, s * 0.14, s * 0.04, '#fff');
}

// Стіна — стос книжок корінцями до нас
function wall(g, s) {
  g.fillStyle = '#2b2533'; g.fillRect(0, 0, s, s);
  [['#c0392b', 0.0], ['#2e6db4', 0.05], ['#2f8f4e', -0.04], ['#d4a72c', 0.03]].forEach(([c, off], j) => {
    const y = s * (0.01 + j * 0.25), h = s * 0.23, x = s * (0.02 + Math.max(0, off)), w = s * (0.96 - Math.abs(off));
    g.fillStyle = '#f2ead6'; g.fillRect(x + s * 0.02, y + h * 0.1, w - s * 0.04, h * 0.8);
    g.fillStyle = c; rr(g, x, y, w, h, s * 0.03); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x, y + h * 0.12, w, h * 0.14);
    g.fillStyle = GOLD; for (const f of [0.12, 0.84]) g.fillRect(x + w * f, y, s * 0.03, h);
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(x + w * 0.36, y + h * 0.36, w * 0.28, h * 0.28);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y + h - s * 0.015, w, s * 0.015);
  });
}

// Коробка з сюрпризом: (cx, cy) — центр, w — сторона, k — частка запалу: ручка крутиться швидше,
// з 0,62 кришка відкривається й визирає блазень на пружині
function jackBox(g, cx, cy, w, k, T, flash) {
  const top = cy - w * 0.42, q = Math.max(0, (k - 0.62) / 0.38);
  if (q > 0) {
    const hy = top + w * 0.2 - q * w * 0.62, sy = top + w * 0.3;
    g.strokeStyle = '#a8aeb8'; g.lineWidth = Math.max(1, w * 0.045); g.lineJoin = 'round';
    g.beginPath(); g.moveTo(cx, sy);
    for (let j = 1; j <= 5; j++) g.lineTo(cx + (j % 2 ? 1 : -1) * w * 0.1, sy + (hy - sy) * j / 5);
    g.stroke();
    poly(g, [[cx - w * 0.18, hy - w * 0.08], [cx - w * 0.3, hy - w * 0.34], [cx, hy - w * 0.14]], '#e53935');
    poly(g, [[cx, hy - w * 0.14], [cx + w * 0.3, hy - w * 0.34], [cx + w * 0.18, hy - w * 0.08]], '#ffd23f');
    circle(g, cx - w * 0.3, hy - w * 0.34, w * 0.05, '#ffd23f'); circle(g, cx + w * 0.3, hy - w * 0.34, w * 0.05, '#e53935');
    circle(g, cx, hy, w * 0.19, SKIN);
    for (const sx of [-1, 1]) circle(g, cx + sx * w * 0.07, hy - w * 0.03, w * 0.03, INK);
    circle(g, cx, hy + w * 0.03, w * 0.045, '#e53935');
    g.strokeStyle = INK; g.lineWidth = Math.max(1, w * 0.03);
    g.beginPath(); g.arc(cx, hy + w * 0.04, w * 0.1, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  }
  g.fillStyle = flash ? '#ff9a8a' : '#e53935'; rr(g, cx - w / 2, top, w, w * 0.92, w * 0.06); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(cx - w / 2 + w * 0.06, top + w * 0.06, w * 0.08, w * 0.76);
  poly(g, [[cx, top + w * 0.16], [cx + w * 0.26, top + w * 0.46], [cx, top + w * 0.76], [cx - w * 0.26, top + w * 0.46]], '#ffd23f');
  circle(g, cx, top + w * 0.46, w * 0.08, '#1e88e5');
  g.fillStyle = '#1e88e5'; g.fillRect(cx - w / 2, top + w * 0.84, w, w * 0.08);
  g.save(); g.translate(cx - w / 2, top); g.rotate(-q * 1.1);                // кришка
  g.fillStyle = '#1e88e5'; rr(g, -w * 0.04, -w * 0.1, w * 1.08, w * 0.13, w * 0.04); g.fill();
  g.restore();
  const a = T / (260 - 200 * k), ax = cx + w * 0.52, ay = top + w * 0.46;    // ручка збоку
  circle(g, ax, ay, w * 0.05, '#8a8f99');
  const kx = ax + w * 0.1, ky = ay + Math.sin(a) * w * 0.2;
  line(g, ax, ay, kx, ky, w * 0.05, '#8a8f99');
  circle(g, kx, ky, w * 0.065, '#ffd23f');
}
function bomb(g, x, y, s, k, T) {
  const sc = 1 + bombBeat(k, T) * 1.2, cx = x + s / 2 + Math.sin(T / 23) * s * 0.035 * k * k;
  ellipse(g, x + s / 2, y + s * 0.86, s * 0.27, s * 0.07, 'rgba(15,20,35,0.35)');
  jackBox(g, cx, y + s * 0.6, s * 0.5 * sc, k, T, bombFlash(k, T));
}

// Бонуси — на круглих наліпках
const ITEM_BG = { [IT_BOMB]: '#ffd0cc', [IT_FIRE]: '#fff0b0', [IT_SPEED]: '#c4ecff', [IT_PASS]: '#e0d2ff', [IT_RESIST]: '#ffe0c0', [IT_REMOTE]: '#d0f2c8' };
function item(g, k, s) {
  const cx = s / 2, cy = s / 2;
  ellipse(g, cx, s * 0.86, s * 0.3, s * 0.07, 'rgba(15,20,35,0.35)');
  circle(g, cx, cy, s * 0.41, '#fff');
  circle(g, cx, cy, s * 0.355, ITEM_BG[k]);
  if (k === IT_BOMB) jackBox(g, cx - s * 0.03, cy + s * 0.04, s * 0.38, 0, 0, false);
  else if (k === IT_FIRE) {                                          // хлопавка
    poly(g, [[cx - s * 0.2, cy + s * 0.2], [cx + s * 0.09, cy + s * 0.03], [cx - s * 0.03, cy - s * 0.09]], '#ffb300');
    line(g, cx - s * 0.12, cy + s * 0.06, cx - s * 0.06, cy + s * 0.13, s * 0.03, '#e53935', 'butt');
    line(g, cx - s * 0.06, cy - s * 0.01, cx + s * 0.03, cy + s * 0.09, s * 0.03, '#e53935', 'butt');
    g.lineWidth = Math.max(1, s * 0.025); g.lineCap = 'round';
    g.strokeStyle = '#ec407a'; g.beginPath(); g.moveTo(cx + s * 0.04, cy - s * 0.06); g.quadraticCurveTo(cx + s * 0.04, cy - s * 0.22, cx + s * 0.16, cy - s * 0.2); g.stroke();
    g.strokeStyle = '#1e88e5'; g.beginPath(); g.moveTo(cx + s * 0.06, cy - s * 0.02); g.quadraticCurveTo(cx + s * 0.2, cy - s * 0.04, cx + s * 0.22, cy - s * 0.14); g.stroke();
    for (const [dx, dy, c] of [[-0.02, -0.22, '#43a047'], [0.12, -0.27, '#e53935'], [0.24, -0.04, '#fdd835'], [0.26, -0.22, '#8e44ad'], [0.17, 0.06, '#1e88e5']]) {
      g.fillStyle = c; g.fillRect(cx + s * dx - s * 0.025, cy + s * dy - s * 0.02, s * 0.05, s * 0.04);
    }
  } else if (k === IT_SPEED) {                                       // самокат
    for (const fx of [-0.17, 0.16]) { circle(g, cx + s * fx, cy + s * 0.17, s * 0.065, INK); circle(g, cx + s * fx, cy + s * 0.17, s * 0.025, '#b8bec8'); }
    line(g, cx - s * 0.2, cy + s * 0.11, cx + s * 0.1, cy + s * 0.11, s * 0.055, '#e53935');
    line(g, cx + s * 0.14, cy + s * 0.15, cx + s * 0.07, cy - s * 0.21, s * 0.045, '#1e88e5');
    line(g, cx + s * 0.0, cy - s * 0.22, cx + s * 0.15, cy - s * 0.2, s * 0.045, '#1e88e5');
    for (const dy of [-0.08, 0.0, 0.08]) line(g, cx - s * 0.3, cy + s * dy, cx - s * 0.2, cy + s * dy, s * 0.025, 'rgba(30,40,60,0.45)');
  } else if (k === IT_PASS) {                                        // повітряний змій
    const T0 = [cx + s * 0.06, cy - s * 0.28], R0 = [cx + s * 0.22, cy - s * 0.06], B0 = [cx - s * 0.02, cy + s * 0.12], L0 = [cx - s * 0.16, cy - s * 0.12];
    const C = [cx + s * 0.03, cy - s * 0.1];
    poly(g, [T0, R0, C], '#e53935'); poly(g, [R0, B0, C], '#fdd835'); poly(g, [B0, L0, C], '#1e88e5'); poly(g, [L0, T0, C], '#43a047');
    g.strokeStyle = '#3a3a44'; g.lineWidth = Math.max(1, s * 0.018); g.lineCap = 'round';
    g.beginPath(); g.moveTo(B0[0], B0[1]); g.bezierCurveTo(cx - s * 0.1, cy + s * 0.22, cx - s * 0.02, cy + s * 0.26, cx - s * 0.18, cy + s * 0.3); g.stroke();
    for (const [bx, by, c] of [[-0.06, 0.21, '#ec407a'], [-0.12, 0.28, '#ffb300']]) {
      poly(g, [[cx + s * bx, cy + s * by], [cx + s * (bx - 0.05), cy + s * (by - 0.03)], [cx + s * (bx - 0.05), cy + s * (by + 0.03)]], c);
      poly(g, [[cx + s * bx, cy + s * by], [cx + s * (bx + 0.05), cy + s * (by - 0.03)], [cx + s * (bx + 0.05), cy + s * (by + 0.03)]], c);
    }
  } else if (k === IT_RESIST) teddy(g, cx, cy + s * 0.27, s * 0.0072);
  else if (k === IT_REMOTE) {                                        // пульт машинки
    line(g, cx + s * 0.1, cy - s * 0.04, cx + s * 0.17, cy - s * 0.29, s * 0.025, '#9aa0a8');
    circle(g, cx + s * 0.17, cy - s * 0.29, s * 0.035, '#e53935');
    g.fillStyle = '#ffc928'; rr(g, cx - s * 0.21, cy - s * 0.07, s * 0.42, s * 0.27, s * 0.07); g.fill();
    g.strokeStyle = '#c48a00'; g.lineWidth = Math.max(1, s * 0.02); g.stroke();
    for (const [dx, c] of [[-0.1, '#e53935'], [0.1, '#1e88e5']]) {
      circle(g, cx + s * dx, cy + s * 0.07, s * 0.06, '#3a3a44');
      line(g, cx + s * dx, cy + s * 0.07, cx + s * dx, cy - s * 0.01, s * 0.025, '#3a3a44');
      circle(g, cx + s * dx, cy - s * 0.02, s * 0.035, c);
    }
  }
}

// Олов'яний солдатик: ківер і мундир кольору гравця, перехрещені ремені, еполети, рукавички, рум'янець і вуса
function player(g, p, s, T, { col, walk, bob, dead }) {
  const dark = shade(col, -0.35), light = luma(col) > 0.75;
  const edge = light ? 'rgba(0,0,0,0.35)' : dark, belt = light ? GOLD : '#f6f2e6';
  for (const [sx, w] of [[-1, walk], [1, -walk]]) {
    line(g, sx * s * 0.08, s * 0.17, sx * s * 0.085, s * 0.33 + w * s * 0.05, s * 0.1, '#28324d', 'butt');
    g.fillStyle = INK; rr(g, sx * s * 0.085 - s * 0.06, s * 0.31 + w * s * 0.05, s * 0.12, s * 0.07, s * 0.025); g.fill();
  }
  const by = -s * 0.07 - bob;
  for (const sx of [-1, 1]) {
    line(g, sx * s * 0.17, by + s * 0.05, sx * s * 0.22, by + s * 0.19 - sx * walk * s * 0.04, s * 0.075, col);
    circle(g, sx * s * 0.22, by + s * 0.21 - sx * walk * s * 0.04, s * 0.042, '#fbfbf7');
  }
  g.fillStyle = col; rr(g, -s * 0.16, by, s * 0.32, s * 0.27, s * 0.06); g.fill();
  g.strokeStyle = edge; g.lineWidth = Math.max(1, s * 0.018); g.stroke();
  line(g, -s * 0.13, by + s * 0.02, s * 0.12, by + s * 0.19, s * 0.035, belt, 'butt');
  line(g, s * 0.13, by + s * 0.02, -s * 0.12, by + s * 0.19, s * 0.035, belt, 'butt');
  g.fillStyle = INK; g.fillRect(-s * 0.16, by + s * 0.19, s * 0.32, s * 0.045);
  if (p.dr !== 1) { g.fillStyle = GOLD; g.fillRect(-s * 0.03, by + s * 0.185, s * 0.06, s * 0.055); }
  for (const sx of [-1, 1]) ellipse(g, sx * s * 0.15, by + s * 0.015, s * 0.065, s * 0.032, GOLD);
  const hy = -s * 0.19 - bob;
  circle(g, 0, hy, s * 0.13, SKIN);
  if (p.dr === 1) ellipse(g, 0, hy + s * 0.03, s * 0.12, s * 0.08, '#6b4a2a');   // потилиця
  g.fillStyle = col;                                                 // ківер
  g.beginPath(); g.moveTo(-s * 0.115, hy - s * 0.05); g.lineTo(-s * 0.13, hy - s * 0.3); g.lineTo(s * 0.13, hy - s * 0.3); g.lineTo(s * 0.115, hy - s * 0.05); g.closePath(); g.fill();
  g.strokeStyle = edge; g.stroke();
  ellipse(g, 0, hy - s * 0.3, s * 0.13, s * 0.03, dark);
  g.fillStyle = INK; g.fillRect(-s * 0.12, hy - s * 0.09, s * 0.24, s * 0.04);
  ellipse(g, 0, hy - s * 0.35, s * 0.04, s * 0.065, light ? '#e53935' : '#fafafa');   // султан
  if (p.dr === 1) return;
  const fx = (DX[p.dr] || 0) * s * 0.05, fy = p.dr === 3 || !p.dr ? s * 0.015 : 0;
  star(g, fx, hy - s * 0.19, s * 0.05, GOLD);
  ellipse(g, fx, hy - s * 0.05, s * 0.1, s * 0.025, INK);            // козирок
  for (const sx of [-1, 1]) circle(g, fx + sx * s * 0.08, hy + s * 0.045 + fy, s * 0.028, 'rgba(240,90,90,0.55)');
  if (dead) {
    g.strokeStyle = INK; g.lineWidth = Math.max(1, s * 0.022);
    for (const ex of [-0.05, 0.05]) {
      const ox = ex * s + fx, oy = hy + fy, e = s * 0.022;
      g.beginPath(); g.moveTo(ox - e, oy - e); g.lineTo(ox + e, oy + e); g.moveTo(ox + e, oy - e); g.lineTo(ox - e, oy + e); g.stroke();
    }
  } else for (const ex of [-0.05, 0.05]) circle(g, ex * s + fx, hy + fy, s * 0.022, INK);
  line(g, fx - s * 0.045, hy + s * 0.07 + fy, fx + s * 0.045, hy + s * 0.07 + fy, s * 0.025, '#5a3418');   // вуса
}

// Монстри: 0 — заводна мишка з ключем (профілем за рухом, спереду / ззаду — по вертикалі), 1 — машинка на пульті
// (передом за рухом), 2 — повітряна кулька з обличчям на ниточці
const MOUSE = '#e8e2d6', MOUSE_D = '#9d9486', PINK = '#ffaec0', CAR = '#6cc23a', BAL = '#a66cf0';
function windKey(g, x, y, s, T, m) {
  const c = Math.cos(T / 110 + m.i), w = Math.abs(c);
  line(g, x, y + s * 0.08, x, y - s * 0.02, s * 0.03, '#b8902a');
  for (const sx of [-1, 1]) ellipse(g, x + sx * s * 0.055 * w, y - s * 0.05, s * 0.05 * w + s * 0.008, s * 0.045, GOLD);
}
function monster(g, m, s, T, wob) {
  if (m.k === 0) {
    const sx = DX[m.d] || 0;
    if (sx) {
      g.save(); g.scale(sx, 1);
      g.strokeStyle = PINK; g.lineWidth = Math.max(1, s * 0.025); g.lineCap = 'round';
      g.beginPath(); g.moveTo(-s * 0.24, s * 0.1); g.bezierCurveTo(-s * 0.42, s * 0.12, -s * 0.4, -s * 0.12, -s * 0.3, -s * 0.06); g.stroke();
      for (const fx of [-0.12, 0.13]) circle(g, s * fx, s * 0.2, s * 0.05, INK);
      windKey(g, -s * 0.05, -s * 0.21, s, T, m);
      g.fillStyle = MOUSE;
      g.beginPath(); g.moveTo(s * 0.34, s * 0.08); g.quadraticCurveTo(s * 0.12, -s * 0.24, -s * 0.2, -s * 0.08);
      g.quadraticCurveTo(-s * 0.32, s * 0.2, -s * 0.04, s * 0.2); g.lineTo(s * 0.2, s * 0.19); g.closePath(); g.fill();
      g.strokeStyle = MOUSE_D; g.lineWidth = Math.max(1, s * 0.018); g.stroke();
      circle(g, s * 0.07, -s * 0.13, s * 0.085, MOUSE); circle(g, s * 0.07, -s * 0.13, s * 0.05, PINK);
      circle(g, s * 0.19, -s * 0.0, s * 0.03, INK);
      circle(g, s * 0.34, s * 0.08, s * 0.035, PINK);
      g.strokeStyle = MOUSE_D; g.lineWidth = Math.max(1, s * 0.01);
      g.beginPath(); g.moveTo(s * 0.3, s * 0.06); g.lineTo(s * 0.4, s * 0.02); g.moveTo(s * 0.3, s * 0.09); g.lineTo(s * 0.41, s * 0.1); g.stroke();
      g.restore();
      return;
    }
    const back = m.d === 1;
    if (back) {
      g.strokeStyle = PINK; g.lineWidth = Math.max(1, s * 0.025); g.lineCap = 'round';
      g.beginPath(); g.moveTo(0, s * 0.22); g.bezierCurveTo(s * 0.02, s * 0.38, s * 0.2, s * 0.34, s * 0.16, s * 0.24); g.stroke();
    }
    for (const fx of [-0.13, 0.13]) circle(g, s * fx, s * 0.24, s * 0.05, INK);
    if (!back) windKey(g, 0, -s * 0.25, s, T, m);
    for (const ex of [-1, 1]) { circle(g, ex * s * 0.17, -s * 0.17, s * 0.1, MOUSE); if (!back) circle(g, ex * s * 0.17, -s * 0.17, s * 0.06, PINK); }
    ellipse(g, 0, s * 0.04, s * 0.24, s * 0.22, MOUSE);
    g.strokeStyle = MOUSE_D; g.lineWidth = Math.max(1, s * 0.018); g.beginPath(); g.ellipse(0, s * 0.04, s * 0.24, s * 0.22, 0, 0, TAU); g.stroke();
    if (back) { windKey(g, 0, -s * 0.12, s, T, m); return; }
    for (const ex of [-1, 1]) circle(g, ex * s * 0.08, -s * 0.0, s * 0.032, INK);
    circle(g, 0, s * 0.08, s * 0.04, PINK);
    g.strokeStyle = MOUSE_D; g.lineWidth = Math.max(1, s * 0.01);
    g.beginPath();
    for (const ex of [-1, 1]) { g.moveTo(ex * s * 0.05, s * 0.09); g.lineTo(ex * s * 0.2, s * 0.06); g.moveTo(ex * s * 0.05, s * 0.11); g.lineTo(ex * s * 0.2, s * 0.13); }
    g.stroke();
    return;
  }
  if (m.k === 1) {
    const a = m.d ? Math.atan2(DY[m.d], DX[m.d]) : 0;
    g.save(); g.rotate(a);
    for (const [wx, wy] of [[-0.19, -0.21], [0.19, -0.21], [-0.19, 0.21], [0.19, 0.21]]) { g.fillStyle = '#1b1b1f'; rr(g, s * wx - s * 0.085, s * wy - s * 0.05, s * 0.17, s * 0.1, s * 0.03); g.fill(); }
    const tw = Math.sin(T / 90 + m.i) * s * 0.04;
    line(g, -s * 0.24, s * 0.12, -s * 0.42, s * 0.2 + tw, s * 0.02, '#3a3a44');
    circle(g, -s * 0.42, s * 0.2 + tw, s * 0.035, '#e53935');
    g.fillStyle = CAR; rr(g, -s * 0.34, -s * 0.19, s * 0.68, s * 0.38, s * 0.12); g.fill();
    g.strokeStyle = '#3f8a1e'; g.lineWidth = Math.max(1, s * 0.018); g.stroke();
    g.fillStyle = '#ffd23f'; g.fillRect(-s * 0.32, -s * 0.035, s * 0.3, s * 0.07);
    g.fillStyle = '#26324a'; rr(g, -s * 0.02, -s * 0.15, s * 0.2, s * 0.3, s * 0.06); g.fill();
    for (const sy of [-1, 1]) {
      ellipse(g, s * 0.09, sy * s * 0.065, s * 0.055, s * 0.05, '#fff');
      circle(g, s * 0.115, sy * s * 0.065, s * 0.025, INK);
      line(g, s * 0.03, sy * s * 0.12, s * 0.14, sy * s * 0.03, s * 0.025, INK);
    }
    for (const sy of [-1, 1]) circle(g, s * 0.31, sy * s * 0.12, s * 0.035, '#fff6b0');
    g.restore();
    return;
  }
  const by = -s * 0.14 + wob * s * 0.03, sway = Math.sin(T / 260 + m.i) * s * 0.05;
  g.strokeStyle = '#4a4a55'; g.lineWidth = Math.max(1, s * 0.015);
  g.beginPath(); g.moveTo(0, by + s * 0.29); g.quadraticCurveTo(sway * 2, by + s * 0.42, sway, s * 0.44); g.stroke();
  poly(g, [[-s * 0.035, by + s * 0.31], [s * 0.035, by + s * 0.31], [0, by + s * 0.25]], '#7a46c0');
  ellipse(g, 0, by, s * 0.25, s * 0.29, BAL);
  ellipse(g, -s * 0.1, by - s * 0.13, s * 0.05, s * 0.09, 'rgba(255,255,255,0.55)', 0.5);
  const ex = (DX[m.d] || 0) * s * 0.05, ey = (DY[m.d] || 0) * s * 0.035;
  for (const sx of [-1, 1]) {
    ellipse(g, sx * s * 0.075 + ex, by - s * 0.03 + ey, s * 0.035, s * 0.05, INK);
    circle(g, sx * s * 0.075 + ex - s * 0.012, by - s * 0.05 + ey, s * 0.012, '#fff');
    line(g, sx * s * 0.04 + ex, by - s * 0.1 + ey, sx * s * 0.12 + ex, by - s * 0.12 + ey, s * 0.02, INK);
  }
  g.strokeStyle = INK; g.lineWidth = Math.max(1, s * 0.025); g.lineCap = 'round';
  g.beginPath(); g.arc(ex, by + s * 0.03 + ey, s * 0.1, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
}

export default {
  name: 'Іграшкова кімната',
  bg: '#202a4e',
  backdrop,
  shadow: 'rgba(5,8,25,0.6)',
  emoji: { bomb: '🎁', fire: '🎉', speed: '🛴', pass: '🪁', resist: '🧸', remote: '🎮' },
  fire: ['#ff3d8b', '#ffd23f', '#ffffff'],
  burn: ['#ff5aa0', 'rgba(255,230,90,0)'],
  blocks: 4,
  floor, stone, block, wall, item, bomb, player, monster,
};
