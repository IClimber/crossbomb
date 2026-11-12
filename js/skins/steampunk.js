// steampunk.js — «Стімпанк»: підлога — клепані сталеві плити, стовпи — чавунні колони з манометрами чи вентилями (на всю
// клітинку), рамка — темний клепаний метал з мідними трубами; блоки — предмети з тінню: ящики з шестернею, мідні котли,
// бочки з вугіллям; стіни — паровий прес. Гравці — винахідники в циліндрах з гоглами на стрічці й сюртуках кольору гравця,
// з моноклем; заводний жук із ключем, паровий автоматон, клуб диму. Бомби — латунні кулі з клапаном, що пускає пару;
// вогонь — пара з іскрами. Тло — мідне небо, заводські димарі й дирижаблі. Бонуси: 💣 бомба, 🔥 вогонь, 🚂 швидкість,
// 💨 прохід, 🥽 стійкість (гогли), 📻 детонатор.
import { DX, DY, IT_BOMB, IT_FIRE, IT_SPEED, IT_PASS, IT_RESIST, IT_REMOTE } from '../sim.js';
import { TAU, rr, rnd, luma, shade, circle, ellipse, line, poly, bevel, bombBeat, bombFlash, pillarShade, flameShape, remoteIcon } from './common.js';

const STEEL = '#8f8e88', STEEL2 = '#898881', RIVET = '#b9b6ac', IRON = '#46403a', IRON_HI = '#5a534b', IRON_LO = '#2b2622';
const BRASS = '#d4a043', BRASS_HI = '#f4d27a', BRASS_LO = '#8a5f1e', COPPER = '#c8703a', COPPER_HI = '#eba06a', COPPER_LO = '#7a3e1a';
const WOOD = '#c4823e', WOOD_D = '#7d4a1c', HAT = '#2a221d', SKIN = '#efc19a';

// Шестерня: n зубців, hole — радіус отвору (0 — без нього)
function gear(g, cx, cy, r, n, color, hole = 0) {
  g.fillStyle = color;
  g.beginPath();
  for (let j = 0; j < n * 4; j++) {
    const a = (j - 0.5) * TAU / (n * 4), q = j % 4 < 2 ? r : r * 0.78;
    const x = cx + Math.cos(a) * q, y = cy + Math.sin(a) * q;
    j ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath();
  if (hole) { g.moveTo(cx + hole, cy); g.arc(cx, cy, hole, 0, TAU); }
  g.fill('evenodd');
}
function rivet(g, x, y, r) {
  circle(g, x + r * 0.35, y + r * 0.35, r, 'rgba(0,0,0,0.35)');
  circle(g, x, y, r, RIVET);
  circle(g, x - r * 0.3, y - r * 0.3, r * 0.4, 'rgba(255,255,255,0.6)');
}

// ---------- Тло: мідне небо, шестерні, заводи з димарями, дирижаблі ----------
// Дирижабль: (x, y) — центр балона, r — півдовжини, dir — куди летить (±1)
function airship(g, x, y, r, dir) {
  g.save(); g.translate(x, y); g.scale(dir, 1);
  line(g, -r * 0.35, r * 0.3, -r * 0.25, r * 0.55, r * 0.025, '#3a2414');
  line(g, r * 0.35, r * 0.3, r * 0.25, r * 0.55, r * 0.025, '#3a2414');
  rr(g, -r * 0.32, r * 0.5, r * 0.64, r * 0.2, r * 0.05); g.fillStyle = '#6b4320'; g.fill();
  for (let j = 0; j < 4; j++) circle(g, -r * 0.2 + j * r * 0.13, r * 0.6, r * 0.04, '#ffd27a');
  poly(g, [[-r * 0.85, 0], [-r * 1.12, -r * 0.4], [-r * 1.05, 0], [-r * 1.12, r * 0.4]], '#6b3a22');
  ellipse(g, 0, 0, r, r * 0.38, '#9a5a32');
  g.strokeStyle = 'rgba(40,18,6,0.45)'; g.lineWidth = Math.max(1, r * 0.02);
  for (const k of [-0.6, -0.2, 0.2, 0.6]) { g.beginPath(); g.ellipse(r * k, 0, r * 0.08, r * 0.37 * Math.sqrt(1 - k * k), 0, 0, TAU); g.stroke(); }
  ellipse(g, r * 0.1, -r * 0.18, r * 0.6, r * 0.08, 'rgba(255,210,150,0.3)');
  line(g, -r * 0.36, r * 0.6, -r * 0.48, r * 0.6, r * 0.03, '#3a2414');            // пропелер
  ellipse(g, -r * 0.5, r * 0.6, r * 0.025, r * 0.13, '#c9a04a');
  g.restore();
}
function chimney(g, x, base, w, h, u, k) {
  g.fillStyle = '#26160e'; g.fillRect(x - w / 2, base - h, w, h);
  g.fillStyle = '#3a2216'; g.fillRect(x - w * 0.65, base - h, w * 1.3, w * 0.35);
  g.fillRect(x - w * 0.55, base - h * 0.55, w * 1.1, w * 0.2);
  for (let j = 0; j < 6; j++) {                                      // дим
    const t = j / 5;
    circle(g, x + t * 60 * u + Math.sin(j * 1.7 + k) * 6 * u, base - h - w * 0.4 - t * 150 * u, (10 + t * 26) * u, `rgba(70,55,48,${0.55 - t * 0.38})`);
  }
}
function backdrop(g, W, H, dpr) {
  const u = H / 900;
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1d110b'); sky.addColorStop(0.45, '#56301a'); sky.addColorStop(0.8, '#b4652e'); sky.addColorStop(1, '#d8904a');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const sun = g.createRadialGradient(W * 0.5, H * 0.8, 0, W * 0.5, H * 0.8, H * 0.45);
  sun.addColorStop(0, 'rgba(255,214,140,0.45)'); sun.addColorStop(1, 'rgba(255,214,140,0)');
  g.fillStyle = sun; g.fillRect(0, 0, W, H);
  gear(g, W * 0.035, H * 0.6, 150 * u, 12, 'rgba(30,14,6,0.32)', 50 * u);
  gear(g, W * 0.1, H * 0.46, 70 * u, 9, 'rgba(30,14,6,0.26)', 22 * u);
  gear(g, W * 0.975, H * 0.12, 120 * u, 11, 'rgba(30,14,6,0.3)', 40 * u);
  gear(g, W * 0.93, H * 0.24, 55 * u, 8, 'rgba(30,14,6,0.24)', 18 * u);
  airship(g, W * 0.065, H * 0.2, 80 * u, 1);
  airship(g, W * 0.93, H * 0.42, 66 * u, -1);
  airship(g, W * 0.9, H * 0.07, 30 * u, -1);
  // заводи: низькі цехи з пилчастими дахами по всій ширині, високі димарі — з боків
  const base = H * 0.9;
  for (const [fx, h, w] of [[0.02, 330, 34], [0.075, 260, 28], [0.12, 200, 22], [0.885, 220, 24], [0.94, 340, 34], [0.985, 270, 26]]) chimney(g, W * fx, base, w * u, h * u, u, fx * 9);
  g.fillStyle = '#1f120b';
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W + 60 * u; x += 60 * u) { g.lineTo(x, base - 40 * u); g.lineTo(x + 40 * u, base - 80 * u); g.lineTo(x + 40 * u, base - 40 * u); }
  g.lineTo(W, H); g.closePath(); g.fill();
  g.fillStyle = '#ffc860';
  for (let j = 0; j < 90; j++) if (rnd(j, 4) < 0.45) g.fillRect(rnd(j, 5) * W, base - (10 + rnd(j, 6) * 25) * u, 6 * u, 8 * u);
  g.fillStyle = '#140b07'; g.fillRect(0, base, W, H - base);
}

