/**
 * Painted backgrounds, baked once with Canvas 2D (gradients, fog, light rays, glow).
 * Generated lazily per key so the game boots fast and only pays for what it shows.
 *
 * Layout contract (battle): sky/scenery 0–400, ground/field 400–930, HUD area 930–1280.
 */
import { GAME_H, GAME_W } from '../config';
import { blob, glow, grain, rng, vgrad, type Ctx } from './canvas';

const W = GAME_W;
const H = GAME_H;

// ------------------------------------------------------------------ shared painters
function tuft(ctx: Ctx, x: number, y: number, s: number, color: string, r: () => number): void {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = 3 * s;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (r() - 0.5) * 1.3;
    const len = (14 + r() * 16) * s;
    ctx.beginPath();
    ctx.moveTo(x + (r() - 0.5) * 10 * s, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.4, y + Math.sin(a) * len * 0.6, x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
}

function fern(ctx: Ctx, x: number, y: number, s: number, color: string): void {
  ctx.fillStyle = color;
  for (let i = -3; i <= 3; i++) {
    const a = -Math.PI / 2 + i * 0.3;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, -30 * s, 7 * s, 30 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function trunk(ctx: Ctx, x: number, top: number, base: number, w: number, color: string, dark: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.45, top);
  ctx.lineTo(x + w * 0.45, top);
  ctx.quadraticCurveTo(x + w * 0.5, base - 60, x + w * 1.1, base);
  ctx.lineTo(x - w * 1.1, base);
  ctx.quadraticCurveTo(x - w * 0.5, base - 60, x - w * 0.45, top);
  ctx.fill();
  // bark shading on the right side
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.1, top);
  ctx.lineTo(x + w * 0.45, top);
  ctx.quadraticCurveTo(x + w * 0.5, base - 60, x + w * 1.1, base);
  ctx.lineTo(x + w * 0.3, base);
  ctx.quadraticCurveTo(x + w * 0.2, base - 80, x + w * 0.1, top);
  ctx.fill();
}

function cloud(ctx: Ctx, x: number, y: number, s: number, light: string, shade: string): void {
  blob(ctx, x, y + 8 * s, 70 * s, 18 * s, shade);
  for (const [dx, dy, r] of [[-40, 0, 26], [-10, -14, 34], [26, -6, 28], [52, 4, 20]]) blob(ctx, x + dx * s, y + dy * s, r * s, r * s * 0.85, light);
}

function stoneWall(ctx: Ctx, y: number, h: number, base: [number, number, number], r: () => number, light = 1): void {
  const [R, G, B] = base;
  ctx.fillStyle = `rgb(${R * 0.7},${G * 0.7},${B * 0.7})`;
  ctx.fillRect(0, y, W, h);
  // crenellations
  for (let x = 0; x < W; x += 64) {
    ctx.fillStyle = `rgb(${R},${G},${B})`;
    ctx.fillRect(x, y - 30, 38, 32);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x, y - 30, 38, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 32, y - 30, 6, 32);
  }
  const rows = Math.ceil(h / 24);
  for (let row = 0; row < rows; row++) {
    const yy = y + row * 24;
    for (let x = (row % 2) * -28; x < W; x += 56) {
      const v = 0.85 + r() * 0.25;
      ctx.fillStyle = `rgb(${Math.min(255, R * v * light)},${Math.min(255, G * v * light)},${Math.min(255, B * v * light)})`;
      ctx.fillRect(x + 2, yy + 2, 52, 20);
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.fillRect(x + 2, yy + 2, 52, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x + 2, yy + 19, 52, 3);
    }
  }
  // moss and stains
  for (let i = 0; i < 10; i++) blob(ctx, r() * W, y + r() * h, 16 + r() * 22, 6 + r() * 6, r() < 0.5 ? 'rgba(80,110,60,0.35)' : 'rgba(0,0,0,0.12)');
}

/** Perspective stone tiles: rows get taller towards the bottom. */
function tiles(ctx: Ctx, top: number, bottom: number, base: [number, number, number], r: () => number): void {
  const [R, G, B] = base;
  let y = top;
  let rh = 22;
  let row = 0;
  while (y < bottom) {
    const tw = 60 + rh * 2.2;
    for (let x = (row % 2) * -tw / 2 - 10; x < W + tw; x += tw) {
      const v = 0.86 + r() * 0.22;
      const depth = 0.85 + ((y - top) / (bottom - top)) * 0.2;
      ctx.fillStyle = `rgb(${R * v * depth},${G * v * depth},${B * v * depth})`;
      const skew = (x - W / 2) * 0.04;
      ctx.beginPath();
      ctx.moveTo(x + 3, y + 2);
      ctx.lineTo(x + tw - 3, y + 2);
      ctx.lineTo(x + tw - 3 + skew, y + rh - 2);
      ctx.lineTo(x + 3 + skew, y + rh - 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(x + 4, y + 2, tw - 8, 2);
      if (r() < 0.12) {
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + tw * 0.3, y + 3);
        ctx.lineTo(x + tw * 0.45, y + rh * 0.6);
        ctx.lineTo(x + tw * 0.4, y + rh - 3);
        ctx.stroke();
      }
    }
    y += rh;
    rh *= 1.09;
    row++;
  }
}

/** Arched window/door drawn with a manual path (the native rounded-rect API is missing on older phones). */
function arch(ctx: Ctx, x: number, y: number, w: number, h: number): void {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}

function lowerArea(ctx: Ctx, top: string, bottom: string): void {
  vgrad(ctx, 0, 925, W, H - 925, [[0, top], [1, bottom]]);
}

