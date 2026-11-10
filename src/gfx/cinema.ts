/**
 * Painted props for the story cinematics (prologue attack, healer's house).
 * Baked once with Canvas 2D on first use; at runtime they are plain images, so they cost
 * nothing per frame beyond drawing a sprite.
 */
import { GAME_W } from '../config';
import { canvasTexture, glow, rng, type Ctx } from './canvas';

const W = GAME_W;

/** World Y where the house layer's bottom edge sits (the street line behind the characters). */
export const HOUSES_BOTTOM = 900;
const HOUSES_H = 500;

interface House { x: number; w: number; h: number; roof: number; chimney?: number }
const HOUSES: House[] = [
  { x: -20, w: 170, h: 170, roof: 96, chimney: 40 },
  { x: 150, w: 140, h: 130, roof: 80 },
  { x: 290, w: 170, h: 190, roof: 110, chimney: 120 },
  { x: 460, w: 140, h: 140, roof: 84 },
  { x: 600, w: 150, h: 175, roof: 96, chimney: 60 },
];

/** Points (world coords) on the roofs where fires burn during the attack. */
export const ROOF_FIRES: { x: number; y: number; s: number }[] = HOUSES.flatMap((h) => {
  const base = HOUSES_BOTTOM - 10 - h.h;
  return [
    { x: h.x + h.w * 0.32, y: base - h.roof * 0.45, s: 0.9 + (h.w % 3) * 0.1 },
    { x: h.x + h.w * 0.7, y: base - h.roof * 0.3, s: 0.75 },
  ];
}).filter((f) => f.x > 10 && f.x < W - 10);