// ---------- Підлога: сталеві плити з заклепками ----------
function floor(g, px, py, s, x, y, map) {
  const i = y * map.GW + x, e = Math.max(1, s * 0.035);
  g.fillStyle = (x + y) % 2 ? STEEL : STEEL2; g.fillRect(px, py, s, s);
  g.fillStyle = 'rgba(255,255,255,0.13)'; g.fillRect(px, py, s, e); g.fillRect(px, py, e, s);
  g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(px, py + s - e, s, e); g.fillRect(px + s - e, py, e, s);
  g.strokeStyle = 'rgba(60,55,50,0.18)'; g.lineWidth = Math.max(1, s * 0.012);   // подряпини
  g.beginPath();
  for (let j = 0; j < 3; j++) {
    const sx = px + s * (0.2 + rnd(i, 30 + j) * 0.6), sy = py + s * (0.2 + rnd(i, 40 + j) * 0.6);
    g.moveTo(sx, sy); g.lineTo(sx + s * (rnd(i, 50 + j) - 0.5) * 0.3, sy + s * (rnd(i, 60 + j) - 0.5) * 0.12);
  }
  g.stroke();
  const r = rnd(i, 5);
  if (r < 0.08) ellipse(g, px + s * 0.6, py + s * 0.6, s * 0.17, s * 0.1, 'rgba(40,30,22,0.22)', rnd(i, 6) * 3);   // мастило
  else if (r < 0.15) {                                                // ґрати
    g.fillStyle = 'rgba(40,36,32,0.55)'; rr(g, px + s * 0.3, py + s * 0.32, s * 0.4, s * 0.36, s * 0.04); g.fill();
    g.fillStyle = 'rgba(160,156,148,0.6)';
    for (let j = 0; j < 4; j++) g.fillRect(px + s * 0.33, py + s * (0.36 + j * 0.08), s * 0.34, Math.max(1, s * 0.03));
  }
  for (const [fx, fy] of [[0.13, 0.13], [0.87, 0.13], [0.13, 0.87], [0.87, 0.87]]) rivet(g, px + s * fx, py + s * fy, s * 0.03);
  pillarShade(g, map, x, y, px, py, s, 'rgba(30,20,10,0.22)');
}

