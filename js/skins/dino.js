// dino.js — «Доба динозаврів»: земля з мохом, папороттю й слідами, стовпи — сіро-зелений базальт із мохом (на всю клітинку),
// рамка — темніший кам'яний вал; блоки — предмети з тінню: кущі папороті, теплі валуни, купи кісток; стіни — кам'яний обвал.
// Гравці — печерні люди в шкурах кольору гравця, з кийками; малий трицератопс, раптор, птеродактиль (летить над блоками).
// Бомби — плямисті яйця, що тріскаються. Тло — вулкани на заході сонця, хвощі, довгошия на обрії.
// Бонуси (на кам'яних табличках): 🥚 бомба, 🔥 вогонь (смолоскип), 🦖 швидкість, 🦕 прохід, 🛡️ стійкість (щит зі шкури),
// 🥁 детонатор (барабан).
import { DX, DY, IT_BOMB, IT_FIRE, IT_SPEED, IT_PASS, IT_RESIST, IT_REMOTE } from '../sim.js';
import { TAU, rr, rnd, luma, shade, circle, ellipse, line, poly, bombBeat, bombFlash, pillarShade, flameShape } from './common.js';

const SOIL = '#8e7a52', SOIL2 = '#88754e';
const ROCK = '#4f5a53', ROCK_HI = '#66726a', ROCK_LO = '#353d38';
const FERN = '#4fae34', FERN_HI = '#86d957', FERN_LO = '#2f7a24';
const BONE = '#efe6cf', BONE_D = '#bfb08a', SKIN = '#d9a476', HAIR = '#3a2414', WOOD = '#8a5a30';

// Лист папороті вздовж осі x (довжина len, піврозмах w) з зубчиками
function frond(g, x, y, a, len, w, col, rib) {
  g.save(); g.translate(x, y); g.rotate(a);
  const n = 8, pts = [];
  for (let j = 0; j <= n; j++) { const t = j / n; pts.push([len * t, -w * Math.sin(Math.PI * t) * (j % 2 ? 1 : 0.55)]); }
  for (let j = n; j >= 0; j--) { const t = j / n; pts.push([len * t, w * Math.sin(Math.PI * t) * (j % 2 ? 1 : 0.55)]); }
  poly(g, pts, col);
  if (rib) line(g, 0, 0, len * 0.92, 0, Math.max(1, w * 0.18), rib);
  g.restore();
}

// Силуети для тла й бонусів: тиранозавр (біжить праворуч) і довгошия (дивиться ліворуч); (x, y) — під тулубом, r — розмір
function trex(g, x, y, r, col) {
  poly(g, [[x - r * 0.3, y - r * 0.55], [x - r * 1.15, y - r * 0.2], [x - r * 0.25, y - r * 0.25]], col);   // хвіст
  ellipse(g, x, y - r * 0.45, r * 0.45, r * 0.27, col, -0.3);
  poly(g, [[x + r * 0.15, y - r * 0.6], [x + r * 0.35, y - r * 0.95], [x + r * 0.55, y - r * 0.85], [x + r * 0.4, y - r * 0.45]], col);
  rr(g, x + r * 0.3, y - r * 1.12, r * 0.55, r * 0.3, r * 0.1); g.fillStyle = col; g.fill();
  line(g, x - r * 0.1, y - r * 0.3, x - r * 0.35, y, r * 0.15, col);
  line(g, x + r * 0.12, y - r * 0.3, x + r * 0.32, y - r * 0.02, r * 0.15, col);
  line(g, x + r * 0.35, y - r * 0.55, x + r * 0.48, y - r * 0.45, r * 0.06, col);
}
function sauropod(g, x, y, r, col) {
  g.fillStyle = col;
  for (const dx of [-0.42, -0.2, 0.2, 0.42]) { rr(g, x + dx * r - r * 0.08, y - r * 0.4, r * 0.16, r * 0.4, r * 0.05); g.fill(); }
  ellipse(g, x, y - r * 0.48, r * 0.6, r * 0.3, col);
  poly(g, [[x + r * 0.45, y - r * 0.6], [x + r * 1.3, y - r * 0.2], [x + r * 0.5, y - r * 0.32]], col);
  g.strokeStyle = col; g.lineWidth = r * 0.17; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - r * 0.4, y - r * 0.55); g.quadraticCurveTo(x - r * 0.85, y - r * 0.85, x - r * 0.8, y - r * 1.45); g.stroke();
  ellipse(g, x - r * 0.88, y - r * 1.5, r * 0.17, r * 0.1, col);
}