function path(ctx: Ctx, pts: number[][]): void {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

function housesLayer(ctx: Ctx): void {
  const r = rng(9);
  const B = HOUSES_H - 10; // layer y of the street
  for (const h of HOUSES) {
    const top = B - h.h;
    // wall: dark plaster with timber frame, lit a little by the moon on the left
    const g = ctx.createLinearGradient(h.x, 0, h.x + h.w, 0);
    g.addColorStop(0, '#3a3450');
    g.addColorStop(1, '#221e32');
    ctx.fillStyle = g;
    ctx.fillRect(h.x, top, h.w, h.h);
    ctx.strokeStyle = '#141020';
    ctx.lineWidth = 7;
    ctx.strokeRect(h.x + 4, top + 4, h.w - 8, h.h - 8);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(h.x + 4, top + h.h * 0.45);
    ctx.lineTo(h.x + h.w - 4, top + h.h * 0.45);
    ctx.moveTo(h.x + 8, top + 8);
    ctx.lineTo(h.x + h.w * 0.4, top + h.h * 0.45);
    ctx.stroke();
    // chimney
    if (h.chimney) {
      ctx.fillStyle = '#1c1828';
      ctx.fillRect(h.x + h.chimney, top - h.roof * 0.75, 22, h.roof * 0.6);
      ctx.fillStyle = '#2a2638';
      ctx.fillRect(h.x + h.chimney - 3, top - h.roof * 0.78, 28, 8);
    }
    // roof: shingles + moonlit rim
    path(ctx, [[h.x - 14, top + 4], [h.x + h.w / 2, top - h.roof], [h.x + h.w + 14, top + 4]]);
    const rg = ctx.createLinearGradient(0, top - h.roof, 0, top);
    rg.addColorStop(0, '#2a1a2a');
    rg.addColorStop(1, '#170d18');
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    ctx.lineWidth = 2;
    for (let y = top - h.roof + 10; y < top; y += 11) {
      ctx.beginPath();
      ctx.moveTo(h.x - 20, y);
      ctx.lineTo(h.x + h.w + 20, y);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(150,160,230,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(h.x - 14, top + 4);
    ctx.lineTo(h.x + h.w / 2, top - h.roof);
    ctx.stroke();
    // windows: warm light, mullions, a glow spilling out
    const nWin = h.w > 150 ? 2 : 1;
    for (let i = 0; i < nWin; i++) {
      const wx = h.x + (nWin === 1 ? h.w * 0.62 : h.w * (0.28 + i * 0.44)) - 15;
      const wy = top + h.h * 0.55;
      glow(ctx, wx + 15, wy + 18, 46, 'rgba(255,180,90,0.45)');
      const wg = ctx.createLinearGradient(0, wy, 0, wy + 36);
      wg.addColorStop(0, '#ffe2a0');
      wg.addColorStop(1, '#ff9a3a');
      ctx.fillStyle = wg;
      ctx.fillRect(wx, wy, 30, 36);
      ctx.fillStyle = '#141020';
      ctx.fillRect(wx + 13, wy, 4, 36);
      ctx.fillRect(wx, wy + 16, 30, 4);
      ctx.strokeStyle = '#141020';
      ctx.lineWidth = 4;
      ctx.strokeRect(wx, wy, 30, 36);
    }
    // door
    if (h.w >= 150) {
      ctx.fillStyle = '#120c14';
      const dx = h.x + h.w * 0.18;
      ctx.beginPath();
      ctx.moveTo(dx, B);
      ctx.lineTo(dx, B - 56);
      ctx.quadraticCurveTo(dx + 17, B - 72, dx + 34, B - 56);
      ctx.lineTo(dx + 34, B);
      ctx.fill();
    }
  }
  // fences, barrels and a cart in front of the houses
  ctx.fillStyle = '#120e1a';
  for (let x = 0; x < W; x += 26) {
    if (r() < 0.35) continue;
    ctx.fillRect(x, B - 34, 7, 34);
  }
  ctx.fillRect(0, B - 24, W, 5);
  for (const bx of [128, 452]) {
    ctx.fillStyle = '#2a1e1e';
    ctx.beginPath();
    ctx.ellipse(bx, B - 22, 18, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0c080c';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  // ground shadow under the houses
  const sg = ctx.createLinearGradient(0, B - 20, 0, HOUSES_H);
  sg.addColorStop(0, 'rgba(0,0,0,0)');
  sg.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, B - 20, W, 30);
}

/** One flame frame: several soft tongues with a white-hot core (blend ADD at runtime). */
function flame(ctx: Ctx, w: number, h: number, seed: number): void {
  const r = rng(seed);
  const tongues = 5;
  for (let layer = 0; layer < 3; layer++) {
    const k = [1, 0.72, 0.42][layer];
    const cols = [
      ['rgba(255,70,20,0)', 'rgba(255,90,30,0.85)', 'rgba(200,40,10,0.9)'],
      ['rgba(255,150,40,0)', 'rgba(255,160,50,0.9)', 'rgba(255,120,30,0.95)'],
      ['rgba(255,240,180,0)', 'rgba(255,240,190,0.95)', 'rgba(255,255,230,1)'],
    ][layer];
    for (let t = 0; t < tongues; t++) {
      const cx = w / 2 + (r() - 0.5) * w * 0.45 * k;
      const top = h * (0.06 + r() * 0.35) + (1 - k) * h * 0.35;
      const bw = w * (0.22 + r() * 0.16) * k;
      const lean = (r() - 0.5) * w * 0.3;
      const g = ctx.createLinearGradient(0, top, 0, h);
      g.addColorStop(0, cols[0]);
      g.addColorStop(0.45, cols[1]);
      g.addColorStop(1, cols[2]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx - bw, h - 4);
      ctx.bezierCurveTo(cx - bw * 1.2, h * 0.6, cx + lean - bw * 0.3, top + h * 0.2, cx + lean, top);
      ctx.bezierCurveTo(cx + lean + bw * 0.3, top + h * 0.25, cx + bw * 1.2, h * 0.6, cx + bw, h - 4);
      ctx.closePath();
      ctx.fill();
    }
  }
  const core = ctx.createRadialGradient(w / 2, h * 0.86, 2, w / 2, h * 0.86, w * 0.4);
  core.addColorStop(0, 'rgba(255,255,240,0.95)');
  core.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);
}

/** The beast's head/mantle (tentacles are drawn live by the story scene). */
function beastBody(ctx: Ctx, w: number, h: number): void {
  const cx = w / 2;
  // mantle silhouette
  ctx.beginPath();
  ctx.moveTo(20, h);
  ctx.bezierCurveTo(10, h * 0.55, 70, h * 0.22, cx - 60, h * 0.08);
  ctx.bezierCurveTo(cx - 20, 0, cx + 20, 0, cx + 60, h * 0.08);
  ctx.bezierCurveTo(w - 70, h * 0.22, w - 10, h * 0.55, w - 20, h);
  ctx.closePath();
  const body = ctx.createRadialGradient(cx - 40, h * 0.3, 20, cx, h * 0.5, w * 0.62);
  body.addColorStop(0, '#3a2466');
  body.addColorStop(0.55, '#1c1036');
  body.addColorStop(1, '#09050f');
  ctx.fillStyle = body;
  ctx.fill();
  // violet rim light along the top
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(170,110,255,0.75)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(30, h * 0.75);
  ctx.bezierCurveTo(30, h * 0.45, 80, h * 0.2, cx - 60, h * 0.1);
  ctx.bezierCurveTo(cx - 20, h * 0.02, cx + 20, h * 0.02, cx + 60, h * 0.1);
  ctx.stroke();
  // blotches and glossy streaks
  const r = rng(13);
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = `rgba(5,2,10,${0.2 + r() * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(40 + r() * (w - 80), 40 + r() * (h - 80), 8 + r() * 26, 6 + r() * 16, r() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx - 70, h * 0.32, 120, Math.PI * 1.15, Math.PI * 1.45);
  ctx.stroke();
  ctx.restore();
  // brow ridges
  ctx.fillStyle = '#07040c';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 14, h * 0.44);
    ctx.lineTo(cx + s * 150, h * 0.36);
    ctx.lineTo(cx + s * 160, h * 0.44);
    ctx.lineTo(cx + s * 40, h * 0.5);
    ctx.closePath();
    ctx.fill();
  }
  // glowing eyes (angry almonds) with slit pupils
  for (const s of [-1, 1]) {
    const ex = cx + s * 92;
    const ey = h * 0.5;
    glow(ctx, ex, ey, 90, 'rgba(190,120,255,0.55)');
    ctx.beginPath();
    ctx.moveTo(ex - s * 58, ey - 4);
    ctx.quadraticCurveTo(ex, ey - 34 + 14, ex + s * 56, ey - 16);
    ctx.quadraticCurveTo(ex + s * 10, ey + 30, ex - s * 58, ey - 4);
    const eg = ctx.createRadialGradient(ex, ey - 2, 2, ex, ey, 60);
    eg.addColorStop(0, '#ffffff');
    eg.addColorStop(0.35, '#f0d8ff');
    eg.addColorStop(1, '#9a4aff');
    ctx.fillStyle = eg;
    ctx.fill();
    ctx.fillStyle = '#12061e';
    ctx.beginPath();
    ctx.ellipse(ex + s * 4, ey - 2, 5, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // the Crown's mark on the forehead
  const my = h * 0.22;
  glow(ctx, cx, my, 70, 'rgba(210,120,255,0.7)');
  ctx.strokeStyle = '#f0c8ff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx - 34, my + 18);
  ctx.lineTo(cx - 30, my - 14);
  ctx.lineTo(cx - 12, my + 4);
  ctx.lineTo(cx, my - 22);
  ctx.lineTo(cx + 12, my + 4);
  ctx.lineTo(cx + 30, my - 14);
  ctx.lineTo(cx + 34, my + 18);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(200,110,255,0.45)';
  ctx.fill();
  // maw with teeth and a sick glow inside
  const mY = h * 0.72;
  ctx.beginPath();
  ctx.moveTo(cx - 120, mY - 10);
  ctx.quadraticCurveTo(cx, mY + 70, cx + 120, mY - 10);
  ctx.quadraticCurveTo(cx, mY + 20, cx - 120, mY - 10);
  const mg = ctx.createRadialGradient(cx, mY + 20, 4, cx, mY + 20, 110);
  mg.addColorStop(0, '#ff5aa8');
  mg.addColorStop(1, '#2a0420');
  ctx.fillStyle = mg;
  ctx.fill();
  ctx.fillStyle = '#efe4f6';
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = cx - 108 + t * 216;
    const y = mY - 10 + Math.sin(t * Math.PI) * 26;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x, y + 18 + (i % 2) * 8);
    ctx.closePath();
    ctx.fill();
  }
  // ink drips running down
  ctx.fillStyle = '#0b0614';
  for (let i = 0; i < 9; i++) {
    const x = 50 + i * ((w - 100) / 8) + (i % 2) * 14;
    const len = 30 + ((i * 37) % 60);
    ctx.beginPath();
    ctx.moveTo(x - 9, h - 4);
    ctx.lineTo(x - 6, h + 0);
    ctx.quadraticCurveTo(x - 7, h - 4 + len, x, h - 4 + len + 8);
    ctx.quadraticCurveTo(x + 7, h - 4 + len, x + 6, h);
    ctx.closePath();
    ctx.fill();
  }
}

function bed(ctx: Ctx, w: number, h: number): void {
  // wooden frame (side view): tall headboard on the left, low footboard on the right
  const wood = ctx.createLinearGradient(0, 0, 0, h);
  wood.addColorStop(0, '#7a4a2a');
  wood.addColorStop(1, '#3a2010');
  ctx.fillStyle = wood;
  ctx.fillRect(0, 0, 22, h);
  ctx.fillRect(w - 20, 40, 20, h - 40);
  ctx.beginPath();
  ctx.arc(11, 4, 15, 0, Math.PI * 2);
  ctx.arc(w - 10, 40, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(18, h - 52, w - 34, 22);
  ctx.fillRect(20, h - 30, 12, 30);
  ctx.fillRect(w - 34, h - 30, 12, 30);
  // mattress and sheet
  ctx.fillStyle = '#e8e0cc';
  ctx.fillRect(22, h - 84, w - 42, 34);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(22, h - 58, w - 42, 8);
  // pillow
  ctx.fillStyle = '#f6f0e0';
  ctx.beginPath();
  ctx.ellipse(70, h - 92, 50, 20, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,100,80,0.45)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#140a04';
  ctx.lineWidth = 4;
  ctx.strokeRect(22, h - 84, w - 42, 34);
}

function blanket(ctx: Ctx, w: number, h: number): void {
  // patchwork quilt draped over the bed edge
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(4, 10);
  ctx.bezierCurveTo(w * 0.3, 0, w * 0.6, 14, w - 4, 6);
  ctx.lineTo(w - 10, h - 8);
  ctx.bezierCurveTo(w * 0.6, h + 4, w * 0.3, h - 14, 10, h - 4);
  ctx.closePath();
  ctx.clip();
  const cols = ['#8a3a3a', '#2a7a7a', '#c8a050', '#5a4a8a', '#a0603a'];
  let k = 0;
  for (let x = 0; x < w; x += 38) for (let y = -10; y < h; y += 30) ctx.fillStyle = cols[(k++) % cols.length], ctx.fillRect(x, y, 38, 30);
  ctx.strokeStyle = 'rgba(255,240,200,0.5)';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2;
  for (let x = 38; x < w; x += 38) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  ctx.setLineDash([]);
  const sh = ctx.createLinearGradient(0, 0, 0, h);
  sh.addColorStop(0, 'rgba(255,255,255,0.18)');
  sh.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = sh;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  ctx.strokeStyle = '#140a04';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(4, 10);
  ctx.bezierCurveTo(w * 0.3, 0, w * 0.6, 14, w - 4, 6);
  ctx.lineTo(w - 10, h - 8);
  ctx.bezierCurveTo(w * 0.6, h + 4, w * 0.3, h - 14, 10, h - 4);
  ctx.closePath();
  ctx.stroke();
}

/** Dante's broken broom left on the floor of the healer's house. */
function brokenBroom(ctx: Ctx): void {
  ctx.save();
  ctx.translate(30, 40);
  ctx.rotate(0.12);
  ctx.fillStyle = '#0b0b0e';
  ctx.fillRect(-2, -6, 104, 12);
  ctx.fillStyle = '#a0682e';
  ctx.fillRect(0, -4, 100, 8);
  ctx.fillStyle = '#d8a060';
  ctx.beginPath();
  ctx.moveTo(100, -4);
  ctx.lineTo(112, 0);
  ctx.lineTo(100, 4);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(150, 46);
  ctx.rotate(-0.2);
  ctx.fillStyle = '#0b0b0e';
  ctx.fillRect(-2, -6, 60, 12);
  ctx.fillStyle = '#a0682e';
  ctx.fillRect(0, -4, 56, 8);
  ctx.fillStyle = '#0b0b0e';
  ctx.beginPath();
  ctx.moveTo(52, -10);
  ctx.lineTo(100, -22);
  ctx.lineTo(104, 22);
  ctx.lineTo(52, 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e0b85a';
  ctx.beginPath();
  ctx.moveTo(56, -7);
  ctx.lineTo(98, -18);
  ctx.lineTo(101, 18);
  ctx.lineTo(56, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function vignette(ctx: Ctx, w: number, h: number): void {
  const g = ctx.createRadialGradient(w / 2, h * 0.48, h * 0.28, w / 2, h * 0.48, h * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Bakes the cinematic props (once). */
export function ensureCinema(scene: Phaser.Scene): void {
  canvasTexture(scene, 'village_houses', W, HOUSES_H, (ctx) => housesLayer(ctx));
  for (let i = 0; i < 4; i++) canvasTexture(scene, `flame_${i}`, 96, 150, (ctx, w, h) => flame(ctx, w, h, 101 + i * 17));
  canvasTexture(scene, 'beast_body', 520, 480, (ctx, w, h) => beastBody(ctx, w, h));
  canvasTexture(scene, 'bed', 380, 170, (ctx, w, h) => bed(ctx, w, h));
  canvasTexture(scene, 'blanket', 230, 76, (ctx, w, h) => blanket(ctx, w, h));
  canvasTexture(scene, 'vignette', 360, 640, (ctx, w, h) => vignette(ctx, w, h));
  canvasTexture(scene, 'broom_broken', 270, 90, (ctx) => brokenBroom(ctx));
}

export { HOUSES_H };