// ---------- Рамка — темний метал з мідною трубою; стовп — чавунна колона з манометром чи вентилем ----------
function pipe(g, x, y, w, h, horiz, s) {
  g.fillStyle = COPPER_LO; g.fillRect(x, y, w, h);
  g.fillStyle = COPPER;
  if (horiz) g.fillRect(x, y + h * 0.12, w, h * 0.6); else g.fillRect(x + w * 0.12, y, w * 0.6, h);
  g.fillStyle = 'rgba(255,220,180,0.45)';
  if (horiz) g.fillRect(x, y + h * 0.22, w, Math.max(1, h * 0.12)); else g.fillRect(x + w * 0.22, y, Math.max(1, w * 0.12), h);
}
function stone(g, x, y, s, border, cx, cy, map) {
  const i = cy * map.GW + cx, d = Math.max(1, Math.round(s * 0.07));
  if (border) {
    bevel(g, x, y, s, '#2f2a26', '#3e3833', '#1b1815', d);
    const horiz = cy === 0 || cy === map.GH - 1, vert = cx === 0 || cx === map.GW - 1, t = s * 0.3, c = s / 2;
    if (horiz && vert) {                                            // кут — коліно
      pipe(g, cx === 0 ? x + c : x, y + c - t / 2, c, t, true, s);
      pipe(g, x + c - t / 2, cy === 0 ? y + c : y, t, c, false, s);
      circle(g, x + c, y + c, t * 0.62, COPPER_LO); circle(g, x + c, y + c, t * 0.5, COPPER);
    } else if (horiz) pipe(g, x, y + c - t / 2, s, t, true, s);
    else pipe(g, x + c - t / 2, y, t, s, false, s);
    if (!(horiz && vert) && rnd(i, 3) < 0.3) {                      // фланець
      g.fillStyle = BRASS_LO;
      if (horiz) g.fillRect(x + s * 0.42, y + c - t * 0.7, s * 0.16, t * 1.4); else g.fillRect(x + c - t * 0.7, y + s * 0.42, t * 1.4, s * 0.16);
      g.fillStyle = BRASS; if (horiz) g.fillRect(x + s * 0.45, y + c - t * 0.7, s * 0.05, t * 1.4); else g.fillRect(x + c - t * 0.7, y + s * 0.45, t * 1.4, s * 0.05);
    }
    for (const [fx, fy] of [[0.12, 0.12], [0.88, 0.12], [0.12, 0.88], [0.88, 0.88]]) rivet(g, x + s * fx, y + s * fy, s * 0.03);
    return;
  }
  bevel(g, x, y, s, IRON, IRON_HI, IRON_LO, d);
  g.fillStyle = 'rgba(0,0,0,0.22)';                                  // жолобки колони
  for (const fx of [0.24, 0.42, 0.58, 0.76]) g.fillRect(x + s * fx, y + s * 0.2, Math.max(1, s * 0.035), s * 0.6);
  g.fillStyle = '#38322d'; g.fillRect(x + d, y + d, s - 2 * d, s * 0.12); g.fillRect(x + d, y + s * 0.8, s - 2 * d, s * 0.12);
  for (const fx of [0.2, 0.4, 0.6, 0.8]) { rivet(g, x + s * fx, y + s * 0.15, s * 0.022); rivet(g, x + s * fx, y + s * 0.85, s * 0.022); }
  const gx = x + s * 0.5, gy = y + s * 0.5;
  if (rnd(i, 7) < 0.3) {                                             // вентиль
    circle(g, gx, gy, s * 0.07, '#5a1a12');
    g.strokeStyle = '#a8301e'; g.lineWidth = Math.max(1, s * 0.045);
    g.beginPath(); g.arc(gx, gy, s * 0.2, 0, TAU); g.stroke();
    for (let j = 0; j < 4; j++) { const a = j * Math.PI / 2 + 0.4; line(g, gx, gy, gx + Math.cos(a) * s * 0.2, gy + Math.sin(a) * s * 0.2, s * 0.035, '#a8301e'); }
    circle(g, gx, gy, s * 0.05, '#d4503a');
    return;
  }
  circle(g, gx, gy, s * 0.22, BRASS_LO);                             // манометр
  circle(g, gx, gy, s * 0.19, BRASS);
  circle(g, gx, gy, s * 0.15, '#efe6cc');
  g.strokeStyle = '#c0392b'; g.lineWidth = Math.max(1, s * 0.03);
  g.beginPath(); g.arc(gx, gy, s * 0.12, -0.3, 0.5); g.stroke();
  g.strokeStyle = '#3a3026'; g.lineWidth = Math.max(1, s * 0.015);
  g.beginPath();
  for (let j = 0; j < 7; j++) { const a = Math.PI * 0.75 + j * Math.PI * 1.5 / 6; g.moveTo(gx + Math.cos(a) * s * 0.1, gy + Math.sin(a) * s * 0.1); g.lineTo(gx + Math.cos(a) * s * 0.135, gy + Math.sin(a) * s * 0.135); }
  g.stroke();
  const a = Math.PI * 0.8 + rnd(i, 8) * Math.PI * 1.3;
  line(g, gx, gy, gx + Math.cos(a) * s * 0.12, gy + Math.sin(a) * s * 0.12, s * 0.025, '#1a1410');
  circle(g, gx, gy, s * 0.025, '#1a1410');
}