// Тло — вулкани на заході сонця: дим, лава, хвощі й папороть з боків, довгоший силует на обрії, птерозаври
function volcano(g, x, y, w, h) {
  g.fillStyle = '#3b2a26';
  g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w * 0.09, y - h); g.lineTo(x + w * 0.09, y - h); g.lineTo(x + w / 2, y); g.closePath(); g.fill();
  g.strokeStyle = '#e8541c'; g.lineWidth = Math.max(1, w * 0.02); g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - w * 0.04, y - h); g.quadraticCurveTo(x - w * 0.1, y - h * 0.6, x - w * 0.17, y - h * 0.32); g.stroke();
  g.beginPath(); g.moveTo(x + w * 0.05, y - h); g.quadraticCurveTo(x + w * 0.08, y - h * 0.72, x + w * 0.15, y - h * 0.5); g.stroke();
  const grd = g.createRadialGradient(x, y - h, 0, x, y - h, w * 0.3);
  grd.addColorStop(0, 'rgba(255,150,50,0.75)'); grd.addColorStop(1, 'rgba(255,150,50,0)');
  g.fillStyle = grd; g.fillRect(x - w * 0.3, y - h - w * 0.3, w * 0.6, w * 0.6);
  for (let j = 0; j < 7; j++) circle(g, x + j * j * w * 0.012, y - h - w * 0.06 - j * w * 0.09, w * (0.06 + j * 0.025), `rgba(55,45,48,${0.6 - j * 0.07})`);
}
function horsetail(g, x, y, h, u, col) {
  const seg = h / 7;
  line(g, x, y, x, y - h, 4 * u, col, 'butt');
  g.strokeStyle = col; g.lineWidth = Math.max(1, 1.4 * u); g.lineCap = 'round';
  g.beginPath();
  for (let j = 1; j < 7; j++) {
    const yy = y - j * seg, l = 16 * u * (1 - j / 9);
    for (const sx of [-1, 1]) for (const k of [0.4, 0.8]) { g.moveTo(x, yy); g.lineTo(x + sx * l * k, yy - l * 0.7 * k); }
  }
  g.stroke();
  ellipse(g, x, y - h - 6 * u, 3.5 * u, 8 * u, col);
}
function backdrop(g, W, H, dpr) {
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#1d3640'); grd.addColorStop(0.5, '#a9603a'); grd.addColorStop(0.72, '#efa452'); grd.addColorStop(0.73, '#2a2a22');
  grd.addColorStop(1, '#141a12');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  const u = H / 900;
  circle(g, W * 0.5, H * 0.68, 120 * u, 'rgba(255,214,120,0.35)');
  circle(g, W * 0.5, H * 0.68, 70 * u, 'rgba(255,226,150,0.6)');
  g.fillStyle = '#4a3a32';                                           // дальні пагорби
  g.beginPath(); g.moveTo(0, H * 0.73);
  for (let j = 0; j <= 12; j++) g.lineTo(W * j / 12, H * (0.66 + 0.04 * Math.sin(j * 1.7)));
  g.lineTo(W, H * 0.73); g.closePath(); g.fill();
  volcano(g, W * 0.05, H * 0.74, 360 * u, 300 * u);
  volcano(g, W * 0.95, H * 0.74, 300 * u, 240 * u);
  sauropod(g, W * 0.9, H * 0.735, 46 * u, '#2a2420');
  sauropod(g, W * 0.12, H * 0.735, 30 * u, '#33281f');
  for (const [fx, fy, k] of [[0.06, 0.16, 1], [0.1, 0.22, 0.7], [0.92, 0.12, 0.9]]) {   // птерозаври
    const x = W * fx, y = H * fy, r = 26 * u * k;
    g.fillStyle = '#2a1f22';
    g.beginPath(); g.moveTo(x - r * 1.6, y - r * 0.2); g.quadraticCurveTo(x - r * 0.6, y - r * 0.5, x, y);
    g.quadraticCurveTo(x + r * 0.6, y - r * 0.5, x + r * 1.6, y - r * 0.2); g.quadraticCurveTo(x + r * 0.6, y + r * 0.1, x, y + r * 0.25);
    g.quadraticCurveTo(x - r * 0.6, y + r * 0.1, x - r * 1.6, y - r * 0.2); g.fill();
    poly(g, [[x, y - r * 0.05], [x + r * 0.55, y + r * 0.05], [x, y + r * 0.12]], '#2a1f22');
  }
  for (const [fx, h, c] of [[0.015, 300, '#1f3a1c'], [0.045, 380, '#26461f'], [0.08, 250, '#1f3a1c'], [0.925, 280, '#1f3a1c'], [0.96, 360, '#26461f'], [0.99, 240, '#1f3a1c']])
    horsetail(g, W * fx, H, h * u, u, c);
  for (const [fx, sx] of [[0.03, 1], [0.97, -1]]) for (let j = 0; j < 6; j++)
    frond(g, W * fx, H, -Math.PI / 2 + sx * (0.2 + j * 0.22), 150 * u, 22 * u, j % 2 ? '#2f5a26' : '#24481f');
}