// ------------------------------------------------------------------ chapter 1: Bosque Sombrío
function forest(ctx: Ctx): void {
  const r = rng(7);
  vgrad(ctx, 0, 0, W, 440, [[0, '#b6e0cf'], [0.4, '#6aa695'], [1, '#2a5a50']]);
  glow(ctx, 620, 30, 320, 'rgba(255,248,214,0.75)');
  // far trunks in the fog
  for (let i = 0; i < 11; i++) trunk(ctx, 20 + i * 68 + r() * 30, 0, 430, 14 + r() * 10, 'rgba(78,128,116,0.85)', 'rgba(60,104,94,0.85)');
  vgrad(ctx, 0, 200, W, 240, [[0, 'rgba(190,230,214,0)'], [1, 'rgba(190,230,214,0.55)']]);
  // light shafts
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const x = 330 + i * 95;
    const g = ctx.createLinearGradient(x, 0, x - 260, 520);
    g.addColorStop(0, 'rgba(255,246,200,0.28)');
    g.addColorStop(1, 'rgba(255,246,200,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 34 + i * 6, 0);
    ctx.lineTo(x - 200, 540);
    ctx.lineTo(x - 300, 540);
    ctx.fill();
  }
  ctx.restore();
  // mid trunks
  for (const [x, w] of [[40, 40], [330, 50], [610, 44]]) trunk(ctx, x, 0, 440, w, '#24524a', '#1a3f39');
  // canopy
  for (let i = 0; i < 16; i++) blob(ctx, i * 48, 10 + r() * 30, 50 + r() * 30, 40 + r() * 20, i % 2 ? '#12302b' : '#163a33');
  // vines with leaves
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const x = r() * W;
    const len = 90 + r() * 200;
    ctx.strokeStyle = '#163a33';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(x + (r() - 0.5) * 60, len / 2, x + (r() - 0.5) * 30, len);
    ctx.stroke();
    for (let j = 0; j < 5; j++) blob(ctx, x + (r() - 0.5) * 22, r() * len, 9, 4, '#1f4a3f');
  }
  // ground
  vgrad(ctx, 0, 400, W, 530, [[0, '#4a8a66'], [0.25, '#3a7356'], [1, '#1d4434']]);
  for (let i = 0; i < 16; i++) {
    const x = r() * W;
    const y = 450 + r() * 430;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 90);
    g.addColorStop(0, 'rgba(120,180,120,0.25)');
    g.addColorStop(1, 'rgba(120,180,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, 120, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // horizon bushes & fog line
  for (let i = 0; i < 14; i++) blob(ctx, i * 56 + r() * 20, 408, 40 + r() * 20, 22 + r() * 10, i % 2 ? '#1e4a3b' : '#245544');
  for (let i = 0; i < 8; i++) fern(ctx, 40 + i * 92 + r() * 30, 418, 0.9, '#1a4134');
  vgrad(ctx, 0, 395, W, 50, [[0, 'rgba(200,235,220,0.35)'], [1, 'rgba(200,235,220,0)']]);
  // field details
  for (let i = 0; i < 40; i++) tuft(ctx, r() * W, 440 + r() * 470, 0.8 + r() * 0.5, r() < 0.5 ? '#2c6248' : '#5c9c6e', r);
  for (let i = 0; i < 14; i++) {
    const x = r() * W;
    const y = 460 + r() * 440;
    glow(ctx, x, y, 10, r() < 0.5 ? 'rgba(255,220,120,0.7)' : 'rgba(255,140,190,0.6)');
    blob(ctx, x, y, 2.5, 2.5, '#fff6d0');
  }
  // foreground silhouettes
  for (let i = 0; i < 9; i++) fern(ctx, r() * W, 935, 1.3, '#0f2a20');
  lowerArea(ctx, '#0f241d', '#06100c');
  grain(ctx, W, H, 9000, 7);
}

