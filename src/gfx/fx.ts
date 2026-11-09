/**
 * Weapon, projectile, skill-icon and VFX textures painted with Canvas 2D
 * (gradients, glows, highlights). Baked once at boot; they replace the simpler
 * Graphics-made versions with the same keys, so gameplay code keeps working.
 */
import { type Ctx } from './canvas';

const INK = '#0b0b0e';

function paint(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: Ctx, w: number, h: number) => void): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  draw(ctx, w, h);
  scene.textures.addCanvas(key, c);
}

function radial(ctx: Ctx, x: number, y: number, r: number, stops: [number, string][]): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function lin(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]): CanvasGradient {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

/** Fills and outlines the current path. */
function ink(ctx: Ctx, fill: string | CanvasGradient, lw = 3): void {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function poly(ctx: Ctx, pts: number[][]): void {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

function star(ctx: Ctx, cx: number, cy: number, r1: number, r2: number, n: number, rot = -Math.PI / 2): void {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = rot + (i * Math.PI) / n;
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

// ================================================================== generic VFX
function vfx(scene: Phaser.Scene): void {
  paint(scene, 'fx_glow', 64, 64, (ctx) => radial(ctx, 32, 32, 32, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]));
  paint(scene, 'fx_spark', 48, 48, (ctx) => {
    radial(ctx, 24, 24, 24, [[0, 'rgba(255,255,255,0.9)'], [0.25, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]);
    ctx.fillStyle = '#ffffff';
    star(ctx, 24, 24, 23, 3, 4);
    ctx.fill();
  });
  paint(scene, 'fx_ring', 128, 128, (ctx) => radial(ctx, 64, 64, 64, [[0, 'rgba(255,255,255,0)'], [0.68, 'rgba(255,255,255,0)'], [0.84, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]));
  paint(scene, 'fx_flash', 128, 128, (ctx) => radial(ctx, 64, 64, 64, [[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,255,255,0.9)'], [0.5, 'rgba(255,255,255,0.3)'], [1, 'rgba(255,255,255,0)']]));
  paint(scene, 'fx_smoke', 72, 72, (ctx) => {
    for (const [x, y, r] of [[30, 40, 22], [44, 34, 20], [36, 26, 18], [26, 30, 16]]) radial(ctx, x, y, r, [[0, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]);
  });
  paint(scene, 'fx_shard', 18, 8, (ctx) => { ctx.fillStyle = '#ffffff'; poly(ctx, [[0, 4], [6, 0], [18, 4], [6, 8]]); ctx.fill(); });
  paint(scene, 'fx_muzzle', 72, 72, (ctx) => {
    radial(ctx, 36, 36, 36, [[0, 'rgba(255,255,230,1)'], [0.3, 'rgba(255,210,110,0.85)'], [1, 'rgba(255,140,40,0)']]);
    ctx.fillStyle = 'rgba(255,255,240,0.95)';
    star(ctx, 36, 36, 34, 7, 6, 0);
    ctx.fill();
  });
  paint(scene, 'fx_flame', 40, 64, (ctx) => {
    const g = lin(ctx, 0, 64, 0, 0, [[0, 'rgba(255,255,255,0.95)'], [0.4, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(20, 2);
    ctx.bezierCurveTo(34, 24, 38, 44, 20, 62);
    ctx.bezierCurveTo(2, 44, 6, 24, 20, 2);
    ctx.fill();
  });
  // ground target for area skills
  paint(scene, 'fx_target', 220, 90, (ctx) => {
    ctx.save();
    ctx.translate(110, 45);
    ctx.scale(1, 0.38);
    ctx.lineWidth = 7;
    ctx.strokeStyle = 'rgba(255,90,70,0.95)';
    ctx.setLineDash([22, 12]);
    ctx.beginPath(); ctx.arc(0, 0, 100, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,220,120,0.9)';
    ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.stroke();
    radial(ctx, 0, 0, 100, [[0, 'rgba(255,90,70,0.35)'], [1, 'rgba(255,90,70,0)']]);
    ctx.restore();
  });
  // translucent ice block for frozen enemies
  paint(scene, 'fx_ice', 120, 140, (ctx) => {
    poly(ctx, [[22, 136], [6, 70], [30, 12], [78, 4], [112, 50], [104, 128]]);
    ctx.fillStyle = lin(ctx, 0, 0, 120, 140, [[0, 'rgba(230,250,255,0.75)'], [0.5, 'rgba(150,215,255,0.45)'], [1, 'rgba(90,170,240,0.6)']]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, 12); ctx.lineTo(50, 70); ctx.lineTo(22, 136); ctx.moveTo(50, 70); ctx.lineTo(112, 50); ctx.moveTo(50, 70); ctx.lineTo(104, 128); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    poly(ctx, [[34, 22], [46, 18], [30, 60], [24, 56]]); ctx.fill();
  });
  // wave of ink for "Muro de Tinta"
  paint(scene, 'fx_inkwave', 150, 520, (ctx) => {
    ctx.fillStyle = lin(ctx, 0, 0, 150, 0, [[0, 'rgba(10,40,44,0)'], [0.45, 'rgba(18,90,90,0.85)'], [0.8, 'rgba(42,212,196,0.95)'], [1, 'rgba(200,255,250,1)']]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let y = 0; y <= 520; y += 26) ctx.quadraticCurveTo(150, y + 13, 120 + Math.sin(y * 0.05) * 18, y + 26);
    ctx.lineTo(0, 520);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (let y = 10; y < 520; y += 34) { ctx.beginPath(); ctx.arc(124 + Math.sin(y) * 10, y, 5 + (y % 3), 0, Math.PI * 2); ctx.fill(); }
  });
  // animated paper tornado (4 frames)
  for (let f = 0; f < 4; f++) {
    paint(scene, `tornado_${f}`, 130, 190, (ctx) => {
      radial(ctx, 65, 176, 60, [[0, 'rgba(200,200,190,0.45)'], [1, 'rgba(200,200,190,0)']]);
      for (let i = 0; i < 12; i++) {
        const y = 178 - i * 14;
        const w = 16 + i * 8;
        const off = Math.sin(i * 0.8 + f * (Math.PI / 2)) * (6 + i * 0.8);
        ctx.strokeStyle = `rgba(${235 - i * 4},${238 - i * 3},${245 - i * 2},${0.9 - i * 0.03})`;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(65 + off, y, w / 2, 6, 0, Math.PI * (0.05 + (f % 2) * 0.1), Math.PI * (1.85 + (f % 2) * 0.1));
        ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const a = f * 0.9 + i * 1.1;
        const r = 20 + i * 8;
        const x = 65 + Math.cos(a) * r;
        const y = 150 - i * 22;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.fillStyle = '#f2ecd8';
        ctx.fillRect(-6, -4, 12, 8);
        ctx.fillStyle = 'rgba(80,70,60,0.6)';
        ctx.fillRect(-4, -1, 8, 1.5);
        ctx.restore();
      }
    });
  }
}

// ================================================================== projectiles
function projectiles(scene: Phaser.Scene): void {
  const arrow = (key: string, gold: boolean) => paint(scene, key, 60, 18, (ctx) => {
    if (gold) radial(ctx, 40, 9, 22, [[0, 'rgba(255,230,120,0.75)'], [1, 'rgba(255,230,120,0)']]);
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(6, 9); ctx.lineTo(44, 9); ctx.stroke();
    ctx.strokeStyle = gold ? '#ffd86a' : '#9a6a3c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(6, 9); ctx.lineTo(44, 9); ctx.stroke();
    poly(ctx, [[42, 3], [58, 9], [42, 15], [45, 9]]);
    ink(ctx, lin(ctx, 0, 3, 0, 15, [[0, '#ffffff'], [0.5, gold ? '#ffe9a0' : '#c8d2dc'], [1, gold ? '#c89a2a' : '#6a7480']]), 2);
    for (const dy of [-1, 1]) {
      poly(ctx, [[2, 9], [12, 9], [8, 9 + dy * 7], [0, 9 + dy * 6]]);
      ink(ctx, gold ? '#fff2b0' : '#2ad4c4', 1.5);
    }
  });
  arrow('p_arrow', false);
  arrow('p_arrowGold', true);
  paint(scene, 'p_bullet', 46, 14, (ctx) => {
    ctx.fillStyle = lin(ctx, 0, 0, 46, 0, [[0, 'rgba(255,170,60,0)'], [0.6, 'rgba(255,200,90,0.7)'], [1, 'rgba(255,240,200,1)']]);
    ctx.beginPath(); ctx.ellipse(26, 7, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    radial(ctx, 38, 7, 8, [[0, '#ffffff'], [0.5, 'rgba(255,230,150,0.9)'], [1, 'rgba(255,200,90,0)']]);
  });
  const orb = (key: string, core: string, mid: string, size: number) => paint(scene, key, size, size, (ctx) => {
    const c = size / 2;
    radial(ctx, c, c, c, [[0, 'rgba(255,255,255,1)'], [0.25, core], [0.6, mid], [1, 'rgba(0,0,0,0)']]);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c, c, c * 0.55, -0.6, 1.4); ctx.stroke();
    ctx.fillStyle = '#ffffff';
    star(ctx, c, c, c * 0.5, 2, 4, Math.PI / 4); ctx.fill();
  });
  orb('p_orb', 'rgba(140,240,255,0.95)', 'rgba(60,170,255,0.45)', 46);
  orb('p_orbGold', 'rgba(255,240,150,0.95)', 'rgba(255,170,60,0.45)', 54);
  orb('p_eorb', 'rgba(220,140,255,0.95)', 'rgba(140,50,220,0.5)', 46);
  orb('p_turret', 'rgba(140,255,240,0.95)', 'rgba(42,212,196,0.45)', 22);
  paint(scene, 'p_pellet', 22, 22, (ctx) => radial(ctx, 11, 11, 11, [[0, '#ffffff'], [0.3, 'rgba(255,190,110,1)'], [0.7, 'rgba(255,100,40,0.5)'], [1, 'rgba(255,80,20,0)']]));
  const shuriken = (key: string, gold: boolean) => paint(scene, key, 44, 44, (ctx) => {
    if (gold) radial(ctx, 22, 22, 22, [[0, 'rgba(255,230,120,0.7)'], [1, 'rgba(255,230,120,0)']]);
    star(ctx, 22, 22, 20, 6, 4, Math.PI / 8);
    ink(ctx, lin(ctx, 4, 4, 40, 40, gold ? [[0, '#fff6c0'], [0.5, '#ffd86a'], [1, '#b8862a']] : [[0, '#ffffff'], [0.5, '#c8d2e0'], [1, '#6a7480']]), 2.5);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(22, 22, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = gold ? '#fff2b0' : '#9aa4ae'; ctx.beginPath(); ctx.arc(22, 22, 2.5, 0, Math.PI * 2); ctx.fill();
  });
  shuriken('p_star', false);
  shuriken('p_starGold', true);
  const lance = (key: string, gold: boolean) => paint(scene, key, 92, 22, (ctx) => {
    if (gold) radial(ctx, 70, 11, 22, [[0, 'rgba(255,230,120,0.7)'], [1, 'rgba(255,230,120,0)']]);
    else radial(ctx, 72, 11, 18, [[0, 'rgba(111,227,214,0.55)'], [1, 'rgba(111,227,214,0)']]);
    ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(4, 11); ctx.lineTo(64, 11); ctx.stroke();
    ctx.strokeStyle = '#2a4a52'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(4, 11); ctx.lineTo(64, 11); ctx.stroke();
    ctx.strokeStyle = gold ? '#ffd86a' : '#2ad4c4'; ctx.lineWidth = 4;
    for (const x of [14, 22, 30]) { ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x + 3, 14); ctx.stroke(); }
    poly(ctx, [[60, 11], [72, 3], [90, 11], [72, 19]]);
    ink(ctx, lin(ctx, 60, 0, 90, 22, gold ? [[0, '#fff6c0'], [1, '#d8a030']] : [[0, '#e8fffb'], [0.5, '#6fe3d6'], [1, '#1f8a80']]), 2.5);
  });
  lance('p_lanza', false);
  lance('p_lanzaGold', true);
  paint(scene, 'p_fall', 18, 66, (ctx) => {
    ctx.fillStyle = lin(ctx, 0, 0, 0, 40, [[0, 'rgba(255,240,200,0)'], [1, 'rgba(255,240,200,0.6)']]);
    ctx.fillRect(6, 0, 6, 40);
    ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(9, 14); ctx.lineTo(9, 48); ctx.stroke();
    ctx.strokeStyle = '#9a6a3c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(9, 14); ctx.lineTo(9, 48); ctx.stroke();
    poly(ctx, [[3, 46], [9, 64], [15, 46]]);
    ink(ctx, lin(ctx, 0, 46, 18, 64, [[0, '#ffffff'], [1, '#6a7480']]), 2);
  });
  paint(scene, 'p_bomb', 50, 50, (ctx) => {
    ctx.beginPath(); ctx.arc(24, 28, 17, 0, Math.PI * 2);
    ink(ctx, (() => { const g = ctx.createRadialGradient(18, 22, 2, 24, 28, 18); g.addColorStop(0, '#6a4aa0'); g.addColorStop(0.4, '#2a1a40'); g.addColorStop(1, '#0b0b0e'); return g; })(), 3);
    ctx.fillStyle = '#4a4e56'; ctx.fillRect(18, 7, 12, 7); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.strokeRect(18, 7, 12, 7);
    ctx.strokeStyle = '#8a5a2c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(24, 7); ctx.quadraticCurveTo(30, -2, 38, 4); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(17, 21, 5, 3, -0.6, 0, Math.PI * 2); ctx.fill();
  });
  paint(scene, 'p_web', 40, 40, (ctx) => {
    radial(ctx, 20, 20, 20, [[0, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]);
    ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 4; ctx.beginPath(); ctx.moveTo(20 + Math.cos(a) * 18, 20 + Math.sin(a) * 18); ctx.lineTo(20 - Math.cos(a) * 18, 20 - Math.sin(a) * 18); ctx.stroke(); }
    for (const r of [6, 11, 16]) { ctx.beginPath(); for (let i = 0; i <= 8; i++) { const a = (i * Math.PI) / 4; const x = 20 + Math.cos(a) * r; const y = 20 + Math.sin(a) * r; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
  });
}

// ================================================================== icons (weapons + skills)
/** Rounded rectangle path (manual: the native API is missing on older phones). */
function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function iconFrame(ctx: Ctx, top: string, bottom: string): void {
  ctx.fillStyle = INK;
  rr(ctx, 0, 0, 96, 96, 16);
  ctx.fill();
  ctx.fillStyle = lin(ctx, 0, 4, 0, 92, [[0, top], [1, bottom]]);
  rr(ctx, 4, 4, 88, 88, 13);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  rr(ctx, 8, 8, 80, 30, 10);
  ctx.fill();
  radial(ctx, 48, 56, 44, [[0, 'rgba(255,255,255,0.18)'], [1, 'rgba(255,255,255,0)']]);
}

function icons(scene: Phaser.Scene): void {
  const W = (key: string, draw: (ctx: Ctx) => void) => paint(scene, key, 96, 96, (ctx) => { iconFrame(ctx, '#ffd36a', '#f08424'); draw(ctx); });
  W('ic_arco', (ctx) => {
    ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(26, 50, 40, -1.1, 1.1); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = lin(ctx, 0, 10, 0, 90, [[0, '#c88a50'], [1, '#6a3a1c']]); ctx.beginPath(); ctx.arc(26, 50, 40, -1.1, 1.1); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(26 + Math.cos(-1.1) * 40, 50 + Math.sin(-1.1) * 40); ctx.lineTo(26 + Math.cos(1.1) * 40, 50 + Math.sin(1.1) * 40); ctx.stroke();
    ctx.fillStyle = '#2ad4c4'; ctx.fillRect(60, 44, 7, 12);
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(22, 50); ctx.lineTo(78, 50); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = '#9a6a3c'; ctx.beginPath(); ctx.moveTo(22, 50); ctx.lineTo(78, 50); ctx.stroke();
    poly(ctx, [[74, 43], [90, 50], [74, 57]]); ink(ctx, '#e8eef4', 2.5);
  });
  W('ic_pistola', (ctx) => {
    poly(ctx, [[14, 34], [82, 34], [84, 48], [46, 48], [42, 76], [24, 76], [28, 48], [14, 48]]);
    ink(ctx, lin(ctx, 0, 34, 0, 76, [[0, '#5a606a'], [1, '#22262c']]), 4);
    ctx.fillStyle = '#8a929c'; ctx.fillRect(18, 37, 62, 5);
    ctx.fillStyle = '#ff6a3d'; ctx.fillRect(48, 41, 8, 5); ctx.fillRect(62, 41, 8, 5);
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(40, 52, 7, 0, Math.PI); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; for (let y = 54; y < 74; y += 5) { ctx.beginPath(); ctx.moveTo(29, y); ctx.lineTo(41, y); ctx.stroke(); }
  });
  W('ic_baston', (ctx) => {
    ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(18, 84); ctx.lineTo(62, 32); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = '#2a3a48'; ctx.beginPath(); ctx.moveTo(18, 84); ctx.lineTo(62, 32); ctx.stroke();
    ctx.strokeStyle = '#ffd86a'; ctx.lineWidth = 4; for (const k of [0.3, 0.55]) { const x = 18 + 44 * k; const y = 84 - 52 * k; ctx.beginPath(); ctx.moveTo(x - 5, y - 4); ctx.lineTo(x + 5, y + 4); ctx.stroke(); }
    radial(ctx, 68, 26, 26, [[0, 'rgba(160,240,255,0.9)'], [1, 'rgba(60,170,255,0)']]);
    poly(ctx, [[68, 8], [80, 26], [68, 44], [56, 26]]); ink(ctx, lin(ctx, 56, 8, 80, 44, [[0, '#e8fdff'], [0.5, '#6fe3ff'], [1, '#2a7ab8']]), 3);
    ctx.strokeStyle = '#8ab8c8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(68, 26, 16, 1.0, 2.6); ctx.stroke();
  });
  W('ic_escopeta', (ctx) => {
    poly(ctx, [[8, 56], [36, 46], [38, 60], [14, 72]]); ink(ctx, lin(ctx, 0, 46, 0, 72, [[0, '#a86a3a'], [1, '#5a3418']]), 3.5);
    poly(ctx, [[34, 40], [90, 40], [90, 50], [34, 54]]); ink(ctx, lin(ctx, 0, 40, 0, 54, [[0, '#6a707a'], [1, '#2a2e36']]), 3.5);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(38, 42, 50, 2);
    poly(ctx, [[52, 52], [72, 50], [72, 60], [52, 62]]); ink(ctx, '#ff6a3d', 3);
  });
  W('ic_shuriken', (ctx) => {
    radial(ctx, 48, 50, 40, [[0, 'rgba(255,255,255,0.4)'], [1, 'rgba(255,255,255,0)']]);
    star(ctx, 48, 50, 38, 11, 4, Math.PI / 8); ink(ctx, lin(ctx, 10, 12, 86, 88, [[0, '#ffffff'], [0.5, '#c8d2e0'], [1, '#5a6470']]), 4);
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(48, 50, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9aa4ae'; ctx.beginPath(); ctx.arc(48, 50, 4, 0, Math.PI * 2); ctx.fill();
  });
  W('ic_lanza', (ctx) => {
    ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(14, 84); ctx.lineTo(64, 34); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = '#2a4a52'; ctx.beginPath(); ctx.moveTo(14, 84); ctx.lineTo(64, 34); ctx.stroke();
    ctx.strokeStyle = '#2ad4c4'; ctx.lineWidth = 4; for (const k of [0.15, 0.25, 0.35]) { const x = 14 + 50 * k; const y = 84 - 50 * k; ctx.beginPath(); ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4); ctx.stroke(); }
    poly(ctx, [[58, 40], [64, 22], [88, 10], [76, 34]]); ink(ctx, lin(ctx, 58, 10, 88, 40, [[0, '#e8fffb'], [0.5, '#6fe3d6'], [1, '#1f8a80']]), 3);
  });

  const S = (key: string, top: string, bottom: string, draw: (ctx: Ctx) => void) => paint(scene, key, 96, 96, (ctx) => { iconFrame(ctx, top, bottom); draw(ctx); });
  S('ic_lluvia', '#c8905a', '#6a3e1e', (ctx) => {
    for (let i = 0; i < 4; i++) {
      const x = 20 + i * 18;
      const y = 10 + (i % 2) * 14;
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y + 44); ctx.stroke();
      ctx.lineWidth = 2.5; ctx.strokeStyle = '#f0d0a0'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y + 44); ctx.stroke();
      poly(ctx, [[x, y + 42], [x + 7, y + 58], [x + 13, y + 41]]); ink(ctx, '#ffffff', 2);
    }
    ctx.fillStyle = 'rgba(255,90,70,0.6)'; ctx.beginPath(); ctx.ellipse(48, 82, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
  });
  S('ic_rayo', '#3a8ad8', '#123a6a', (ctx) => {
    radial(ctx, 48, 48, 40, [[0, 'rgba(180,240,255,0.7)'], [1, 'rgba(120,200,255,0)']]);
    poly(ctx, [[54, 6], [24, 52], [44, 52], [34, 90], [72, 38], [52, 38], [64, 6]]);
    ink(ctx, lin(ctx, 0, 6, 0, 90, [[0, '#ffffff'], [0.5, '#fff27a'], [1, '#ffc93c']]), 3.5);
  });
  S('ic_bomba', '#7a4ad0', '#2a1458', (ctx) => {
    ctx.beginPath(); ctx.arc(44, 56, 27, 0, Math.PI * 2);
    ink(ctx, (() => { const g = ctx.createRadialGradient(34, 46, 3, 44, 56, 28); g.addColorStop(0, '#7a5ab8'); g.addColorStop(0.45, '#2a1a40'); g.addColorStop(1, '#0b0b0e'); return g; })(), 4);
    ctx.strokeStyle = '#8a5a2c'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(58, 34); ctx.quadraticCurveTo(66, 18, 76, 20); ctx.stroke();
    radial(ctx, 78, 18, 16, [[0, 'rgba(255,255,220,1)'], [0.4, 'rgba(255,200,60,0.9)'], [1, 'rgba(255,120,30,0)']]);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(34, 46, 7, 4, -0.6, 0, Math.PI * 2); ctx.fill();
  });
  S('ic_muro', '#2ad4c4', '#0e5a54', (ctx) => {
    ctx.beginPath(); ctx.moveTo(12, 86); ctx.quadraticCurveTo(20, 30, 50, 26); ctx.quadraticCurveTo(84, 24, 86, 56); ctx.quadraticCurveTo(70, 44, 60, 58); ctx.lineTo(60, 86); ctx.closePath();
    ink(ctx, lin(ctx, 0, 30, 0, 86, [[0, '#6fe3d6'], [1, '#157a72']]), 3.5);
    ctx.fillStyle = '#ffffff'; for (const [x, y] of [[74, 40], [82, 50], [64, 34]]) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffffff'; ctx.fillRect(22, 58, 22, 8); ctx.fillRect(29, 51, 8, 22);
  });
  S('ic_hielo', '#9ad8ff', '#2a6aa8', (ctx) => {
    radial(ctx, 48, 48, 40, [[0, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]);
    ctx.strokeStyle = INK; ctx.lineWidth = 9;
    for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; ctx.beginPath(); ctx.moveTo(48 + Math.cos(a) * 34, 48 + Math.sin(a) * 34); ctx.lineTo(48 - Math.cos(a) * 34, 48 - Math.sin(a) * 34); ctx.stroke(); }
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5;
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath(); ctx.moveTo(48 + Math.cos(a) * 34, 48 + Math.sin(a) * 34); ctx.lineTo(48 - Math.cos(a) * 34, 48 - Math.sin(a) * 34); ctx.stroke();
      for (const s of [1, -1]) {
        const bx = 48 + Math.cos(a) * 22 * s;
        const by = 48 + Math.sin(a) * 22 * s;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a + 0.8 * s) * 9 * s, by + Math.sin(a + 0.8 * s) * 9 * s); ctx.stroke();
      }
    }
    poly(ctx, [[48, 38], [56, 48], [48, 58], [40, 48]]); ink(ctx, '#bfe9ff', 2.5);
  });
  S('ic_tornado', '#c8ccd4', '#5a6270', (ctx) => {
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = INK; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.ellipse(48 + Math.sin(i) * 4, 82 - i * 10, 8 + i * 5, 5, 0, 0.2, Math.PI * 1.8); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(48 + Math.sin(i) * 4, 82 - i * 10, 8 + i * 5, 5, 0, 0.2, Math.PI * 1.8); ctx.stroke();
    }
    ctx.fillStyle = '#f2ecd8'; ctx.fillRect(18, 30, 10, 7); ctx.fillRect(70, 22, 9, 6);
  });
  S('ic_evo', '#ff8a4a', '#b8241a', (ctx) => {
    radial(ctx, 48, 48, 44, [[0, 'rgba(255,240,180,0.8)'], [1, 'rgba(255,200,100,0)']]);
    poly(ctx, [[48, 10], [80, 46], [62, 46], [62, 84], [34, 84], [34, 46], [16, 46]]);
    ink(ctx, lin(ctx, 0, 10, 0, 84, [[0, '#ffffff'], [1, '#ffd86a']]), 4);
  });
  S('ic_legend', '#d06aff', '#5a1a9a', (ctx) => {
    radial(ctx, 48, 50, 44, [[0, 'rgba(255,240,160,0.8)'], [1, 'rgba(255,200,100,0)']]);
    star(ctx, 48, 50, 36, 15, 5); ink(ctx, lin(ctx, 0, 14, 0, 86, [[0, '#fff6c0'], [1, '#ffb83a']]), 4);
    star(ctx, 48, 50, 15, 6, 5); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();
  });
}

export function generateFx(scene: Phaser.Scene): void {
  vfx(scene);
  projectiles(scene);
  icons(scene);
}
