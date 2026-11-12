// japan.js — «Японія»: татамі з облямівкою, стовпи — сірі кам'яні плити з ліхтарем-торо в рельєфі (на всю клітинку),
// рамка — мур замку з тесаного каменю; блоки — предмети з тінню: кадомацу з бамбука, ширми, діжки саке, червоні ліхтарі;
// стіни — мур замку з білою штукатуркою під чорною черепицею. Гравці — ніндзя в масках кольору гравця, з мечем за спиною;
// тануки, червоний демон-óні з дубиною, примара юрей. Бомби — чорні кулі ніндзя з ґнотом. Вогонь — рожево-червоний, як сакура.
// Тло — світанок: сонце, Фудзі, пагода, торії, гілки сакури й пелюстки. Бонуси: 💣 бомба, 🎇 вогонь (бенгальський вогник),
// 🍃 швидкість, 💨 прохід (димова завіса), ⛩️ стійкість, 🥁 детонатор (тайко).
import { DX, DY, IT_BOMB, IT_FIRE, IT_SPEED, IT_PASS, IT_RESIST, IT_REMOTE } from '../sim.js';
import { TAU, rr, rnd, luma, shade, circle, ellipse, line, poly, bombShape, bombBeat, bombFlash, pillarShade, spark } from './common.js';

const MAT = '#cfc78e', MAT2 = '#c9c087', HERI = '#3e5640', STONE = '#6e6a63', STONE_HI = '#86827a', STONE_LO = '#4d4a45';
const RED = '#c8202e', SKIN = '#f0c8a0', INK = '#1c1a20', WOOD = '#6b3f22', PAPER = '#f6efdc';