// ------------------------------------------------------------------ chapter 2: Ruinas del Castillo
function ruins(ctx: Ctx): void {
  const r = rng(11);
  vgrad(ctx, 0, 0, W, 440, [[0, '#5d78b8'], [0.55, '#c99cb0'], [1, '#f6c48a']]);
  glow(ctx, 520, 300, 300, 'rgba(255,220,150,0.8)');
  blob(ctx, 520, 300, 46, 46, '#fff0c8');
  for (let i = 0; i < 6; i++) cloud(ctx, r() * W, 60 + r() * 170, 0.8 + r() * 0.6, 'rgba(255,230,230,0.7)', 'rgba(170,120,150,0.5)');
  // far mountains
  ctx.fillStyle = '#8c7c9e';
  ctx.beginPath();
  ctx.moveTo(0, 340);
  for (let x = 0; x <= W; x += 60) ctx.lineTo(x, 280 + Math.sin(x * 0.012) * 30 + r() * 20);
  ctx.lineTo(W, 440);
  ctx.lineTo(0, 440);
  ctx.fill();
  // towers
  for (const [x, w, h] of [[30, 100, 330], [480, 120, 380], [630, 80, 270]]) {
    vgrad(ctx, x, 420 - h, w, h, [[0, '#a8968c'], [1, '#7c6c66']]);
    ctx.fillStyle = 'rgba(60,40,50,0.35)';
    ctx.fillRect(x + w * 0.65, 420 - h, w * 0.35, h);
    for (let cx = x; cx < x + w; cx += 28) {
      ctx.fillStyle = '#a8968c';
      ctx.fillRect(cx, 420 - h - 20, 18, 22);
    }
    ctx.fillStyle = '#2a2230';
    arch(ctx, x + w / 2 - 10, 420 - h + 50, 20, 38);
    glow(ctx, x + w / 2, 420 - h + 70, 22, 'rgba(255,190,110,0.5)');
  }
  // tree line behind the wall
  for (let i = 0; i < 12; i++) {
    const x = r() * W;
    blob(ctx, x, 300 + r() * 20, 50 + r() * 20, 40, '#4f6f45');
    blob(ctx, x - 10, 290 + r() * 10, 30, 22, '#6f9055');
  }
  stoneWall(ctx, 312, 100, [200, 184, 156], r);
  vgrad(ctx, 0, 380, W, 40, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.25)']]);
  // ground: perspective tiles
  vgrad(ctx, 0, 410, W, 520, [[0, '#a89880'], [1, '#6e6050']]);
  tiles(ctx, 412, 930, [196, 180, 152], r);
  for (let i = 0; i < 22; i++) tuft(ctx, r() * W, 430 + r() * 480, 0.7, '#6f8f4f', r);
  for (let i = 0; i < 10; i++) {
    const x = r() * W;
    const y = 440 + r() * 460;
    blob(ctx, x + 3, y + 4, 12, 5, 'rgba(0,0,0,0.25)');
    blob(ctx, x, y, 11, 7, '#8c8070');
  }
  // warm light from the sunset
  const lg = ctx.createLinearGradient(W, 400, 0, 930);
  lg.addColorStop(0, 'rgba(255,200,130,0.25)');
  lg.addColorStop(1, 'rgba(255,200,130,0)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 400, W, 530);
  lowerArea(ctx, '#3e352c', '#120e0b');
  grain(ctx, W, H, 9000, 11);
}

// ------------------------------------------------------------------ chapter 3: Ciudadela de Ceniza
function ash(ctx: Ctx): void {
  const r = rng(23);
  vgrad(ctx, 0, 0, W, 440, [[0, '#1c0b2e'], [0.5, '#61204c'], [1, '#e87a40']]);
  for (let i = 0; i < 40; i++) blob(ctx, r() * W, r() * 200, 1.2, 1.2, 'rgba(255,255,255,0.6)');
  glow(ctx, 520, 300, 260, 'rgba(255,160,90,0.7)');
  blob(ctx, 520, 300, 64, 64, '#ffd9a0');
  glow(ctx, 340, 120, 110, 'rgba(190,90,255,0.45)');
  // floating crown in the sky
  ctx.fillStyle = '#3a1450';
  ctx.beginPath();
  ctx.moveTo(296, 150); ctx.lineTo(292, 108); ctx.lineTo(314, 128); ctx.lineTo(332, 92); ctx.lineTo(344, 128); ctx.lineTo(348, 150); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(362, 150); ctx.lineTo(364, 124); ctx.lineTo(384, 94); ctx.lineTo(398, 130); ctx.lineTo(418, 108); ctx.lineTo(414, 150); ctx.fill();
  // dunes
  const dune = (y: number, amp: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 440);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.009 + amp) * 26);
    ctx.lineTo(W, 440);
    ctx.fill();
  };
  dune(330, 0, '#8a3a52');
  dune(368, 2, '#62284a');
  // ruined pillars with purple rim light
  for (const [x, h] of [[60, 210], [200, 150], [610, 240]]) {
    vgrad(ctx, x, 420 - h, 46, h, [[0, '#4a2440'], [1, '#2a1426']]);
    ctx.fillStyle = 'rgba(210,123,255,0.45)';
    ctx.fillRect(x, 420 - h, 4, h);
    ctx.fillStyle = '#4a2440';
    ctx.beginPath();
    ctx.moveTo(x - 6, 420 - h); ctx.lineTo(x + 18, 420 - h - 34); ctx.lineTo(x + 52, 420 - h); ctx.fill();
  }
  // ground
  vgrad(ctx, 0, 405, W, 525, [[0, '#7a3c58'], [0.3, '#5c2e48'], [1, '#341a2c']]);
  ctx.strokeStyle = 'rgba(255,190,160,0.12)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    const y = 430 + r() * 480;
    ctx.beginPath();
    ctx.ellipse(x, y, 60 + r() * 50, 8, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }
  // crystals with glow
  for (let i = 0; i < 9; i++) {
    const x = r() * W;
    const y = i % 3 === 0 ? 420 : 440 + r() * 460;
    const s = 0.7 + r() * 0.7;
    glow(ctx, x + 10 * s, y - 16 * s, 40 * s, 'rgba(170,70,255,0.45)');
    ctx.fillStyle = '#8e3ae8';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8 * s, y - 44 * s); ctx.lineTo(x + 18 * s, y); ctx.fill();
    ctx.fillStyle = '#d27bff';
    ctx.beginPath(); ctx.moveTo(x + 12 * s, y); ctx.lineTo(x + 24 * s, y - 28 * s); ctx.lineTo(x + 32 * s, y); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.moveTo(x + 6 * s, y - 4 * s); ctx.lineTo(x + 8 * s, y - 40 * s); ctx.lineTo(x + 10 * s, y - 4 * s); ctx.fill();
  }
  // ember specks
  for (let i = 0; i < 30; i++) {
    const x = r() * W;
    const y = 120 + r() * 780;
    glow(ctx, x, y, 6, 'rgba(255,150,80,0.8)');
  }
  lowerArea(ctx, '#24101e', '#0a0408');
  grain(ctx, W, H, 9000, 23);
}

