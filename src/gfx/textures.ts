import { canvasTexture, stickerize } from './canvas';
import { drawStickman, POSES, type Look, type Skeleton } from './stickman';

type G = Phaser.GameObjects.Graphics;
const INK = 0x0b0b0e;

function bake(scene: Phaser.Scene, key: string, w: number, h: number, draw: (g: G) => void): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function pts(arr: number[][], ox = 0, oy = 0, sx = 1, sy = 1): Phaser.Math.Vector2[] {
  return arr.map(([x, y]) => new Phaser.Math.Vector2(ox + x * sx, oy + y * sy));
}

function star(g: G, cx: number, cy: number, r1: number, r2: number, n: number, rot = -Math.PI / 2): void {
  const p: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = rot + (i * Math.PI) / n;
    p.push(new Phaser.Math.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
  g.fillPoints(p, true);
}

/** Texture size + frame count per enemy id (for sprite setup). */
export const ENEMY_TEX: Record<string, { w: number; h: number; scale?: number }> = {};

function enemy(scene: Phaser.Scene, id: string, w: number, h: number, draw: (g: G, frame: number) => void): void {
  ENEMY_TEX[id] = { w, h };
  for (let f = 0; f < 2; f++) bake(scene, `e_${id}_${f}`, w, h, (g) => draw(g, f));
}

function spider(g: G, frame: number, cx: number, cy: number, s: number, body: number, crown = false, eggs = false): void {
  g.lineStyle(4 * s, INK, 1);
  for (let i = 0; i < 4; i++) {
    const bx = cx - 10 * s + i * 8 * s;
    const ph = (i + frame) % 2 === 0 ? 1 : -1;
    // near legs
    g.lineBetween(bx, cy + 2 * s, bx - 8 * s + ph * 4 * s, cy - 14 * s);
    g.lineBetween(bx - 8 * s + ph * 4 * s, cy - 14 * s, bx - 14 * s + ph * 6 * s, cy + 22 * s);
    g.lineBetween(bx, cy + 2 * s, bx + 10 * s - ph * 4 * s, cy - 10 * s);
    g.lineBetween(bx + 10 * s - ph * 4 * s, cy - 10 * s, bx + 16 * s - ph * 5 * s, cy + 22 * s);
  }
  if (eggs) {
    g.fillStyle(0xf0e6d0, 1);
    g.fillCircle(cx + 28 * s, cy - 2 * s, 12 * s);
    g.fillStyle(0xd8c8a8, 1);
    g.fillCircle(cx + 31 * s, cy + 1 * s, 6 * s);
  }
  g.fillStyle(Phaser.Display.Color.ValueToColor(body).darken(30).color, 1);
  g.fillEllipse(cx + 8 * s, cy + 2 * s, 46 * s, 34 * s);
  g.fillStyle(body, 1);
  g.fillEllipse(cx + 8 * s, cy - 1 * s, 44 * s, 30 * s);
  g.fillStyle(0xff8a8a, 0.6);
  g.fillEllipse(cx + 2 * s, cy - 8 * s, 16 * s, 8 * s);
  g.lineStyle(3 * s, INK, 0.7);
  g.lineBetween(cx + 8 * s, cy - 15 * s, cx + 8 * s, cy + 13 * s);
  g.fillStyle(INK, 1);
  g.fillCircle(cx - 16 * s, cy + 4 * s, 10 * s);
  g.fillStyle(0xffffff, 1);
  g.fillPoints(pts([[-6, -2], [-1, 0], [-5, 2]], cx - 16 * s, cy + 3 * s, s, s), true);
  g.fillPoints(pts([[-1, 3], [3, 2], [0, 5]], cx - 18 * s, cy + 3 * s, s, s), true);
  if (crown) {
    g.fillStyle(0x6a2fc0, 1);
    g.fillPoints(pts([[-14, 0], [-16, -14], [-8, -6], [0, -18], [8, -6], [16, -14], [14, 0]], cx + 8 * s, cy - 14 * s, s, s), true);
    g.fillStyle(0xd27bff, 1);
    g.fillCircle(cx + 8 * s, cy - 24 * s, 3 * s);
  }
}

function humanoid(scene: Phaser.Scene, id: string, w: number, h: number, s: number, look: Look, extra?: (g: G, frame: number, sk: Skeleton) => void): void {
  enemy(scene, id, w, h, (g, frame) => {
    const pose = POSES.walk(frame === 0 ? 0.8 : -0.8);
    const sk = drawStickman(g, w / 2, h - 4, s, pose, look, -1, frame * 0.6);
    extra?.(g, frame, sk);
  });
}

export function generateTextures(scene: Phaser.Scene): void {
  // ------------------------------------------------------------ particles & misc
  bake(scene, 'dot', 12, 12, (g) => { g.fillStyle(0xffffff, 1); g.fillCircle(6, 6, 6); });
  bake(scene, 'spark', 20, 20, (g) => { g.fillStyle(0xffffff, 1); star(g, 10, 10, 10, 3, 4); });
  bake(scene, 'ring', 128, 128, (g) => { g.lineStyle(8, 0xffffff, 1); g.strokeCircle(64, 64, 58); });
  bake(scene, 'disc', 128, 128, (g) => { g.fillStyle(0xffffff, 1); g.fillCircle(64, 64, 64); });
  bake(scene, 'shadow', 64, 20, (g) => { g.fillStyle(0x000000, 0.32); g.fillEllipse(32, 10, 64, 20); });
  bake(scene, 'mark', 84, 84, (g) => {
    g.lineStyle(5, 0xff3b3b, 1);
    g.strokeCircle(42, 42, 34);
    g.lineStyle(5, 0xff3b3b, 1);
    for (const [x1, y1, x2, y2] of [[42, 0, 42, 16], [42, 68, 42, 84], [0, 42, 16, 42], [68, 42, 84, 42]]) g.lineBetween(x1, y1, x2, y2);
  });
  bake(scene, 'coin', 30, 30, (g) => {
    g.fillStyle(0xb8860b, 1); g.fillCircle(15, 15, 14);
    g.fillStyle(0xffc93c, 1); g.fillCircle(15, 14, 12);
    g.fillStyle(0xfff0a0, 1); g.fillRect(12, 7, 6, 14);
    g.fillStyle(0xb8860b, 1); g.fillRect(14, 9, 2, 10);
  });
  bake(scene, 'xp', 18, 22, (g) => {
    g.fillStyle(0x0b5c66, 1); g.fillPoints(pts([[9, 0], [18, 11], [9, 22], [0, 11]]), true);
    g.fillStyle(0x5fe0d2, 1); g.fillPoints(pts([[9, 3], [15, 11], [9, 19], [3, 11]]), true);
    g.fillStyle(0xffffff, 0.8); g.fillPoints(pts([[9, 4], [12, 9], [9, 11], [6, 9]]), true);
  });
  bake(scene, 'stake', 56, 64, (g) => {
    g.lineStyle(13, 0x3a2116, 1); g.lineBetween(10, 8, 46, 58); g.lineBetween(46, 8, 10, 58);
    g.lineStyle(9, 0x7a4a33, 1); g.lineBetween(10, 8, 46, 58); g.lineBetween(46, 8, 10, 58);
    g.fillStyle(0x9a6a4d, 1); g.fillCircle(10, 8, 4.5); g.fillCircle(46, 8, 4.5);
  });
  bake(scene, 'rock', 170, 80, (g) => {
    g.fillStyle(0x4a4e52, 1);
    g.fillPoints(pts([[8, 70], [20, 26], [60, 10], [120, 14], [156, 34], [166, 72]]), true);
    g.fillStyle(0x6a6f74, 1);
    g.fillPoints(pts([[24, 30], [62, 14], [118, 18], [150, 36], [110, 40], [50, 40]]), true);
    g.fillStyle(0x34373a, 1);
    g.fillPoints(pts([[8, 70], [166, 72], [160, 80], [12, 80]]), true);
  });
  bake(scene, 'chest', 48, 44, (g) => {
    g.fillStyle(0x6a3a1c, 1); g.fillRoundedRect(2, 14, 44, 28, 5);
    g.fillStyle(0x8a4a24, 1); g.fillRoundedRect(2, 4, 44, 16, { tl: 12, tr: 12, bl: 2, br: 2 });
    g.fillStyle(0xffc93c, 1); g.fillRect(2, 18, 44, 5); g.fillRect(20, 14, 8, 14);
    g.fillStyle(0xfff0a0, 1); g.fillRect(22, 18, 4, 6);
  });
  bake(scene, 'splat', 120, 120, (g) => {
    g.fillStyle(0xffffff, 1);
    g.fillCircle(60, 60, 34);
    const r = [0.9, 0.3, 1.7, 2.4, 3.3, 4.1, 5.0, 5.8];
    r.forEach((a, i) => {
      const d = 36 + (i % 3) * 10;
      g.fillCircle(60 + Math.cos(a) * d, 60 + Math.sin(a) * d, 8 + (i % 2) * 6);
      g.fillCircle(60 + Math.cos(a) * (d - 14), 60 + Math.sin(a) * (d - 14), 12);
    });
  });
  // white glove pointer (tutorial)
  bake(scene, 'hand', 70, 90, (g) => {
    const outline = (fn: (o: number) => void) => { g.fillStyle(0x0b0b0e, 1); fn(4); g.fillStyle(0xffffff, 1); fn(0); };
    outline((o) => g.fillRoundedRect(14 - o, 4 - o, 18 + o * 2, 50 + o * 2, 9));
    outline((o) => g.fillRoundedRect(10 - o, 38 - o, 50 + o * 2, 44 + o * 2, 16));
    outline((o) => g.fillRoundedRect(30 - o, 34 - o, 14 + o * 2, 24 + o * 2, 7));
    outline((o) => g.fillRoundedRect(44 - o, 38 - o, 14 + o * 2, 22 + o * 2, 7));
    g.fillStyle(0xd8dee6, 1); g.fillRoundedRect(16, 62, 40, 6, 3);
  });
  bake(scene, 'gear', 48, 48, (g) => {
    g.fillStyle(0xffffff, 1);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      g.fillCircle(24 + Math.cos(a) * 17, 24 + Math.sin(a) * 17, 6);
    }
    g.fillCircle(24, 24, 17);
    g.fillStyle(0x3a4a5e, 1); g.fillCircle(24, 24, 7);
  });
  bake(scene, 'pause', 40, 40, (g) => { g.fillStyle(0xffffff, 1); g.fillRoundedRect(6, 4, 10, 32, 3); g.fillRoundedRect(24, 4, 10, 32, 3); });
  bake(scene, 'lock', 40, 48, (g) => {
    g.lineStyle(6, 0x8a94a0, 1); g.beginPath(); g.arc(20, 20, 11, Math.PI, 0); g.strokePath();
    g.lineBetween(9, 20, 9, 24); g.lineBetween(31, 20, 31, 24);
    g.fillStyle(0xb8c2cc, 1); g.fillRoundedRect(4, 22, 32, 24, 5);
    g.fillStyle(0x2a2e36, 1); g.fillCircle(20, 32, 4); g.fillRect(18, 32, 4, 8);
  });

  // ------------------------------------------------------------ projectiles
  bake(scene, 'p_arrow', 44, 12, (g) => {
    g.lineStyle(3, 0x8a5a2c, 1); g.lineBetween(4, 6, 34, 6);
    g.fillStyle(0xd8dee6, 1); g.fillPoints(pts([[32, 1], [44, 6], [32, 11]]), true);
    g.fillStyle(0x2ad4c4, 1); g.fillPoints(pts([[0, 1], [10, 6], [0, 11], [4, 6]]), true);
  });
  bake(scene, 'p_arrowGold', 48, 14, (g) => {
    g.fillStyle(0xffe27a, 0.4); g.fillEllipse(24, 7, 48, 14);
    g.lineStyle(3, 0xffd86a, 1); g.lineBetween(4, 7, 36, 7);
    g.fillStyle(0xffffff, 1); g.fillPoints(pts([[34, 2], [48, 7], [34, 12]]), true);
  });
  bake(scene, 'p_bullet', 30, 10, (g) => {
    g.fillStyle(0xffb340, 0.5); g.fillEllipse(15, 5, 30, 10);
    g.fillStyle(0xfff0a0, 1); g.fillEllipse(19, 5, 20, 5);
  });
  bake(scene, 'p_orb', 34, 34, (g) => {
    g.fillStyle(0x6fe3ff, 0.25); g.fillCircle(17, 17, 17);
    g.fillStyle(0x6fe3ff, 0.6); g.fillCircle(17, 17, 11);
    g.fillStyle(0xffffff, 1); g.fillCircle(17, 17, 6);
  });
  bake(scene, 'p_orbGold', 40, 40, (g) => {
    g.fillStyle(0xffe27a, 0.25); g.fillCircle(20, 20, 20);
    g.fillStyle(0xffe27a, 0.6); g.fillCircle(20, 20, 13);
    g.fillStyle(0xffffff, 1); g.fillCircle(20, 20, 7);
  });
  bake(scene, 'p_pellet', 16, 16, (g) => {
    g.fillStyle(0xff6a3d, 0.5); g.fillCircle(8, 8, 8);
    g.fillStyle(0xffd0a0, 1); g.fillCircle(8, 8, 4);
  });
  bake(scene, 'p_star', 30, 30, (g) => {
    g.fillStyle(0xc8d2e0, 1); star(g, 15, 15, 15, 5, 4);
    g.fillStyle(0x6a7480, 1); g.fillCircle(15, 15, 4);
  });
  const lance = (key: string, tip: number, glowC: number | null) => bake(scene, key, 76, 16, (g) => {
    if (glowC !== null) { g.fillStyle(glowC, 0.35); g.fillEllipse(40, 8, 76, 16); }
    g.lineStyle(4, 0x1f3a40, 1); g.lineBetween(2, 8, 56, 8);
    g.fillStyle(tip, 1); g.fillPoints(pts([[54, 2], [74, 8], [54, 14], [58, 8]]), true);
    g.fillStyle(0xffffff, 0.8); g.fillPoints(pts([[58, 6], [70, 8], [58, 9]]), true);
    g.fillStyle(0x2ad4c4, 1); g.fillRect(4, 5, 8, 6);
  });
  lance('p_lanza', 0x6fe3d6, null);
  lance('p_lanzaGold', 0xffe27a, 0xffe27a);
  bake(scene, 'p_starGold', 36, 36, (g) => {
    g.fillStyle(0xffe27a, 0.4); g.fillCircle(18, 18, 18);
    g.fillStyle(0xffd86a, 1); star(g, 18, 18, 17, 6, 4);
    g.fillStyle(0xffffff, 1); g.fillCircle(18, 18, 4);
  });
  bake(scene, 'p_turret', 20, 8, (g) => { g.fillStyle(0x2ad4c4, 1); g.fillEllipse(10, 4, 20, 6); g.fillStyle(0xffffff, 1); g.fillEllipse(13, 4, 8, 3); });
  bake(scene, 'p_earrow', 40, 10, (g) => {
    g.lineStyle(3, 0x3a2a2a, 1); g.lineBetween(10, 5, 36, 5);
    g.fillStyle(0xff3b3b, 1); g.fillPoints(pts([[12, 0], [0, 5], [12, 10]]), true);
  });
  bake(scene, 'p_web', 34, 34, (g) => {
    g.lineStyle(2, 0xffffff, 0.95);
    for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 4; g.lineBetween(17 + Math.cos(a) * 16, 17 + Math.sin(a) * 16, 17 - Math.cos(a) * 16, 17 - Math.sin(a) * 16); }
    g.strokeCircle(17, 17, 7); g.strokeCircle(17, 17, 13);
  });
  bake(scene, 'p_eorb', 34, 34, (g) => {
    g.fillStyle(0xa040ff, 0.35); g.fillCircle(17, 17, 17);
    g.fillStyle(0xd27bff, 1); g.fillCircle(17, 17, 9);
    g.fillStyle(0xffffff, 1); g.fillCircle(17, 17, 4);
  });
  bake(scene, 'p_bomb', 40, 40, (g) => {
    g.fillStyle(INK, 1); g.fillCircle(20, 22, 15);
    g.fillStyle(0x9a5cff, 1); g.fillCircle(15, 17, 5);
    g.lineStyle(3, 0x8a5a2c, 1); g.lineBetween(26, 10, 32, 3);
    g.fillStyle(0xffc93c, 1); g.fillCircle(33, 3, 3);
  });
  bake(scene, 'p_fall', 12, 50, (g) => {
    g.lineStyle(3, 0x8a5a2c, 1); g.lineBetween(6, 0, 6, 38);
    g.fillStyle(0xd8dee6, 1); g.fillPoints(pts([[0, 36], [6, 50], [12, 36]]), true);
  });
  for (let f = 0; f < 2; f++) {
    bake(scene, `tornado_${f}`, 110, 170, (g) => {
      for (let i = 0; i < 9; i++) {
        const y = 160 - i * 18;
        const w = 20 + i * 9;
        const off = Math.sin(i * 0.9 + f * 1.6) * 10;
        g.fillStyle(i % 2 === 0 ? 0xf2f2f2 : 0xd0d6de, 0.85);
        g.fillEllipse(55 + off, y, w, 16);
      }
      g.lineStyle(2, 0x9aa4ae, 0.8);
      for (let i = 0; i < 5; i++) g.lineBetween(30 + i * 12, 40 + i * 20, 70 - i * 6, 50 + i * 22);
    });
  }

  // ------------------------------------------------------------ turret (mini stickman with pencil gun)
  bake(scene, 'turret', 60, 70, (g) => {
    const sk = drawStickman(g, 26, 68, 0.52, POSES.aim(0, 1.5), { scarf: 0x2ad4c4, eyes: 'determined' }, 1, 0);
    g.lineStyle(5, 0xffc93c, 1);
    g.lineBetween(sk.handF.x - 4, sk.handF.y, sk.handF.x + 20, sk.handF.y);
    g.fillStyle(0xf0d0a0, 1);
    g.fillPoints(pts([[0, -3], [8, 0], [0, 3]], sk.handF.x + 20, sk.handF.y), true);
  });

  // ------------------------------------------------------------ chapter 1 enemies
  enemy(scene, 'arana', 80, 60, (g, f) => spider(g, f, 36, 34, 0.9, 0xd8323a));
  enemy(scene, 'aranaMadre', 150, 110, (g, f) => spider(g, f, 66, 64, 1.75, 0xb8222a, false, true));
  enemy(scene, 'reina', 230, 170, (g, f) => spider(g, f, 100, 100, 2.6, 0xc81e3a, true));
  enemy(scene, 'escarabajo', 96, 66, (g, f) => {
    g.lineStyle(5, INK, 1);
    for (let i = 0; i < 3; i++) {
      const bx = 30 + i * 18;
      const ph = (i + f) % 2 === 0 ? 5 : -5;
      g.lineBetween(bx, 46, bx - 8 + ph, 64);
    }
    g.fillStyle(0x5a1a1e, 1); g.fillEllipse(54, 38, 72, 50);
    g.fillStyle(0x8a2a2e, 1); g.fillEllipse(54, 34, 66, 40);
    g.lineStyle(3, 0x3a0a0e, 1); g.lineBetween(54, 14, 54, 56);
    g.fillStyle(0xff9a9a, 0.4); g.fillEllipse(44, 24, 22, 10);
    g.fillStyle(INK, 1); g.fillCircle(18, 42, 13);
    g.fillPoints(pts([[8, 36], [-2, 22], [14, 32]]), true);
    g.fillStyle(0xffffff, 1); g.fillPoints(pts([[10, 38], [17, 41], [11, 44]]), true);
  });
  enemy(scene, 'seta', 64, 76, (g, f) => {
    const sq = f === 0 ? 0 : 4;
    g.lineStyle(5, INK, 1);
    g.lineBetween(26, 54, 20 + sq, 74); g.lineBetween(38, 54, 44 - sq, 74);
    g.fillStyle(0xe8dcc0, 1); g.fillRoundedRect(20, 34 + sq, 24, 24 - sq, 6);
    g.fillStyle(0xd8323a, 1);
    g.fillEllipse(32, 30 + sq, 60, 38 - sq);
    g.fillStyle(0xe8dcc0, 1); g.fillRect(2, 30 + sq, 60, 14);
    g.fillStyle(0xd8323a, 1); g.fillEllipse(32, 30 + sq, 60, 30 - sq);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(18, 22 + sq, 5); g.fillCircle(38, 16 + sq, 6); g.fillCircle(50, 28 + sq, 4);
    g.fillStyle(INK, 1);
    g.fillPoints(pts([[22, 44], [30, 46], [22, 49]], 0, sq), true);
    g.fillPoints(pts([[34, 46], [42, 44], [42, 49]], 0, sq), true);
  });

  // ------------------------------------------------------------ chapter 2 enemies
  const bone: Look = { bones: true, eyes: 'glow', eyeColor: 0xff3b3b, body: 0x1a1a1e };
  humanoid(scene, 'esqueleto', 90, 128, 0.82, { ...bone, weapon: 'sword' });
  humanoid(scene, 'arquero', 90, 128, 0.82, { ...bone, weapon: 'arco' });
  humanoid(scene, 'caballero', 100, 138, 0.9, { helm: 'hollow', shield: true, tier: 2, capeColor: 0x6a2a2a, body: 0x15151a, scarf: null });
  humanoid(scene, 'sirHueco', 230, 290, 2.15, { helm: 'hollow', tier: 2, capeColor: 0x7a1e22, weapon: 'sword', body: 0x15151a, outline: 0xff3b3b, scarf: null });
  enemy(scene, 'murcielago', 84, 56, (g, f) => {
    const up = f === 0 ? -1 : 1;
    g.fillStyle(0x4a2a6a, 1);
    g.fillPoints(pts([[42, 28], [8, 14 + up * 14], [16, 30], [4, 36], [30, 36]]), true);
    g.fillPoints(pts([[42, 28], [76, 14 + up * 14], [68, 30], [80, 36], [54, 36]]), true);
    g.fillStyle(INK, 1); g.fillCircle(42, 30, 13);
    g.fillPoints(pts([[34, 20], [32, 8], [40, 18]]), true); g.fillPoints(pts([[50, 20], [52, 8], [44, 18]]), true);
    g.fillStyle(0xff3b3b, 1); g.fillCircle(37, 29, 3); g.fillCircle(47, 29, 3);
  });
  enemy(scene, 'gargola', 150, 120, (g, f) => {
    const up = f === 0 ? -1 : 1;
    g.fillStyle(0x5a6068, 1);
    g.fillPoints(pts([[75, 54], [10, 20 + up * 20], [26, 50], [6, 64], [56, 70]]), true);
    g.fillPoints(pts([[75, 54], [140, 20 + up * 20], [124, 50], [144, 64], [94, 70]]), true);
    g.fillStyle(0x7a8088, 1); g.fillEllipse(75, 70, 54, 60);
    g.fillStyle(0x4a4e56, 1); g.fillCircle(68, 42, 22);
    g.fillPoints(pts([[56, 26], [46, 4], [62, 24]]), true); g.fillPoints(pts([[78, 26], [88, 4], [74, 24]]), true);
    g.fillStyle(0xffb340, 1); g.fillPoints(pts([[52, 40], [62, 44], [52, 47]]), true); g.fillPoints(pts([[68, 44], [78, 40], [78, 47]]), true);
    g.lineStyle(6, 0x4a4e56, 1); g.lineBetween(60, 96, 54, 118); g.lineBetween(88, 96, 94, 118);
  });

  // ------------------------------------------------------------ chapter 3 enemies
  const blob = (g: G, f: number, cx: number, cy: number, s: number) => {
    const sq = f === 0 ? 1 : 0.88;
    g.fillStyle(0x2a1a3a, 1);
    g.fillEllipse(cx, cy, 52 * s / sq, 42 * s * sq);
    g.fillCircle(cx - 22 * s, cy + 12 * s, 7 * s); g.fillCircle(cx + 20 * s, cy + 14 * s, 6 * s);
    g.fillStyle(0x6a3a9a, 0.7); g.fillEllipse(cx - 6 * s, cy - 10 * s, 20 * s, 10 * s);
    g.fillStyle(0xffffff, 1);
    g.fillPoints(pts([[-14, -4], [-4, 0], [-13, 4]], cx, cy, s, s), true);
    g.fillPoints(pts([[2, 0], [12, -4], [11, 4]], cx, cy, s, s), true);
  };
  enemy(scene, 'mancha', 70, 56, (g, f) => blob(g, f, 35, 30, 1));
  enemy(scene, 'manchita', 44, 36, (g, f) => blob(g, f, 22, 20, 0.6));
  humanoid(scene, 'sombra', 96, 124, 0.85, { eyes: 'glow', eyeColor: 0xd27bff, body: 0x120a1a, outline: 0x6a2fc0 });
  humanoid(scene, 'brujo', 90, 130, 0.85, { eyes: 'glow', eyeColor: 0x6aff8a, hoodColor: 0x2a5a3a, capeColor: 0x1a3a2a, weapon: 'baston' });
  enemy(scene, 'golem', 120, 124, (g, f) => {
    const step = f === 0 ? 4 : -4;
    g.fillStyle(0x4a4038, 1);
    g.fillRoundedRect(30 + step, 88, 22, 34, 6); g.fillRoundedRect(68 - step, 88, 22, 34, 6);
    g.fillStyle(0x6a5a4c, 1); g.fillRoundedRect(22, 34, 76, 62, 14);
    g.fillStyle(0x7a6a5a, 1); g.fillRoundedRect(30, 40, 40, 20, 8);
    g.fillStyle(0x4a4038, 1); g.fillRoundedRect(4, 44 - step, 22, 50, 8); g.fillRoundedRect(94, 44 + step, 22, 50, 8);
    g.fillStyle(0x5a4c40, 1); g.fillRoundedRect(36, 6, 46, 36, 10);
    g.fillStyle(0xff8a3d, 1);
    g.fillPoints(pts([[40, 22], [52, 26], [41, 30]]), true); g.fillPoints(pts([[58, 26], [70, 22], [69, 30]]), true);
    g.lineStyle(3, 0xff8a3d, 0.7); g.lineBetween(50, 50, 62, 70); g.lineBetween(62, 70, 56, 86);
  });
  humanoid(scene, 'guardian', 170, 210, 1.55, { corrupt: true, eyes: 'glow', eyeColor: 0xd27bff, capeColor: 0x3a1a5a, weapon: 'sword', outline: 0x8a3ae0 });
  // ------------------------------------------------------------ chapter 4: Marisma de Tinta
  enemy(scene, 'renacuajo', 74, 56, (g, f) => {
    const w = f === 0 ? 8 : -8;
    g.fillStyle(0x10262a, 1);
    g.fillPoints(pts([[36, 30], [56, 22 + w], [72, 28 + w * 1.4], [58, 34 + w], [36, 38]]), true);
    g.fillStyle(0x0b0b0e, 1); g.fillCircle(28, 32, 18);
    g.fillStyle(0x2a6a6a, 0.8); g.fillEllipse(22, 24, 14, 7);
    g.fillStyle(0xffffff, 1);
    g.fillPoints(pts([[14, 28], [24, 31], [15, 35]]), true); g.fillPoints(pts([[26, 31], [34, 27], [34, 35]]), true);
  });
  enemy(scene, 'sanguijuela', 86, 48, (g, f) => {
    const u = f === 0 ? 4 : -4;
    for (let i = 0; i < 5; i++) {
      const x = 22 + i * 12;
      g.fillStyle(i % 2 ? 0x5a1a22 : 0x6e222a, 1);
      g.fillEllipse(x, 26 + (i % 2 ? u : -u) * 0.6, 20 - i, 22 - i * 1.5);
    }
    g.fillStyle(0x2a0a0e, 1); g.fillCircle(14, 26, 11);
    g.fillStyle(0xffe0e0, 1);
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.fillCircle(14 + Math.cos(a) * 6, 26 + Math.sin(a) * 6, 1.8); }
    g.fillStyle(0xff8a8a, 0.4); g.fillEllipse(40, 18, 30, 5);
  });
  humanoid(scene, 'pescador', 96, 132, 0.84, { eyes: 'glow', eyeColor: 0x6fe3d6, capeColor: 0x2a4a3a, body: 0x101418 }, (g, _f, sk) => {
    // straw hat + harpoon
    g.fillStyle(0xc8a050, 1); g.fillEllipse(sk.head.x, sk.head.y - 10, 50, 10);
    g.fillStyle(0xa8803a, 1); g.fillEllipse(sk.head.x, sk.head.y - 16, 24, 14);
    g.lineStyle(3, 0x5a3a20, 1); g.lineBetween(sk.handF.x + 10, sk.handF.y + 20, sk.handF.x - 34, sk.handF.y - 26);
    g.fillStyle(0xc8d2dc, 1); g.fillPoints(pts([[-34, -26], [-44, -38], [-30, -32]], sk.handF.x, sk.handF.y), true);
  });
  enemy(scene, 'tortuga', 116, 84, (g, f) => {
    const st = f === 0 ? 4 : -4;
    g.fillStyle(0x3a4a2a, 1);
    g.fillRoundedRect(28 + st, 58, 16, 22, 6); g.fillRoundedRect(76 - st, 58, 16, 22, 6);
    g.fillStyle(0x4e5e34, 1); g.fillCircle(20, 52, 15);
    g.fillStyle(0xffffff, 1); g.fillPoints(pts([[10, 48], [20, 51], [11, 55]]), true);
    g.fillStyle(0x4a3a22, 1); g.fillEllipse(64, 46, 88, 62);
    g.fillStyle(0x6a5a32, 1); g.fillEllipse(64, 40, 80, 46);
    g.lineStyle(3, 0x3a2a16, 1);
    for (const [x, y] of [[50, 32], [72, 30], [62, 48], [86, 44], [40, 46]]) g.strokeCircle(x, y, 9);
    g.fillStyle(0x7a8a4a, 0.6); g.fillEllipse(56, 26, 30, 8);
  });
  enemy(scene, 'hidra', 170, 150, (g, f) => {
    g.fillStyle(0x0d2226, 1); g.fillEllipse(90, 130, 150, 34);
    const heads = [[40, 52], [86, 30], [130, 54]];
    heads.forEach(([hx, hy], i) => {
      const sway = (f === 0 ? 1 : -1) * (i % 2 ? 6 : -6);
      g.lineStyle(16, 0x15363a, 1); g.lineBetween(90, 128, hx + sway, hy + 14);
      g.fillStyle(0x1e4a4e, 1); g.fillCircle(hx + sway, hy, 18);
      g.fillStyle(0x0b0b0e, 1); g.fillPoints(pts([[-18, 2], [-30, 8], [-16, 10]], hx + sway, hy), true);
      g.fillStyle(0x6fe3d6, 1); g.fillPoints(pts([[-12, -4], [-3, -1], [-11, 3]], hx + sway, hy), true);
    });
  });
  enemy(scene, 'kraken', 250, 220, (g, f) => {
    const w = f === 0 ? 1 : -1;
    for (let i = 0; i < 6; i++) {
      const bx = 50 + i * 32;
      g.lineStyle(18 - i, 0x120a1e, 1);
      g.lineBetween(bx, 160, bx - 20 + w * (i % 2 ? 14 : -14), 214);
      g.lineBetween(bx - 20 + w * (i % 2 ? 14 : -14), 214, bx - 40, 200);
    }
    g.fillStyle(0x1a0f2a, 1); g.fillEllipse(130, 100, 190, 150);
    g.fillStyle(0x2a1a40, 1); g.fillEllipse(118, 80, 150, 100);
    g.fillStyle(0x3a2458, 0.6); g.fillEllipse(100, 56, 70, 26);
    // the Crown's mark on its forehead
    g.fillStyle(0xa040ff, 0.4); g.fillCircle(130, 50, 22);
    g.fillStyle(0xd27bff, 1); g.fillPoints(pts([[116, 58], [114, 42], [122, 50], [130, 36], [138, 50], [146, 42], [144, 58]]), true);
    g.fillStyle(0xffffff, 1);
    g.fillPoints(pts([[56, 96], [92, 104], [60, 116]]), true); g.fillPoints(pts([[100, 104], [134, 94], [130, 116]]), true);
    g.fillStyle(0xd27bff, 1); g.fillCircle(70, 106, 3); g.fillCircle(120, 106, 3);
  });

  // ------------------------------------------------------------ chapter 5: Torre del Olvido
  enemy(scene, 'pagina', 70, 64, (g, f) => {
    const bend = f === 0 ? 6 : -6;
    g.fillStyle(0xe8e2d0, 1);
    g.fillPoints(pts([[10, 12 + bend], [58, 6], [62, 54], [14, 58 - bend]]), true);
    g.fillStyle(0xc8c0a8, 1); g.fillPoints(pts([[50, 6], [58, 6], [62, 16]]), true);
    g.lineStyle(2, 0x9a9080, 1);
    for (let i = 0; i < 5; i++) g.lineBetween(18, 22 + i * 7, 52, 20 + i * 7);
    g.fillStyle(0x0b0b0e, 1);
    g.fillPoints(pts([[20, 28], [32, 32], [21, 36]]), true); g.fillPoints(pts([[36, 32], [48, 27], [47, 36]]), true);
  });
  enemy(scene, 'tintero', 70, 84, (g, f) => {
    const st = f === 0 ? 4 : -4;
    g.lineStyle(5, 0x0b0b0e, 1); g.lineBetween(26, 66, 22 + st, 82); g.lineBetween(44, 66, 48 - st, 82);
    g.fillStyle(0x1a2a5a, 1); g.fillRoundedRect(12, 28, 46, 42, 10);
    g.fillStyle(0x0b0b1a, 1); g.fillRoundedRect(16, 40, 38, 28, 8);
    g.fillStyle(0x3a4a8a, 1); g.fillRect(24, 16, 22, 14);
    g.fillStyle(0x0b0b1a, 1); g.fillEllipse(35, 16, 24, 8);
    g.fillStyle(0xffffff, 0.35); g.fillRect(16, 32, 6, 30);
    g.fillStyle(0xffffff, 1); g.fillPoints(pts([[22, 48], [32, 52], [23, 56]]), true); g.fillPoints(pts([[36, 52], [46, 48], [46, 56]]), true);
  });
  humanoid(scene, 'escriba', 96, 132, 0.85, { eyes: 'glow', eyeColor: 0xbfe9ff, hoodColor: 0x5a5a6a, capeColor: 0x3a3a48 }, (g, _f, sk) => {
    // quill
    g.lineStyle(2, 0x2a2a2a, 1); g.lineBetween(sk.handF.x, sk.handF.y, sk.handF.x - 14, sk.handF.y - 30);
    g.fillStyle(0xf2f2f2, 1); g.fillPoints(pts([[-14, -30], [-24, -48], [-8, -36]], sk.handF.x, sk.handF.y), true);
  });
  humanoid(scene, 'guardiaCorona', 110, 140, 0.92, { corrupt: true, shield: true, eyes: 'glow', eyeColor: 0xd27bff, capeColor: 0x3a1a5a });
  enemy(scene, 'golemLibros', 150, 170, (g, f) => {
    const st = f === 0 ? 5 : -5;
    const colors = [0x8a2a2a, 0x2a5a8a, 0x2a7a4a, 0x8a6a2a, 0x5a2a7a, 0x2a6a6a];
    g.fillStyle(0x3a2a1a, 1); g.fillRect(44 + st, 132, 24, 36); g.fillRect(84 - st, 132, 24, 36);
    for (let i = 0; i < 6; i++) {
      g.fillStyle(colors[i], 1); g.fillRoundedRect(32 + (i % 2) * 8, 40 + i * 16, 88, 15, 3);
      g.fillStyle(0xe8e2d0, 1); g.fillRect(112 + (i % 2) * 8, 42 + i * 16, 6, 11);
    }
    g.fillStyle(colors[3], 1); g.fillRoundedRect(6, 50 - st, 26, 70, 6); g.fillRoundedRect(122, 50 + st, 26, 70, 6);
    g.fillStyle(colors[4], 1); g.fillRoundedRect(50, 6, 56, 36, 6);
    g.fillStyle(0xffe27a, 1); g.fillPoints(pts([[58, 20], [72, 25], [59, 30]]), true); g.fillPoints(pts([[84, 25], [98, 20], [97, 30]]), true);
  });
  humanoid(scene, 'recuerdo', 210, 330, 2.2, { kid: true, collar: 0xe2552c, crown: true, outline: 0xb060ff, eyes: 'glow', eyeColor: 0xffb0c8, body: 0x1a0a28 });

  // ------------------------------------------------------------ chapter 6: Trono de la Corona
  humanoid(scene, 'coronado', 100, 175, 0.88, { eyes: 'glow', eyeColor: 0xffd86a, body: 0x120a1a, outline: 0x8a3ae0, crown: true });
  humanoid(scene, 'dante', 270, 420, 2.35, { corrupt: true, crown: true, eyes: 'glow', eyeColor: 0xffffff, capeColor: 0x6a1e1e, scarf: 0xa8442a, weapon: 'sword', outline: 0xb060ff });

  humanoid(scene, 'ecoDante', 240, 380, 2.1, { corrupt: true, crown: true, eyes: 'glow', eyeColor: 0xffffff, capeColor: 0x5a1a2a, outline: 0xb060ff });

  // ------------------------------------------------------------ icons
  generateIcons(scene);
  generatePassiveIcons(scene);

  // ------------------------------------------------------------ finish: outline + shading on every sprite
  const PAD = 3;
  for (const id of Object.keys(ENEMY_TEX)) {
    for (let f = 0; f < 2; f++) stickerize(scene, `e_${id}_${f}`, { pad: PAD });
    ENEMY_TEX[id].w += PAD * 2;
    ENEMY_TEX[id].h += PAD * 2;
  }
  for (const k of ['p_lanza', 'p_lanzaGold', 'p_arrow', 'p_arrowGold', 'p_bullet', 'p_pellet', 'p_star', 'p_starGold', 'p_turret', 'p_earrow', 'p_bomb', 'p_fall', 'turret', 'coin', 'xp', 'stake', 'rock', 'chest', 'lock']) {
    stickerize(scene, k, { pad: 2 });
  }

  // ink splash behind the logo
  canvasTexture(scene, 'inksplash', 680, 340, (ctx, w, h) => {
    const r = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const rnd = r(42);
    ctx.fillStyle = 'rgba(8,10,14,0.82)';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.44, h * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2;
      const d = 0.8 + rnd() * 0.35;
      ctx.beginPath();
      ctx.arc(w / 2 + Math.cos(a) * w * 0.44 * d, h / 2 + Math.sin(a) * h * 0.34 * d, 8 + rnd() * 26, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 7; i++) {
      const x = w * 0.2 + rnd() * w * 0.6;
      const len = 30 + rnd() * 80;
      ctx.fillRect(x - 5, h * 0.6, 10, len + h * 0.15);
      ctx.beginPath();
      ctx.arc(x, h * 0.75 + len, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // radial vignette (battle mood + danger pulse)
  canvasTexture(scene, 'vignette', 360, 640, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.28, w / 2, h / 2, h * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/** Drawn icons for passives and permanent upgrades (shared visual language). */
function generatePassiveIcons(scene: Phaser.Scene): void {
  const W = 0xffffff;
  const D = 0x0b0b0e;
  const icon = (key: string, color: number, draw: (g: G) => void) => bake(scene, key, 72, 72, (g) => { iconBg(g, color); draw(g); });
  icon('pi_filo', 0xc8402e, (g) => {
    g.fillStyle(D, 1); g.fillPoints(pts([[50, 8], [62, 10], [26, 50], [20, 44]]), true);
    g.fillStyle(0xe8eef4, 1); g.fillPoints(pts([[51, 11], [59, 12], [26, 46], [23, 43]]), true);
    g.fillStyle(0xffc93c, 1); g.fillRect(12, 46, 22, 7); g.fillRect(17, 50, 7, 16);
    g.fillStyle(D, 1); g.fillCircle(20, 66, 4);
  });
  icon('pi_prisa', 0x1f9ab0, (g) => {
    g.lineStyle(5, W, 1);
    for (let i = 0; i < 3; i++) g.lineBetween(10, 22 + i * 14, 34 - i * 4, 22 + i * 14);
    g.fillStyle(W, 1); g.fillPoints(pts([[36, 14], [62, 36], [36, 58], [44, 36]]), true);
  });
  icon('pi_critico', 0xd89a1c, (g) => {
    g.lineStyle(5, W, 1); g.strokeCircle(36, 38, 20); g.strokeCircle(36, 38, 9);
    g.lineBetween(36, 10, 36, 22); g.lineBetween(36, 54, 36, 66); g.lineBetween(8, 38, 20, 38); g.lineBetween(52, 38, 64, 38);
    g.fillStyle(0xff3b3b, 1); g.fillCircle(36, 38, 5);
  });
  icon('pi_combo', 0xd8641c, (g) => {
    for (const y of [26, 46]) {
      g.lineStyle(4, W, 1); g.lineBetween(10, y, 52, y);
      g.fillStyle(W, 1); g.fillPoints(pts([[50, y - 8], [64, y], [50, y + 8]]), true);
    }
  });
  icon('pi_estacas', 0x7a4a2a, (g) => {
    for (const x of [18, 36, 54]) {
      g.fillStyle(0x3a2116, 1); g.fillPoints(pts([[x - 7, 64], [x - 7, 22], [x, 10], [x + 7, 22], [x + 7, 64]]), true);
      g.fillStyle(0xb07a50, 1); g.fillPoints(pts([[x - 4, 62], [x - 4, 24], [x, 15], [x + 4, 24], [x + 4, 62]]), true);
    }
    g.fillStyle(0xd8dee6, 1); g.fillRect(8, 36, 56, 6);
  });
  icon('pi_savia', 0x2e8a4a, (g) => {
    g.fillStyle(0x9aff9a, 1); g.fillPoints(pts([[14, 60], [20, 26], [52, 12], [46, 46]]), true);
    g.lineStyle(3, 0x1e5a2e, 1); g.lineBetween(16, 58, 46, 22);
    g.fillStyle(W, 1); g.fillRect(48, 44, 16, 6); g.fillRect(53, 39, 6, 16);
  });
  icon('pi_mente', 0x5a5cd8, (g) => {
    g.fillStyle(W, 1); g.fillRect(18, 10, 36, 6); g.fillRect(18, 58, 36, 6);
    g.fillPoints(pts([[22, 16], [50, 16], [38, 37], [50, 58], [22, 58], [34, 37]]), true);
    g.fillStyle(0xffd34d, 1); g.fillPoints(pts([[28, 22], [44, 22], [36, 34]]), true); g.fillPoints(pts([[36, 44], [46, 56], [26, 56]]), true);
  });
  icon('pi_perforacion', 0x6a7480, (g) => {
    g.fillStyle(0x3a4048, 1); g.fillCircle(30, 36, 11); g.fillCircle(50, 36, 11);
    g.lineStyle(4, W, 1); g.lineBetween(6, 36, 60, 36);
    g.fillStyle(W, 1); g.fillPoints(pts([[58, 28], [68, 36], [58, 44]]), true);
  });
  icon('pi_sabiduria', 0x1f8a80, (g) => {
    g.fillStyle(W, 1); g.fillPoints(pts([[8, 20], [35, 26], [35, 62], [8, 56]]), true); g.fillPoints(pts([[64, 20], [37, 26], [37, 62], [64, 56]]), true);
    g.lineStyle(2, 0x1f8a80, 1); for (let i = 0; i < 3; i++) { g.lineBetween(13, 32 + i * 8, 30, 36 + i * 8); g.lineBetween(42, 36 + i * 8, 59, 32 + i * 8); }
  });
  icon('pi_bolsillos', 0xb88a14, (g) => {
    g.fillStyle(0x6a4a24, 1); g.fillCircle(36, 44, 22); g.fillPoints(pts([[26, 22], [46, 22], [40, 28], [32, 28]]), true);
    g.fillStyle(0xffd34d, 1); g.fillCircle(36, 46, 11);
    g.fillStyle(0x6a4a24, 1); g.fillRect(34, 39, 4, 14);
  });
  icon('pi_furia', 0xc8243e, (g) => {
    g.fillStyle(0xffb340, 1); g.fillPoints(pts([[36, 6], [56, 34], [52, 60], [36, 68], [20, 60], [16, 36], [26, 44], [28, 22]]), true);
    g.fillStyle(0xfff0a0, 1); g.fillPoints(pts([[36, 30], [46, 48], [36, 62], [26, 48]]), true);
  });
}

function iconBg(g: G, color: number): void {
  g.fillStyle(0x5a3a10, 1); g.fillRoundedRect(0, 0, 72, 72, 12);
  g.fillStyle(color, 1); g.fillRoundedRect(3, 3, 66, 66, 10);
  g.fillStyle(0xffffff, 0.25); g.fillRoundedRect(6, 6, 60, 22, 8);
}

function generateIcons(scene: Phaser.Scene): void {
  const orange = 0xf6a63a;
  const weaponIcon = (key: string, draw: (g: G) => void) => bake(scene, key, 72, 72, (g) => { iconBg(g, orange); draw(g); });
  weaponIcon('ic_arco', (g) => {
    g.lineStyle(6, 0x6a3a1c, 1); g.beginPath(); g.arc(22, 36, 28, -1.15, 1.15); g.strokePath();
    g.lineStyle(2, 0xffffff, 1); g.lineBetween(22 + Math.cos(-1.15) * 28, 36 + Math.sin(-1.15) * 28, 22 + Math.cos(1.15) * 28, 36 + Math.sin(1.15) * 28);
    g.lineStyle(3, 0x3a2a1a, 1); g.lineBetween(14, 36, 58, 36);
    g.fillStyle(0xe0e6ec, 1); g.fillPoints(pts([[56, 30], [66, 36], [56, 42]]), true);
    g.fillStyle(0x2ad4c4, 1); g.fillPoints(pts([[10, 31], [18, 36], [10, 41]]), true);
  });
  weaponIcon('ic_pistola', (g) => {
    g.fillStyle(0x2a2e36, 1); g.fillPoints(pts([[10, 24], [62, 24], [62, 36], [34, 36], [30, 58], [16, 58], [20, 36], [10, 36]]), true);
    g.fillStyle(0x4a505a, 1); g.fillRect(12, 26, 48, 4);
    g.fillStyle(0xff6a3d, 1); g.fillRect(36, 28, 6, 4); g.fillRect(46, 28, 6, 4);
  });
  weaponIcon('ic_baston', (g) => {
    g.lineStyle(5, 0x2a3a48, 1); g.lineBetween(16, 64, 46, 20);
    g.fillStyle(0x6fe3ff, 0.4); g.fillCircle(50, 16, 13);
    g.fillStyle(0x6fe3ff, 1); g.fillCircle(50, 16, 7);
    g.lineStyle(3, 0x8ab8c8, 1); g.beginPath(); g.arc(50, 16, 11, 1.2, 1.2 + Math.PI * 1.6); g.strokePath();
  });
  weaponIcon('ic_escopeta', (g) => {
    g.fillStyle(0x6a3a1c, 1); g.fillPoints(pts([[8, 40], [30, 34], [30, 44], [12, 54]]), true);
    g.fillStyle(0x2a2e36, 1); g.fillRect(28, 30, 38, 8); g.fillRect(28, 38, 34, 6);
    g.fillStyle(0xff6a3d, 1); g.fillRect(34, 44, 12, 6);
  });
  weaponIcon('ic_shuriken', (g) => {
    g.fillStyle(0x6a7480, 1); star(g, 36, 38, 28, 9, 4, 0.3);
    g.fillStyle(0xd8e0ea, 1); star(g, 36, 36, 26, 8, 4, 0.3);
    g.fillStyle(0x2a2e36, 1); g.fillCircle(36, 36, 6);
  });
  weaponIcon('ic_lanza', (g) => {
    g.lineStyle(6, 0x1f3a40, 1); g.lineBetween(10, 64, 52, 22);
    g.fillStyle(0x6fe3d6, 1); g.fillPoints(pts([[46, 18], [64, 8], [56, 28], [52, 24]]), true);
    g.fillStyle(0xffffff, 0.9); g.fillPoints(pts([[52, 18], [62, 10], [56, 22]]), true);
    g.fillStyle(0x2ad4c4, 1); g.fillCircle(16, 58, 5);
  });

  const skillIcon = (key: string, color: number, draw: (g: G) => void) => bake(scene, key, 72, 72, (g) => { iconBg(g, color); draw(g); });
  skillIcon('ic_lluvia', 0x7a4a2a, (g) => {
    for (let i = 0; i < 4; i++) {
      const x = 16 + i * 13; const y = 12 + (i % 2) * 10;
      g.lineStyle(3, 0xf0d0a0, 1); g.lineBetween(x, y, x, y + 30);
      g.fillStyle(0xffffff, 1); g.fillPoints(pts([[-5, 0], [0, 10], [5, 0]], x, y + 30), true);
    }
  });
  skillIcon('ic_rayo', 0x1a5a8a, (g) => {
    g.fillStyle(0xfff27a, 1);
    g.fillPoints(pts([[40, 6], [18, 40], [34, 40], [26, 66], [54, 28], [38, 28], [48, 6]]), true);
  });
  skillIcon('ic_bomba', 0x4a2a7a, (g) => {
    g.fillStyle(INK, 1); g.fillCircle(34, 40, 20);
    g.fillStyle(0x9a5cff, 1); g.fillCircle(27, 33, 6);
    g.lineStyle(4, 0x8a5a2c, 1); g.lineBetween(46, 24, 54, 12);
    g.fillStyle(0xffc93c, 1); star(g, 56, 10, 8, 3, 5);
  });
  skillIcon('ic_muro', 0x157a72, (g) => {
    g.fillStyle(0x0b3a36, 1); g.fillRoundedRect(12, 22, 48, 40, 4);
    g.fillStyle(0x2ad4c4, 1);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.fillRect(14 + c * 16 + (r % 2) * 6, 24 + r * 13, 12, 10);
    g.fillStyle(0xffffff, 1); g.fillRect(31, 6, 10, 22); g.fillRect(25, 12, 22, 10);
  });
  skillIcon('ic_hielo', 0x4a8ac0, (g) => {
    g.lineStyle(5, 0xffffff, 1);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI) / 3;
      g.lineBetween(36 + Math.cos(a) * 24, 36 + Math.sin(a) * 24, 36 - Math.cos(a) * 24, 36 - Math.sin(a) * 24);
    }
    g.fillStyle(0xbfe9ff, 1); g.fillCircle(36, 36, 7);
  });
  skillIcon('ic_tornado', 0x6a7480, (g) => {
    for (let i = 0; i < 6; i++) { g.fillStyle(0xffffff, 0.9 - i * 0.08); g.fillEllipse(36 + Math.sin(i) * 4, 60 - i * 9, 14 + i * 8, 9); }
  });
  bake(scene, 'ic_turret', 72, 72, (g) => {
    iconBg(g, 0x2a8a80);
    drawStickman(g, 32, 66, 0.5, POSES.aim(0, 1.5), { scarf: 0xffc93c, eyes: 'determined' }, 1, 0);
  });
  bake(scene, 'ic_legend', 72, 72, (g) => {
    iconBg(g, 0xb84ae0);
    g.fillStyle(0xffe27a, 1); star(g, 36, 38, 26, 11, 5);
    g.fillStyle(0xffffff, 0.8); star(g, 36, 38, 12, 5, 5);
  });
  bake(scene, 'ic_evo', 72, 72, (g) => {
    iconBg(g, 0xff5a3a);
    g.fillStyle(0xffffff, 1);
    g.fillPoints(pts([[36, 8], [60, 36], [46, 36], [46, 64], [26, 64], [26, 36], [12, 36]]), true);
  });
  bake(scene, 'ic_heal', 72, 72, (g) => {
    iconBg(g, 0x3aa05a);
    g.fillStyle(0xffffff, 1); g.fillRect(28, 14, 16, 44); g.fillRect(14, 28, 44, 16);
  });
  bake(scene, 'ic_gold', 72, 72, (g) => {
    iconBg(g, 0xd8a020);
    for (const [x, y] of [[24, 46], [44, 46], [34, 30]]) {
      g.fillStyle(0xb8860b, 1); g.fillCircle(x, y, 13);
      g.fillStyle(0xffe27a, 1); g.fillCircle(x, y - 1, 11);
    }
  });
}