// ---------- Тло ----------
function blossom(g, x, y, r) {
  for (let j = 0; j < 5; j++) {
    const a = j * TAU / 5 - Math.PI / 2;
    ellipse(g, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.55, r * 0.4, '#f9c6d5', a);
  }
  circle(g, x, y, r * 0.22, '#e0607e');
}
// Гілка сакури з кута: (x0, y0) — звідки, dir ±1 — у який бік росте
function branch(g, x0, y0, dir, u) {
  g.save(); g.translate(x0, y0); g.scale(dir * u, u);                 // далі — координати в u від кута
  g.strokeStyle = '#3a2422'; g.lineCap = 'round';
  g.lineWidth = 10;
  g.beginPath(); g.moveTo(-10, 0); g.quadraticCurveTo(70, 40, 170, 66); g.stroke();
  g.lineWidth = 5;
  g.beginPath(); g.moveTo(70, 38); g.quadraticCurveTo(95, 95, 78, 150); g.stroke();
  g.beginPath(); g.moveTo(120, 54); g.quadraticCurveTo(160, 30, 200, 34); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(30, 18); g.quadraticCurveTo(40, 50, 28, 80); g.stroke();
  for (const [px, py] of [[170, 66], [200, 34], [78, 150], [28, 80], [130, 60], [95, 110], [160, 42], [50, 28], [86, 128], [110, 40], [185, 76], [40, 60]])
    for (let j = 0; j < 3; j++) blossom(g, px + (rnd(px * 7 + j, 1) - 0.5) * 26, py + (rnd(py * 5 + j, 2) - 0.5) * 22, 7 + rnd(px + j, 3) * 4);
  g.restore();
}
// Пагода: (cx, base) — середина низу, u — масштаб. П'ять ярусів на кам'яній платформі; далі — координати в u від низу
function pagoda(g, cx, base, u) {
  g.save(); g.translate(cx, base); g.scale(u, u);
  g.fillStyle = '#2b2333'; g.fillRect(-215, -18, 430, 18);                    // платформа у два уступи й сходи
  g.fillStyle = '#433852'; g.fillRect(-215, -18, 430, 3);
  g.fillStyle = '#332a3d'; g.fillRect(-185, -36, 370, 18);
  g.fillStyle = '#4a3e5a'; g.fillRect(-185, -36, 370, 3);
  g.fillStyle = '#3d3348'; g.fillRect(-30, -36, 60, 36);
  g.fillStyle = 'rgba(0,0,0,0.3)'; for (let j = 1; j < 6; j++) g.fillRect(-30, -36 + j * 6, 60, 1.5);
  for (const x of [-160, 160]) stoneLantern(g, x, -36);
  let y = -36;
  for (let t = 0; t < 5; t++) {
    const bw = 220 - 32 * t, bh = 66 - 5 * t, rw = bw + 150 - 14 * t, rt = 32 - 2 * t, lift = 24 - 2 * t;
    pagodaTier(g, y, bw, bh, t);
    y = pagodaRoof(g, y - bh + 4, bw, rw, rt, lift) + 4;
  }
  g.fillStyle = '#3a3040'; g.fillRect(-16, y - 14, 32, 14);                    // шпиль: дев'ять кілець, полум'я, перлина
  g.fillStyle = '#9a7a32'; g.fillRect(-3, y - 124, 6, 112);
  for (let j = 0; j < 9; j++) ellipse(g, 0, y - 26 - j * 9, 15 - j * 0.7, 3, j % 2 ? '#c9a04a' : '#e0bb5a');
  for (const a of [-0.9, -0.3, 0.3, 0.9]) ellipse(g, Math.sin(a) * 9, y - 116 - Math.cos(a) * 4, 3.5, 9, '#d8b04a', a);
  circle(g, 0, y - 132, 6, '#f2d27a');
  circle(g, -2, y - 134, 2, '#fff4c8');
  g.restore();
}
// Ярус пагоди: стіни з колонами й ґратчастими вікнами (частина світиться), балкон, кронштейни під дахом
function pagodaTier(g, y, bw, bh, t) {
  g.fillStyle = '#7a2634'; g.fillRect(-bw / 2, y - bh, bw, bh);
  const n = t < 2 ? 5 : t < 4 ? 4 : 3, step = (bw - 8) / (n - 1);
  for (let k = 0; k < n - 1; k++) {
    const x = -bw / 2 + 4 + k * step + 7, w = step - 14, wy = y - bh * 0.82, wh = bh * 0.5;
    g.fillStyle = rnd(t * 7 + k, 11) < 0.55 ? 'rgba(255,196,120,0.9)' : '#3a1620';
    g.fillRect(x, wy, w, wh);
    g.fillStyle = '#4a1a1e';
    for (const f of [1 / 3, 2 / 3]) { g.fillRect(x + w * f - 0.8, wy, 1.6, wh); g.fillRect(x, wy + wh * f - 0.8, w, 1.6); }
  }
  g.fillStyle = '#a33a4a'; for (let k = 0; k < n; k++) g.fillRect(-bw / 2 + k * step, y - bh, 8, bh);   // колони
  g.fillStyle = '#3a1a24'; g.fillRect(-bw / 2 - 4, y - bh, bw + 8, 8);
  g.fillStyle = '#b07a3a'; for (let k = 0; k < n; k++) { g.fillRect(-bw / 2 + k * step - 3, y - bh + 8, 14, 4); g.fillRect(-bw / 2 + k * step, y - bh + 12, 8, 3); }
  if (t === 0) return;
  g.fillStyle = '#4a1a24'; g.fillRect(-bw / 2 - 12, y - 4, bw + 24, 4);              // балкон з поруччям
  g.fillRect(-bw / 2 - 12, y - 16, bw + 24, 3);
  for (let x = -bw / 2 - 10; x <= bw / 2 + 10; x += 9) g.fillRect(x, y - 15, 2, 12);
}
// Дах з піднятими кінцями й черепицею; повертає верх даху
function pagodaRoof(g, yb, bw, rw, rt, lift) {
  const yt = yb - rt;
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(-bw / 2, yb, bw, 10);            // тінь під стріхою
  g.fillStyle = '#241d2e';
  g.beginPath(); g.moveTo(-bw * 0.4, yt); g.lineTo(bw * 0.4, yt);
  g.quadraticCurveTo(rw * 0.36, yb - rt * 0.15, rw / 2, yb - lift);
  g.lineTo(rw / 2 - 6, yb - lift + 9);
  g.quadraticCurveTo(rw * 0.3, yb + 5, bw * 0.5, yb + 3); g.lineTo(-bw * 0.5, yb + 3);
  g.quadraticCurveTo(-rw * 0.3, yb + 5, -rw / 2 + 6, yb - lift + 9);
  g.lineTo(-rw / 2, yb - lift);
  g.quadraticCurveTo(-rw * 0.36, yb - rt * 0.15, -bw * 0.4, yt);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,220,240,0.1)'; g.lineWidth = 1.5;                    // черепиця
  g.beginPath();
  for (let k = -6; k <= 6; k++) { const f = k / 6; g.moveTo(f * bw * 0.4, yt + 2); g.lineTo(f * rw * 0.47, yb - lift * f * f + 2); }
  g.stroke();
  g.fillStyle = '#3a3048'; g.fillRect(-bw * 0.4, yt - 3, bw * 0.8, 5);           // гребінь
  g.strokeStyle = '#c9a04a'; g.lineWidth = 2.5;                                  // золоте обрамування стріхи
  g.beginPath(); g.moveTo(-rw / 2 + 6, yb - lift + 9); g.quadraticCurveTo(-rw * 0.3, yb + 5, -bw * 0.5, yb + 3);
  g.lineTo(bw * 0.5, yb + 3); g.quadraticCurveTo(rw * 0.3, yb + 5, rw / 2 - 6, yb - lift + 9); g.stroke();
  for (const sx of [-1, 1]) {                                                    // дзвіночки на кінцях
    line(g, sx * (rw / 2 - 3), yb - lift + 5, sx * (rw / 2 - 3), yb - lift + 18, 1.2, '#8a7040');
    ellipse(g, sx * (rw / 2 - 3), yb - lift + 21, 3.5, 4.5, '#d8b04a');
    circle(g, sx * rw / 2, yb - lift, 3, '#e0bb5a');
  }
  return yt;
}
// Кам'яний ліхтар-торо біля пагоди (у тих самих одиницях u)
function stoneLantern(g, x, y) {
  g.fillStyle = '#3a3346'; g.fillRect(x - 12, y - 8, 24, 8); g.fillRect(x - 4, y - 34, 8, 26);
  g.fillRect(x - 13, y - 40, 26, 6);
  g.fillStyle = 'rgba(255,190,110,0.9)'; g.fillRect(x - 8, y - 56, 16, 16);
  g.fillStyle = '#3a3346'; g.fillRect(x - 10, y - 56, 4, 16); g.fillRect(x + 6, y - 56, 4, 16);
  poly(g, [[x - 18, y - 56], [x + 18, y - 56], [x + 6, y - 68], [x - 6, y - 68]], '#2c2638');
  circle(g, x, y - 71, 3.5, '#2c2638');
}
function torii(g, cx, base, h, c1, c2) {
  const w = h * 0.9, t = h * 0.07;
  for (const sx of [-1, 1]) { g.fillStyle = c1; g.fillRect(cx + sx * w * 0.32 - t / 2, base - h * 0.86, t, h * 0.86); }
  g.fillStyle = c1; g.fillRect(cx - w * 0.42, base - h * 0.7, w * 0.84, t * 0.8);              // нукі
  g.fillRect(cx - w * 0.05, base - h * 0.86, w * 0.1, h * 0.16);
  g.fillStyle = c1;                                                    // касагі — вигнута верхня балка
  g.beginPath(); g.moveTo(cx - w * 0.56, base - h * 0.97); g.quadraticCurveTo(cx, base - h * 0.86, cx + w * 0.56, base - h * 0.97);
  g.lineTo(cx + w * 0.5, base - h * 0.86); g.quadraticCurveTo(cx, base - h * 0.8, cx - w * 0.5, base - h * 0.86); g.closePath(); g.fill();
  g.fillStyle = c2;
  g.beginPath(); g.moveTo(cx - w * 0.58, base - h * 1.01); g.quadraticCurveTo(cx, base - h * 0.9, cx + w * 0.58, base - h * 1.01);
  g.lineTo(cx + w * 0.56, base - h * 0.96); g.quadraticCurveTo(cx, base - h * 0.85, cx - w * 0.56, base - h * 0.96); g.closePath(); g.fill();
}

// Силует Фудзі (шлях): (fx, fy) — середина вершини, foot — висота підніжжя
function fuji(g, fx, fy, foot, u) {
  g.beginPath(); g.moveTo(fx - 330 * u, foot);
  g.quadraticCurveTo(fx - 130 * u, fy + 130 * u, fx - 42 * u, fy); g.lineTo(fx + 42 * u, fy);
  g.quadraticCurveTo(fx + 130 * u, fy + 130 * u, fx + 330 * u, foot); g.closePath();
}