// ------------------------------------------------------------------ endless: El Abismo
function abyss(ctx: Ctx): void {
  const r = rng(31);
  vgrad(ctx, 0, 0, W, H, [[0, '#05030a'], [0.35, '#160a28'], [1, '#0b0614']]);
  glow(ctx, 180, 160, 260, 'rgba(120,50,220,0.45)');
  glow(ctx, 560, 260, 220, 'rgba(40,90,220,0.35)');
  for (let i = 0; i < 110; i++) {
    const x = r() * W;
    const y = r() * 420;
    const big = r() < 0.12;
    if (big) glow(ctx, x, y, 8, 'rgba(220,200,255,0.8)');
    blob(ctx, x, y, big ? 1.8 : 1, big ? 1.8 : 1, '#ffffff');
  }
  // floating islands
  for (const [x, y, s] of [[110, 300, 1], [560, 220, 0.7], [380, 340, 0.5]]) {
    ctx.fillStyle = '#140a20';
    ctx.beginPath();
    ctx.moveTo(x - 60 * s, y);
    ctx.lineTo(x + 60 * s, y);
    ctx.lineTo(x + 20 * s, y + 50 * s);
    ctx.lineTo(x, y + 80 * s);
    ctx.lineTo(x - 30 * s, y + 40 * s);
    ctx.fill();
    ctx.fillStyle = 'rgba(160,64,255,0.5)';
    ctx.fillRect(x - 60 * s, y - 2, 120 * s, 3);
  }
  // ink drips from the top
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 14; i++) {
    const x = r() * W;
    const h = 40 + r() * 170;
    ctx.fillRect(x, 0, 12, h);
    blob(ctx, x + 6, h, 9, 11, '#000000');
  }
  // ground platform
  vgrad(ctx, 0, 400, W, 530, [[0, '#2a1640'], [1, '#100818']]);
  ctx.save();
  ctx.shadowColor = '#b060ff';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = 'rgba(190,110,255,0.75)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 12; i++) {
    let x = r() * W;
    let y = 420 + r() * 460;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 5; j++) {
      x += (r() - 0.5) * 90;
      y += r() * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  vgrad(ctx, 0, 395, W, 40, [[0, 'rgba(176,96,255,0.35)'], [1, 'rgba(176,96,255,0)']]);
  lowerArea(ctx, '#0a0612', '#030205');
  grain(ctx, W, H, 9000, 31);
}

// ------------------------------------------------------------------ story / menu: castle courtyard
function courtyard(ctx: Ctx, dusk: boolean): void {
  const r = rng(dusk ? 5 : 3);
  if (dusk) vgrad(ctx, 0, 0, W, 760, [[0, '#26315e'], [0.55, '#9a6a8a'], [1, '#f2a46c']]);
  else vgrad(ctx, 0, 0, W, 760, [[0, '#6fb6ea'], [1, '#d6eefa']]);
  if (dusk) {
    glow(ctx, 360, 640, 360, 'rgba(255,170,100,0.7)');
  } else {
    glow(ctx, 600, 90, 200, 'rgba(255,255,230,0.9)');
  }
  for (let i = 0; i < 7; i++) {
    cloud(ctx, r() * W, 70 + r() * 260, 0.9 + r() * 0.7, dusk ? 'rgba(255,200,190,0.55)' : 'rgba(255,255,255,0.95)', dusk ? 'rgba(120,80,120,0.4)' : 'rgba(190,215,235,0.9)');
  }
  // distant hills
  ctx.fillStyle = dusk ? '#5a4a6a' : '#9cc49a';
  ctx.beginPath();
  ctx.moveTo(0, 600);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 520 + Math.sin(x * 0.01) * 26);
  ctx.lineTo(W, 760);
  ctx.lineTo(0, 760);
  ctx.fill();
  // towers
  const stone: [number, number, number] = dusk ? [120, 104, 116] : [214, 198, 166];
  for (const [x, w, h] of [[-30, 150, 660], [570, 190, 740]]) {
    const [R, G, B] = stone;
    vgrad(ctx, x, 760 - h, w, h, [[0, `rgb(${R},${G},${B})`], [1, `rgb(${R * 0.8},${G * 0.8},${B * 0.8})`]]);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let row = 0; row < h / 28; row++) ctx.fillRect(x, 760 - h + row * 28, w, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + w * 0.7, 760 - h, w * 0.3, h);
    for (let cx = x; cx < x + w; cx += 36) {
      ctx.fillStyle = `rgb(${R},${G},${B})`;
      ctx.fillRect(cx, 760 - h - 26, 24, 28);
    }
    ctx.fillStyle = '#2a2230';
    arch(ctx, x + w / 2 - 14, 760 - h + 90, 28, 46);
    if (dusk) glow(ctx, x + w / 2, 760 - h + 115, 36, 'rgba(255,190,110,0.6)');
  }
  // trees (three tones)
  for (let i = 0; i < 7; i++) {
    const x = 150 + i * 72 + r() * 30;
    const y = 540 + r() * 40;
    const s = 0.9 + r() * 0.4;
    blob(ctx, x, y, 66 * s, 56 * s, dusk ? '#22382c' : '#4f8a4a');
    blob(ctx, x - 14 * s, y - 14 * s, 46 * s, 38 * s, dusk ? '#2c4a38' : '#66a35a');
    blob(ctx, x - 22 * s, y - 26 * s, 22 * s, 16 * s, dusk ? '#3a5a44' : '#8cc070');
  }
  stoneWall(ctx, 640, 180, stone, r, 1);
  vgrad(ctx, 0, 760, W, 60, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.25)']]);
  // grass strip
  vgrad(ctx, 0, 818, W, 40, [[0, dusk ? '#3e5a3a' : '#78ac58'], [1, dusk ? '#2c4430' : '#5c8e44']]);
  for (let i = 0; i < 40; i++) tuft(ctx, r() * W, 836, 0.7, dusk ? '#4e6e46' : '#8cc068', r);
  // path tiles
  vgrad(ctx, 0, 852, W, H - 852, [[0, dusk ? '#8a7a76' : '#d8c8a8'], [1, dusk ? '#3a3236' : '#a89878']]);
  tiles(ctx, 856, H, dusk ? [140, 124, 120] : [216, 200, 170], r);
  grain(ctx, W, H, 9000, dusk ? 5 : 3);
}