// ---------- Блоки: 0 — ящик з шестернею, 1 — мідний котел, 2 — бочка з вугіллям ----------
function block(g, s, v) {
  ellipse(g, s / 2, s * 0.88, s * 0.36, s * 0.09, 'rgba(30,20,10,0.35)');
  if (v === 0) {
    g.fillStyle = WOOD; g.fillRect(s * 0.13, s * 0.17, s * 0.74, s * 0.7);
    g.fillStyle = 'rgba(0,0,0,0.16)';
    for (let j = 1; j < 4; j++) g.fillRect(s * 0.13, s * (0.17 + j * 0.175), s * 0.74, Math.max(1, s * 0.015));
    g.fillStyle = 'rgba(255,230,180,0.25)'; g.fillRect(s * 0.13, s * 0.17, s * 0.74, s * 0.04);
    gear(g, s * 0.5, s * 0.52, s * 0.2, 8, '#7d4a1c', s * 0.07);
    g.fillStyle = BRASS;                                             // латунні кутики
    for (const [fx, fy] of [[0.13, 0.17], [0.77, 0.17], [0.13, 0.77], [0.77, 0.77]]) g.fillRect(s * fx, s * fy, s * 0.1, s * 0.1);
    for (const [fx, fy] of [[0.18, 0.22], [0.82, 0.22], [0.18, 0.82], [0.82, 0.82]]) circle(g, s * fx, s * fy, s * 0.018, BRASS_LO);
    return;
  }
  if (v === 1) {
    line(g, s * 0.62, s * 0.2, s * 0.62, s * 0.08, s * 0.07, BRASS_LO, 'butt');      // клапан
    ellipse(g, s * 0.62, s * 0.08, s * 0.08, s * 0.03, '#b8301e');
    g.fillStyle = COPPER; rr(g, s * 0.2, s * 0.24, s * 0.6, s * 0.62, s * 0.08); g.fill();
    ellipse(g, s * 0.5, s * 0.25, s * 0.3, s * 0.1, COPPER_HI);
    g.fillStyle = 'rgba(255,220,180,0.35)'; g.fillRect(s * 0.28, s * 0.3, s * 0.06, s * 0.5);
    g.fillStyle = 'rgba(80,30,10,0.25)'; g.fillRect(s * 0.66, s * 0.3, s * 0.1, s * 0.52);
    g.fillStyle = COPPER_LO;
    for (const fy of [0.42, 0.7]) g.fillRect(s * 0.2, s * fy, s * 0.6, s * 0.04);
    for (const fy of [0.44, 0.72]) for (let j = 0; j < 5; j++) circle(g, s * (0.27 + j * 0.115), s * fy, s * 0.015, COPPER_HI);
    circle(g, s * 0.5, s * 0.56, s * 0.08, BRASS); circle(g, s * 0.5, s * 0.56, s * 0.055, '#efe6cc');
    line(g, s * 0.5, s * 0.56, s * 0.54, s * 0.52, s * 0.015, '#1a1410');
    return;
  }
  g.fillStyle = '#a6602c';
  g.beginPath(); g.moveTo(s * 0.22, s * 0.24); g.quadraticCurveTo(s * 0.13, s * 0.55, s * 0.22, s * 0.86); g.lineTo(s * 0.78, s * 0.86);
  g.quadraticCurveTo(s * 0.87, s * 0.55, s * 0.78, s * 0.24); g.closePath(); g.fill();
  g.strokeStyle = '#6e3a16'; g.lineWidth = Math.max(1, s * 0.02);
  for (const fx of [0.36, 0.5, 0.64]) { g.beginPath(); g.moveTo(s * fx, s * 0.26); g.quadraticCurveTo(s * (fx + (fx - 0.5) * 0.3), s * 0.55, s * fx, s * 0.86); g.stroke(); }
  g.fillStyle = BRASS; for (const fy of [0.34, 0.74]) g.fillRect(s * 0.17, s * fy, s * 0.66, s * 0.06);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(s * 0.27, s * 0.3, s * 0.05, s * 0.5);
  ellipse(g, s * 0.5, s * 0.24, s * 0.29, s * 0.07, '#5a3010');
  for (const [fx, fy, r] of [[0.36, 0.2, 0.08], [0.5, 0.16, 0.09], [0.64, 0.2, 0.08], [0.43, 0.24, 0.06], [0.58, 0.24, 0.06]]) {
    circle(g, s * fx, s * fy, s * r, '#1e1c1a'); circle(g, s * (fx - r * 0.3), s * (fy - r * 0.3), s * r * 0.35, '#4a4744');
  }
}

// ---------- Стіна — паровий прес: важка плита з заклепками, поршні, смуги-попередження ----------
function wall(g, s) {
  g.fillStyle = '#1f1b18'; g.fillRect(0, 0, s, s);
  g.fillStyle = BRASS_LO; for (const fx of [0.22, 0.7]) g.fillRect(s * fx, 0, s * 0.08, s * 0.14);
  g.fillStyle = '#504840'; g.fillRect(s * 0.03, s * 0.08, s * 0.94, s * 0.6);
  g.fillStyle = '#655c52'; g.fillRect(s * 0.03, s * 0.08, s * 0.94, s * 0.07);
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(s * 0.03, s * 0.62, s * 0.94, s * 0.06);
  for (const fx of [0.12, 0.37, 0.63, 0.88]) for (const fy of [0.24, 0.5]) rivet(g, s * fx, s * fy, s * 0.04);
  g.save();
  g.beginPath(); g.rect(s * 0.03, s * 0.72, s * 0.94, s * 0.24); g.clip();
  g.fillStyle = '#e8b030'; g.fillRect(0, s * 0.72, s, s * 0.24);
  g.fillStyle = '#1f1b18';
  for (let j = -1; j < 6; j++) { const x0 = j * s * 0.22; poly(g, [[x0, s * 0.96], [x0 + s * 0.11, s * 0.96], [x0 + s * 0.35, s * 0.72], [x0 + s * 0.24, s * 0.72]], '#1f1b18'); }
  g.restore();
}