function backdrop(g, W, H) {
  const sky = g.createLinearGradient(0, 0, 0, H * 0.82);
  sky.addColorStop(0, '#221b44'); sky.addColorStop(0.45, '#673e72'); sky.addColorStop(0.78, '#dc7a86'); sky.addColorStop(1, '#f6c08e');
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  const u = H / 900;
  circle(g, W * 0.87, H * 0.4, 92 * u, 'rgba(255,130,100,0.3)');
  circle(g, W * 0.87, H * 0.4, 66 * u, '#ff7458');
  const fx = W * 0.94, fy = H * 0.5;                                   // Фудзі
  fuji(g, fx, fy, H * 0.84, u); g.fillStyle = '#4a3b6c'; g.fill();
  g.save(); fuji(g, fx, fy, H * 0.84, u); g.clip();
  g.fillStyle = '#f4e6ef';
  g.beginPath(); g.moveTo(fx + 200 * u, fy - 20 * u); g.lineTo(fx - 200 * u, fy - 20 * u);
  for (let j = 0; j <= 12; j++) g.lineTo(fx + (-150 + j * 25) * u, fy + (j % 2 ? 58 : 84) * u + (j % 3) * 6 * u);
  g.closePath(); g.fill();
  g.fillStyle = 'rgba(120,90,160,0.35)';
  for (const dx of [-30, 10, 45]) { g.beginPath(); g.moveTo(fx + dx * u, fy + 10 * u); g.lineTo(fx + (dx - 12) * u, fy + 70 * u); g.lineTo(fx + (dx + 4) * u, fy + 70 * u); g.closePath(); g.fill(); }
  g.restore();
  g.fillStyle = 'rgba(255,225,232,0.22)'; g.fillRect(0, H * 0.76, W, H * 0.07);   // туман
  g.fillStyle = '#2a2142';                                               // пагорби
  g.beginPath(); g.moveTo(0, H * 0.86);
  for (let j = 0; j <= 10; j++) g.quadraticCurveTo(W * (j - 0.5) / 10, H * (0.8 + (j % 2) * 0.04), W * j / 10, H * 0.84);
  g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  pagoda(g, W * 0.1, H * 0.92, u);
  torii(g, W * 0.9, H * 0.98, 150 * u, '#b8202c', '#1a1420');
  branch(g, 0, H * 0.04, 1, u);
  branch(g, W, H * 0.1, -1, u);
  for (let j = 0; j < 110; j++) {                                       // пелюстки
    const r = (3 + rnd(j, 3) * 3.5) * u;
    ellipse(g, rnd(j, 1) * W, rnd(j, 2) * H, r, r * 0.55, rnd(j, 4) < 0.5 ? '#f9c6d5' : '#f3a9bf', rnd(j, 5) * 3);
  }
}

// ---------- Поле ----------
// Татамі: плетіння вздовж (у шаховому порядку — то вздовж, то впоперек), облямівка-хері на довгих боках
function floor(g, px, py, s, x, y, map) {
  const i = y * map.GW + x, hz = (x + y) % 2 === 0;
  g.fillStyle = hz ? MAT : MAT2; g.fillRect(px, py, s, s);
  g.fillStyle = 'rgba(120,112,50,0.16)';
  const w = Math.max(1, s * 0.012);
  for (let j = 1; j < 10; j++) { const t = j / 10; if (hz) g.fillRect(px, py + s * t, s, w); else g.fillRect(px + s * t, py, w, s); }
  g.fillStyle = 'rgba(255,255,230,0.14)';
  if (hz) g.fillRect(px, py + s * 0.08, s, s * 0.3); else g.fillRect(px + s * 0.08, py, s * 0.3, s);
  g.fillStyle = HERI;
  const b = Math.max(1, Math.round(s * 0.045));
  if (hz) { g.fillRect(px, py, s, b); g.fillRect(px, py + s - b, s, b); } else { g.fillRect(px, py, b, s); g.fillRect(px + s - b, py, b, s); }
  if (rnd(i, 5) < 0.09) ellipse(g, px + s * (0.25 + rnd(i, 6) * 0.5), py + s * (0.3 + rnd(i, 7) * 0.4), s * 0.045, s * 0.028, '#f4a9be', rnd(i, 8) * 3);
  pillarShade(g, map, x, y, px, py, s, 'rgba(40,40,20,0.22)');
}

// Рамка — мур замку з тесаного каменю; стовп — сіра плита з кам'яним ліхтарем-торо в рельєфі
function stone(g, x, y, s, border, cx, cy, map) {
  const i = cy * map.GW + cx, d = Math.max(1, Math.round(s * 0.07));
  if (border) {
    g.fillStyle = '#2e2b28'; g.fillRect(x, y, s, s);
    const rows = 3, h = s / rows;
    for (let r = 0; r < rows; r++) {
      const off = ((r + cy) % 2) * 0.5, n = 2;
      for (let c = -1; c < n + 1; c++) {
        const x0 = x + (c + off) * s / n, x1 = x0 + s / n;
        const a = Math.max(x, x0 + s * 0.02), b = Math.min(x + s, x1 - s * 0.02);
        if (b <= a) continue;
        const k = rnd(i * 7 + r * 3 + c, 4);
        g.fillStyle = k < 0.33 ? '#56514a' : k < 0.66 ? '#5f5a52' : '#4e4a44';
        rr(g, a, y + r * h + s * 0.02, b - a, h - s * 0.04, s * 0.04); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(a, y + r * h + s * 0.02, b - a, Math.max(1, s * 0.03));
      }
    }
    return;
  }
  g.fillStyle = STONE_LO; g.fillRect(x, y, s, s);
  g.fillStyle = STONE_HI; g.fillRect(x, y, s - d, s - d);
  g.fillStyle = STONE; g.fillRect(x + d, y + d, s - 2 * d, s - 2 * d);
  for (let j = 0; j < 4; j++) circle(g, x + s * (0.15 + rnd(i, j) * 0.7), y + s * (0.15 + rnd(i, j + 9) * 0.7), s * (0.02 + rnd(i, j + 4) * 0.02), 'rgba(0,0,0,0.14)');
  const c = x + s / 2, rel = 'rgba(40,36,34,0.42)', hi = 'rgba(255,255,255,0.12)';   // торо: дах, ліхтар, шия, основа
  g.fillStyle = rel;
  g.beginPath(); g.moveTo(c - s * 0.3, y + s * 0.34); g.quadraticCurveTo(c - s * 0.12, y + s * 0.26, c, y + s * 0.16);
  g.quadraticCurveTo(c + s * 0.12, y + s * 0.26, c + s * 0.3, y + s * 0.34); g.closePath(); g.fill();
  circle(g, c, y + s * 0.14, s * 0.035, rel);
  g.fillRect(c - s * 0.15, y + s * 0.34, s * 0.3, s * 0.18);
  g.fillStyle = 'rgba(255,190,110,0.32)'; g.fillRect(c - s * 0.07, y + s * 0.37, s * 0.14, s * 0.11);
  g.fillStyle = rel;
  g.fillRect(c - s * 0.2, y + s * 0.52, s * 0.4, s * 0.05);
  g.fillRect(c - s * 0.06, y + s * 0.57, s * 0.12, s * 0.16);
  g.fillRect(c - s * 0.2, y + s * 0.73, s * 0.4, s * 0.08);
  g.fillStyle = hi; g.fillRect(c - s * 0.2, y + s * 0.52, s * 0.4, Math.max(1, s * 0.015)); g.fillRect(c - s * 0.2, y + s * 0.73, s * 0.4, Math.max(1, s * 0.015));
}