// ------------------------------------------------------------------ chapter 4: Marisma de Tinta
function marsh(ctx: Ctx): void {
  const r = rng(41);
  vgrad(ctx, 0, 0, W, 440, [[0, '#0a1a22'], [0.55, '#1d3d44'], [1, '#3e6a62']]);
  // moon behind mist
  glow(ctx, 170, 270, 200, 'rgba(210,240,230,0.55)');
  blob(ctx, 170, 270, 46, 46, '#e8f6ee');
  blob(ctx, 186, 260, 40, 40, 'rgba(10,26,34,0.25)');
  for (let i = 0; i < 6; i++) cloud(ctx, r() * W, 80 + r() * 200, 0.9 + r() * 0.6, 'rgba(120,170,160,0.25)', 'rgba(30,60,60,0.25)');
  // dead trees silhouettes
  const deadTree = (x: number, base: number, h: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + 10, base - h * 0.5, x - 6, base - h); ctx.stroke();
    ctx.lineWidth = 6;
    for (let i = 0; i < 4; i++) {
      const y = base - h * (0.45 + i * 0.13);
      const dir = i % 2 ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + dir * 30, y - 20, x + dir * (50 + r() * 30), y - 40 - r() * 20); ctx.stroke();
    }
  };
  for (let i = 0; i < 6; i++) deadTree(30 + i * 130 + r() * 40, 430, 220 + r() * 120, 'rgba(22,44,46,0.9)');
  for (const x of [80, 560]) deadTree(x, 440, 380, '#0b1a1e');
  vgrad(ctx, 0, 300, W, 140, [[0, 'rgba(160,210,200,0)'], [1, 'rgba(160,210,200,0.35)']]);
  // water + mud ground
  vgrad(ctx, 0, 405, W, 525, [[0, '#28504c'], [0.3, '#1e403c'], [1, '#10261f']]);
  for (let i = 0; i < 12; i++) {
    const x = r() * W;
    const y = 440 + r() * 460;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 110);
    g.addColorStop(0, 'rgba(30,70,80,0.55)');
    g.addColorStop(1, 'rgba(30,70,80,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, 130, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(200,240,230,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y, 60, 9, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }
  // reeds
  for (let i = 0; i < 30; i++) {
    const x = r() * W;
    const y = 420 + r() * 490;
    ctx.strokeStyle = r() < 0.5 ? '#2a5a3e' : '#3e7a52';
    ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath(); ctx.moveTo(x + k * 5, y); ctx.quadraticCurveTo(x + k * 5 + 4, y - 20, x + k * 7 - 4, y - 36 - r() * 16); ctx.stroke();
    }
    if (r() < 0.4) blob(ctx, x + 5, y - 40, 3, 9, '#5a3a22');
  }
  // will-o-wisps
  for (let i = 0; i < 14; i++) {
    const x = r() * W;
    const y = 160 + r() * 740;
    glow(ctx, x, y, 16, 'rgba(120,255,220,0.6)');
    blob(ctx, x, y, 2.5, 2.5, '#e8fff8');
  }
  vgrad(ctx, 0, 398, W, 60, [[0, 'rgba(180,230,220,0.35)'], [1, 'rgba(180,230,220,0)']]);
  lowerArea(ctx, '#0c1c18', '#040a08');
  grain(ctx, W, H, 9000, 41);
}

// ------------------------------------------------------------------ chapter 5: Torre del Olvido
function tower(ctx: Ctx): void {
  const r = rng(53);
  vgrad(ctx, 0, 0, W, 440, [[0, '#1a1838'], [0.6, '#2e2c5a'], [1, '#4a4478']]);
  // tall bookshelves
  const spines = ['#7a2a2a', '#2a4a7a', '#2a6a4a', '#7a5a2a', '#5a2a6a', '#2a5a5a', '#8a7a5a'];
  for (const [x0, w] of [[0, 170], [550, 170]]) {
    vgrad(ctx, x0, 0, w, 440, [[0, '#2a1e18'], [1, '#3e2c22']]);
    for (let row = 0; row < 8; row++) {
      const y = 20 + row * 52;
      ctx.fillStyle = '#1a120e';
      ctx.fillRect(x0, y + 44, w, 8);
      let x = x0 + 8;
      while (x < x0 + w - 12) {
        const bw = 8 + r() * 10;
        const bh = 30 + r() * 12;
        ctx.fillStyle = spines[Math.floor(r() * spines.length)];
        ctx.fillRect(x, y + 44 - bh, bw, bh);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x + 1, y + 44 - bh, 2, bh);
        x += bw + 1;
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x0 === 0 ? w - 20 : x0, 0, 20, 440);
  }
  // central arched window with purple light
  ctx.fillStyle = '#0c0a1e';
  ctx.beginPath(); ctx.moveTo(250, 420); ctx.lineTo(250, 170); ctx.arc(360, 170, 110, Math.PI, 0); ctx.lineTo(470, 420); ctx.fill();
  glow(ctx, 360, 210, 190, 'rgba(160,100,255,0.55)');
  ctx.strokeStyle = '#3a2c22';
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(360, 60); ctx.lineTo(360, 420); ctx.moveTo(250, 250); ctx.lineTo(470, 250); ctx.stroke();
  // floating pages
  for (let i = 0; i < 18; i++) {
    const x = 180 + r() * 360;
    const y = 60 + r() * 330;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((r() - 0.5) * 1.2);
    ctx.fillStyle = 'rgba(240,234,214,0.85)';
    ctx.fillRect(-9, -12, 18, 24);
    ctx.fillStyle = 'rgba(120,110,90,0.6)';
    for (let k = 0; k < 4; k++) ctx.fillRect(-6, -8 + k * 5, 12, 1.5);
    ctx.restore();
  }
  // paper floor with ink stains
  vgrad(ctx, 0, 405, W, 525, [[0, '#cfc6ae'], [0.4, '#b0a68c'], [1, '#6e6656']]);
  ctx.strokeStyle = 'rgba(80,70,50,0.25)';
  ctx.lineWidth = 2;
  for (let y = 430; y < 930; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  for (let i = 0; i < 12; i++) blob(ctx, r() * W, 440 + r() * 460, 30 + r() * 50, 8 + r() * 10, 'rgba(30,24,60,0.35)');
  for (let i = 0; i < 10; i++) {
    const x = r() * W;
    const y = 440 + r() * 450;
    ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 2);
    ctx.fillStyle = '#eee6cc'; ctx.fillRect(-12, -8, 24, 16);
    ctx.restore();
  }
  // purple light falling on the floor
  const lg = ctx.createRadialGradient(360, 470, 10, 360, 470, 340);
  lg.addColorStop(0, 'rgba(170,110,255,0.35)');
  lg.addColorStop(1, 'rgba(170,110,255,0)');
  ctx.fillStyle = lg;
  ctx.fillRect(0, 400, W, 530);
  lowerArea(ctx, '#2a2620', '#0c0a08');
  grain(ctx, W, H, 9000, 53);
}