// ---------- Бонуси — на латунній шестерні ----------
const ITEM_BG = { [IT_BOMB]: '#f3d9b0', [IT_FIRE]: '#f6c8a8', [IT_SPEED]: '#d6e4ea', [IT_PASS]: '#a9c4d2', [IT_RESIST]: '#d4ecd8', [IT_REMOTE]: '#e8dcf2' };
function item(g, k, s) {
  const cx = s / 2, cy = s / 2;
  ellipse(g, cx, s * 0.86, s * 0.3, s * 0.07, 'rgba(30,20,10,0.35)');
  gear(g, cx, cy, s * 0.42, 10, BRASS_LO);
  gear(g, cx - s * 0.01, cy - s * 0.01, s * 0.4, 10, BRASS);
  circle(g, cx, cy, s * 0.29, BRASS_LO);
  circle(g, cx, cy, s * 0.26, ITEM_BG[k]);
  if (k === IT_BOMB) brassBall(g, cx, cy + s * 0.04, s * 0.13, false);
  else if (k === IT_FIRE) { flameShape(g, cx, cy + s * 0.02, s * 0.18, '#e8481c'); flameShape(g, cx, cy + s * 0.07, s * 0.1, '#ffc23d'); }
  else if (k === IT_SPEED) {                                         // паровоз
    const y0 = cy + s * 0.06;
    g.fillStyle = '#2a2622'; g.fillRect(cx - s * 0.15, y0 - s * 0.08, s * 0.2, s * 0.1);
    g.fillStyle = '#b8301e'; g.fillRect(cx + s * 0.03, y0 - s * 0.15, s * 0.1, s * 0.17);
    g.fillStyle = '#efe6cc'; g.fillRect(cx + s * 0.055, y0 - s * 0.12, s * 0.05, s * 0.05);
    g.fillStyle = '#2a2622'; g.fillRect(cx - s * 0.12, y0 - s * 0.16, s * 0.05, s * 0.08);
    poly(g, [[cx - s * 0.15, y0 - s * 0.02], [cx - s * 0.21, y0 + s * 0.06], [cx - s * 0.15, y0 + s * 0.06]], BRASS_LO);
    for (const fx of [-0.09, -0.01, 0.08]) { circle(g, cx + s * fx, y0 + s * 0.05, s * 0.04, '#b8301e'); circle(g, cx + s * fx, y0 + s * 0.05, s * 0.015, '#2a2622'); }
    for (const [fx, fy, r] of [[-0.12, -0.21, 0.035], [-0.05, -0.23, 0.045]]) circle(g, cx + s * fx, y0 + s * fy, s * r, '#b4b0a8');
  } else if (k === IT_PASS) steamPuffs(g, cx, cy, s, '#6e7c86', '#ffffff');
  else if (k === IT_RESIST) {                                        // гогли
    line(g, cx - s * 0.25, cy, cx + s * 0.25, cy, s * 0.05, '#5a3a1f');
    for (const sx of [-1, 1]) {
      circle(g, cx + sx * s * 0.1, cy, s * 0.085, BRASS_LO);
      circle(g, cx + sx * s * 0.1, cy, s * 0.065, '#3fb0c8');
      circle(g, cx + sx * s * 0.1 - s * 0.02, cy - s * 0.02, s * 0.02, 'rgba(255,255,255,0.8)');
    }
    line(g, cx - s * 0.03, cy, cx + s * 0.03, cy, s * 0.03, BRASS_LO);
  } else if (k === IT_REMOTE) remoteIcon(g, cx, cy + s * 0.02, s * 0.9, '#5a3a1f', '#e53935', '#ffd23f');
}
function steamPuffs(g, cx, cy, s, dark, light) {
  g.fillStyle = dark;
  g.beginPath();
  for (const [dx, dy, r] of [[-0.1, 0.03, 0.09], [0.02, -0.03, 0.11], [0.12, 0.04, 0.08], [0.0, 0.07, 0.08]]) { g.moveTo(cx + s * (dx + r), cy + s * dy); g.arc(cx + s * dx, cy + s * dy, s * r, 0, TAU); }
  g.fill();
  g.fillStyle = light;
  g.beginPath();
  for (const [dx, dy, r] of [[-0.11, 0.01, 0.07], [0.01, -0.05, 0.09], [0.11, 0.02, 0.06]]) { g.moveTo(cx + s * (dx + r), cy + s * dy); g.arc(cx + s * dx, cy + s * dy, s * r, 0, TAU); }
  g.fill();
  for (const dy of [-0.03, 0.06]) line(g, cx - s * 0.24, cy + s * dy, cx - s * 0.18, cy + s * dy, s * 0.025, dark);
}