// Блоки: 0 — кадомацу (бамбук), 1 — ширма, 2 — діжка саке, 3 — червоний ліхтар
function block(g, s, v) {
  ellipse(g, s / 2, s * 0.88, s * 0.34, s * 0.08, 'rgba(60,50,20,0.35)');
  if (v === 0) {
    for (const [fx, top, w] of [[0.36, 0.2, 0.15], [0.64, 0.28, 0.15], [0.5, 0.1, 0.17]]) {
      const x = s * (fx - w / 2), wd = s * w, yt = s * top;
      g.fillStyle = '#5aa83a';
      g.beginPath(); g.moveTo(x, yt + wd * 0.6); g.lineTo(x + wd, yt); g.lineTo(x + wd, s * 0.8); g.lineTo(x, s * 0.8); g.closePath(); g.fill();
      ellipse(g, x + wd / 2, yt + wd * 0.3, wd * 0.5, wd * 0.22, '#d9e8a0', -0.55);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + wd * 0.15, yt + wd * 0.6, wd * 0.18, s * 0.8 - yt - wd * 0.6);
      g.fillStyle = '#3d7a26'; g.fillRect(x, s * (top + 0.26), wd, s * 0.025);
    }
    g.fillStyle = '#d9b860'; rr(g, s * 0.2, s * 0.58, s * 0.6, s * 0.28, s * 0.04); g.fill();   // солом'яна обгортка
    g.strokeStyle = '#a8862e'; g.lineWidth = Math.max(1, s * 0.015);
    for (let j = 1; j < 7; j++) { g.beginPath(); g.moveTo(s * (0.2 + j * 0.0857), s * 0.58); g.lineTo(s * (0.2 + j * 0.0857), s * 0.86); g.stroke(); }
    g.fillStyle = '#6b3f22'; g.fillRect(s * 0.2, s * 0.66, s * 0.6, s * 0.035); g.fillRect(s * 0.2, s * 0.77, s * 0.6, s * 0.035);
    for (const [px, py, a] of [[0.24, 0.56, -0.6], [0.76, 0.56, 0.6], [0.3, 0.52, -0.2], [0.7, 0.52, 0.2]]) ellipse(g, s * px, s * py, s * 0.08, s * 0.035, '#2e6b2a', a);
    return;
  }
  if (v === 1) {
    const top = s * 0.14, bot = s * 0.8, xs = [0.12, 0.38, 0.62, 0.88];
    for (let p = 0; p < 3; p++) {
      const x0 = s * xs[p], x1 = s * xs[p + 1], dy = p === 1 ? s * 0.03 : 0;
      g.fillStyle = WOOD; g.fillRect(x0, top + dy, x1 - x0, bot - top);
      g.fillStyle = p === 1 ? '#ece2c8' : PAPER; g.fillRect(x0 + s * 0.03, top + dy + s * 0.03, x1 - x0 - s * 0.06, bot - top - s * 0.06);
      g.fillStyle = 'rgba(107,63,34,0.75)';
      g.fillRect((x0 + x1) / 2 - s * 0.008, top + dy, Math.max(1, s * 0.016), bot - top);
      for (const fy of [0.3, 0.47, 0.64]) g.fillRect(x0, top + dy + (bot - top) * fy, x1 - x0, Math.max(1, s * 0.016));
    }
    circle(g, s * 0.5, s * 0.36, s * 0.07, 'rgba(210,40,50,0.85)');      // червоне сонце на середній
    g.fillStyle = WOOD; g.fillRect(s * 0.14, bot, s * 0.05, s * 0.06); g.fillRect(s * 0.81, bot, s * 0.05, s * 0.06);
    return;
  }
  if (v === 2) {
    g.fillStyle = '#e9dcae'; rr(g, s * 0.16, s * 0.22, s * 0.68, s * 0.62, s * 0.08); g.fill();
    g.fillStyle = 'rgba(160,130,60,0.35)'; for (let j = 0; j < 5; j++) g.fillRect(s * (0.2 + j * 0.13), s * 0.26, Math.max(1, s * 0.012), s * 0.56);
    ellipse(g, s / 2, s * 0.22, s * 0.34, s * 0.08, '#b08048');
    ellipse(g, s / 2, s * 0.22, s * 0.27, s * 0.05, '#c99a5e');
    g.strokeStyle = '#5a3418'; g.lineWidth = Math.max(1, s * 0.03);
    for (const fy of [0.3, 0.76]) { g.beginPath(); g.moveTo(s * 0.16, s * fy); g.lineTo(s * 0.84, s * fy); g.stroke(); }
    g.beginPath(); g.moveTo(s * 0.16, s * 0.3); g.lineTo(s * 0.84, s * 0.76); g.moveTo(s * 0.84, s * 0.3); g.lineTo(s * 0.16, s * 0.76); g.stroke();
    g.fillStyle = '#1d3f8a'; g.fillRect(s * 0.35, s * 0.4, s * 0.3, s * 0.26);
    circle(g, s * 0.5, s * 0.53, s * 0.08, '#f4f0e6');
    circle(g, s * 0.5, s * 0.53, s * 0.04, RED);
    return;
  }
  line(g, s * 0.5, s * 0.06, s * 0.5, s * 0.16, s * 0.025, '#2a2420');
  g.fillStyle = '#1e1a1c'; rr(g, s * 0.32, s * 0.14, s * 0.36, s * 0.08, s * 0.02); g.fill(); rr(g, s * 0.32, s * 0.74, s * 0.36, s * 0.08, s * 0.02); g.fill();
  ellipse(g, s / 2, s * 0.48, s * 0.3, s * 0.29, '#d8332a');
  g.strokeStyle = 'rgba(90,10,10,0.45)'; g.lineWidth = Math.max(1, s * 0.014);
  for (let j = 1; j < 7; j++) { const yy = s * (0.2 + j * 0.08), hw = Math.sqrt(Math.max(0, 1 - ((yy - s * 0.48) / (s * 0.29)) ** 2)) * s * 0.3; g.beginPath(); g.moveTo(s / 2 - hw, yy); g.lineTo(s / 2 + hw, yy); g.stroke(); }
  ellipse(g, s * 0.4, s * 0.38, s * 0.06, s * 0.12, 'rgba(255,220,180,0.35)');
  circle(g, s * 0.5, s * 0.5, s * 0.09, 'rgba(255,240,200,0.9)');
  circle(g, s * 0.5, s * 0.5, s * 0.05, '#d8332a');
}