// ------------------------------------------------------------------ chapter 6: Trono de la Corona
function throne(ctx: Ctx): void {
  const r = rng(67);
  vgrad(ctx, 0, 0, W, 440, [[0, '#06020c'], [0.5, '#2a0a3a'], [1, '#5a1a4a']]);
  for (let i = 0; i < 60; i++) blob(ctx, r() * W, r() * 300, 1.1, 1.1, 'rgba(255,220,255,0.7)');
  // the giant broken crown hanging in the void (below the battle HUD)
  ctx.save();
  ctx.translate(0, 150);
  glow(ctx, 360, 170, 260, 'rgba(176,70,255,0.55)');
  const crownHalf = (dx: number, dir: number) => {
    ctx.fillStyle = '#3a1460';
    ctx.beginPath();
    ctx.moveTo(360 + dx, 250);
    ctx.lineTo(360 + dx + dir * 150, 250);
    ctx.lineTo(360 + dx + dir * 170, 120);
    ctx.lineTo(360 + dx + dir * 120, 180);
    ctx.lineTo(360 + dx + dir * 90, 80);
    ctx.lineTo(360 + dx + dir * 50, 170);
    ctx.lineTo(360 + dx + dir * 10, 110);
    ctx.closePath();
    ctx.fill();
    glow(ctx, 360 + dx + dir * 90, 90, 18, 'rgba(255,140,220,0.9)');
  };
  crownHalf(18, 1);
  crownHalf(-18, -1);
  // void crack between the halves
  ctx.save();
  ctx.shadowColor = '#d27bff';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = '#f0c8ff';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(360, 90); ctx.lineTo(352, 150); ctx.lineTo(366, 200); ctx.lineTo(356, 252); ctx.stroke();
  ctx.restore();
  ctx.restore();
  // throne pillars
  for (const x of [40, 640]) {
    vgrad(ctx, x - 26, 120, 52, 300, [[0, '#2a1438'], [1, '#14081c']]);
    ctx.fillStyle = 'rgba(232,160,64,0.8)';
    ctx.fillRect(x - 26, 120, 52, 6);
    ctx.fillRect(x - 26, 260, 52, 4);
    glow(ctx, x, 110, 30, 'rgba(255,170,80,0.6)');
  }
  // obsidian floor with gold veins
  vgrad(ctx, 0, 405, W, 525, [[0, '#2e1838'], [0.4, '#1e0e28'], [1, '#0e0614']]);
  ctx.save();
  ctx.shadowColor = '#e8a040';
  ctx.shadowBlur = 8;
  ctx.strokeStyle = 'rgba(232,170,80,0.7)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    let x = r() * W;
    let y = 420 + r() * 460;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let j = 0; j < 4; j++) { x += (r() - 0.5) * 110; y += r() * 24; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
  // red carpet towards the throne (perspective)
  ctx.fillStyle = 'rgba(120,20,40,0.55)';
  ctx.beginPath(); ctx.moveTo(320, 405); ctx.lineTo(400, 405); ctx.lineTo(520, 930); ctx.lineTo(200, 930); ctx.fill();
  vgrad(ctx, 0, 395, W, 50, [[0, 'rgba(200,100,255,0.35)'], [1, 'rgba(200,100,255,0)']]);
  lowerArea(ctx, '#0c0612', '#030106');
  grain(ctx, W, H, 9000, 67);
}

// ------------------------------------------------------------------ prologue: the village at night
/** Night sky, mountains, castle and the river the beast comes out of. The houses are a separate
 *  transparent layer (cinema.ts) so the creature can rise *behind* them. */
