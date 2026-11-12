// lab.js — «Лабораторія порталів»: бетонна підлога гаража в плямах мастила й зеленої кислоти, стовпи — сталеві стелажі
// з банками (на всю клітинку), рамка — стіна лабораторії з панелями, трубами й смугами небезпеки; блоки — предмети з тінню:
// колби з рідиною, що булькає, коробки з мотлохом, бочки «☢»; стіни — зелений вихровий портал. Гравці — шалені вчені
// в халатах кольору гравця й окулярах-лупах; триокий мутант-слизовик, інопланетний жук-паразит, мерехтливий двійник
// з іншого виміру. Бомби — капсули із зеленим ядром. Вогонь — зелена плазма. Тло — фіолетове небо чужого світу
// з двома місяцями, кислотними грибами й порталом. Бонуси: 🧪 бомба, ☢️ вогонь, ⚡ швидкість, 🌀 прохід (портал),
// 🥽 стійкість (захисні окуляри), 📟 детонатор.
import { DX, DY, IT_BOMB, IT_FIRE, IT_SPEED, IT_PASS, IT_RESIST, IT_REMOTE } from '../sim.js';
import { TAU, rr, rnd, luma, shade, circle, ellipse, line, poly, bombBeat, bombFlash, pillarShade, remoteIcon, ghostPath } from './common.js';

const CON = '#9a9da2', CON2 = '#95989d', STEEL = '#3b434e', STEEL_HI = '#4f5966', STEEL_LO = '#252b33';
const ACID = '#7dff3a', ACID_D = '#2fa82a', GLOW = '#d8ffb0', SKIN = '#f0c39a', BRASS = '#c8913a';
const HAIR = ['#3a2416', '#c8642a', '#1c1c22', '#e0b860', '#8a3a1a', '#5a2a4a', '#4a3020', '#d07a3a'];