// Стіна — мур замку: чорна черепиця згори, біла штукатурка, темна балка
function wall(g, s) {
  g.fillStyle = '#f0ece2'; g.fillRect(0, 0, s, s);
  g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, s * 0.42, s, s * 0.08);
  g.fillStyle = '#4a3020'; g.fillRect(0, s * 0.74, s, s * 0.1);
  g.fillStyle = '#3a3a40'; g.fillRect(0, s * 0.84, s, s * 0.16);
  g.fillStyle = 'rgba(255,255,255,0.12)'; for (let j = 0; j < 3; j++) g.fillRect(s * (0.05 + j * 0.33), s * 0.86, s * 0.26, s * 0.04);
  g.fillStyle = '#25252c'; g.fillRect(0, 0, s, s * 0.36);
  g.fillStyle = '#3c3c46';
  for (let j = 0; j < 4; j++) g.fillRect(s * (0.02 + j * 0.25), 0, s * 0.11, s * 0.3);
  for (let j = 0; j < 4; j++) { circle(g, s * (0.125 + j * 0.25), s * 0.32, s * 0.07, '#2e2e36'); circle(g, s * (0.125 + j * 0.25), s * 0.32, s * 0.035, '#45454f'); }
  g.fillStyle = '#4a3020'; g.fillRect(s * 0.4, s * 0.52, s * 0.2, s * 0.14);        // бійниця
  g.fillStyle = '#1a1414'; g.fillRect(s * 0.43, s * 0.55, s * 0.14, s * 0.08);
}

// ---------- Бонуси — на паперовому кружечку з червоною облямівкою ----------
function item(g, k, s) {
  const cx = s / 2, cy = s / 2;
  ellipse(g, cx, s * 0.86, s * 0.26, s * 0.06, 'rgba(60,50,20,0.3)');
  circle(g, cx, cy, s * 0.4, '#b8202c');
  circle(g, cx, cy, s * 0.35, '#f7f0de');
  if (k === IT_BOMB) { ninjaBomb(g, cx - s * 0.02, cy + s * 0.04, s * 0.15, false); spark(g, cx + s * 0.16, cy - s * 0.12, s * 0.8); }
  else if (k === IT_FIRE) {                                           // бенгальський вогник
    line(g, cx - s * 0.2, cy + s * 0.22, cx + s * 0.02, cy - s * 0.02, s * 0.025, '#7a3a8a');
    g.strokeStyle = '#ffb020'; g.lineWidth = Math.max(1, s * 0.018); g.lineCap = 'round';
    g.beginPath();
    for (let j = 0; j < 12; j++) { const a = j * TAU / 12 + 0.2, r1 = s * 0.05, r2 = s * (0.14 + (j % 3) * 0.035); g.moveTo(cx + s * 0.04 + Math.cos(a) * r1, cy - s * 0.04 + Math.sin(a) * r1); g.lineTo(cx + s * 0.04 + Math.cos(a) * r2, cy - s * 0.04 + Math.sin(a) * r2); }
    g.stroke();
    circle(g, cx + s * 0.04, cy - s * 0.04, s * 0.06, '#ff4a2a');
    circle(g, cx + s * 0.04, cy - s * 0.04, s * 0.03, '#fff3b0');
  } else if (k === IT_SPEED) {                                        // лист і вітер
    g.save(); g.translate(cx + s * 0.04, cy); g.rotate(-0.6);
    ellipse(g, 0, 0, s * 0.18, s * 0.09, '#4f9a32');
    line(g, -s * 0.2, 0, s * 0.16, 0, s * 0.015, '#2e6a1e');
    g.restore();
    g.strokeStyle = '#6a8ab0'; g.lineWidth = Math.max(1, s * 0.025); g.lineCap = 'round';
    for (const [dy, l] of [[-0.12, 0.16], [0.02, 0.2], [0.16, 0.13]]) { g.beginPath(); g.moveTo(cx - s * 0.28, cy + s * dy); g.lineTo(cx - s * (0.28 - l), cy + s * dy); g.stroke(); }
  } else if (k === IT_PASS) {                                         // димова завіса
    for (const [dx, dy, r, c] of [[-0.12, 0.08, 0.12, '#8e95a2'], [0.12, 0.08, 0.12, '#8e95a2'], [0, -0.06, 0.15, '#a9afba'], [-0.04, 0.1, 0.11, '#bfc4cd'], [0.1, -0.12, 0.08, '#c9ced6']])
      circle(g, cx + s * dx, cy + s * dy, s * r, c);
    g.strokeStyle = '#6b7280'; g.lineWidth = Math.max(1, s * 0.02);
    g.beginPath(); g.arc(cx, cy - s * 0.04, s * 0.06, 0.5, 4.5); g.stroke();
  } else if (k === IT_RESIST) torii(g, cx, cy + s * 0.24, s * 0.46, '#c8202e', '#1c1a20');
  else if (k === IT_REMOTE) taiko(g, cx, cy + s * 0.03, s);
}
// Тайко: барабан на боці, мембрана, цвяхи, палички
function taiko(g, cx, cy, s) {
  g.fillStyle = '#9a3a22';
  g.beginPath(); g.moveTo(cx - s * 0.18, cy - s * 0.12); g.quadraticCurveTo(cx, cy - s * 0.2, cx + s * 0.18, cy - s * 0.12);
  g.lineTo(cx + s * 0.18, cy + s * 0.12); g.quadraticCurveTo(cx, cy + s * 0.2, cx - s * 0.18, cy + s * 0.12); g.closePath(); g.fill();
  ellipse(g, cx + s * 0.18, cy, s * 0.06, s * 0.13, '#f0e2c0');
  ellipse(g, cx - s * 0.18, cy, s * 0.06, s * 0.13, '#d9c9a2');
  for (let j = 0; j < 5; j++) { const a = -1.2 + j * 0.6; circle(g, cx + s * 0.18 + Math.cos(a) * s * 0.05, cy + Math.sin(a) * s * 0.12, s * 0.012, '#1c1a20'); }
  g.fillStyle = 'rgba(255,220,150,0.3)'; g.fillRect(cx - s * 0.12, cy - s * 0.12, s * 0.2, s * 0.03);
  line(g, cx + s * 0.02, cy - s * 0.3, cx + s * 0.2, cy - s * 0.04, s * 0.03, '#d9b070');
  line(g, cx + s * 0.12, cy - s * 0.32, cx + s * 0.24, cy - s * 0.06, s * 0.03, '#d9b070');
}