function villageNight(ctx: Ctx): void {
  const r = rng(41);
  vgrad(ctx, 0, 0, W, 780, [[0, '#04061a'], [0.45, '#121a44'], [0.8, '#2a2a5a'], [1, '#4a3462']]);
  // stars (a few brighter ones with a cross glint)
  for (let i = 0; i < 220; i++) {
    const x = r() * W;
    const y = r() * 560;
    const a = 0.25 + r() * 0.7;
    ctx.fillStyle = `rgba(230,236,255,${a})`;
    ctx.fillRect(x, y, r() < 0.1 ? 3 : 2, r() < 0.1 ? 3 : 2);
  }
  for (let i = 0; i < 9; i++) {
    const x = 30 + r() * (W - 60);
    const y = 30 + r() * 380;
    glow(ctx, x, y, 14, 'rgba(220,230,255,0.7)');
    ctx.fillStyle = 'rgba(240,244,255,0.9)';
    ctx.fillRect(x - 7, y - 0.75, 14, 1.5);
    ctx.fillRect(x - 0.75, y - 7, 1.5, 14);
  }
  // moon with halo and a soft cloud passing over it
  glow(ctx, 560, 200, 220, 'rgba(160,180,255,0.22)');
  glow(ctx, 560, 200, 110, 'rgba(230,236,255,0.35)');
  const mg = ctx.createRadialGradient(548, 188, 6, 560, 200, 52);
  mg.addColorStop(0, '#fffbea');
  mg.addColorStop(1, '#d8d2bc');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(560, 200, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(160,150,130,0.45)';
  for (const [x, y, rr] of [[546, 186, 10], [574, 214, 7], [572, 182, 5], [550, 216, 4]]) {
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const [x, y, s] of [[470, 250, 1.1], [130, 150, 1.4], [300, 330, 1]]) cloud(ctx, x, y, s, 'rgba(70,80,140,0.55)', 'rgba(30,34,80,0.6)');
  // two mountain ranges
  for (const [base, amp, col, seed] of [[560, 70, '#1a1f48', 0.011], [640, 50, '#121638', 0.017]] as const) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, 780);
    for (let x = 0; x <= W; x += 12) ctx.lineTo(x, base - Math.abs(Math.sin(x * seed + base)) * amp - Math.sin(x * 0.05) * 8);
    ctx.lineTo(W, 780);
    ctx.fill();
  }
  // castle silhouette on the hill, a few warm windows
  ctx.fillStyle = '#0c0e26';
  for (const [x, w, h] of [[40, 70, 230], [104, 120, 150], [218, 56, 260], [270, 90, 120]]) {
    ctx.fillRect(x, 690 - h, w, h);
    for (let cx = x; cx < x + w; cx += 18) ctx.fillRect(cx, 690 - h - 14, 10, 14);
  }
  for (const [x, y] of [[66, 520], [240, 470], [150, 590], [300, 610]]) {
    glow(ctx, x, y, 22, 'rgba(255,190,110,0.55)');
    ctx.fillStyle = '#ffc870';
    ctx.fillRect(x - 4, y - 7, 8, 14);
  }
  // the river (where La Mancha comes from), with the moon's reflection
  vgrad(ctx, 0, 690, W, 80, [[0, '#18204a'], [1, '#0a0e26']]);
  ctx.fillStyle = 'rgba(200,210,255,0.35)';
  for (let i = 0; i < 26; i++) {
    const y = 700 + r() * 60;
    const w = 20 + r() * 70;
    ctx.fillRect(500 + (r() - 0.5) * 120 - w / 2, y, w, 2);
  }
  // street: dark grass and moonlit cobbles
  vgrad(ctx, 0, 770, W, 120, [[0, '#141a2c'], [1, '#0e1220']]);
  vgrad(ctx, 0, 880, W, H - 880, [[0, '#3a3a52'], [1, '#14141e']]);
  tiles(ctx, 884, H, [74, 74, 100], r);
  vgrad(ctx, 0, 884, W, 120, [[0, 'rgba(10,10,20,0.6)'], [1, 'rgba(10,10,20,0)']]);
  grain(ctx, W, H, 9000, 41);
}