// ---------- Бомба — латунна куля з поясом заклепок і клапаном, що пускає пару ----------
function brassBall(g, cx, cy, r, red) {
  g.fillStyle = BRASS_LO; g.fillRect(cx - r * 0.16, cy - r * 1.28, r * 0.32, r * 0.4);
  ellipse(g, cx, cy - r * 1.3, r * 0.42, r * 0.12, '#b8301e');
  const grd = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.08, cx, cy, r);
  grd.addColorStop(0, red ? '#ffc0a0' : BRASS_HI); grd.addColorStop(0.55, red ? '#e0502a' : '#c08a2e'); grd.addColorStop(1, red ? '#6a1608' : '#5a3a10');
  g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  g.fillStyle = 'rgba(60,30,0,0.4)'; g.fillRect(cx - r * 0.97, cy - r * 0.1, r * 1.94, r * 0.2);
  for (const k of [-0.7, -0.35, 0, 0.35, 0.7]) circle(g, cx + r * k, cy, r * 0.07, red ? '#ffd0b0' : BRASS_HI);
}
function bomb(g, x, y, s, k, T) {
  const r = s * (0.26 + bombBeat(k, T)), cx = x + s / 2, cy = y + s * 0.58;
  ellipse(g, cx, y + s * 0.88, s * 0.28, s * 0.07, 'rgba(30,20,10,0.35)');
  brassBall(g, cx, cy, r, bombFlash(k, T));
  const vy = cy - r * 1.4, per = 520 - 380 * k;                      // пара з клапана — частіше до вибуху
  for (let j = 0; j < 3; j++) {
    const ph = ((T / per) + j / 3) % 1;
    circle(g, cx + Math.sin(ph * 5 + j) * s * 0.04 + ph * s * 0.08, vy - ph * s * 0.28, s * (0.035 + ph * 0.06), `rgba(245,242,235,${0.85 * (1 - ph)})`);
  }
}

// ---------- Винахідник: циліндр з гоглами на стрічці кольору гравця, сюртук кольору гравця, монокль і вуса ----------
function player(g, p, s, T, { col, walk, bob, dead }) {
  const dark = shade(col, -0.35), edge = luma(col) > 0.8 ? 'rgba(0,0,0,0.35)' : luma(col) < 0.3 ? shade(col, 0.35) : dark;
  for (const [sx, w] of [[-1, walk], [1, -walk]]) {
    line(g, sx * s * 0.08, s * 0.2, sx * s * 0.09, s * 0.33 + w * s * 0.05, s * 0.09, '#3a302a');
    g.fillStyle = '#4a2a14'; rr(g, sx * s * 0.09 - s * 0.065, s * 0.32 + w * s * 0.05, s * 0.13, s * 0.08, s * 0.03); g.fill();
  }
  g.fillStyle = col;                                                 // сюртук з полами
  g.beginPath(); g.moveTo(-s * 0.15, -s * 0.06 - bob); g.lineTo(s * 0.15, -s * 0.06 - bob); g.lineTo(s * 0.21, s * 0.27 - bob); g.lineTo(-s * 0.21, s * 0.27 - bob); g.closePath(); g.fill();
  g.strokeStyle = edge; g.lineWidth = Math.max(1, s * 0.02); g.stroke();
  if (p.dr === 1) line(g, 0, s * 0.12 - bob, 0, s * 0.27 - bob, s * 0.018, edge);
  else {
    poly(g, [[-s * 0.075, -s * 0.06 - bob], [s * 0.075, -s * 0.06 - bob], [0, s * 0.12 - bob]], '#efe6d2');
    poly(g, [[-s * 0.05, -s * 0.05 - bob], [s * 0.05, -s * 0.05 - bob], [0, s * 0.0 - bob]], '#8a1f1a');   // краватка-метелик
    line(g, -s * 0.075, -s * 0.06 - bob, 0, s * 0.12 - bob, s * 0.02, edge);
    line(g, s * 0.075, -s * 0.06 - bob, 0, s * 0.12 - bob, s * 0.02, edge);
    for (const fy of [0.15, 0.22]) { circle(g, -s * 0.05, fy * s - bob, s * 0.02, BRASS); circle(g, s * 0.05, fy * s - bob, s * 0.02, BRASS); }
  }
  for (const sx of [-1, 1]) {
    line(g, sx * s * 0.17, -s * 0.01 - bob, sx * s * 0.25, s * 0.13 - bob - sx * walk * s * 0.04, s * 0.08, col);
    circle(g, sx * s * 0.25, s * 0.15 - bob - sx * walk * s * 0.04, s * 0.045, '#6b4020');
  }
  const hy = -s * 0.17 - bob, fx = (DX[p.dr] || 0) * s * 0.05, fy = p.dr === 3 || !p.dr ? s * 0.015 : 0;
  circle(g, 0, hy, s * 0.14, SKIN);
  if (p.dr === 1) ellipse(g, 0, hy + s * 0.02, s * 0.13, s * 0.1, '#6b4020');   // волосся ззаду
  ellipse(g, 0, hy - s * 0.09, s * 0.21, s * 0.05, HAT);              // циліндр
  g.fillStyle = HAT; rr(g, -s * 0.12, hy - s * 0.34, s * 0.24, s * 0.26, s * 0.02); g.fill();
  ellipse(g, 0, hy - s * 0.34, s * 0.12, s * 0.025, '#40362e');
  g.fillStyle = col; g.fillRect(-s * 0.12, hy - s * 0.16, s * 0.24, s * 0.05);
  if (luma(col) < 0.3) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(-s * 0.12, hy - s * 0.16, s * 0.24, Math.max(1, s * 0.012)); }
  if (p.dr === 1) return;
  for (const sx of [-1, 1]) {                                        // гогли на циліндрі
    const gx = sx * s * 0.055 + fx * 0.6, gy = hy - s * 0.215;
    circle(g, gx, gy, s * 0.048, BRASS_LO); circle(g, gx, gy, s * 0.035, '#5fc8d8');
    circle(g, gx - s * 0.012, gy - s * 0.012, s * 0.011, 'rgba(255,255,255,0.85)');
  }
  const ey = hy + fy - s * 0.01;
  if (dead) {
    g.strokeStyle = '#2a1a10'; g.lineWidth = Math.max(1, s * 0.022);
    for (const ex of [-0.055, 0.055]) {
      const ox = ex * s + fx, e = s * 0.024;
      g.beginPath(); g.moveTo(ox - e, ey - e); g.lineTo(ox + e, ey + e); g.moveTo(ox + e, ey - e); g.lineTo(ox - e, ey + e); g.stroke();
    }
  } else for (const ex of [-0.055, 0.055]) circle(g, ex * s + fx, ey, s * 0.022, '#2a1a10');
  g.strokeStyle = BRASS; g.lineWidth = Math.max(1, s * 0.015);         // монокль з ланцюжком
  g.beginPath(); g.arc(s * 0.055 + fx, ey, s * 0.042, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(s * 0.09 + fx, ey + s * 0.02); g.quadraticCurveTo(s * 0.13 + fx, s * 0.0 - bob, s * 0.1, s * 0.06 - bob); g.stroke();
  g.fillStyle = '#5a3418';                                           // вуса
  g.beginPath();
  g.ellipse(fx - s * 0.04, hy + s * 0.06 + fy, s * 0.045, s * 0.018, 0.25, 0, TAU);
  g.ellipse(fx + s * 0.04, hy + s * 0.06 + fy, s * 0.045, s * 0.018, -0.25, 0, TAU);
  g.fill();
}