// ---------- Бомба — чорна куля ніндзя, перев'язана шнуром ----------
function ninjaBomb(g, cx, cy, r, red) {
  bombShape(g, cx, cy, r, red ? '#e0605a' : '#4a4a58', red ? '#5a0e0a' : '#0c0c12', '#c9a36b');
  g.strokeStyle = red ? '#ffd0c0' : '#b8202c'; g.lineWidth = Math.max(1, r * 0.16);
  g.beginPath(); g.ellipse(cx, cy + r * 0.05, r * 0.98, r * 0.3, 0, 0.1, Math.PI - 0.1); g.stroke();
  g.beginPath(); g.ellipse(cx + r * 0.05, cy, r * 0.3, r * 0.98, 0, -Math.PI / 2 - 0.1, Math.PI / 2 + 0.1, true); g.stroke();
  circle(g, cx + r * 0.42, cy - r * 0.72, r * 0.18, red ? '#ffd0c0' : '#b8202c');
  ellipse(g, cx - r * 0.38, cy - r * 0.42, r * 0.2, r * 0.12, 'rgba(255,255,255,0.35)', -0.6);
}
function bomb(g, x, y, s, k, T) {
  const r = s * (0.27 + bombBeat(k, T)), cx = x + s / 2, cy = y + s * 0.55;
  ellipse(g, cx, y + s * 0.87, s * 0.27, s * 0.07, 'rgba(60,50,20,0.35)');
  ninjaBomb(g, cx, cy, r, bombFlash(k, T));
  spark(g, cx + r * 1.2, cy - r * 1.05, s, '#ff6a8a', '#fff');
}

// ---------- Ніндзя: костюм і маска кольору гравця, прорізь для очей, хвости пов'язки, меч за спиною ----------
function player(g, p, s, T, { col, walk, bob, dead }) {
  const dark = shade(col, -0.35), edge = luma(col) > 0.8 ? 'rgba(0,0,0,0.35)' : luma(col) < 0.3 ? 'rgba(255,255,255,0.25)' : dark;
  const back = p.dr === 1, side = DX[p.dr] || 0, hy = -s * 0.19 - bob;
  for (const [sx, w] of [[-1, walk], [1, -walk]]) {
    line(g, sx * s * 0.09, s * 0.2, sx * s * 0.1, s * 0.33 + w * s * 0.05, s * 0.11, col);
    g.fillStyle = '#26242a'; rr(g, sx * s * 0.1 - s * 0.065, s * 0.32 + w * s * 0.05, s * 0.13, s * 0.08, s * 0.03); g.fill();
  }
  if (!back) line(g, s * 0.2, -s * 0.36 - bob, s * 0.12, -s * 0.2 - bob, s * 0.05, '#2a2228');   // рукоять меча над плечем
  const tw = Math.sin(T / 110 + p.c) * s * 0.03, tx = side ? -side : 1;   // хвости пов'язки — назад від руху
  line(g, tx * s * 0.12, hy - s * 0.04, tx * s * 0.3, hy + s * 0.02 + tw, s * 0.045, dark);
  line(g, tx * s * 0.12, hy - s * 0.02, tx * s * 0.27, hy + s * 0.1 - tw, s * 0.04, dark);
  g.fillStyle = col; rr(g, -s * 0.18, -s * 0.05 - bob, s * 0.36, s * 0.28, s * 0.09); g.fill();
  g.strokeStyle = edge; g.lineWidth = Math.max(1, s * 0.018); g.stroke();
  if (!back) {                                                         // запах кімоно
    g.strokeStyle = dark; g.lineWidth = Math.max(1, s * 0.02);
    g.beginPath(); g.moveTo(-s * 0.08, -s * 0.04 - bob); g.lineTo(s * 0.03, s * 0.1 - bob); g.moveTo(s * 0.08, -s * 0.04 - bob); g.lineTo(s * 0.0, s * 0.04 - bob); g.stroke();
  }
  g.fillStyle = '#26242a'; g.fillRect(-s * 0.18, s * 0.12 - bob, s * 0.36, s * 0.05);   // пояс
  if (back) {                                                          // меч навскіс по спині
    line(g, -s * 0.16, s * 0.16 - bob, s * 0.16, -s * 0.3 - bob, s * 0.05, '#2a2228');
    line(g, s * 0.08, -s * 0.19 - bob, s * 0.17, -s * 0.33 - bob, s * 0.05, '#7a6a50');
    line(g, s * 0.04, -s * 0.13 - bob, s * 0.12, -s * 0.2 - bob, s * 0.08, '#b8923e', 'butt');
  }
  for (const sx of [-1, 1]) {
    line(g, sx * s * 0.2, 0 - bob, sx * s * 0.26, s * 0.12 - bob - sx * walk * s * 0.04, s * 0.08, col);
    circle(g, sx * s * 0.26, s * 0.14 - bob - sx * walk * s * 0.04, s * 0.045, dark);
  }
  circle(g, 0, hy, s * 0.17, col);
  g.strokeStyle = edge; g.lineWidth = Math.max(1, s * 0.018); g.beginPath(); g.arc(0, hy, s * 0.17, 0, TAU); g.stroke();
  if (back) { circle(g, 0, hy + s * 0.02, s * 0.04, dark); return; }      // вузол пов'язки ззаду
  const fx = side * s * 0.06, fy = p.dr === 3 || !p.dr ? s * 0.01 : 0;
  g.fillStyle = SKIN; rr(g, fx - s * 0.13, hy - s * 0.045 + fy, s * 0.26, s * 0.085, s * 0.04); g.fill();
  if (dead) {
    g.strokeStyle = INK; g.lineWidth = Math.max(1, s * 0.022);
    for (const ex of [-0.055, 0.055]) {
      const ox = ex * s + fx, oy = hy + fy, e = s * 0.022;
      g.beginPath(); g.moveTo(ox - e, oy - e); g.lineTo(ox + e, oy + e); g.moveTo(ox + e, oy - e); g.lineTo(ox - e, oy + e); g.stroke();
    }
  } else for (const ex of [-0.055, 0.055]) {
    ellipse(g, ex * s + fx, hy + fy, s * 0.03, s * 0.022, '#fff');
    circle(g, ex * s + fx + side * s * 0.01, hy + fy, s * 0.016, INK);
  }
  line(g, fx - s * 0.1, hy - s * 0.07 + fy, fx - s * 0.03, hy - s * 0.055 + fy, s * 0.018, dark);   // насуплені брови
  line(g, fx + s * 0.1, hy - s * 0.07 + fy, fx + s * 0.03, hy - s * 0.055 + fy, s * 0.018, dark);
}

