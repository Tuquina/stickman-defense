import { GAME_H, GAME_W } from '../config';

type G = Phaser.GameObjects.Graphics;

const lerp = (a: number, b: number, t: number) => Phaser.Display.Color.Interpolate.ColorWithColor(
  Phaser.Display.Color.ValueToColor(a), Phaser.Display.Color.ValueToColor(b), 100, Math.round(t * 100),
);

function vgrad(g: G, x: number, y: number, w: number, h: number, c1: number, c2: number, steps = 48): void {
  const sh = h / steps;
  for (let i = 0; i < steps; i++) {
    const c = lerp(c1, c2, i / (steps - 1));
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
    g.fillRect(x, y + i * sh, w, sh + 1);
  }
}

function P(arr: number[][]): Phaser.Math.Vector2[] {
  return arr.map(([x, y]) => new Phaser.Math.Vector2(x, y));
}

/** Deterministic pseudo-random so backgrounds are always identical. */
function rng(seed: number): () => number {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function bush(g: G, x: number, y: number, s: number, c: number): void {
  g.fillStyle(c, 1);
  g.fillCircle(x, y, 22 * s);
  g.fillCircle(x + 22 * s, y + 4 * s, 18 * s);
  g.fillCircle(x - 20 * s, y + 6 * s, 16 * s);
  g.fillRect(x - 36 * s, y + 6 * s, 76 * s, 16 * s);
}

function fern(g: G, x: number, y: number, s: number, c: number): void {
  g.lineStyle(4 * s, c, 1);
  for (let i = -3; i <= 3; i++) {
    const a = -Math.PI / 2 + i * 0.32;
    g.lineBetween(x, y, x + Math.cos(a) * 46 * s, y + Math.sin(a) * 40 * s);
  }
}

function forest(g: G): void {
  const r = rng(7);
  vgrad(g, 0, 0, GAME_W, 520, 0x3d6e66, 0x214541);
  // far trunks
  for (let i = 0; i < 9; i++) {
    const x = i * 90 + r() * 40;
    g.fillStyle(0x2a5550, 1);
    g.fillRect(x, 0, 26 + r() * 20, 470);
  }
  // light rays
  for (let i = 0; i < 4; i++) {
    const x = 120 + i * 170;
    g.fillStyle(0xf0f0b0, 0.07);
    g.fillPoints(P([[x, 0], [x + 50, 0], [x + 160, 520], [x + 60, 520]]), true);
  }
  // mid trunks with roots
  for (const [x, w] of [[30, 70], [300, 90], [560, 80]]) {
    g.fillStyle(0x183a35, 1);
    g.fillRect(x, 0, w, 430);
    g.fillPoints(P([[x - 40, 440], [x, 330], [x + w, 330], [x + w + 40, 440]]), true);
    g.fillStyle(0x20463f, 1);
    g.fillRect(x + 10, 0, 10, 400);
  }
  // hanging vines + leaves
  for (let i = 0; i < 14; i++) {
    const x = r() * GAME_W;
    const len = 80 + r() * 200;
    g.lineStyle(3, 0x10302b, 1);
    g.lineBetween(x, 0, x + (r() - 0.5) * 30, len);
    g.fillStyle(0x10302b, 1);
    for (let j = 0; j < 4; j++) g.fillEllipse(x + (r() - 0.5) * 24, r() * len, 14, 7);
  }
  // canopy
  g.fillStyle(0x0f2a26, 1);
  for (let i = 0; i < 12; i++) g.fillCircle(i * 66, 10 + r() * 30, 50 + r() * 30);
  // ground
  vgrad(g, 0, 400, GAME_W, 520, 0x2a5a48, 0x1a3a2f);
  g.fillStyle(0x34684f, 0.5);
  for (let i = 0; i < 18; i++) g.fillEllipse(r() * GAME_W, 450 + r() * 420, 80 + r() * 120, 18 + r() * 14);
  // back bushes on horizon
  for (let i = 0; i < 10; i++) bush(g, i * 80 + r() * 30, 405, 0.9 + r() * 0.5, 0x183d33);
  for (let i = 0; i < 5; i++) fern(g, 120 + i * 140 + r() * 40, 410, 1, 0x14352c);
  // lower region
  vgrad(g, 0, 910, GAME_W, GAME_H - 910, 0x163128, 0x0b1a16);
  for (let i = 0; i < 8; i++) fern(g, r() * GAME_W, 920 + r() * 20, 1.2, 0x0e231d);
}

function stoneWall(g: G, y: number, h: number, base: number, line: number, r: () => number): void {
  g.fillStyle(base, 1);
  g.fillRect(0, y, GAME_W, h);
  // crenellations
  for (let x = 0; x < GAME_W; x += 60) g.fillRect(x, y - 34, 36, 36);
  g.lineStyle(2, line, 0.6);
  for (let row = 0; row < h / 26; row++) {
    const yy = y + row * 26;
    g.lineBetween(0, yy, GAME_W, yy);
    for (let x = (row % 2) * 30; x < GAME_W; x += 60) g.lineBetween(x, yy, x, yy + 26);
  }
  g.fillStyle(0x000000, 0.08);
  for (let i = 0; i < 12; i++) g.fillRect(r() * GAME_W, y + r() * h, 40, 20);
}

function ruins(g: G): void {
  const r = rng(11);
  vgrad(g, 0, 0, GAME_W, 420, 0x5a7ab0, 0xf0b890);
  g.fillStyle(0xffffff, 0.35);
  for (let i = 0; i < 6; i++) g.fillEllipse(r() * GAME_W, 60 + r() * 140, 160 + r() * 120, 26);
  // far towers
  for (const [x, w, h] of [[40, 90, 320], [470, 110, 360], [620, 70, 260]]) {
    g.fillStyle(0x9a8a78, 1);
    g.fillRect(x, 420 - h, w, h);
    for (let cx = x; cx < x + w; cx += 26) g.fillRect(cx, 420 - h - 18, 16, 20);
    g.fillStyle(0x2a2a30, 0.8);
    g.fillRoundedRect(x + w / 2 - 9, 420 - h + 50, 18, 34, { tl: 9, tr: 9, bl: 0, br: 0 });
  }
  // trees
  for (let i = 0; i < 7; i++) {
    g.fillStyle(0x5a8a4a, 1);
    g.fillCircle(80 + i * 100 + r() * 30, 300 + r() * 30, 50 + r() * 20);
  }
  stoneWall(g, 300, 110, 0xc8b898, 0x8a7a64, r);
  // ground: stone tiles
  vgrad(g, 0, 400, GAME_W, 520, 0xb8aa92, 0x8a7c66);
  g.lineStyle(2, 0x6a5e4c, 0.5);
  for (let row = 0; row < 12; row++) {
    const y = 410 + row * 42;
    g.lineBetween(0, y, GAME_W, y);
    for (let x = (row % 2) * 45; x < GAME_W; x += 90) g.lineBetween(x, y, x - 12, y + 42);
  }
  g.fillStyle(0x6a8a4a, 0.5);
  for (let i = 0; i < 10; i++) g.fillEllipse(r() * GAME_W, 420 + r() * 460, 40, 10);
  vgrad(g, 0, 910, GAME_W, GAME_H - 910, 0x5a5044, 0x1e1a16);
}

function ash(g: G): void {
  const r = rng(23);
  vgrad(g, 0, 0, GAME_W, 420, 0x2a1240, 0xe8784a);
  g.fillStyle(0xffd0a0, 0.9);
  g.fillCircle(520, 300, 70);
  g.fillStyle(0xffd0a0, 0.2);
  g.fillCircle(520, 300, 110);
  // floating crown silhouette in the sky
  g.fillStyle(0x3a1a50, 0.7);
  g.fillPoints(P([[300, 150], [296, 112], [318, 132], [336, 98], [348, 132], [352, 150]]), true);
  g.fillPoints(P([[366, 150], [368, 128], [386, 100], [400, 134], [418, 112], [414, 150]]), true);
  // dunes
  g.fillStyle(0x7a3a4a, 1);
  g.fillPoints(P([[0, 420], [0, 330], [160, 300], [340, 350], [520, 310], [720, 340], [720, 420]]), true);
  g.fillStyle(0x5a2a40, 1);
  g.fillPoints(P([[0, 420], [0, 370], [200, 350], [420, 390], [720, 360], [720, 420]]), true);
  // pillars
  for (const [x, h] of [[60, 200], [190, 140], [600, 230]]) {
    g.fillStyle(0x4a2a3a, 1);
    g.fillRect(x, 420 - h, 44, h);
    g.fillRect(x - 8, 420 - h, 60, 14);
    g.fillPoints(P([[x, 420 - h], [x + 20, 420 - h - 30], [x + 44, 420 - h]]), true);
  }
  // ground
  vgrad(g, 0, 400, GAME_W, 520, 0x6a3a4c, 0x3a2030);
  g.fillStyle(0x8a4a5a, 0.4);
  for (let i = 0; i < 14; i++) g.fillEllipse(r() * GAME_W, 440 + r() * 440, 90 + r() * 80, 14);
  // crystals
  for (let i = 0; i < 6; i++) {
    const x = r() * GAME_W;
    const y = 420 + (i % 2) * 470;
    g.fillStyle(0xa040ff, 0.9);
    g.fillPoints(P([[x, y], [x + 10, y - 40], [x + 20, y]]), true);
    g.fillStyle(0xd27bff, 0.9);
    g.fillPoints(P([[x + 14, y], [x + 26, y - 26], [x + 34, y]]), true);
  }
  vgrad(g, 0, 910, GAME_W, GAME_H - 910, 0x2a1622, 0x0e070c);
}

function abyss(g: G): void {
  const r = rng(31);
  vgrad(g, 0, 0, GAME_W, GAME_H, 0x07040e, 0x2a0f3a);
  g.fillStyle(0xffffff, 1);
  for (let i = 0; i < 80; i++) g.fillCircle(r() * GAME_W, r() * 400, r() * 1.8 + 0.4);
  // ink drips from top
  for (let i = 0; i < 12; i++) {
    const x = r() * GAME_W;
    const h = 40 + r() * 160;
    g.fillStyle(0x000000, 1);
    g.fillRect(x, 0, 14, h);
    g.fillCircle(x + 7, h, 10);
  }
  vgrad(g, 0, 400, GAME_W, 520, 0x241236, 0x140a20);
  g.lineStyle(3, 0xa040ff, 0.5);
  for (let i = 0; i < 10; i++) {
    let x = r() * GAME_W;
    let y = 420 + r() * 440;
    for (let j = 0; j < 4; j++) {
      const nx = x + (r() - 0.5) * 80;
      const ny = y + r() * 30;
      g.lineBetween(x, y, nx, ny);
      x = nx; y = ny;
    }
  }
  vgrad(g, 0, 910, GAME_W, GAME_H - 910, 0x100818, 0x050208);
}

function castleDay(g: G, dusk: boolean): void {
  const r = rng(dusk ? 5 : 3);
  vgrad(g, 0, 0, GAME_W, 760, dusk ? 0x2a3a6a : 0x7ab8e8, dusk ? 0xf0a070 : 0xd8ecf8);
  g.fillStyle(0xffffff, dusk ? 0.2 : 0.7);
  for (let i = 0; i < 6; i++) g.fillEllipse(r() * GAME_W, 80 + r() * 260, 200, 40);
  // castle towers
  for (const [x, w, h] of [[-20, 140, 640], [560, 180, 720]]) {
    g.fillStyle(dusk ? 0x6a5a68 : 0xc8b898, 1);
    g.fillRect(x, 760 - h, w, h);
    for (let cx = x; cx < x + w; cx += 34) g.fillRect(cx, 760 - h - 24, 22, 26);
    g.lineStyle(2, dusk ? 0x4a3a48 : 0x9a8a72, 0.6);
    for (let row = 0; row < h / 30; row++) g.lineBetween(x, 760 - h + row * 30, x + w, 760 - h + row * 30);
  }
  // trees
  for (let i = 0; i < 6; i++) {
    g.fillStyle(dusk ? 0x2a4a3a : 0x5a9a5a, 1);
    g.fillCircle(150 + i * 80 + r() * 30, 520 + r() * 40, 60 + r() * 30);
  }
  stoneWall(g, 620, 200, dusk ? 0x7a6a6a : 0xd8c8a0, dusk ? 0x4a3a40 : 0x9a8a72, r);
  // grass strip + path
  g.fillStyle(dusk ? 0x3a5a3a : 0x7aaa5a, 1);
  g.fillRect(0, 820, GAME_W, 40);
  vgrad(g, 0, 850, GAME_W, GAME_H - 850, dusk ? 0x8a7a72 : 0xd8c8a8, dusk ? 0x3a3236 : 0xa89878);
  g.lineStyle(2, dusk ? 0x4a4040 : 0x8a7a62, 0.5);
  for (let row = 0; row < 10; row++) {
    const y = 870 + row * 44;
    g.lineBetween(0, y, GAME_W, y);
    for (let x = (row % 2) * 60; x < GAME_W; x += 120) g.lineBetween(x, y, x - 20, y + 44);
  }
}

export function generateBackgrounds(scene: Phaser.Scene): void {
  const make = (key: string, draw: (g: G) => void) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    draw(g);
    const rt = scene.make.renderTexture({ x: 0, y: 0, width: GAME_W, height: GAME_H }, false);
    rt.draw(g, 0, 0);
    rt.saveTexture(key);
    g.destroy();
  };
  make('bg_c1', forest);
  make('bg_c2', ruins);
  make('bg_c3', ash);
  make('bg_abismo', abyss);
  make('bg_day', (g) => castleDay(g, false));
  make('bg_dusk', (g) => castleDay(g, true));
}