// ------------------------------------------------------------------ prologue: the healer's house
function healerRoom(ctx: Ctx): void {
  const r = rng(77);
  // plank wall
  vgrad(ctx, 0, 0, W, 900, [[0, '#2a1810'], [0.5, '#4a2c1c'], [1, '#3a2216']]);
  for (let x = 0; x < W; x += 72) {
    ctx.fillStyle = `rgba(0,0,0,${0.18 + r() * 0.12})`;
    ctx.fillRect(x, 0, 3, 900);
    ctx.fillStyle = 'rgba(255,200,150,0.05)';
    ctx.fillRect(x + 4, 0, 2, 900);
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = 'rgba(20,10,6,0.35)';
      ctx.beginPath();
      ctx.ellipse(x + 20 + r() * 40, r() * 880, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // beams
  for (const y of [120, 700]) {
    vgrad(ctx, 0, y, W, 34, [[0, '#5a3a24'], [1, '#2a180e']]);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, y + 34, W, 6);
  }
  // round window with the night outside
  const wx = 540;
  const wy = 400;
  ctx.save();
  ctx.beginPath();
  ctx.arc(wx, wy, 112, 0, Math.PI * 2);
  ctx.clip();
  vgrad(ctx, wx - 112, wy - 112, 224, 224, [[0, '#0a1030'], [1, '#2a2a5a']]);
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(230,236,255,${0.3 + r() * 0.6})`;
    ctx.fillRect(wx - 100 + r() * 200, wy - 100 + r() * 120, 2, 2);
  }
  glow(ctx, wx + 40, wy - 40, 60, 'rgba(230,236,255,0.4)');
  ctx.fillStyle = '#f2ecd6';
  ctx.beginPath();
  ctx.arc(wx + 40, wy - 40, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0c0e26';
  ctx.beginPath();
  ctx.moveTo(wx - 112, wy + 60);
  for (let x = -112; x <= 112; x += 16) ctx.lineTo(wx + x, wy + 40 - Math.abs(Math.sin(x * 0.05)) * 30);
  ctx.lineTo(wx + 112, wy + 112);
  ctx.lineTo(wx - 112, wy + 112);
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#2a180e';
  ctx.beginPath();
  ctx.arc(wx, wy, 112, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(wx - 112, wy);
  ctx.lineTo(wx + 112, wy);
  ctx.moveTo(wx, wy - 112);
  ctx.lineTo(wx, wy + 112);
  ctx.stroke();
  // curtains
  for (const side of [-1, 1]) {
    ctx.fillStyle = side < 0 ? '#7a2a2a' : '#6a2424';
    ctx.beginPath();
    ctx.moveTo(wx + side * 70, 250);
    ctx.quadraticCurveTo(wx + side * 150, 400, wx + side * 120, 560);
    ctx.lineTo(wx + side * 170, 560);
    ctx.lineTo(wx + side * 170, 250);
    ctx.fill();
  }
  ctx.fillStyle = '#2a180e';
  ctx.fillRect(wx - 190, 240, 380, 14);
  // shelf with jars and hanging herbs
  ctx.fillStyle = '#2a180e';
  ctx.fillRect(40, 330, 260, 14);
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * 40;
    const h = 30 + r() * 26;
    const col = ['#4a8a7a', '#8a5a3a', '#6a6aa0', '#a08a4a', '#5a7a4a', '#8a4a6a'][i];
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(x, 330 - h / 2, 14, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(x - 8, 330 - h + 6, 3, h - 14);
    ctx.fillStyle = '#3a2416';
    ctx.fillRect(x - 6, 330 - h - 6, 12, 8);
  }
  for (let i = 0; i < 5; i++) {
    const x = 70 + i * 48;
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 154);
    ctx.lineTo(x, 190);
    ctx.stroke();
    for (let k = 0; k < 7; k++) {
      ctx.fillStyle = k % 2 ? '#4a6a3a' : '#5a7a40';
      ctx.beginPath();
      ctx.ellipse(x + (r() - 0.5) * 18, 196 + k * 8, 7, 4, r(), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // a child's drawing of the two brothers pinned to the wall
  ctx.save();
  ctx.translate(230, 520);
  ctx.rotate(-0.06);
  ctx.fillStyle = '#efe6cc';
  ctx.fillRect(-70, -60, 140, 110);
  ctx.strokeStyle = '#1a1a2a';
  ctx.lineWidth = 3;
  for (const [x, c] of [[-28, '#2ad4c4'], [26, '#e2552c']] as const) {
    ctx.strokeStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.arc(x, -26, 11, 0, Math.PI * 2);
    ctx.moveTo(x, -15);
    ctx.lineTo(x, 14);
    ctx.moveTo(x, 14);
    ctx.lineTo(x - 10, 36);
    ctx.moveTo(x, 14);
    ctx.lineTo(x + 10, 36);
    ctx.moveTo(x - 14, -4);
    ctx.lineTo(x + 14, -4);
    ctx.stroke();
    ctx.strokeStyle = c;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 8, -12);
    ctx.lineTo(x + 8, -12);
    ctx.stroke();
    ctx.lineWidth = 3;
  }
  ctx.fillStyle = '#c84a4a';
  ctx.beginPath();
  ctx.arc(0, -40, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(-3, -64, 6, 6);
  ctx.restore();
  // floor
  vgrad(ctx, 0, 900, W, H - 900, [[0, '#3a2414'], [1, '#1a0e08']]);
  for (let y = 900; y < H; y += 34) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, y, W, 2);
    for (let x = (y / 34) % 2 ? -60 : 0; x < W; x += 180) ctx.fillRect(x, y, 2, 34);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 900, W, 8);
  // round rug
  ctx.fillStyle = '#5a2a3a';
  ctx.beginPath();
  ctx.ellipse(470, 1080, 220, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c8a050';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(470, 1080, 190, 56, 0, 0, Math.PI * 2);
  ctx.stroke();
  // night table with the candle (the flame itself is animated by the story scene)
  ctx.fillStyle = '#3a2214';
  ctx.fillRect(388, 880, 92, 16);
  ctx.fillRect(398, 896, 10, 104);
  ctx.fillRect(460, 896, 10, 104);
  ctx.fillStyle = '#efe6cc';
  ctx.fillRect(426, 836, 16, 46);
  ctx.fillStyle = '#c8a050';
  ctx.fillRect(418, 878, 32, 6);
  // warm candle light over everything + darker corners
  glow(ctx, 434, 820, 520, 'rgba(255,170,80,0.22)');
  const vg = ctx.createRadialGradient(400, 760, 200, 400, 760, 900);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, 9000, 77);
}

const PAINTERS: Record<string, (ctx: Ctx) => void> = {
  bg_c1: forest,
  bg_c2: ruins,
  bg_c3: ash,
  bg_c4: marsh,
  bg_c5: tower,
  bg_c6: throne,
  bg_abismo: abyss,
  bg_day: (ctx) => courtyard(ctx, false),
  bg_dusk: (ctx) => courtyard(ctx, true),
  bg_village_night: villageNight,
  bg_room: healerRoom,
};

/** Bakes the background if it doesn't exist yet. Call it from any scene before using a bg key. */
export function ensureBackground(scene: Phaser.Scene, key: string): void {
  if (scene.textures.exists(key) || !PAINTERS[key]) return;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  PAINTERS[key](c.getContext('2d')!);
  scene.textures.addCanvas(key, c);
}

/** Only the title/menu background is needed at boot; the rest are baked on demand. */
export function generateBackgrounds(scene: Phaser.Scene): void {
  ensureBackground(scene, 'bg_dusk');
}

export const BACKGROUND_KEYS = Object.keys(PAINTERS);