// ---------- Монстри: 0 — тануки, 1 — червоний óні з дубиною, 2 — примара юрей ----------
function eyes(g, s, ex, y, gap, r, iris = '#111', white = '#fff') {
  for (const sx of [-1, 1]) { circle(g, sx * s * gap + ex, y, s * r, white); circle(g, sx * s * gap + ex * 1.5, y, s * r * 0.5, iris); }
}
function monster(g, m, s, T, wob) {
  const dx = DX[m.d] || 0, ex = dx * s * 0.035, ey = (DY[m.d] || 0) * s * 0.015;
  if (m.k === 0) {
    const tx = dx ? -dx : 1, sw = Math.sin(T / 160 + m.i) * 0.25;   // хвіст у смужку — позаду
    g.save(); g.translate(tx * s * 0.2, s * 0.12); g.rotate(tx * (0.9 + sw));
    ellipse(g, 0, -s * 0.12, s * 0.08, s * 0.16, '#8a5a30');
    for (const fy of [-0.2, -0.1, 0]) ellipse(g, 0, s * fy, s * 0.08, s * 0.025, '#3a2414');
    g.restore();
    for (const sx of [-1, 1]) ellipse(g, sx * s * 0.12, s * 0.32 + (sx * wob) * s * 0.02, s * 0.08, s * 0.05, '#3a2414');
    ellipse(g, 0, s * 0.1, s * 0.24, s * 0.23, '#9a6a3a');
    ellipse(g, 0, s * 0.14, s * 0.15, s * 0.15, '#ecd6a8');
    const hy = -s * 0.15 + wob * s * 0.015;
    for (const sx of [-1, 1]) { circle(g, sx * s * 0.13, hy - s * 0.12, s * 0.06, '#3a2414'); circle(g, sx * s * 0.13, hy - s * 0.12, s * 0.03, '#8a5a30'); }
    ellipse(g, 0, hy, s * 0.2, s * 0.17, '#a87444');
    ellipse(g, 0, hy + s * 0.07, s * 0.1, s * 0.07, '#ecd6a8');
    for (const sx of [-1, 1]) ellipse(g, sx * s * 0.08 + ex, hy - s * 0.01, s * 0.065, s * 0.05, '#3a2414', sx * 0.3);   // «маска»
    eyes(g, s, ex, hy - s * 0.01 + ey, 0.08, 0.035);
    circle(g, ex * 0.6, hy + s * 0.05, s * 0.028, '#1a1010');
    g.save(); g.translate(s * 0.02, hy - s * 0.18); g.rotate(-0.4);              // листок на голові
    ellipse(g, 0, 0, s * 0.08, s * 0.04, '#4f9a32');
    line(g, -s * 0.08, 0, s * 0.07, 0, s * 0.01, '#2e6a1e');
    g.restore();
    return;
  }
  if (m.k === 1) {
    const hand = dx || 1, a = -0.6 + Math.sin(T / 120 + m.i) * 0.35;     // дубина в руці з боку руху
    for (const sx of [-1, 1]) ellipse(g, sx * s * 0.11, s * 0.33 + sx * wob * s * 0.02, s * 0.07, s * 0.045, '#8a1e18');
    ellipse(g, 0, s * 0.08, s * 0.22, s * 0.2, '#d8392b');
    g.fillStyle = '#f2b630'; rr(g, -s * 0.2, s * 0.12, s * 0.4, s * 0.14, s * 0.05); g.fill();   // тигрова пов'язка
    g.fillStyle = '#2a1a10'; for (let j = 0; j < 4; j++) poly(g, [[s * (-0.15 + j * 0.1), s * 0.12], [s * (-0.12 + j * 0.1), s * 0.12], [s * (-0.135 + j * 0.1), s * 0.22]], '#2a1a10');
    g.save(); g.translate(hand * s * 0.24, s * 0.06); g.rotate(hand * a);
    g.fillStyle = '#4a4250';
    g.beginPath(); g.moveTo(-s * 0.03, 0); g.lineTo(-s * 0.065, -s * 0.44); g.quadraticCurveTo(0, -s * 0.5, s * 0.065, -s * 0.44); g.lineTo(s * 0.03, 0); g.closePath(); g.fill();
    for (let j = 0; j < 4; j++) for (const sx of [-1, 0, 1]) circle(g, sx * s * 0.035, -s * (0.4 - j * 0.08), s * 0.017, '#c8ccd6');
    g.restore();
    circle(g, hand * s * 0.24, s * 0.06, s * 0.06, '#c22e22');
    circle(g, -hand * s * 0.22, s * 0.1, s * 0.055, '#c22e22');
    const hy = -s * 0.16;
    for (const sx of [-1, 1]) poly(g, [[sx * s * 0.08, hy - s * 0.12], [sx * s * 0.18, hy - s * 0.32], [sx * s * 0.15, hy - s * 0.1]], '#f0e6c8');
    circle(g, 0, hy, s * 0.17, '#e04432');
    g.fillStyle = '#2a1414';                                             // скуйовджене волосся
    g.beginPath(); g.moveTo(-s * 0.17, hy - s * 0.02);
    for (let j = 0; j <= 6; j++) g.lineTo(s * (-0.17 + j * 0.057), hy - s * (j % 2 ? 0.1 : 0.2));
    g.lineTo(s * 0.17, hy - s * 0.02); g.quadraticCurveTo(0, hy - s * 0.12, -s * 0.17, hy - s * 0.02); g.fill();
    line(g, -s * 0.12 + ex, hy - s * 0.04, -s * 0.03 + ex, hy, s * 0.025, '#2a1414');
    line(g, s * 0.12 + ex, hy - s * 0.04, s * 0.03 + ex, hy, s * 0.025, '#2a1414');
    eyes(g, s, ex, hy + s * 0.03 + ey, 0.07, 0.038, '#2a1010', '#ffd23f');
    g.fillStyle = '#5a0e0a'; rr(g, -s * 0.08 + ex, hy + s * 0.09, s * 0.16, s * 0.05, s * 0.02); g.fill();
    for (const sx of [-1, 1]) poly(g, [[sx * s * 0.06 + ex, hy + s * 0.09], [sx * s * 0.035 + ex, hy + s * 0.09], [sx * s * 0.05 + ex, hy + s * 0.04]], '#fff');
    return;
  }
  // юрей: білий одяг без ніг (хвіст тане), довге чорне волосся, трикутна пов'язка, руки звисають; поруч — блукаючий вогник
  const sway = wob * s * 0.05;
  g.save(); g.translate(0, -s * 0.05); g.scale(1.15, 1.15);
  g.fillStyle = '#f2f4f8';
  g.beginPath(); g.moveTo(-s * 0.17, -s * 0.06);
  g.quadraticCurveTo(-s * 0.22, s * 0.16, -s * 0.08 + sway, s * 0.3);
  g.quadraticCurveTo(sway * 1.6, s * 0.46, s * 0.06 + sway * 2, s * 0.4);
  g.quadraticCurveTo(s * 0.02 + sway, s * 0.3, s * 0.1 + sway * 0.5, s * 0.24);
  g.quadraticCurveTo(s * 0.22, s * 0.12, s * 0.17, -s * 0.06); g.closePath(); g.fill();
  g.strokeStyle = '#b8c0cc'; g.lineWidth = Math.max(1, s * 0.015);
  g.beginPath(); g.moveTo(s * 0.1, -s * 0.06); g.lineTo(-s * 0.04, s * 0.12); g.stroke();
  const hy = -s * 0.2;
  g.fillStyle = '#121016';                                               // волосся ззаду — до плечей і нижче
  g.beginPath(); g.moveTo(-s * 0.16, hy - s * 0.02); g.quadraticCurveTo(-s * 0.2, hy + s * 0.2, -s * 0.15 + sway * 0.3, hy + s * 0.32);
  g.lineTo(s * 0.15 + sway * 0.3, hy + s * 0.32); g.quadraticCurveTo(s * 0.2, hy + s * 0.2, s * 0.16, hy - s * 0.02);
  g.arc(0, hy - s * 0.02, s * 0.16, 0, Math.PI, true); g.fill();
  for (const sx of [-1, 1]) {                                            // рукави й кисті, що звисають
    g.fillStyle = '#e6eaf0'; g.beginPath(); g.moveTo(sx * s * 0.14, -s * 0.02); g.lineTo(sx * s * 0.06 + ex, s * 0.1); g.lineTo(sx * s * 0.2 + ex, s * 0.12); g.closePath(); g.fill();
    line(g, sx * s * 0.11 + ex, s * 0.11, sx * s * 0.11 + ex, s * 0.17, s * 0.03, '#dfe6ea');
  }
  ellipse(g, ex, hy + s * 0.03, s * 0.09, s * 0.11, '#dde6ea');
  g.fillStyle = '#121016';                                               // пасма спереду, на проділ
  g.beginPath(); g.moveTo(ex, hy - s * 0.1); g.quadraticCurveTo(ex - s * 0.12, hy - s * 0.06, ex - s * 0.1, hy + s * 0.16); g.lineTo(ex - s * 0.07, hy + s * 0.16);
  g.quadraticCurveTo(ex - s * 0.07, hy - s * 0.02, ex, hy - s * 0.08); g.quadraticCurveTo(ex + s * 0.07, hy - s * 0.02, ex + s * 0.07, hy + s * 0.16);
  g.lineTo(ex + s * 0.1, hy + s * 0.16); g.quadraticCurveTo(ex + s * 0.12, hy - s * 0.06, ex, hy - s * 0.1); g.fill();
  poly(g, [[ex - s * 0.05, hy - s * 0.09], [ex + s * 0.05, hy - s * 0.09], [ex, hy - s * 0.02]], '#f4f6f8');
  for (const sx of [-1, 1]) ellipse(g, ex + sx * s * 0.032, hy + s * 0.04 + ey, s * 0.018, s * 0.011, '#3a4a5a');
  ellipse(g, ex, hy + s * 0.1, s * 0.015, s * 0.01, '#6a7a88');
  const ph = T / 380 + m.i, wx = Math.cos(ph) * s * 0.28, wy = -s * 0.08 + Math.sin(ph * 1.3) * s * 0.08;   // блукаючий вогник
  circle(g, wx, wy, s * 0.07, 'rgba(120,200,255,0.4)');
  poly(g, [[wx - s * 0.035, wy], [wx, wy - s * 0.1], [wx + s * 0.035, wy]], '#c8f0ff');
  circle(g, wx, wy, s * 0.038, '#c8f0ff');
  g.restore();
}

export default {
  name: 'Японія',
  bg: '#221b44',
  backdrop,
  shadow: 'rgba(20,10,30,0.55)',
  emoji: { bomb: '💣', fire: '🎇', speed: '🍃', pass: '💨', resist: '⛩️', remote: '🥁' },
  fire: ['#d81e5b', '#ff7aa2', '#fff0f5'],
  burn: ['#ff3d7a', 'rgba(255,220,235,0)'],
  blocks: 4,
  floor, stone, block, wall, item, bomb, player, monster,
};