function footprint(g, cx, cy, s, a, col) {
  g.save(); g.translate(cx, cy); g.rotate(a);
  ellipse(g, 0, s * 0.05, s * 0.05, s * 0.045, col);
  for (const t of [-0.55, 0, 0.55]) line(g, 0, s * 0.02, Math.sin(t) * s * 0.11, s * 0.02 - Math.cos(t) * s * 0.11, s * 0.035, col);
  g.restore();
}
function floor(g, px, py, s, x, y, map) {
  const i = y * map.GW + x;
  g.fillStyle = (x + y) % 2 ? SOIL : SOIL2; g.fillRect(px, py, s, s);
  for (let j = 0; j < 3; j++)                                         // мох
    if (rnd(i, 30 + j) < 0.45) ellipse(g, px + s * (0.15 + rnd(i, 10 + j) * 0.7), py + s * (0.15 + rnd(i, 20 + j) * 0.7), s * (0.08 + rnd(i, 40 + j) * 0.08), s * (0.05 + rnd(i, 50 + j) * 0.04), 'rgba(96,130,52,0.38)');
  for (let j = 0; j < 4; j++) circle(g, px + s * rnd(i, 60 + j), py + s * rnd(i, 70 + j), Math.max(0.7, s * 0.018), 'rgba(60,45,25,0.35)');
  const r = rnd(i, 5);
  if (r < 0.1) footprint(g, px + s * 0.5, py + s * 0.5, s, rnd(i, 6) * TAU, 'rgba(70,52,30,0.4)');
  else if (r < 0.2) frond(g, px + s * 0.2, py + s * 0.85, -0.9, s * 0.3, s * 0.06, 'rgba(70,120,40,0.75)', null);
  else if (r < 0.23) {                                                // амоніт
    g.strokeStyle = 'rgba(70,52,30,0.45)'; g.lineWidth = Math.max(1, s * 0.02);
    g.beginPath();
    for (let a = 0; a < 12; a += 0.3) { const rr2 = s * 0.008 * a; const X = px + s * 0.68 + Math.cos(a) * rr2, Y = py + s * 0.66 + Math.sin(a) * rr2; a ? g.lineTo(X, Y) : g.moveTo(X, Y); }
    g.stroke();
  }
  pillarShade(g, map, x, y, px, py, s, 'rgba(30,25,10,0.25)');
}