// ---------- Монстри: 0 — заводний жук з ключем, 1 — паровий автоматон, 2 — клуб диму ----------
function monster(g, m, s, T, wob) {
  const ex = (DX[m.d] || 0) * s * 0.05, ey = (DY[m.d] || 0) * s * 0.025;
  if (m.k === 0) {
    g.strokeStyle = '#2e2218'; g.lineWidth = Math.max(1, s * 0.035); g.lineCap = 'round';
    g.beginPath();
    for (let j = 0; j < 3; j++) for (const sx of [-1, 1]) {
      const y0 = -s * 0.06 + j * s * 0.11, sw = Math.sin(T / 80 + j * 2 + (sx > 0 ? Math.PI : 0) + m.i) * s * 0.04;
      g.moveTo(sx * s * 0.18, y0); g.lineTo(sx * s * 0.32, y0 + sw + s * 0.03);
    }
    g.stroke();
    const kw = Math.cos(T / 140 + m.i) * s * 0.11;                   // ключ на спині обертається
    line(g, 0, -s * 0.16, 0, -s * 0.3, s * 0.045, BRASS_LO);
    ellipse(g, -kw * 0.55, -s * 0.34, Math.abs(kw) * 0.5 + 1, s * 0.065, BRASS);
    ellipse(g, kw * 0.55, -s * 0.34, Math.abs(kw) * 0.5 + 1, s * 0.065, BRASS_HI);
    ellipse(g, 0, s * 0.02, s * 0.27, s * 0.24, COPPER);
    ellipse(g, -s * 0.08, -s * 0.08, s * 0.1, s * 0.06, 'rgba(255,220,180,0.45)', -0.4);
    line(g, 0, -s * 0.2, 0, s * 0.16, s * 0.02, COPPER_LO);
    for (let j = 0; j < 6; j++) { const a = Math.PI * 1.15 + j * 0.25; circle(g, Math.cos(a) * s * 0.21, s * 0.02 + Math.sin(a) * s * 0.18, s * 0.017, COPPER_HI); circle(g, -Math.cos(a) * s * 0.21, s * 0.02 + Math.sin(a) * s * 0.18, s * 0.017, COPPER_HI); }
    ellipse(g, ex * 0.6, s * 0.2 + ey, s * 0.15, s * 0.08, '#4a2e18');
    for (const sx of [-1, 1]) { circle(g, sx * s * 0.065 + ex, s * 0.19 + ey, s * 0.04, '#ffd23f'); circle(g, sx * s * 0.065 + ex * 1.3, s * 0.19 + ey, s * 0.018, '#1a1008'); }
    return;
  }
  if (m.k === 1) {
    const st = Math.sin(T / 100 + m.i);
    for (const sx of [-1, 1]) { g.fillStyle = '#3a3633'; g.fillRect(sx * s * 0.11 - s * 0.05, s * 0.18 + sx * st * s * 0.025, s * 0.1, s * 0.18); }
    for (const sx of [-1, 1]) {                                      // руки-кліщі
      line(g, sx * s * 0.2, -s * 0.02, sx * s * 0.3, s * 0.12 + sx * st * s * 0.03, s * 0.06, '#5a5652');
      circle(g, sx * s * 0.3, s * 0.14 + sx * st * s * 0.03, s * 0.05, BRASS);
    }
    g.fillStyle = '#6e6a64'; rr(g, -s * 0.2, -s * 0.08, s * 0.4, s * 0.32, s * 0.05); g.fill();
    g.fillStyle = '#86817a'; g.fillRect(-s * 0.2, -s * 0.06, s * 0.4, s * 0.04);
    for (const [fx, fy] of [[-0.16, -0.04], [0.16, -0.04], [-0.16, 0.2], [0.16, 0.2]]) circle(g, s * fx, s * fy, s * 0.018, '#b9b6ac');
    const glow = 0.7 + 0.3 * Math.sin(T / 120 + m.i * 2);           // топка
    g.fillStyle = '#2a1a10'; g.fillRect(-s * 0.09, s * 0.03, s * 0.18, s * 0.12);
    g.fillStyle = `rgba(255,${Math.round(110 + 60 * glow)},40,${glow})`; g.fillRect(-s * 0.075, s * 0.045, s * 0.15, s * 0.09);
    g.fillStyle = '#2a1a10'; for (const fx of [-0.03, 0.03]) g.fillRect(s * fx - s * 0.008, s * 0.03, s * 0.016, s * 0.12);
    const ph = (T / 400 + m.i * 0.3) % 1;                             // пара з труби
    circle(g, -s * 0.1 - ph * s * 0.06, -s * 0.44 - ph * s * 0.16, s * (0.04 + ph * 0.05), `rgba(235,232,225,${0.8 * (1 - ph)})`);
    g.fillStyle = '#3a3633'; g.fillRect(-s * 0.14, -s * 0.44, s * 0.08, s * 0.12);
    g.fillStyle = '#5a5652'; rr(g, -s * 0.15, -s * 0.34, s * 0.3, s * 0.25, s * 0.06); g.fill();
    g.fillStyle = BRASS; g.fillRect(-s * 0.15, -s * 0.12, s * 0.3, s * 0.03);
    g.fillStyle = '#1a1210'; rr(g, -s * 0.11 + ex, -s * 0.27 + ey, s * 0.22, s * 0.07, s * 0.03); g.fill();
    for (const sx of [-1, 1]) circle(g, sx * s * 0.055 + ex * 1.2, -s * 0.235 + ey, s * 0.025, '#ff4a2a');
    return;
  }
  const t = T / 300 + m.i;                                           // клуб диму: один контур — однакова прозорість
  g.fillStyle = '#3e3733';
  g.beginPath();
  for (const [dx, dy, r, k] of [[0, -0.12, 0.2, 0], [-0.15, 0, 0.15, 1], [0.15, 0, 0.15, 2], [-0.08, 0.12, 0.14, 3], [0.09, 0.12, 0.14, 4], [-0.12, -0.2, 0.1, 5], [0.13, -0.18, 0.11, 6]]) {
    const x = s * dx + Math.sin(t + k) * s * 0.02, y = s * dy + Math.cos(t * 1.3 + k) * s * 0.015;
    g.moveTo(x + s * r, y); g.arc(x, y, s * r, 0, TAU);
  }
  for (let j = 0; j < 3; j++) {                                      // пасма знизу
    const x = (j - 1) * s * 0.12, sw = Math.sin(t * 2 + j) * s * 0.05 + wob * s * 0.02;
    g.moveTo(x - s * 0.06, s * 0.2); g.quadraticCurveTo(x + sw, s * 0.32, x + sw * 1.5, s * 0.4); g.quadraticCurveTo(x + s * 0.02, s * 0.3, x + s * 0.06, s * 0.2);
  }
  g.fill();
  g.fillStyle = '#6a605a';
  g.beginPath();
  for (const [dx, dy, r] of [[-0.05, -0.18, 0.1], [0.08, -0.22, 0.07], [-0.17, -0.04, 0.07]]) { g.moveTo(s * (dx + r), s * dy); g.arc(s * dx, s * dy, s * r, 0, TAU); }
  g.fill();
  for (const sx of [-1, 1]) { ellipse(g, sx * s * 0.08 + ex, -s * 0.04 + ey, s * 0.05, s * 0.065, '#ffc04a'); circle(g, sx * s * 0.08 + ex * 1.3, -s * 0.03 + ey, s * 0.022, '#c23a10'); }
  ellipse(g, ex, s * 0.1 + ey, s * 0.07, s * 0.03 + Math.abs(wob) * s * 0.015, '#ff8a2a');
  ellipse(g, ex, s * 0.1 + ey, s * 0.05, s * 0.015 + Math.abs(wob) * s * 0.01, '#1a1410');
}

export default {
  name: 'Стімпанк',
  bg: '#1d110b',
  backdrop,
  shadow: 'rgba(20,8,0,0.6)',
  emoji: { bomb: '💣', fire: '🔥', speed: '🚂', pass: '💨', resist: '🥽', remote: '📻' },
  fire: ['#e05a22', '#ffb36a', '#fffaf0'],
  burn: ['#ff7a20', 'rgba(255,230,180,0)'],
  blocks: 3,
  floor, stone, block, wall, item, bomb, player, monster,
};