// ---------- Тло: фіолетове небо чужого світу, два місяці, кислотні гриби, портал ----------
function moon(g, x, y, r, c1, c2, glow) {
  circle(g, x, y, r * 1.45, glow);
  const grd = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  grd.addColorStop(0, c1); grd.addColorStop(1, c2);
  g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  for (const [dx, dy, k] of [[-0.3, 0.2, 0.22], [0.25, -0.25, 0.15], [0.35, 0.35, 0.12], [-0.05, -0.45, 0.09]]) circle(g, x + dx * r, y + dy * r, r * k, 'rgba(60,20,70,0.22)');
}
function mushroom(g, x, y, h, cap, spot, glow) {
  circle(g, x, y - h * 0.82, h * 0.42, glow);
  g.fillStyle = '#e8d8f0'; rr(g, x - h * 0.07, y - h * 0.85, h * 0.14, h * 0.85, h * 0.06); g.fill();
  g.fillStyle = 'rgba(80,30,90,0.3)'; g.fillRect(x + h * 0.01, y - h * 0.85, h * 0.06, h * 0.85);
  g.fillStyle = cap;
  g.beginPath(); g.ellipse(x, y - h * 0.82, h * 0.3, h * 0.24, 0, Math.PI, TAU); g.closePath(); g.fill();
  ellipse(g, x, y - h * 0.82, h * 0.3, h * 0.05, shade(cap, -0.35));
  for (const [dx, dy, k] of [[-0.15, -0.9, 0.05], [0.05, -0.98, 0.06], [0.18, -0.88, 0.04], [-0.02, -0.86, 0.03]]) circle(g, x + dx * h, y + dy * h, h * k, spot);
}
function portal(g, x, y, r, t = 0) {
  circle(g, x, y, r * 1.35, 'rgba(125,255,58,0.12)');
  const grd = g.createRadialGradient(x, y, r * 0.05, x, y, r);
  grd.addColorStop(0, '#f0ffe0'); grd.addColorStop(0.35, ACID); grd.addColorStop(0.8, '#1f8a2a'); grd.addColorStop(1, 'rgba(15,60,20,0)');
  g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(230,255,200,0.65)'; g.lineWidth = Math.max(1, r * 0.06); g.lineCap = 'round';
  for (let j = 0; j < 3; j++) {
    g.beginPath();
    for (let q = 0; q <= 24; q++) {
      const a = t + j * TAU / 3 + q * 0.22, rad = r * (0.12 + q * 0.032);
      const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
      q ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
  }
}
function backdrop(g, W, H, dpr) {
  const grd = g.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#12061f'); grd.addColorStop(0.55, '#3b1452'); grd.addColorStop(1, '#5e2366');
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  for (let j = 0; j < 140; j++) {
    const a = 0.3 + rnd(j, 3) * 0.6;
    circle(g, rnd(j, 1) * W, rnd(j, 2) * H * 0.7, (0.6 + rnd(j, 4) * 1.2) * dpr, `rgba(255,240,255,${a})`);
  }
  const u = H / 900;
  moon(g, W * 0.065, H * 0.15, 62 * u, '#ffe0f4', '#c063a8', 'rgba(255,150,220,0.12)');
  moon(g, W * 0.94, H * 0.09, 30 * u, '#f0ffc8', '#7ab844', 'rgba(200,255,140,0.12)');
  g.fillStyle = '#2a0a33';                                          // пагорби
  g.beginPath(); g.moveTo(0, H * 0.8);
  for (let j = 0; j <= 16; j++) g.lineTo(W * j / 16, H * (0.8 - 0.04 * Math.sin(j * 1.7) - 0.03 * Math.sin(j * 0.6)));
  g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  g.fillStyle = '#1a0522'; g.fillRect(0, H * 0.9, W, H * 0.1);
  for (const [fx, fy, rx] of [[0.05, 0.9, 60], [0.94, 0.88, 50]]) {   // кислотні калюжі
    ellipse(g, W * fx, H * fy, rx * u * 1.3, rx * u * 0.3, 'rgba(125,255,58,0.18)');
    ellipse(g, W * fx, H * fy, rx * u, rx * u * 0.2, '#4fd62a');
    ellipse(g, W * fx - rx * u * 0.3, H * fy - rx * u * 0.05, rx * u * 0.3, rx * u * 0.05, 'rgba(230,255,200,0.6)');
  }
  portal(g, W * 0.93, H * 0.48, 58 * u, 0.4);
  mushroom(g, W * 0.035, H * 0.92, 170 * u, '#ff4fa3', '#ffd0ea', 'rgba(255,80,170,0.12)');
  mushroom(g, W * 0.095, H * 0.95, 105 * u, '#3dff8a', '#e0ffe8', 'rgba(80,255,140,0.12)');
  mushroom(g, W * 0.9, H * 0.96, 120 * u, '#b07aff', '#efe0ff', 'rgba(170,120,255,0.14)');
  mushroom(g, W * 0.965, H * 0.93, 160 * u, '#ffb02a', '#fff0c8', 'rgba(255,180,60,0.12)');
}

// ---------- Підлога: бетон гаража, шви, плями мастила й кислоти ----------
function floor(g, px, py, s, x, y, map) {
  const i = y * map.GW + x;
  g.fillStyle = (x + y) % 2 ? CON : CON2; g.fillRect(px, py, s, s);
  for (let j = 0; j < 6; j++) circle(g, px + s * rnd(i, 10 + j), py + s * rnd(i, 20 + j), Math.max(0.6, s * 0.015), 'rgba(60,62,70,0.28)');
  g.fillStyle = 'rgba(60,64,72,0.22)';                               // шви бетону
  g.fillRect(px, py, s, Math.max(1, s * 0.02)); g.fillRect(px, py, Math.max(1, s * 0.02), s);
  const r = rnd(i, 5);
  if (r < 0.1) {                                                     // пляма мастила з райдужним полиском
    const cx = px + s * (0.35 + rnd(i, 6) * 0.3), cy = py + s * (0.35 + rnd(i, 7) * 0.3);
    ellipse(g, cx, cy, s * 0.2, s * 0.13, 'rgba(30,28,36,0.4)', rnd(i, 8) * 3);
    ellipse(g, cx + s * 0.08, cy + s * 0.04, s * 0.09, s * 0.06, 'rgba(30,28,36,0.35)');
    ellipse(g, cx - s * 0.03, cy - s * 0.02, s * 0.08, s * 0.035, 'rgba(150,90,200,0.25)', 0.4);
  } else if (r < 0.16) {                                             // калюжка кислоти
    const cx = px + s * (0.3 + rnd(i, 6) * 0.4), cy = py + s * (0.3 + rnd(i, 7) * 0.4);
    ellipse(g, cx, cy, s * 0.13, s * 0.08, 'rgba(47,168,42,0.8)');
    ellipse(g, cx + s * 0.1, cy + s * 0.05, s * 0.06, s * 0.04, 'rgba(47,168,42,0.8)');
    ellipse(g, cx, cy, s * 0.09, s * 0.05, 'rgba(125,255,58,0.85)');
    ellipse(g, cx - s * 0.04, cy - s * 0.02, s * 0.03, s * 0.012, 'rgba(255,255,255,0.7)');
  } else if (r < 0.21) {                                             // тріщина
    g.strokeStyle = 'rgba(55,58,66,0.45)'; g.lineWidth = Math.max(1, s * 0.018); g.lineCap = 'round';
    g.beginPath(); g.moveTo(px + s * 0.15, py + s * 0.6); g.lineTo(px + s * 0.4, py + s * 0.55); g.lineTo(px + s * 0.52, py + s * 0.7); g.lineTo(px + s * 0.8, py + s * 0.66); g.stroke();
  } else if (r < 0.24) {                                             // загублена гайка
    const cx = px + s * 0.7, cy = py + s * 0.3, q = s * 0.045;
    poly(g, Array.from({ length: 6 }, (_, j) => [cx + Math.cos(j * TAU / 6) * q, cy + Math.sin(j * TAU / 6) * q]), '#6a6e76');
    circle(g, cx, cy, q * 0.45, CON);
  }
  pillarShade(g, map, x, y, px, py, s, 'rgba(20,22,30,0.25)');
}

// ---------- Рамка — стіна лабораторії; стовп — сталевий стелаж із банками на всю клітинку ----------
function stone(g, x, y, s, border, cx, cy, map) {
  const i = cy * map.GW + cx, d = Math.max(1, Math.round(s * 0.07));
  if (border) {
    g.fillStyle = '#171b21'; g.fillRect(x, y, s, s);
    g.fillStyle = '#2b323c'; g.fillRect(x, y, s - d, s - d);
    g.fillStyle = '#222830'; g.fillRect(x + d, y + d, s - 2 * d, s - 2 * d);
    for (const [fx, fy] of [[0.16, 0.16], [0.84, 0.16], [0.16, 0.84], [0.84, 0.84]]) circle(g, x + s * fx, y + s * fy, s * 0.03, '#3d4652');
    const r = rnd(i, 3);
    if (r < 0.22) {                                                  // смуга небезпеки
      g.save(); g.beginPath(); g.rect(x + d, y + s * 0.38, s - 2 * d, s * 0.24); g.clip();
      g.fillStyle = '#d9b21f'; g.fillRect(x + d, y + s * 0.38, s - 2 * d, s * 0.24);
      g.fillStyle = '#1c1c20';
      for (let j = -2; j < 6; j++) { const sx = x + j * s * 0.22; poly(g, [[sx, y + s * 0.62], [sx + s * 0.11, y + s * 0.62], [sx + s * 0.35, y + s * 0.38], [sx + s * 0.24, y + s * 0.38]], '#1c1c20'); }
      g.restore();
    } else if (r < 0.42) {                                           // труба з кислотою
      const vert = (cx === 0 || cx === map.GW - 1);
      g.fillStyle = '#2f6b3a';
      if (vert) g.fillRect(x + s * 0.4, y, s * 0.2, s); else g.fillRect(x, y + s * 0.4, s, s * 0.2);
      g.fillStyle = 'rgba(125,255,58,0.55)';
      if (vert) g.fillRect(x + s * 0.44, y, s * 0.05, s); else g.fillRect(x, y + s * 0.44, s, s * 0.05);
      g.fillStyle = '#5a646f';
      if (vert) g.fillRect(x + s * 0.36, y + s * 0.44, s * 0.28, s * 0.12); else g.fillRect(x + s * 0.44, y + s * 0.36, s * 0.12, s * 0.28);
    } else if (r < 0.6) {                                            // решітка вентиляції
      g.fillStyle = '#14181d'; g.fillRect(x + s * 0.24, y + s * 0.28, s * 0.52, s * 0.44);
      g.fillStyle = '#39424d';
      for (let j = 0; j < 4; j++) g.fillRect(x + s * 0.24, y + s * (0.31 + j * 0.105), s * 0.52, s * 0.045);
    }
    return;
  }
  g.fillStyle = STEEL_LO; g.fillRect(x, y, s, s);
  g.fillStyle = STEEL_HI; g.fillRect(x, y, s - d, s - d);
  g.fillStyle = STEEL; g.fillRect(x + d, y + d, s - 2 * d, s - 2 * d);
  g.fillStyle = '#1e232a'; g.fillRect(x + d, y + d, s - 2 * d, s * 0.06);       // тінь під верхньою полицею
  const JAR = ['#47823a', '#82466c', '#3c6a84', '#86733a', '#644f88'];
  for (const [k, fy] of [[0, 0.44], [1, 0.8]]) {                     // дві полиці з банками
    for (let j = 0; j < 3; j++) {
      if (rnd(i, 50 + k * 3 + j) < 0.2) continue;
      const w = s * (0.13 + rnd(i, 60 + j + k * 3) * 0.05), h = s * (0.14 + rnd(i, 70 + j + k * 3) * 0.1);
      const jx = x + s * (0.15 + j * 0.25) + (rnd(i, 80 + j + k) - 0.5) * s * 0.04;
      g.fillStyle = JAR[Math.floor(rnd(i, 90 + j + k * 3) * JAR.length)]; g.fillRect(jx, y + s * fy - h, w, h);
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(jx + w * 0.15, y + s * fy - h, w * 0.18, h);
      g.fillStyle = '#5c6672'; g.fillRect(jx - w * 0.05, y + s * fy - h - s * 0.03, w * 1.1, s * 0.03);
    }
    g.fillStyle = '#6b7684'; g.fillRect(x + d, y + s * fy, s - 2 * d, s * 0.05);
    g.fillStyle = '#1e232a'; g.fillRect(x + d, y + s * (fy + 0.05), s - 2 * d, s * 0.025);
  }
  g.fillStyle = '#5f6a78';                                           // стійки
  g.fillRect(x + d, y + d, s * 0.06, s - 2 * d); g.fillRect(x + s - d - s * 0.06, y + d, s * 0.06, s - 2 * d);
  g.fillStyle = '#2a3038';
  for (let j = 0; j < 6; j++) { g.fillRect(x + d + s * 0.02, y + s * (0.12 + j * 0.14), s * 0.02, s * 0.03); g.fillRect(x + s - d - s * 0.04, y + s * (0.12 + j * 0.14), s * 0.02, s * 0.03); }
}

// ---------- Блоки: 0 — колба з рідиною, що булькає; 1 — коробка з мотлохом; 2 — бочка «☢» ----------
function trefoil(g, cx, cy, r, col) {
  g.fillStyle = col;
  for (let j = 0; j < 3; j++) {
    const a = Math.PI / 2 + j * TAU / 3;
    g.beginPath(); g.arc(cx, cy, r, a - 0.52, a + 0.52); g.arc(cx, cy, r * 0.34, a + 0.52, a - 0.52, true); g.closePath(); g.fill();
  }
  circle(g, cx, cy, r * 0.2, col);
}
function flaskPath(g, s) {
  g.beginPath();
  g.moveTo(s * 0.41, s * 0.16); g.lineTo(s * 0.41, s * 0.38); g.lineTo(s * 0.17, s * 0.76);
  g.quadraticCurveTo(s * 0.12, s * 0.86, s * 0.24, s * 0.86); g.lineTo(s * 0.76, s * 0.86);
  g.quadraticCurveTo(s * 0.88, s * 0.86, s * 0.83, s * 0.76); g.lineTo(s * 0.59, s * 0.38); g.lineTo(s * 0.59, s * 0.16);
  g.closePath();
}
function gear(g, cx, cy, r, col, hole) {
  g.fillStyle = col; g.beginPath();
  for (let j = 0; j < 16; j++) { const a = j * TAU / 16, q = j % 2 ? r * 0.78 : r; j ? g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q) : g.moveTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
  g.closePath(); g.fill();
  circle(g, cx, cy, r * 0.32, hole);
}
function block(g, s, v) {
  ellipse(g, s / 2, s * 0.88, s * 0.35, s * 0.09, 'rgba(20,22,30,0.38)');
  if (v === 0) {
    circle(g, s / 2, s * 0.66, s * 0.36, 'rgba(125,255,58,0.16)');   // сяйво рідини
    flaskPath(g, s); g.fillStyle = 'rgba(215,245,255,0.45)'; g.fill();
    g.save(); flaskPath(g, s); g.clip();
    g.fillStyle = '#52e02a'; g.fillRect(0, s * 0.5, s, s);
    g.fillStyle = '#9dff5a'; g.fillRect(0, s * 0.5, s, s * 0.05);
    g.fillStyle = 'rgba(20,90,20,0.35)'; g.fillRect(s * 0.6, s * 0.5, s * 0.3, s * 0.4);
    for (const [fx, fy, r] of [[0.36, 0.72, 0.035], [0.5, 0.62, 0.05], [0.62, 0.76, 0.03], [0.44, 0.8, 0.025]]) {
      circle(g, s * fx, s * fy, s * r, 'rgba(235,255,210,0.75)');
    }
    g.restore();
    g.strokeStyle = '#e8f6ff'; g.lineWidth = Math.max(1, s * 0.03); g.lineJoin = 'round'; flaskPath(g, s); g.stroke();
    g.fillStyle = '#e8f6ff'; rr(g, s * 0.37, s * 0.13, s * 0.26, s * 0.05, s * 0.02); g.fill();
    line(g, s * 0.29, s * 0.62, s * 0.4, s * 0.43, s * 0.03, 'rgba(255,255,255,0.7)');
    for (const [fx, fy, r] of [[0.5, 0.3, 0.03], [0.46, 0.08, 0.04], [0.56, 0.0, 0.03]]) circle(g, s * fx, s * (fy + 0.02), s * r, 'rgba(200,255,160,0.85)');
    return;
  }
  if (v === 1) {
    gear(g, s * 0.34, s * 0.3, s * 0.16, '#9aa4b0', '#5a626c');      // мотлох зверху
    line(g, s * 0.62, s * 0.4, s * 0.74, s * 0.1, s * 0.035, '#8a929c');
    circle(g, s * 0.74, s * 0.1, s * 0.05, '#ff4f6a');
    g.strokeStyle = '#2a8fd6'; g.lineWidth = Math.max(1, s * 0.03); g.lineCap = 'round';
    g.beginPath(); g.moveTo(s * 0.48, s * 0.42); g.bezierCurveTo(s * 0.5, s * 0.1, s * 0.62, s * 0.3, s * 0.56, s * 0.18); g.stroke();
    g.strokeStyle = '#e53935';
    g.beginPath(); g.moveTo(s * 0.52, s * 0.42); g.bezierCurveTo(s * 0.44, s * 0.2, s * 0.36, s * 0.16, s * 0.2, s * 0.2); g.stroke();
    g.fillStyle = '#c8955a'; g.fillRect(s * 0.14, s * 0.4, s * 0.72, s * 0.46);         // коробка
    g.fillStyle = '#ddb07a'; poly(g, [[s * 0.14, s * 0.4], [s * 0.06, s * 0.3], [s * 0.36, s * 0.3], [s * 0.42, s * 0.4]], '#ddb07a');
    poly(g, [[s * 0.86, s * 0.4], [s * 0.94, s * 0.3], [s * 0.66, s * 0.28], [s * 0.58, s * 0.4]], '#b38048');
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(s * 0.14, s * 0.4, s * 0.72, s * 0.05);
    g.fillStyle = '#e8d29a'; g.fillRect(s * 0.44, s * 0.4, s * 0.12, s * 0.46);          // скотч
    g.fillStyle = '#2a2a2a'; g.font = `bold ${Math.round(s * 0.15)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('?!', s * 0.29, s * 0.64);
    g.strokeStyle = 'rgba(80,50,20,0.5)'; g.lineWidth = Math.max(1, s * 0.015);
    g.beginPath(); g.moveTo(s * 0.62, s * 0.6); g.lineTo(s * 0.8, s * 0.6); g.moveTo(s * 0.62, s * 0.68); g.lineTo(s * 0.76, s * 0.68); g.stroke();
    return;
  }
  g.fillStyle = '#e8b81e'; rr(g, s * 0.2, s * 0.16, s * 0.6, s * 0.7, s * 0.06); g.fill();          // бочка
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(s * 0.27, s * 0.18, s * 0.06, s * 0.66);
  g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(s * 0.68, s * 0.18, s * 0.1, s * 0.66);
  g.fillStyle = '#b8901a'; for (const fy of [0.3, 0.72]) g.fillRect(s * 0.18, s * fy, s * 0.64, s * 0.05);
  ellipse(g, s / 2, s * 0.17, s * 0.3, s * 0.06, '#c89a1a');
  circle(g, s / 2, s * 0.51, s * 0.15, '#f6d84a');
  trefoil(g, s / 2, s * 0.51, s * 0.13, '#1c1c20');
  g.fillStyle = '#5ae02a';                                            // кислота стікає з кришки
  g.beginPath(); g.moveTo(s * 0.3, s * 0.16); g.lineTo(s * 0.46, s * 0.16); g.lineTo(s * 0.44, s * 0.34);
  g.quadraticCurveTo(s * 0.41, s * 0.4, s * 0.39, s * 0.33); g.lineTo(s * 0.36, s * 0.24); g.lineTo(s * 0.33, s * 0.28); g.closePath(); g.fill();
  circle(g, s * 0.415, s * 0.38, s * 0.025, '#5ae02a');
  ellipse(g, s * 0.36, s * 0.86, s * 0.12, s * 0.035, '#5ae02a');
  ellipse(g, s * 0.34, s * 0.855, s * 0.05, s * 0.012, 'rgba(230,255,200,0.7)');
}

// ---------- Стіна — зелений вихровий портал ----------
function wall(g, s) {
  g.fillStyle = '#0c160e'; g.fillRect(0, 0, s, s);
  const grd = g.createRadialGradient(s / 2, s / 2, s * 0.04, s / 2, s / 2, s * 0.62);
  grd.addColorStop(0, '#f0ffe0'); grd.addColorStop(0.3, ACID); grd.addColorStop(0.7, '#1f8a2a'); grd.addColorStop(1, '#0c160e');
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
  g.strokeStyle = 'rgba(230,255,200,0.7)'; g.lineWidth = Math.max(1, s * 0.035); g.lineCap = 'round';
  for (let j = 0; j < 4; j++) {
    g.beginPath();
    for (let q = 0; q <= 20; q++) {
      const a = j * TAU / 4 + q * 0.26, rad = s * (0.05 + q * 0.022);
      const px = s / 2 + Math.cos(a) * rad, py = s / 2 + Math.sin(a) * rad;
      q ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
  }
  for (let j = 0; j < 6; j++) circle(g, s * rnd(j, 31), s * rnd(j, 32), s * 0.02, 'rgba(200,255,150,0.8)');
}

// ---------- Бонуси — на чашці Петрі з зеленим обідком ----------
function capsule(g, cx, cy, r, k, T, flash, still) {
  const w = r * 0.6, core = w * 0.62 * (still ? 1 : 1 + bombBeat(k, T) * 2.5);
  circle(g, cx, cy, w * 1.5, flash ? 'rgba(255,255,255,0.3)' : 'rgba(125,255,58,0.22)');
  g.fillStyle = 'rgba(200,240,225,0.55)'; rr(g, cx - w * 0.82, cy - r * 0.62, w * 1.64, r * 1.24, w * 0.3); g.fill();
  circle(g, cx, cy, core, flash ? '#ffffff' : ACID);
  circle(g, cx, cy, core * 0.55, flash ? '#ff5a4a' : GLOW);
  g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(cx - w * 0.6, cy - r * 0.55, w * 0.18, r * 1.1);
  for (const sy of [-1, 1]) {
    g.fillStyle = '#7d8996'; rr(g, cx - w, sy < 0 ? cy - r : cy + r * 0.58, w * 2, r * 0.42, w * 0.45); g.fill();
    g.fillStyle = '#4c5560'; g.fillRect(cx - w, sy < 0 ? cy - r * 0.66 : cy + r * 0.58, w * 2, r * 0.08);
    g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(cx - w * 0.7, sy < 0 ? cy - r * 0.92 : cy + r * 0.72, w * 0.25, r * 0.18);
  }
  const on = still || Math.floor(T / (320 - 250 * k)) % 2 === 0;    // вогник на кришці частішає до вибуху
  circle(g, cx + w * 0.45, cy - r * 0.82, r * 0.09, on ? '#ff3b30' : '#6a1a14');
}
function item(g, k, s) {
  const cx = s / 2, cy = s / 2;
  ellipse(g, cx, cy + s * 0.06, s * 0.4, s * 0.36, 'rgba(20,22,30,0.3)');
  circle(g, cx, cy, s * 0.39, 'rgba(125,255,58,0.25)');
  circle(g, cx, cy, s * 0.35, '#26302c');
  g.strokeStyle = '#8affc0'; g.lineWidth = Math.max(1, s * 0.035);
  g.beginPath(); g.arc(cx, cy, s * 0.35, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = Math.max(1, s * 0.02);
  g.beginPath(); g.arc(cx, cy, s * 0.29, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  if (k === IT_BOMB) capsule(g, cx, cy, s * 0.21, 0, 0, false, true);
  else if (k === IT_FIRE) { circle(g, cx, cy, s * 0.24, '#f6d84a'); trefoil(g, cx, cy, s * 0.2, '#1c1c20'); }
  else if (k === IT_SPEED) poly(g, [[cx + s * 0.06, cy - s * 0.27], [cx - s * 0.15, cy + s * 0.04], [cx - s * 0.01, cy + s * 0.04], [cx - s * 0.07, cy + s * 0.27], [cx + s * 0.15, cy - s * 0.06], [cx + s * 0.01, cy - s * 0.06]], '#ffe14a');
  else if (k === IT_PASS) portal(g, cx, cy, s * 0.25, 0);
  else if (k === IT_RESIST) {                                        // захисні окуляри
    line(g, cx - s * 0.28, cy, cx + s * 0.28, cy, s * 0.05, '#4a3020');
    for (const sx of [-1, 1]) { circle(g, cx + sx * s * 0.12, cy, s * 0.11, BRASS); circle(g, cx + sx * s * 0.12, cy, s * 0.08, '#9ae8ff'); circle(g, cx + sx * s * 0.12 - s * 0.03, cy - s * 0.03, s * 0.025, '#fff'); }
    line(g, cx - s * 0.02, cy, cx + s * 0.02, cy, s * 0.04, BRASS);
  } else if (k === IT_REMOTE) remoteIcon(g, cx, cy, s * 0.95, '#2a3a30', '#ff3b30', ACID);
}

// ---------- Бомба — капсула із зеленим ядром ----------
function bomb(g, x, y, s, k, T) {
  const sc = 1 + bombBeat(k, T) * 0.6, cx = x + s / 2, cy = y + s * 0.5;
  ellipse(g, cx, y + s * 0.88, s * 0.24, s * 0.07, 'rgba(20,22,30,0.35)');
  capsule(g, cx, cy, s * 0.32 * sc, k, T, bombFlash(k, T), false);
}

// ---------- Шалений учений: халат кольору гравця, кудлате волосся, окуляри-лупи ----------
function player(g, p, s, T, { col, walk, bob, dead }) {
  const edge = luma(col) > 0.8 ? 'rgba(0,0,0,0.35)' : shade(col, -0.4), hair = HAIR[p.c % HAIR.length] || HAIR[0];
  for (const [sx, w] of [[-1, walk], [1, -walk]]) {
    line(g, sx * s * 0.08, s * 0.2, sx * s * 0.09, s * 0.34 + w * s * 0.05, s * 0.1, '#3a3f4a');
    ellipse(g, sx * s * 0.1, s * 0.38 + w * s * 0.05, s * 0.08, s * 0.045, '#1a1a1e');
  }
  for (const sx of [-1, 1]) {                                         // рукави й руки
    line(g, sx * s * 0.17, s * 0.0 - bob, sx * s * 0.25, s * 0.14 - bob - sx * walk * s * 0.04, s * 0.085, col);
    circle(g, sx * s * 0.26, s * 0.17 - bob - sx * walk * s * 0.04, s * 0.04, SKIN);
  }
  g.fillStyle = col;                                                  // халат розширюється донизу
  g.beginPath(); g.moveTo(-s * 0.16, -s * 0.06 - bob); g.lineTo(s * 0.16, -s * 0.06 - bob); g.lineTo(s * 0.21, s * 0.27 - bob); g.lineTo(-s * 0.21, s * 0.27 - bob); g.closePath(); g.fill();
  g.strokeStyle = edge; g.lineWidth = Math.max(1, s * 0.018); g.lineJoin = 'round'; g.stroke();
  if (p.dr !== 1) {
    poly(g, [[-s * 0.07, -s * 0.06 - bob], [s * 0.07, -s * 0.06 - bob], [0, s * 0.09 - bob]], '#e8eef0');   // сорочка
    poly(g, [[-s * 0.02, -s * 0.03 - bob], [s * 0.02, -s * 0.03 - bob], [s * 0.025, s * 0.06 - bob], [0, s * 0.09 - bob], [-s * 0.025, s * 0.06 - bob]], ACID_D);   // краватка
    g.beginPath(); g.moveTo(-s * 0.07, -s * 0.06 - bob); g.lineTo(-s * 0.01, s * 0.12 - bob); g.lineTo(-s * 0.01, s * 0.27 - bob);
    g.moveTo(s * 0.07, -s * 0.06 - bob); g.lineTo(s * 0.01, s * 0.12 - bob); g.stroke();
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(s * 0.06, s * 0.04 - bob, s * 0.08, s * 0.06);   // кишеня з ручками
    line(g, s * 0.08, s * 0.05 - bob, s * 0.08, s * 0.0 - bob, s * 0.018, '#e53935');
    line(g, s * 0.115, s * 0.05 - bob, s * 0.115, s * 0.01 - bob, s * 0.018, '#1e88e5');
  } else {
    line(g, 0, s * 0.1 - bob, 0, s * 0.27 - bob, s * 0.015, edge);
    g.fillStyle = edge; g.fillRect(-s * 0.08, s * 0.08 - bob, s * 0.16, s * 0.03);
  }
  const hy = -s * 0.2 - bob;
  circle(g, 0, hy, s * 0.15, SKIN);
  for (const [a, r] of [[-2.9, 0.07], [-2.4, 0.075], [-1.9, 0.07], [-1.25, 0.07], [-0.7, 0.075], [-0.2, 0.07], [-1.57, 0.06]]) {   // кудлате волосся
    circle(g, Math.cos(a) * s * 0.15, hy + Math.sin(a) * s * 0.14, s * r, hair);
  }
  if (p.dr === 1) {
    circle(g, 0, hy, s * 0.15, hair);
    for (const sx of [-1, 1]) circle(g, sx * s * 0.13, hy + s * 0.04, s * 0.06, hair);
    g.strokeStyle = 'rgba(0,0,0,0.22)'; g.lineWidth = Math.max(1, s * 0.015); g.lineCap = 'round';   // кучері
    for (const [cx, cy] of [[-0.07, -0.08], [0.05, -0.1], [-0.02, 0.03], [0.09, 0.02], [-0.1, 0.05]]) { g.beginPath(); g.arc(s * cx, hy + s * cy, s * 0.03, 0.3, 3.6); g.stroke(); }
    line(g, -s * 0.15, hy - s * 0.01, s * 0.15, hy - s * 0.01, s * 0.035, '#4a3020');   // ремінець окулярів
    return;
  }
  const fx = (DX[p.dr] || 0) * s * 0.05, fy = p.dr === 3 || !p.dr ? s * 0.015 : 0;
  for (const sx of [-1, 1]) circle(g, sx * s * 0.15, hy + s * 0.02, s * 0.04, hair);  // бакенбарди
  line(g, -s * 0.15, hy - s * 0.01, s * 0.15, hy - s * 0.01, s * 0.03, '#4a3020');
  for (const ex of [-0.065, 0.065]) {                                 // окуляри-лупи: великі очі за склом
    const ox = ex * s + fx, oy = hy - s * 0.005 + fy;
    circle(g, ox, oy, s * 0.068, BRASS);
    circle(g, ox, oy, s * 0.052, '#e4f8ff');
    if (dead) {
      g.strokeStyle = '#1a1a22'; g.lineWidth = Math.max(1, s * 0.022);
      const e = s * 0.025;
      g.beginPath(); g.moveTo(ox - e, oy - e); g.lineTo(ox + e, oy + e); g.moveTo(ox + e, oy - e); g.lineTo(ox - e, oy + e); g.stroke();
    } else {
      const lx = (DX[p.dr] || 0) * s * 0.014, ly = (DY[p.dr] || 0) * s * 0.012;
      circle(g, ox + lx, oy + ly, s * 0.03, '#1a1a22');
      circle(g, ox + lx - s * 0.01, oy + ly - s * 0.01, s * 0.009, '#fff');
    }
  }
  g.strokeStyle = '#7a3a2a'; g.lineWidth = Math.max(1, s * 0.016); g.lineCap = 'round';   // божевільна усмішка
  g.beginPath(); g.moveTo(fx - s * 0.05, hy + s * 0.085 + fy);
  for (let j = 1; j <= 4; j++) g.lineTo(fx - s * 0.05 + j * s * 0.025, hy + s * (j % 2 ? 0.1 : 0.085) + fy);
  g.stroke();
}

// Силует двійника: халат-привид і кудлата голова, зсунуті на (dx, dy)
function twin(g, s, wob, dx, dy, color) {
  g.save(); g.translate(dx, dy);
  g.fillStyle = color; ghostPath(g, s, wob, 0.22); g.fill();
  circle(g, 0, -s * 0.28, s * 0.13, color);
  for (const a of [-2.8, -2.2, -1.57, -0.95, -0.35]) circle(g, Math.cos(a) * s * 0.13, -s * 0.28 + Math.sin(a) * s * 0.12, s * 0.06, color);
  g.restore();
}

// ---------- Монстри: 0 — триокий слизовик, 1 — жук-паразит (головою за рухом), 2 — двійник з іншого виміру ----------
function monster(g, m, s, T, wob) {
  const ex = (DX[m.d] || 0) * s * 0.035, ey = (DY[m.d] || 0) * s * 0.025;
  if (m.k === 0) {
    const sq = wob * 0.05;
    g.fillStyle = '#b44fd6';
    g.beginPath(); g.moveTo(-s * 0.33 * (1 + sq), s * 0.3);
    g.bezierCurveTo(-s * 0.38, -s * 0.06, -s * 0.22, -s * 0.3 * (1 - sq), 0, -s * 0.3 * (1 - sq));
    g.bezierCurveTo(s * 0.22, -s * 0.3 * (1 - sq), s * 0.38, -s * 0.06, s * 0.33 * (1 + sq), s * 0.3);
    g.closePath(); g.fill();
    ellipse(g, 0, s * 0.27, s * 0.3 * (1 + sq), s * 0.06, '#7a2a9e');
    for (const [fx, h] of [[-0.2, 0.06], [0.05, 0.09], [0.22, 0.05]]) ellipse(g, s * fx, s * (0.3 + h / 2), s * 0.035, s * h / 2, '#b44fd6');
    ellipse(g, -s * 0.12, -s * 0.16, s * 0.1, s * 0.05, 'rgba(255,255,255,0.3)', -0.5);
    for (const [fx, fy] of [[0.18, 0.12], [-0.22, 0.14], [0.1, -0.2]]) circle(g, s * fx, s * fy, s * 0.03, 'rgba(255,190,255,0.45)');
    for (const [fx, fy, r] of [[-0.14, -0.05, 0.065], [0.0, -0.16, 0.08], [0.14, -0.04, 0.055]]) {   // три ока різного розміру
      circle(g, s * fx, s * fy, s * r, '#f6ffd0');
      circle(g, s * fx + ex * r / 0.07, s * fy + ey, s * r * 0.5, '#7dd62a');
      circle(g, s * fx + ex * r / 0.07, s * fy + ey, s * r * 0.25, '#1a0a1e');
    }
    g.fillStyle = '#3a0a3e';
    g.beginPath(); g.ellipse(ex, s * 0.1, s * 0.1, s * 0.045, 0, 0, Math.PI); g.fill();
    poly(g, [[ex - s * 0.04, s * 0.1], [ex - s * 0.015, s * 0.1], [ex - s * 0.028, s * 0.135]], '#fff');
    return;
  }
  if (m.k === 1) {
    const a = m.d ? Math.atan2(DY[m.d], DX[m.d]) : 0;
    g.save(); g.rotate(a);
    g.strokeStyle = '#1e1630'; g.lineWidth = Math.max(1, s * 0.035); g.lineCap = 'round'; g.lineJoin = 'round';
    for (let j = 0; j < 3; j++) {                                     // лапки перебирають
      const x0 = -s * 0.06 + j * s * 0.1;
      for (const sy of [-1, 1]) {
        const sw = Math.sin(T / 55 + j * 2.1 + m.i + (sy > 0 ? Math.PI : 0)) * s * 0.045;
        g.beginPath(); g.moveTo(x0, sy * s * 0.07); g.lineTo(x0 + s * 0.04 + sw, sy * s * 0.2); g.lineTo(x0 - s * 0.02 + sw * 1.3, sy * s * 0.29); g.stroke();
      }
    }
    ellipse(g, -s * 0.15, 0, s * 0.2, s * 0.15, '#4b3a9a');            // черевце
    g.strokeStyle = '#2e2266'; g.lineWidth = Math.max(1, s * 0.02);
    for (const fx of [-0.24, -0.16, -0.08]) { g.beginPath(); g.arc(s * (fx + 0.12), 0, s * 0.14, Math.PI * 0.72, Math.PI * 1.28); g.stroke(); }
    for (const [fx, fy] of [[-0.2, -0.06], [-0.12, 0.07], [-0.27, 0.04]]) circle(g, s * fx, s * fy, s * 0.025, ACID);
    ellipse(g, s * 0.06, 0, s * 0.1, s * 0.11, '#5a48b0');
    ellipse(g, s * 0.2, 0, s * 0.085, s * 0.085, '#3a2c80');
    g.strokeStyle = '#c8a8ff'; g.lineWidth = Math.max(1, s * 0.015);   // вусики
    for (const sy of [-1, 1]) { g.beginPath(); g.moveTo(s * 0.24, sy * s * 0.05); g.quadraticCurveTo(s * 0.34, sy * s * 0.1, s * 0.38 + Math.sin(T / 120 + m.i) * s * 0.02, sy * s * 0.17); g.stroke(); }
    g.strokeStyle = '#f0e0a8'; g.lineWidth = Math.max(1, s * 0.025);  // жвала
    for (const sy of [-1, 1]) { g.beginPath(); g.moveTo(s * 0.26, sy * s * 0.035); g.quadraticCurveTo(s * 0.34, sy * s * 0.04, s * 0.35, sy * s * 0.005); g.stroke(); }
    for (const sy of [-1, 1]) { circle(g, s * 0.235, sy * s * 0.045, s * 0.03, '#ff3b30'); circle(g, s * 0.245, sy * s * 0.05, s * 0.01, '#fff'); }
    g.restore();
    return;
  }
  const flick = Math.sin(T / 47 + m.i * 3.1) > 0.82, jx = flick ? s * 0.035 : 0, bob = wob * s * 0.03;
  g.strokeStyle = 'rgba(125,255,58,0.85)'; g.lineWidth = Math.max(1, s * 0.03);   // портал під ногами
  ellipse(g, 0, s * 0.33, s * 0.25, s * 0.065, 'rgba(125,255,58,0.3)');
  g.beginPath(); g.ellipse(0, s * 0.33, s * 0.25, s * 0.065, 0, 0, TAU); g.stroke();
  const a0 = g.globalAlpha;
  g.globalAlpha = a0 * 0.55;
  twin(g, s, wob, -s * 0.03 - jx, s * 0.06 - bob, '#ff3bd0');                                // розщеплення кольорів
  twin(g, s, wob, s * 0.03 + jx, s * 0.06 - bob, '#3bf0ff');
  g.globalAlpha = a0;
  twin(g, s, wob, jx * 0.5, s * 0.06 - bob, '#d8fff4');
  const hy = -s * 0.22 - bob + jx * 0.2;
  g.strokeStyle = 'rgba(40,120,110,0.5)'; g.lineWidth = Math.max(1, s * 0.015);
  g.beginPath(); g.moveTo(-s * 0.06 + jx * 0.5, -s * 0.08 - bob); g.lineTo(jx * 0.5, s * 0.08 - bob); g.lineTo(s * 0.06 + jx * 0.5, -s * 0.08 - bob); g.stroke();
  for (const sx of [-1, 1]) {                                         // окуляри з порожнім зеленим світлом
    const ox = sx * s * 0.062 + ex + jx * 0.5;
    circle(g, ox, hy, s * 0.055, '#2a6a60');
    circle(g, ox, hy, s * 0.04, ACID);
    circle(g, ox, hy, s * 0.018, '#f0ffe0');
  }
}

export default {
  name: 'Лабораторія порталів',
  bg: '#12061f',
  backdrop,
  shadow: 'rgba(10,0,20,0.6)',
  emoji: { bomb: '🧪', fire: '☢️', speed: '⚡', pass: '🌀', resist: '🥽', remote: '📟' },
  fire: ['#169a3a', '#6dff3a', '#effff0'],
  burn: ['#5aff3a', 'rgba(220,255,160,0)'],
  blocks: 3,
  floor, stone, block, wall, item, bomb, player, monster,
};