// Рамка — темний кам'яний вал; стовп — сіро-зелений базальт (шестикутна верхівка стовпа) з мохом на всю клітинку
function stone(g, x, y, s, border, cx, cy, map) {
  const i = cy * map.GW + cx, d = Math.max(1, Math.round(s * 0.08));
  const [base, hi, lo] = border ? ['#363d38', '#454d47', '#222724'] : [ROCK, ROCK_HI, ROCK_LO];
  g.fillStyle = lo; g.fillRect(x, y, s, s);
  g.fillStyle = hi; g.fillRect(x, y, s - d, s - d);
  g.fillStyle = base; g.fillRect(x + d, y + d, s - 2 * d, s - 2 * d);
  g.save(); g.beginPath(); g.rect(x, y, s, s); g.clip();
  const hx = x + s * (0.5 + (rnd(i, 1) - 0.5) * 0.1), hy = y + s * (0.52 + (rnd(i, 2) - 0.5) * 0.1), R = s * 0.27;
  const pts = Array.from({ length: 6 }, (_, j) => [hx + Math.cos(j * TAU / 6 + 0.3) * R, hy + Math.sin(j * TAU / 6 + 0.3) * R]);
  poly(g, pts, border ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)');
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = Math.max(1, s * 0.025);
  g.beginPath();
  pts.forEach(([px, py], j) => (j ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath();
  for (const j of [0, 2, 4]) { const [px, py] = pts[j]; g.moveTo(px, py); g.lineTo(hx + (px - hx) * 2.2, hy + (py - hy) * 2.2); }
  g.stroke();
  g.restore();
  if (border) {
    if (rnd(i, 3) < 0.3) for (let j = 0; j < 3; j++) circle(g, x + s * (0.2 + j * 0.28), y + d + s * 0.02, s * (0.06 + rnd(i, 4 + j) * 0.04), 'rgba(80,120,50,0.6)');
    return;
  }
  for (let j = 0; j < 4; j++) circle(g, x + s * (0.15 + j * 0.23), y + d + s * 0.03, s * (0.05 + rnd(i, 10 + j) * 0.05), '#5f8a3a');   // мох згори
  for (let j = 0; j < 2; j++) circle(g, x + s * (0.2 + j * 0.5), y + d + s * 0.06, s * 0.035, '#7aa84a');
}

// Блоки: 0 — кущ папороті, 1 — теплий валун, 2 — купа кісток
function bone(g, x1, y1, x2, y2, w, col, edge) {
  for (const [c, k] of [[edge, 1.25], [col, 1]]) {
    line(g, x1, y1, x2, y2, w * k, c);
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * w * 0.55, ny = Math.cos(a) * w * 0.55;
    for (const [x, y] of [[x1, y1], [x2, y2]]) { circle(g, x + nx, y + ny, w * 0.62 * k, c); circle(g, x - nx, y - ny, w * 0.62 * k, c); }
  }
}
function block(g, s, v) {
  ellipse(g, s / 2, s * 0.86, s * 0.36, s * 0.09, 'rgba(40,30,10,0.38)');
  if (v === 0) {
    ellipse(g, s / 2, s * 0.78, s * 0.26, s * 0.1, '#2a5a1e');
    for (const a of [-2.95, -2.45, -0.2, -0.7]) frond(g, s / 2, s * 0.8, a, s * 0.42, s * 0.1, FERN_LO, '#245a1c');
    for (const a of [-2.05, -1.1, -1.58]) frond(g, s / 2, s * 0.82, a, s * 0.44, s * 0.11, FERN, '#2f7a24');
    for (const a of [-2.6, -0.55]) frond(g, s / 2, s * 0.84, a, s * 0.3, s * 0.08, FERN_HI, '#4fae34');
    g.strokeStyle = '#9ae070'; g.lineWidth = Math.max(1, s * 0.035); g.lineCap = 'round';   // равлик молодого листка
    g.beginPath(); g.moveTo(s * 0.5, s * 0.8); g.quadraticCurveTo(s * 0.48, s * 0.5, s * 0.56, s * 0.44); g.stroke();
    g.beginPath(); g.arc(s * 0.53, s * 0.42, s * 0.035, 0, TAU * 0.8); g.stroke();
    return;
  }
  if (v === 1) {
    g.fillStyle = '#9a5e30';
    g.beginPath(); g.moveTo(s * 0.12, s * 0.8); g.quadraticCurveTo(s * 0.08, s * 0.38, s * 0.36, s * 0.24); g.quadraticCurveTo(s * 0.62, s * 0.12, s * 0.82, s * 0.32);
    g.quadraticCurveTo(s * 0.96, s * 0.52, s * 0.88, s * 0.8); g.closePath(); g.fill();
    g.fillStyle = '#c98a4c';
    g.beginPath(); g.moveTo(s * 0.16, s * 0.74); g.quadraticCurveTo(s * 0.12, s * 0.4, s * 0.36, s * 0.28); g.quadraticCurveTo(s * 0.6, s * 0.17, s * 0.78, s * 0.34);
    g.quadraticCurveTo(s * 0.86, s * 0.5, s * 0.72, s * 0.62); g.quadraticCurveTo(s * 0.45, s * 0.72, s * 0.16, s * 0.74); g.fill();
    ellipse(g, s * 0.38, s * 0.36, s * 0.13, s * 0.06, '#e3ad6c', -0.4);
    g.strokeStyle = '#6e3e1c'; g.lineWidth = Math.max(1, s * 0.022); g.lineCap = 'round';
    g.beginPath(); g.moveTo(s * 0.6, s * 0.3); g.lineTo(s * 0.55, s * 0.46); g.lineTo(s * 0.62, s * 0.56); g.stroke();
    ellipse(g, s * 0.3, s * 0.28, s * 0.1, s * 0.045, '#6f9a3c', -0.4);
    ellipse(g, s * 0.84, s * 0.8, s * 0.08, s * 0.06, '#8a5228');
    return;
  }
  bone(g, s * 0.18, s * 0.74, s * 0.8, s * 0.5, s * 0.07, BONE, BONE_D);
  bone(g, s * 0.24, s * 0.38, s * 0.7, s * 0.78, s * 0.065, BONE, BONE_D);
  g.strokeStyle = BONE_D; g.lineWidth = Math.max(1, s * 0.045); g.lineCap = 'round';   // ребра
  for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(s * (0.6 + j * 0.09), s * 0.5, s * 0.16, Math.PI * 1.1, Math.PI * 1.55); g.stroke(); }
  ellipse(g, s * 0.36, s * 0.5, s * 0.16, s * 0.13, BONE_D);            // череп
  ellipse(g, s * 0.35, s * 0.48, s * 0.15, s * 0.12, BONE);
  poly(g, [[s * 0.22, s * 0.52], [s * 0.1, s * 0.6], [s * 0.26, s * 0.6]], BONE);
  circle(g, s * 0.38, s * 0.45, s * 0.04, '#4a3a22');
  for (let j = 0; j < 3; j++) poly(g, [[s * (0.16 + j * 0.04), s * 0.59], [s * (0.18 + j * 0.04), s * 0.64], [s * (0.2 + j * 0.04), s * 0.59]], '#fff');
}

// Стіна — кам'яний обвал: брили впритул
function wall(g, s) {
  g.fillStyle = '#2b2622'; g.fillRect(0, 0, s, s);
  for (const [x, y, r] of [[0.24, 0.26, 0.25], [0.74, 0.24, 0.24], [0.5, 0.55, 0.27], [0.2, 0.8, 0.23], [0.8, 0.78, 0.24]]) {
    circle(g, s * x, s * y, s * r, '#544a42');
    circle(g, s * (x - 0.03), s * (y - 0.03), s * r * 0.82, '#7a6d60');
    ellipse(g, s * (x - r * 0.35), s * (y - r * 0.4), s * r * 0.3, s * r * 0.15, 'rgba(255,255,255,0.18)', -0.5);
    line(g, s * (x + r * 0.1), s * (y - r * 0.2), s * (x + r * 0.3), s * (y + r * 0.2), s * 0.02, 'rgba(0,0,0,0.3)');
  }
}

// Бонуси — на кам'яній табличці
function item(g, k, s) {
  const cx = s / 2, cy = s / 2;
  ellipse(g, cx, s * 0.86, s * 0.3, s * 0.07, 'rgba(40,30,10,0.38)');
  circle(g, cx, cy + s * 0.02, s * 0.38, '#6e5a3e');
  circle(g, cx, cy, s * 0.36, '#e8d4a8');
  g.strokeStyle = 'rgba(110,90,60,0.35)'; g.lineWidth = Math.max(1, s * 0.015);
  g.beginPath(); g.arc(cx, cy, s * 0.31, 0, TAU); g.stroke();
  if (k === IT_BOMB) egg(g, cx, cy + s * 0.04, s * 0.19, false, 0);
  else if (k === IT_FIRE) {                                           // смолоскип
    line(g, cx - s * 0.1, cy + s * 0.25, cx + s * 0.03, cy - s * 0.02, s * 0.06, WOOD);
    line(g, cx - s * 0.01, cy + s * 0.04, cx + s * 0.07, cy - s * 0.06, s * 0.08, '#6b4a2a');
    flameShape(g, cx + s * 0.06, cy - s * 0.13, s * 0.15, '#e8541c');
    flameShape(g, cx + s * 0.06, cy - s * 0.1, s * 0.08, '#ffd23f');
  } else if (k === IT_SPEED) {                                        // тиранозавр біжить
    for (const dy of [-0.12, -0.02, 0.08]) line(g, cx - s * 0.3, cy + s * dy, cx - s * 0.18, cy + s * dy, s * 0.025, 'rgba(110,90,60,0.6)');
    trex(g, cx + s * 0.03, cy + s * 0.24, s * 0.36, '#3f8a2e');
    circle(g, cx + s * 0.22, cy - s * 0.12, s * 0.022, '#fff');
  } else if (k === IT_PASS) sauropod(g, cx + s * 0.02, cy + s * 0.24, s * 0.25, '#2f8a8a');
  else if (k === IT_RESIST) {                                         // щит зі шкури з кістками
    circle(g, cx, cy, s * 0.22, '#7a4a24');
    circle(g, cx, cy, s * 0.18, '#c08850');
    for (const [dx, dy] of [[-0.06, -0.08], [0.07, 0.05], [-0.04, 0.09]]) circle(g, cx + s * dx, cy + s * dy, s * 0.025, '#8a5a30');
    bone(g, cx - s * 0.12, cy - s * 0.12, cx + s * 0.12, cy + s * 0.12, s * 0.035, BONE, BONE_D);
    bone(g, cx + s * 0.12, cy - s * 0.12, cx - s * 0.12, cy + s * 0.12, s * 0.035, BONE, BONE_D);
  } else if (k === IT_REMOTE) {                                       // барабан і кістка-палиця
    g.fillStyle = '#a0522d'; g.fillRect(cx - s * 0.15, cy - s * 0.06, s * 0.3, s * 0.24);
    ellipse(g, cx, cy + s * 0.18, s * 0.15, s * 0.05, '#a0522d');
    g.strokeStyle = '#f0dcb0'; g.lineWidth = Math.max(1, s * 0.018);
    g.beginPath(); for (let j = 0; j <= 6; j++) { const x = cx - s * 0.15 + j * s * 0.05; j ? g.lineTo(x, cy + (j % 2 ? s * 0.16 : -s * 0.04)) : g.moveTo(x, cy - s * 0.04); } g.stroke();
    ellipse(g, cx, cy - s * 0.06, s * 0.15, s * 0.05, '#f0dcb0');
    bone(g, cx + s * 0.04, cy - s * 0.1, cx + s * 0.2, cy - s * 0.26, s * 0.025, BONE, BONE_D);
    g.strokeStyle = '#e8541c'; g.lineWidth = Math.max(1, s * 0.022); g.lineCap = 'round';
    for (const r of [0.08, 0.13]) { g.beginPath(); g.arc(cx - s * 0.17, cy - s * 0.16, s * r, Math.PI * 1.05, Math.PI * 1.55); g.stroke(); }
  }
}

// Яйце: (cx, cy) — центр, r — піврозмах; k — частка запалу (тріщини), red — блимає перед вибухом
function eggPath(g, cx, cy, r) {
  g.beginPath(); g.moveTo(cx, cy - r * 1.3);
  g.bezierCurveTo(cx + r * 0.95, cy - r * 1.25, cx + r * 1.05, cy + r * 0.9, cx, cy + r * 0.95);
  g.bezierCurveTo(cx - r * 1.05, cy + r * 0.9, cx - r * 0.95, cy - r * 1.25, cx, cy - r * 1.3);
}
function egg(g, cx, cy, r, red, k) {
  eggPath(g, cx, cy, r); g.fillStyle = red ? '#ff9a6a' : '#efe2c0'; g.fill();
  g.save(); eggPath(g, cx, cy, r); g.clip();
  ellipse(g, cx + r * 0.5, cy + r * 0.2, r * 0.6, r * 1.2, 'rgba(120,90,40,0.18)');
  for (const [dx, dy, rs, c] of [[-0.4, -0.5, 0.2, '#7a8a3a'], [0.3, -0.2, 0.16, '#8a5a3a'], [-0.2, 0.3, 0.22, '#7a8a3a'], [0.45, 0.45, 0.14, '#8a5a3a'], [0.05, -0.85, 0.12, '#8a5a3a'], [-0.55, 0.0, 0.1, '#8a5a3a']])
    ellipse(g, cx + dx * r, cy + dy * r, r * rs, r * rs * 0.8, c);
  g.restore();
  ellipse(g, cx - r * 0.35, cy - r * 0.6, r * 0.14, r * 0.25, 'rgba(255,255,255,0.6)', 0.4);
  const n = k > 0.85 ? 3 : k > 0.55 ? 2 : k > 0.25 ? 1 : 0;
  if (!n) return;
  g.strokeStyle = '#4a3820'; g.lineWidth = Math.max(1, r * 0.09); g.lineCap = 'round'; g.lineJoin = 'round';
  const cracks = [[[-0.7, -0.2], [-0.4, -0.05], [-0.25, -0.3], [0, -0.1], [0.2, -0.35]], [[0.75, 0.1], [0.5, 0.25], [0.35, 0.05], [0.15, 0.3]], [[-0.3, -1.05], [-0.1, -0.8], [0.1, -0.95], [0.25, -0.7]]];
  for (let j = 0; j < n; j++) { g.beginPath(); cracks[j].forEach(([x, y], q) => (q ? g.lineTo(cx + x * r, cy + y * r) : g.moveTo(cx + x * r, cy + y * r))); g.stroke(); }
}
function bomb(g, x, y, s, k, T) {
  const r = s * (0.235 + bombBeat(k, T) * 0.8), cx = x + s / 2, base = y + s * 0.78;
  ellipse(g, cx, y + s * 0.84, s * 0.24, s * 0.07, 'rgba(40,30,10,0.38)');
  g.save(); g.translate(cx, base); g.rotate(Math.sin(T / 45) * 0.18 * k * k);
  egg(g, 0, -r * 0.95, r, bombFlash(k, T), k);
  g.restore();
}

// Кийок у руці: cl — бік (1 праворуч, −1 ліворуч), by — верх тулуба
function club(g, s, cl, by, walk) {
  const hx = cl * s * 0.27, hy = by + s * 0.16 + cl * walk * s * 0.04;
  line(g, hx, hy, hx + cl * s * 0.08, hy - s * 0.3, s * 0.05, WOOD);
  ellipse(g, hx + cl * s * 0.09, hy - s * 0.32, s * 0.065, s * 0.1, '#6b4320', cl * 0.25);
  circle(g, hx + cl * s * 0.06, hy - s * 0.33, s * 0.015, '#4a2c12'); circle(g, hx + cl * s * 0.11, hy - s * 0.28, s * 0.015, '#4a2c12');
}
// Печерна людина: шкура кольору гравця через плече (з плямами), скуйовджене волосся з кісткою, кийок
function player(g, p, s, T, { col, walk, bob, dead }) {
  const dark = shade(col, -0.35), edge = luma(col) > 0.8 ? 'rgba(0,0,0,0.35)' : dark;
  const spot = luma(col) < 0.35 ? shade(col, 0.35) : shade(col, -0.3);
  for (const [sx, w] of [[-1, walk], [1, -walk]]) {
    line(g, sx * s * 0.08, s * 0.18, sx * s * 0.09, s * 0.33 + w * s * 0.05, s * 0.09, SKIN);
    g.fillStyle = '#7a5230'; rr(g, sx * s * 0.09 - s * 0.065, s * 0.31 + w * s * 0.05, s * 0.13, s * 0.08, s * 0.035); g.fill();
  }
  const by = -s * 0.05 - bob, cl = p.dr === 1 ? -1 : 1;              // кийок — у правій руці (зі спини — ліворуч)
  if (p.dr === 1) club(g, s, cl, by, walk);
  g.fillStyle = SKIN; rr(g, -s * 0.17, by, s * 0.34, s * 0.26, s * 0.1); g.fill();
  g.fillStyle = col;
  g.beginPath(); g.moveTo(-s * 0.17, by + s * 0.03); g.lineTo(s * 0.03, by - s * 0.005); g.lineTo(s * 0.17, by + s * 0.1); g.lineTo(s * 0.17, by + s * 0.25);
  for (let j = 1; j <= 6; j++) g.lineTo(s * (0.17 - j * 0.34 / 6), by + s * (j % 2 ? 0.31 : 0.25));
  g.closePath(); g.fill();
  g.strokeStyle = edge; g.lineWidth = Math.max(1, s * 0.018); g.stroke();
  for (const [dx, dy] of [[-0.09, 0.08], [0.06, 0.14], [0.1, 0.06], [-0.04, 0.19]]) ellipse(g, dx * s, by + dy * s, s * 0.025, s * 0.018, spot);
  for (const sx of [-1, 1]) {
    line(g, sx * s * 0.18, by + s * 0.04, sx * s * 0.26, by + s * 0.16 - sx * walk * s * 0.04, s * 0.075, SKIN);
    circle(g, sx * s * 0.27, by + s * 0.17 - sx * walk * s * 0.04, s * 0.045, SKIN);
  }
  if (p.dr !== 1) club(g, s, cl, by, walk);
  const hy = -s * 0.21 - bob;
  circle(g, 0, hy, s * 0.155, SKIN);
  g.fillStyle = HAIR;                                                 // скуйовджене волосся
  g.beginPath();
  if (p.dr === 1) g.arc(0, hy + s * 0.01, s * 0.165, 0, TAU);
  else { g.arc(0, hy - s * 0.01, s * 0.165, Math.PI * 0.95, Math.PI * 2.05); g.lineTo(s * 0.14, hy - s * 0.02); g.lineTo(-s * 0.14, hy - s * 0.02); }
  g.fill();
  for (let j = 0; j < 5; j++) { const a = Math.PI * (1.1 + j * 0.2); poly(g, [[Math.cos(a - 0.2) * s * 0.15, hy + Math.sin(a - 0.2) * s * 0.15], [Math.cos(a) * s * 0.24, hy - s * 0.01 + Math.sin(a) * s * 0.24], [Math.cos(a + 0.2) * s * 0.15, hy + Math.sin(a + 0.2) * s * 0.15]], HAIR); }
  bone(g, -s * 0.09, hy - s * 0.16, s * 0.07, hy - s * 0.2, s * 0.025, BONE, BONE_D);
  if (p.dr === 1) return;
  const fx = (DX[p.dr] || 0) * s * 0.05, fy = p.dr === 3 || !p.dr ? s * 0.02 : 0;
  line(g, fx - s * 0.1, hy - s * 0.035 + fy, fx + s * 0.1, hy - s * 0.035 + fy, s * 0.035, HAIR);   // суцільна брова
  ellipse(g, fx, hy + s * 0.05 + fy, s * 0.035, s * 0.028, shade(SKIN, -0.15));
  if (dead) {
    g.strokeStyle = '#2a1a10'; g.lineWidth = Math.max(1, s * 0.022);
    for (const ex of [-0.055, 0.055]) {
      const ox = ex * s + fx, oy = hy + s * 0.01 + fy, e = s * 0.022;
      g.beginPath(); g.moveTo(ox - e, oy - e); g.lineTo(ox + e, oy + e); g.moveTo(ox + e, oy - e); g.lineTo(ox - e, oy + e); g.stroke();
    }
  } else for (const ex of [-0.055, 0.055]) { circle(g, ex * s + fx, hy + s * 0.01 + fy, s * 0.026, '#fff'); circle(g, ex * s + fx * 1.2, hy + s * 0.012 + fy, s * 0.014, '#1a1008'); }
}

// Нога раптора (збоку, морда праворуч): ph — фаза кроку −1..1, з серпоподібним кігтем
function raptorLeg(g, s, ph, c) {
  const kx = s * (0.06 + ph * 0.07), fx = s * (ph * 0.1);
  line(g, 0, s * 0.03, kx, s * 0.15, s * 0.08, c);
  line(g, kx, s * 0.15, fx - s * 0.02, s * 0.29, s * 0.05, c);
  line(g, fx - s * 0.02, s * 0.29, fx + s * 0.07, s * 0.31, s * 0.035, c);
  g.strokeStyle = '#f0e6c8'; g.lineWidth = Math.max(1, s * 0.018); g.lineCap = 'round';
  g.beginPath(); g.moveTo(fx, s * 0.29); g.quadraticCurveTo(fx + s * 0.03, s * 0.24, fx + s * 0.06, s * 0.25); g.stroke();
}
// Монстри: 0 — малий трицератопс (анфас), 1 — раптор (згори, головою за рухом), 2 — птеродактиль (летить, тінь на землі)
function monster(g, m, s, T, wob) {
  const ex = (DX[m.d] || 0) * s * 0.045;
  if (m.k === 0) {
    const st = Math.sin(T / 90 + m.i);
    for (const sx of [-1, 1]) { g.fillStyle = '#a65a28'; rr(g, sx * s * 0.17 - s * 0.06, s * 0.14 + sx * st * s * 0.02, s * 0.12, s * 0.2, s * 0.05); g.fill(); }
    g.save(); g.rotate(wob * 0.05);
    ellipse(g, 0, -s * 0.13, s * 0.34, s * 0.24, '#f2c470');                // комір
    ellipse(g, 0, -s * 0.12, s * 0.3, s * 0.2, '#e3a24a');
    for (let j = 0; j < 7; j++) { const a = Math.PI * (1.05 + j * 0.15); circle(g, Math.cos(a) * s * 0.31, -s * 0.13 + Math.sin(a) * s * 0.22, s * 0.035, '#f6d890'); }
    for (const sx of [-1, 1]) circle(g, sx * s * 0.18, -s * 0.18, s * 0.035, '#c9743a');
    ellipse(g, 0, s * 0.04, s * 0.22, s * 0.2, '#c9743a');
    for (const sx of [-1, 1]) poly(g, [[sx * s * 0.13 + ex, -s * 0.06], [sx * s * 0.2 + ex * 1.4, -s * 0.33], [sx * s * 0.06 + ex, -s * 0.09]], BONE);
    poly(g, [[ex * 1.2 - s * 0.035, s * 0.06], [ex * 1.4, -s * 0.06], [ex * 1.2 + s * 0.035, s * 0.06]], BONE);
    ellipse(g, ex * 1.2, s * 0.13, s * 0.09, s * 0.06, '#8a4a22');
    for (const sx of [-1, 1]) { circle(g, sx * s * 0.1 + ex, -s * 0.03, s * 0.05, '#fff'); circle(g, sx * s * 0.1 + ex * 1.5, -s * 0.03, s * 0.026, '#1a1008'); }
    g.restore();
    return;
  }
  if (m.k === 1) {
    const h = DX[m.d] || (m.i % 2 ? 1 : -1), run = Math.sin(T / 60 + m.i), tw = Math.sin(T / 130 + m.i) * s * 0.04;
    const body = '#6a9e3a', dk = '#3d6a22', far = '#55822e';
    g.save(); g.scale(h, 1);
    raptorLeg(g, s, -run, far);
    line(g, s * 0.1, -s * 0.05, s * 0.19, s * 0.0, s * 0.035, far);
    g.fillStyle = body;
    g.beginPath(); g.moveTo(-s * 0.06, -s * 0.12); g.quadraticCurveTo(-s * 0.3, -s * 0.13, -s * 0.48, -s * 0.18 + tw); g.quadraticCurveTo(-s * 0.3, -s * 0.03, -s * 0.04, s * 0.05); g.closePath(); g.fill();
    ellipse(g, 0, -s * 0.03, s * 0.18, s * 0.115, body, -0.12);
    ellipse(g, s * 0.03, s * 0.03, s * 0.12, s * 0.05, '#b8d07a', -0.12);
    poly(g, [[s * 0.08, -s * 0.12], [s * 0.17, -s * 0.27], [s * 0.25, -s * 0.22], [s * 0.16, -s * 0.03]], body);
    g.strokeStyle = dk; g.lineWidth = Math.max(1, s * 0.03); g.lineCap = 'round';
    for (const x of [-0.3, -0.2, -0.1, 0, 0.09]) { g.beginPath(); g.moveTo(s * x, -s * (x < -0.05 ? 0.13 - x * 0.12 : 0.14)); g.lineTo(s * (x + 0.02), -s * 0.06); g.stroke(); }
    const bite = Math.sin(T / 140 + m.i) > 0.2 ? 0.06 : 0.02;
    poly(g, [[s * 0.18, -s * 0.2], [s * 0.4, -s * 0.21 + bite * s * 0.3], [s * 0.38, -s * 0.17 + bite * s], [s * 0.2, -s * 0.15]], '#4f7a2a');   // нижня щелепа
    ellipse(g, s * 0.24, -s * 0.26, s * 0.1, s * 0.065, body);
    poly(g, [[s * 0.26, -s * 0.31], [s * 0.42, -s * 0.25], [s * 0.42, -s * 0.21], [s * 0.24, -s * 0.2]], body);
    for (let j = 0; j < 4; j++) poly(g, [[s * (0.27 + j * 0.035), -s * 0.21], [s * (0.285 + j * 0.035), -s * 0.18], [s * (0.3 + j * 0.035), -s * 0.21]], '#fff');
    circle(g, s * 0.26, -s * 0.28, s * 0.03, '#ffd23f'); line(g, s * 0.265, -s * 0.3, s * 0.265, -s * 0.26, s * 0.012, '#111', 'butt');
    line(g, s * 0.2, -s * 0.31, s * 0.3, -s * 0.315, s * 0.02, dk);
    raptorLeg(g, s, run, body);
    line(g, s * 0.12, -s * 0.04, s * 0.2, s * 0.02, s * 0.035, body);
    g.restore();
    return;
  }
  const flap = Math.sin(T / 110 + m.i * 1.3), hy = -s * 0.14 + wob * s * 0.03, h = DX[m.d] || 1;
  ellipse(g, 0, s * 0.4, s * 0.2 * (0.85 + 0.1 * flap), s * 0.05, 'rgba(0,0,0,0.2)');
  for (const sx of [-1, 1]) {
    const tipY = hy - flap * s * 0.18 - s * 0.02;
    const wx = sx * s * 0.27, wy = hy - s * 0.07 - flap * s * 0.1;
    poly(g, [[sx * s * 0.05, hy - s * 0.06], [wx, wy], [sx * s * 0.5, tipY], [sx * s * 0.36, hy + s * 0.08 - flap * s * 0.06], [sx * s * 0.2, hy + s * 0.1 - flap * s * 0.03], [sx * s * 0.06, hy + s * 0.13]], '#b8704a');
    g.strokeStyle = 'rgba(122,62,34,0.6)'; g.lineWidth = Math.max(1, s * 0.015);
    g.beginPath(); g.moveTo(wx, wy); g.lineTo(sx * s * 0.36, hy + s * 0.08 - flap * s * 0.06); g.moveTo(wx, wy); g.lineTo(sx * s * 0.2, hy + s * 0.1 - flap * s * 0.03); g.stroke();
    line(g, sx * s * 0.05, hy - s * 0.06, wx, wy, s * 0.045, '#7a3e22');
    line(g, wx, wy, sx * s * 0.5, tipY, s * 0.03, '#7a3e22');
  }
  ellipse(g, 0, hy + s * 0.03, s * 0.085, s * 0.14, '#c27a4c');
  const hx = h * s * 0.02, hh = hy - s * 0.13;
  poly(g, [[hx, hh - s * 0.03], [hx - h * s * 0.22, hh - s * 0.14], [hx - h * s * 0.02, hh + s * 0.02]], '#e04a2a');   // гребінь
  poly(g, [[hx + h * s * 0.03, hh - s * 0.03], [hx + h * s * 0.3, hh + s * 0.04], [hx + h * s * 0.03, hh + s * 0.04]], '#e0b060');   // дзьоб
  circle(g, hx, hh, s * 0.08, '#c27a4c');
  circle(g, hx + h * s * 0.025, hh - s * 0.01, s * 0.022, '#fff'); circle(g, hx + h * s * 0.03, hh - s * 0.01, s * 0.011, '#111');
}

export default {
  name: 'Доба динозаврів',
  bg: '#141a12',
  backdrop,
  shadow: 'rgba(20,15,5,0.6)',
  emoji: { bomb: '🥚', fire: '🔥', speed: '🦖', pass: '🦕', resist: '🛡️', remote: '🥁' },
  fire: ['#5e4a44', '#ff7a1a', '#ffe27a'],
  burn: ['#ff6a00', 'rgba(255,210,80,0)'],
  blocks: 3,
  floor, stone, block, wall, item, bomb, player, monster,
};
