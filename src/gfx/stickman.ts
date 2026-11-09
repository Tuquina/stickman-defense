/**
 * Vector stickman renderer. Draws an ink stickman with a simple forward-kinematics
 * skeleton plus layered armor pieces. Only uses Graphics primitives that also work
 * in Canvas mode, so it can be baked into textures with generateTexture().
 */
import type { WeaponId } from '../data/weapons';

type G = Phaser.GameObjects.Graphics;
type V = { x: number; y: number };

export interface Pose {
  lean: number; // torso tilt (+ = forward)
  head: number;
  armB: [number, number]; // back arm: shoulder angle, elbow bend (0 = pointing down)
  armF: [number, number]; // front arm
  legB: [number, number];
  legF: [number, number];
  crouch: number; // 0..1
}

export type Eyes = 'angry' | 'happy' | 'sad' | 'smug' | 'determined' | 'glow' | 'shock' | 'closed' | 'cool' | 'none';

export interface Look {
  tier?: number; // hero armor tier 0..4, undefined = none
  scarf?: number | null;
  collar?: number | null;
  eyes?: Eyes;
  eyeColor?: number;
  mouth?: 'none' | 'grin' | 'open' | 'frown';
  weapon?: WeaponId | 'sword' | 'bowE' | 'staffE' | null;
  twin?: boolean; // second pistol in back hand
  crown?: boolean;
  corrupt?: boolean;
  sunglasses?: boolean;
  clip?: boolean;
  chain?: boolean;
  kid?: boolean;
  outline?: number | null; // glow outline color
  body?: number;
  bones?: boolean;
  helm?: 'hollow' | 'knight' | null;
  shield?: boolean;
  hoodColor?: number | null;
  capeColor?: number | null;
}

export const POSES = {
  idle: (t = 0): Pose => {
    const b = Math.sin(t * 2.2) * 0.04;
    return { lean: 0.05 + b * 0.5, head: 0, armB: [-0.25 + b, 0.35], armF: [0.25 - b, 0.35], legB: [-0.18, 0.04], legF: [0.18, 0.04], crouch: 0.04 + b * 0.5 };
  },
  walk: (t: number): Pose => {
    const s = Math.sin(t);
    return { lean: 0.12, head: -0.04, armB: [-0.5 * s, 0.4], armF: [0.5 * s, 0.4], legB: [-0.5 * s, 0.3 + Math.max(0, s) * 0.5], legF: [0.5 * s, 0.3 + Math.max(0, -s) * 0.5], crouch: 0.08 };
  },
  aim: (t: number, armAngle: number): Pose => {
    const b = Math.sin(t * 2.2) * 0.03;
    return { lean: 0.04, head: 0.05, armB: [0.9 + b, 0.9], armF: [armAngle, 0], legB: [-0.3, 0.05], legF: [0.32, 0.02], crouch: 0.08 };
  },
  point: (t = 0): Pose => ({ ...POSES.idle(t), armF: [1.6, 0.05] }),
  fist: (t = 0): Pose => ({ ...POSES.idle(t), armF: [1.7, 1.0], lean: 0.1 }),
  laugh: (t = 0): Pose => ({ ...POSES.idle(t), lean: -0.18 + Math.sin(t * 14) * 0.03, head: -0.25, armB: [-0.6, 1.4], armF: [0.6, 1.4] }),
  cross: (t = 0): Pose => ({ ...POSES.idle(t), armB: [0.9, 1.9], armF: [0.7, 2.0], lean: -0.05, head: -0.1 }),
  kneel: (t = 0): Pose => ({ lean: 0.35 + Math.sin(t * 2) * 0.02, head: 0.3, armB: [0.2, 0.3], armF: [0.6, 0.6], legB: [-1.5, 1.6], legF: [1.3, -1.3], crouch: 0.45 }),
  hands: (t = 0): Pose => ({ ...POSES.idle(t), armF: [1.1, 0.7], armB: [1.0, 0.8] }),
};

const INK = 0x0b0b0e;

function fk(o: V, len: number, ang: number, f: number): V {
  return { x: o.x + Math.sin(ang) * len * f, y: o.y + Math.cos(ang) * len };
}

function limb(g: G, pts: V[], w: number, color: number, alpha = 1): void {
  g.lineStyle(w, color, alpha);
  for (let i = 0; i < pts.length - 1; i++) g.lineBetween(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
  g.fillStyle(color, alpha);
  for (const p of pts) g.fillCircle(p.x, p.y, w / 2);
}

function seg(g: G, a: V, b: V, from: number, to: number, w: number, color: number): void {
  const p = { x: a.x + (b.x - a.x) * from, y: a.y + (b.y - a.y) * from };
  const q = { x: a.x + (b.x - a.x) * to, y: a.y + (b.y - a.y) * to };
  g.lineStyle(w, color, 1);
  g.lineBetween(p.x, p.y, q.x, q.y);
}

/** Polygon in local coords (relative to c, mirrored by facing f, rotated by rot). */
function poly(g: G, c: V, s: number, f: number, pts: number[][], color: number, alpha = 1, rot = 0): void {
  const cs = Math.cos(rot);
  const sn = Math.sin(rot);
  const out = pts.map(([x, y]) => {
    const lx = x * s * f;
    const ly = y * s;
    return new Phaser.Math.Vector2(c.x + lx * cs - ly * sn, c.y + lx * sn + ly * cs);
  });
  g.fillStyle(color, alpha);
  g.fillPoints(out, true);
  // thin ink outline on coloured pieces: the same sticker finish as the baked sprites
  if (alpha === 1 && color !== INK && s >= 0.6) {
    g.lineStyle(Math.max(1.2, 1.5 * s), INK, 0.85);
    g.strokePoints(out, true, true);
  }
}

export interface Skeleton {
  hip: V; neck: V; shoulder: V; head: V; headR: number;
  elbowB: V; handB: V; elbowF: V; handF: V;
  kneeB: V; footB: V; kneeF: V; footF: V;
}

export function skeleton(x: number, y: number, s: number, p: Pose, f: number, kid = false): Skeleton {
  const k = kid ? 0.78 : 1;
  const thigh = 23 * s * k;
  const shin = 23 * s * k;
  const torso = 36 * s * k;
  const ua = 19 * s * k;
  const fa = 18 * s * k;
  const headR = (kid ? 19 : 16) * s;
  const hip = { x, y: y - (thigh + shin) * (1 - p.crouch * 0.3) - 3 * s };
  const kneeB = fk(hip, thigh, p.legB[0], f);
  const footB = fk(kneeB, shin, p.legB[0] + p.legB[1], f);
  const kneeF = fk(hip, thigh, p.legF[0], f);
  const footF = fk(kneeF, shin, p.legF[0] + p.legF[1], f);
  const neck = { x: hip.x + Math.sin(p.lean) * torso * f, y: hip.y - Math.cos(p.lean) * torso };
  const shoulder = { x: neck.x - Math.sin(p.lean) * 4 * s * f, y: neck.y + Math.cos(p.lean) * 4 * s };
  const ha = p.lean + p.head;
  const head = { x: neck.x + Math.sin(ha) * (headR + 1 * s) * f, y: neck.y - Math.cos(ha) * (headR + 1 * s) };
  const elbowB = fk(shoulder, ua, p.armB[0], f);
  const handB = fk(elbowB, fa, p.armB[0] + p.armB[1], f);
  const elbowF = fk(shoulder, ua, p.armF[0], f);
  const handF = fk(elbowF, fa, p.armF[0] + p.armF[1], f);
  return { hip, neck, shoulder, head, headR, elbowB, handB, elbowF, handF, kneeB, footB, kneeF, footF };
}

/**
 * Draws a stickman with feet at (x, y).
 * @param s scale (1 ≈ 110px tall)
 * @param f facing: 1 = right, -1 = left
 * @param t time (seconds) for capes/scarves animation
 */
export function drawStickman(g: G, x: number, y: number, s: number, pose: Pose, look: Look, f = 1, t = 0): Skeleton {
  const sk = skeleton(x, y, s, pose, f, look.kid);
  const w = 8 * s * (look.kid ? 0.9 : 1);
  const body = look.body ?? INK;
  const tier = look.tier ?? -1;
  const wave = Math.sin(t * 5);

  // ---------------- cape (behind everything)
  const capeColor = look.capeColor ?? (tier >= 2 ? (tier >= 4 ? 0xf2f2f2 : tier === 3 ? 0x2b6fd6 : 0x2f5fb8) : null);
  if (capeColor !== null && capeColor !== undefined) {
    const sh = sk.shoulder;
    const len = 62 * s;
    const pts = [
      [ -2, -2 ], [ -10 - 4 * wave, len * 0.55 / s ], [ -22 - 6 * wave, len / s ], [ 4, len * 0.95 / s ], [ 8, 0 ],
    ];
    poly(g, sh, s, f, pts, capeColor);
    poly(g, sh, s, f, [[-2, -2], [-12 - 4 * wave, len * 0.55 / s], [-18 - 6 * wave, len / s], [-8, len / s]], Phaser.Display.Color.ValueToColor(capeColor).darken(25).color);
  }

  // ---------------- outline glow
  if (look.outline) {
    const ow = w + 10 * s;
    const oc = look.outline;
    limb(g, [sk.shoulder, sk.elbowB, sk.handB], ow, oc, 0.45);
    limb(g, [sk.hip, sk.kneeB, sk.footB], ow, oc, 0.45);
    limb(g, [sk.hip, sk.neck], ow, oc, 0.45);
    limb(g, [sk.hip, sk.kneeF, sk.footF], ow, oc, 0.45);
    limb(g, [sk.shoulder, sk.elbowF, sk.handF], ow, oc, 0.45);
    g.fillStyle(oc, 0.45);
    g.fillCircle(sk.head.x, sk.head.y, sk.headR + 6 * s);
  }

  // ---------------- back limbs
  limb(g, [sk.shoulder, sk.elbowB, sk.handB], w, body);
  limb(g, [sk.hip, sk.kneeB, sk.footB], w, body);
  foot(g, sk.footB, s, f, body);
  if (look.twin && look.weapon === 'pistola') drawWeapon(g, 'pistola', sk.elbowB, sk.handB, s, f, t);

  // ---------------- torso
  limb(g, [sk.hip, sk.neck], w * 1.15, body);

  // ---------------- front leg
  limb(g, [sk.hip, sk.kneeF, sk.footF], w, body);
  foot(g, sk.footF, s, f, body);

  // ---------------- leg/arm armor accents
  if (look.bones) {
    g.lineStyle(2.5 * s, 0xe8e4d8, 1);
    g.lineBetween(sk.hip.x, sk.hip.y, sk.neck.x, sk.neck.y);
    for (let i = 1; i <= 3; i++) {
      const p = { x: sk.hip.x + (sk.neck.x - sk.hip.x) * (0.3 + i * 0.15), y: sk.hip.y + (sk.neck.y - sk.hip.y) * (0.3 + i * 0.15) };
      g.lineBetween(p.x - 6 * s, p.y, p.x + 6 * s, p.y);
    }
    for (const [a, b] of [[sk.hip, sk.kneeF], [sk.kneeF, sk.footF], [sk.shoulder, sk.elbowF], [sk.elbowF, sk.handF]] as [V, V][]) {
      g.lineBetween(a.x, a.y, b.x, b.y);
    }
  }
  if (tier >= 1 || look.corrupt) {
    const bootC = look.corrupt ? 0x5a2f9a : tier >= 3 ? 0xe8b84a : tier === 2 ? 0xb8c2cc : 0x7a3f2c;
    seg(g, sk.kneeF, sk.footF, 0.35, 0.95, w * 1.35, bootC);
    seg(g, sk.kneeB, sk.footB, 0.35, 0.95, w * 1.35, Phaser.Display.Color.ValueToColor(bootC).darken(20).color);
    if (tier >= 2 && !look.corrupt) {
      g.fillStyle(0xffffff, 0.35);
      g.fillCircle(sk.kneeF.x, sk.kneeF.y, w * 0.8);
    }
  }
  if (look.corrupt) {
    // chest plate + gem
    const n = sk.neck;
    const hp = sk.hip;
    const mid = { x: (n.x + hp.x) / 2, y: (n.y + hp.y) / 2 - 6 * s };
    poly(g, mid, s, f, [[-11, -16], [11, -16], [8, 6], [0, 14], [-8, 6]], 0x4a2a7a);
    poly(g, mid, s, f, [[0, -10], [6, -2], [0, 8], [-6, -2]], 0xe8a040);
    poly(g, mid, s, f, [[0, -6], [3.5, -1], [0, 4.5], [-3.5, -1]], 0xd8202c);
  } else if (tier >= 2) {
    const n = sk.neck;
    const hp = sk.hip;
    const mid = { x: (n.x + hp.x) / 2, y: (n.y + hp.y) / 2 - 6 * s };
    const plate = tier >= 4 ? 0xf4f4f4 : tier === 3 ? 0xe8c060 : 0xc8d2dc;
    poly(g, mid, s, f, [[-11, -15], [11, -15], [9, 6], [0, 13], [-9, 6]], plate);
    poly(g, mid, s, f, [[-11, -15], [11, -15], [10, -10], [-10, -10]], tier >= 3 ? 0xffffff : 0xe8b84a, 0.8);
  }

  // ---------------- scarf / collar
  const scarf = look.scarf !== undefined ? look.scarf : tier === 0 ? 0x2ad4c4 : tier === 4 ? 0xffe9a8 : tier >= 2 ? 0x2a7fd6 : null;
  if (scarf !== null && scarf !== undefined && (!look.corrupt || look.scarf !== undefined)) {
    const n = sk.neck;
    poly(g, n, s, f, [[-11, -3], [11, -3], [12, 6], [-12, 6]], scarf);
    // trailing tail
    const tl = tier === 4 ? 1.4 : 1;
    poly(g, n, s, f, [[-8, 0], [-26 * tl, 4 + wave * 4], [-40 * tl, 10 + wave * 7], [-36 * tl, 16 + wave * 6], [-22 * tl, 10 + wave * 3], [-8, 7]], scarf);
    poly(g, n, s, f, [[-26 * tl, 4 + wave * 4], [-40 * tl, 10 + wave * 7], [-36 * tl, 16 + wave * 6]], Phaser.Display.Color.ValueToColor(scarf).darken(18).color);
  }
  if (look.collar) {
    // kid Dante: red collar like a cape-collar
    const n = sk.neck;
    poly(g, n, s, f, [[-13, -6], [13, -6], [10, 6], [-10, 6]], look.collar);
    poly(g, n, s, f, [[-13, -6], [-17, -12], [-6, -4]], look.collar);
    poly(g, n, s, f, [[13, -6], [17, -12], [6, -4]], look.collar);
  }
  if (tier === 1) {
    // fur collar
    g.fillStyle(0xf2efe6, 1);
    for (let i = -2; i <= 2; i++) g.fillCircle(sk.neck.x + i * 5 * s * f, sk.neck.y + 1 * s + Math.abs(i) * 1.5 * s, 5.5 * s);
  }
  if (look.chain) {
    g.lineStyle(3 * s, 0xffc93c, 1);
    const n = sk.neck;
    g.beginPath();
    g.arc(n.x, n.y + 4 * s, 10 * s, 0.3, Math.PI - 0.3, false);
    g.strokePath();
    g.fillStyle(0xffc93c, 1);
    g.fillCircle(n.x, n.y + 14 * s, 4 * s);
  }

  // ---------------- pauldrons
  if (tier >= 2 || look.corrupt) {
    const pc = look.corrupt ? 0x5a2f9a : tier >= 4 ? 0xf8f8f8 : tier === 3 ? 0xe8c060 : 0xb8c2cc;
    const trim = look.corrupt ? 0xe8a040 : tier >= 3 ? 0xffffff : 0xe8b84a;
    const sh = sk.shoulder;
    poly(g, sh, s, f, [[-14, 2], [-6, -10], [12, -8], [16, 4], [4, 8]], pc);
    poly(g, sh, s, f, [[-14, 2], [-6, -10], [-2, -9], [-10, 3]], trim);
    if (look.corrupt) {
      poly(g, sh, s, f, [[8, -8], [20, -24], [14, -6]], 0xe8a040);
      poly(g, sh, s, f, [[-6, -10], [-16, -26], [-2, -9]], 0x7a4fc0);
    }
    if (tier >= 3 && !look.corrupt) poly(g, sh, s, f, [[-6, -9], [-14, -22], [2, -9]], 0xffffff);
  }

  // ---------------- head
  drawHead(g, sk, s, f, look, tier, t);

  // ---------------- front arm + weapon
  if (look.shield) {
    const hc = sk.handF;
    poly(g, hc, s, f, [[2, -26], [20, -22], [20, 14], [8, 28], [2, 22]], 0x5d6670);
    poly(g, hc, s, f, [[5, -21], [16, -18], [16, 11], [8, 21], [5, 17]], 0x8a949e);
  }
  limb(g, [sk.shoulder, sk.elbowF, sk.handF], w, body);
  if (tier >= 1 || look.corrupt) {
    const br = look.corrupt ? 0x5a2f9a : tier >= 3 ? 0xe8b84a : tier === 2 ? 0xc8d2dc : 0x7a3f2c;
    seg(g, sk.elbowF, sk.handF, 0.25, 0.8, w * 1.4, br);
    seg(g, sk.elbowB, sk.handB, 0.25, 0.8, w * 1.4, Phaser.Display.Color.ValueToColor(br).darken(20).color);
  }
  if (look.bones) {
    g.lineStyle(2.5 * s, 0xe8e4d8, 1);
    g.lineBetween(sk.shoulder.x, sk.shoulder.y, sk.elbowF.x, sk.elbowF.y);
    g.lineBetween(sk.elbowF.x, sk.elbowF.y, sk.handF.x, sk.handF.y);
  }
  g.fillStyle(body, 1);
  g.fillCircle(sk.handF.x, sk.handF.y, w * 0.85);
  g.fillCircle(sk.handB.x, sk.handB.y, w * 0.85);
  if (look.weapon) drawWeapon(g, look.weapon, sk.elbowF, sk.handF, s, f, t);

  return sk;
}

function foot(g: G, p: V, s: number, f: number, color: number): void {
  poly(g, p, s, f, [[-4, -4], [10, 0], [10, 4], [-5, 4]], color);
}

function drawHead(g: G, sk: Skeleton, s: number, f: number, look: Look, tier: number, t: number): void {
  const h = sk.head;
  const r = sk.headR;
  const body = look.body ?? INK;
  const hood = look.hoodColor ?? (tier === 1 ? 0x2f6fc8 : null);

  if (hood) {
    g.fillStyle(hood, 1);
    g.fillCircle(h.x - 2 * s * f, h.y - 2 * s, r * 1.38);
    poly(g, h, s, f, [[-14, -16], [-28, -10], [-14, 4]], hood);
    poly(g, h, s, f, [[-6, -22], [8, -22], [-2, -30]], hood);
  }

  if (look.helm === 'hollow') {
    g.fillStyle(0x6c7680, 1);
    g.fillCircle(h.x, h.y, r * 1.3);
    poly(g, h, s, f, [[-18, -6], [-20, 20], [18, 20], [20, -6]], 0x6c7680);
    g.fillStyle(0x0a0a0a, 1);
    poly(g, h, s, f, [[-2, -4], [20, -4], [20, 3], [-2, 3]], 0x0a0a0a);
    g.fillStyle(0xff3b3b, 0.9);
    g.fillCircle(h.x + 8 * s * f, h.y - 0.5 * s, 2.6 * s);
    poly(g, h, s, f, [[-6, -20], [6, -20], [-18, -40], [-20, -30]], 0x8a2a2a);
    return;
  }

  g.fillStyle(body, 1);
  g.fillCircle(h.x, h.y, r);

  // knight-type helmets for the hero (tier 2+)
  if (tier >= 2 && !look.corrupt) {
    const hc = tier >= 4 ? 0xf8f8f8 : tier === 3 ? 0xe8c060 : 0xc8d2dc;
    const dark = Phaser.Display.Color.ValueToColor(hc).darken(25).color;
    g.fillStyle(hc, 1);
    g.fillCircle(h.x, h.y - 2 * s, r * 1.12);
    poly(g, h, s, f, [[-18, -2], [-17, 16], [-4, 18], [-6, 2]], hc);
    // face opening
    poly(g, h, s, f, [[-9, -6], [17, -6], [17, 5], [-9, 5]], INK);
    poly(g, h, s, f, [[3, 5], [10, 5], [10, 13], [3, 13]], INK);
    poly(g, h, s, f, [[-9, -9], [17, -9], [17, -6], [-9, -6]], dark);
    if (tier === 2) {
      poly(g, h, s, f, [[-6, -16], [6, -20], [-16, -34], [-12, -22]], 0xe8b84a);
    } else {
      // wings
      poly(g, h, s, f, [[-10, -8], [-30, -26], [-26, -14], [-34, -12], [-14, -2]], 0xffffff);
      poly(g, h, s, f, [[0, -18], [4, -34], [8, -18]], tier === 4 ? 0xffd86a : 0xffffff);
    }
  }
  if (look.corrupt) {
    // horned helm
    g.fillStyle(0x4a2a7a, 1);
    g.fillCircle(h.x, h.y - 2 * s, r * 1.12);
    poly(g, h, s, f, [[-9, -5], [17, -5], [17, 6], [-9, 6]], INK);
    poly(g, h, s, f, [[3, 6], [10, 6], [10, 13], [3, 13]], INK);
    if (look.crown) {
      // small swept-back horns so the floating crown stays readable
      poly(g, h, s, f, [[-12, -10], [-30, -18], [-38, -12], [-24, -6], [-14, -4]], 0x7a4fc0);
      poly(g, h, s, f, [[-4, -18], [-14, -30], [-20, -28], [-10, -14]], 0x7a4fc0);
    } else {
      poly(g, h, s, f, [[-10, -12], [-26, -34], [-30, -50], [-16, -26], [-4, -16]], 0x7a4fc0);
      poly(g, h, s, f, [[6, -14], [16, -34], [14, -50], [24, -30], [12, -10]], 0x7a4fc0);
      poly(g, h, s, f, [[-4, -16], [2, -32], [8, -16]], 0xe8a040);
    }
  }
  if (tier >= 3 && !look.corrupt) {
    g.lineStyle(3 * s, tier === 4 ? 0xfff2b0 : 0x9fe8ff, 0.8);
    g.strokeEllipse(h.x - 2 * s * f, h.y - r * 1.6, r * 1.6, r * 0.45);
  }

  // eyes
  const eyes = look.eyes ?? 'angry';
  const ec = look.eyeColor ?? 0xffffff;
  const e = { x: h.x + 4 * s * f, y: h.y + 1 * s };
  switch (eyes) {
    case 'angry':
      poly(g, e, s, f, [[-11, -4], [-2, 0], [-10, 4]], ec);
      poly(g, e, s, f, [[3, 0], [13, -5], [12, 4]], ec);
      break;
    case 'determined':
      poly(g, e, s, f, [[-11, -2], [-2, 0], [-3, 4], [-10, 4]], ec);
      poly(g, e, s, f, [[3, 0], [13, -3], [12, 4], [4, 4]], ec);
      break;
    case 'sad':
      poly(g, e, s, f, [[-11, 0], [-3, -3], [-3, 3], [-10, 4]], ec);
      poly(g, e, s, f, [[3, -3], [12, 0], [11, 4], [3, 3]], ec);
      break;
    case 'happy':
      g.lineStyle(3 * s, ec, 1);
      g.beginPath();
      g.arc(e.x - 6 * s * f, e.y + 1 * s, 4 * s, Math.PI * 1.1, Math.PI * 1.9);
      g.strokePath();
      g.beginPath();
      g.arc(e.x + 7 * s * f, e.y + 1 * s, 4 * s, Math.PI * 1.1, Math.PI * 1.9);
      g.strokePath();
      break;
    case 'smug':
      poly(g, e, s, f, [[-11, -1], [-2, -1], [-3, 3], [-10, 3]], ec);
      g.fillStyle(ec, 1);
      g.fillEllipse(e.x + 8 * s * f, e.y, 9 * s, 9 * s);
      g.fillStyle(INK, 1);
      g.fillRect(Math.min(e.x + 3 * s * f, e.x + 13 * s * f), e.y - 5 * s, 10 * s, 4 * s);
      break;
    case 'glow':
      g.fillStyle(ec, 0.35);
      g.fillCircle(e.x - 6 * s * f, e.y, 7 * s);
      g.fillCircle(e.x + 8 * s * f, e.y, 7 * s);
      poly(g, e, s, f, [[-11, -3], [-2, 0], [-10, 3]], ec);
      poly(g, e, s, f, [[3, 0], [13, -4], [12, 3]], ec);
      break;
    case 'shock':
      g.fillStyle(ec, 1);
      g.fillCircle(e.x - 6 * s * f, e.y - 1 * s, 4.5 * s);
      g.fillCircle(e.x + 8 * s * f, e.y - 1 * s, 4.5 * s);
      break;
    case 'closed':
      g.lineStyle(2.5 * s, ec, 1);
      g.lineBetween(e.x - 10 * s * f, e.y + 1 * s, e.x - 3 * s * f, e.y + 1 * s);
      g.lineBetween(e.x + 3 * s * f, e.y + 1 * s, e.x + 12 * s * f, e.y + 1 * s);
      break;
    case 'cool':
      break;
    case 'none':
      break;
  }
  if (look.sunglasses || eyes === 'cool') {
    poly(g, e, s, f, [[-14, -5], [15, -5], [14, 3], [5, 4], [1, -1], [-3, 4], [-12, 3]], 0x262a33);
    g.lineStyle(1.5 * s, 0xffffff, 0.9);
    g.lineBetween(e.x - 10 * s * f, e.y - 3 * s, e.x - 6 * s * f, e.y - 3 * s);
    g.lineBetween(e.x + 6 * s * f, e.y - 3 * s, e.x + 10 * s * f, e.y - 3 * s);
  }
  if (look.clip) {
    g.lineStyle(2.5 * s, 0xc8d2e0, 1);
    const top = { x: h.x - 3 * s * f, y: h.y - r };
    g.lineBetween(top.x, top.y, top.x - 4 * s * f, top.y - 16 * s);
    g.beginPath();
    g.arc(top.x - 1 * s * f, top.y - 18 * s, 3.5 * s, 0, Math.PI * 2);
    g.strokePath();
  }

  // mouth
  const m = { x: h.x + 6 * s * f, y: h.y + 8 * s };
  switch (look.mouth) {
    case 'grin':
      poly(g, m, s, f, [[-6, -1], [7, -2], [3, 4], [-3, 4]], 0xffffff);
      break;
    case 'open':
      poly(g, m, s, f, [[-6, -2], [7, -3], [4, 6], [-3, 5]], 0xffffff);
      poly(g, m, s, f, [[-3, 2], [4, 1], [2, 5], [-2, 5]], 0xff5a7a);
      break;
    case 'frown':
      g.lineStyle(2 * s, 0xffffff, 0.9);
      g.lineBetween(m.x - 4 * s * f, m.y + 2 * s, m.x + 5 * s * f, m.y + 1 * s);
      break;
  }

  if (look.crown) {
    const cy = h.y - r * 2.15 + Math.sin(t * 2.5) * 2 * s;
    const c = { x: h.x + 1 * s * f, y: cy };
    g.fillStyle(0xd27bff, 0.18);
    g.fillEllipse(c.x, c.y + 2 * s, 46 * s, 16 * s);
    // broken crown: two halves with a void gap
    poly(g, c, s, f, [[-18, 6], [-20, -8], [-13, -2], [-9, -14], [-4, -2], [-3, 6]], 0x6a2fc0);
    poly(g, c, s, f, [[4, 6], [5, -3], [10, -15], [14, -2], [20, -9], [18, 6]], 0x6a2fc0);
    poly(g, c, s, f, [[-18, 6], [-3, 6], [-3, 2], [-18, 2]], 0xe8a040);
    poly(g, c, s, f, [[4, 6], [18, 6], [18, 2], [4, 2]], 0xe8a040);
    g.fillStyle(0xd27bff, 1);
    g.fillCircle(c.x - 9 * s * f, c.y - 14 * s, 2.5 * s);
    g.fillCircle(c.x + 10 * s * f, c.y - 15 * s, 2.5 * s);
  }
}

/** Draws the held weapon from the forearm direction (outlined, shaded, evolved variants glow). */
export function drawWeapon(g: G, w: Look['weapon'], elbow: V, hand: V, s: number, f: number, t: number): void {
  const ang = Math.atan2(hand.y - elbow.y, hand.x - elbow.x);
  const c = hand;
  // forearm space: x forward along the arm, y "down" (mirrored by facing so nothing renders upside-down)
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  const dx = -Math.sin(ang) * f;
  const dy = Math.cos(ang) * f;
  const P = (x: number, y: number) => new Phaser.Math.Vector2(c.x + (ux * x + dx * y) * s, c.y + (uy * x + dy * y) * s);
  const shape = (pts: number[][], color: number, outline = true, alpha = 1) => {
    const out = pts.map(([x, y]) => P(x, y));
    g.fillStyle(color, alpha);
    g.fillPoints(out, true);
    if (outline) {
      g.lineStyle(1.6 * s, INK, 1);
      g.strokePoints(out, true, true);
    }
  };
  const line = (x0: number, y0: number, x1: number, y1: number, width: number, color: number, alpha = 1) => {
    const a = P(x0, y0);
    const b = P(x1, y1);
    g.lineStyle(width * s, color, alpha);
    g.lineBetween(a.x, a.y, b.x, b.y);
  };
  const dot = (x: number, y: number, r: number, color: number, alpha = 1) => {
    const p = P(x, y);
    g.fillStyle(color, alpha);
    g.fillCircle(p.x, p.y, r * s);
  };
  const pulse = 0.5 + Math.sin(t * 6) * 0.5;

  switch (w) {
    case 'arco':
    case 'bowE': {
      const gold = w === 'bowE';
      const wood = gold ? 0xffd86a : 0x8a5a2c;
      const woodHi = gold ? 0xfff2b0 : 0xc88a50;
      if (gold) dot(6, 0, 30, 0xffe27a, 0.18 + pulse * 0.1);
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = -10; i <= 10; i++) {
        const k = i / 10;
        pts.push(P(4 + 13 * (1 - k * k), k * 27));
      }
      g.lineStyle(7.5 * s, INK, 1);
      g.strokePoints(pts, false);
      g.lineStyle(4.5 * s, wood, 1);
      g.strokePoints(pts, false);
      g.lineStyle(1.6 * s, woodHi, 0.9);
      g.strokePoints(pts.slice(3, 9), false);
      line(4, -27, 4, 27, 1.4, gold ? 0xfff2b0 : 0xf0f0f0, 0.95);
      shape([[13, -4], [19, -4], [19, 4], [13, 4]], gold ? 0xffffff : 0x2ad4c4);
      dot(4, -27, 2.4, gold ? 0xffffff : 0xffc93c);
      dot(4, 27, 2.4, gold ? 0xffffff : 0xffc93c);
      break;
    }
    case 'pistola': {
      shape([[-3, 0], [6, 0], [3, 13], [-6, 13]], 0x24282e);
      line(-3, 4, 3, 4, 1, 0x5a606a);
      line(-4, 8, 2, 8, 1, 0x5a606a);
      shape([[-3, -7], [27, -7], [27, 0], [-3, 0]], 0x3e444e);
      line(-1, -6, 25, -6, 1.2, 0x9aa2ac);
      shape([[27, -6], [31, -6], [31, -1], [27, -1]], 0x16191d);
      shape([[9, -5], [19, -5], [19, -2.5], [9, -2.5]], 0xff6a3d, false);
      line(6, 1, 9, 5, 1.4, INK);
      break;
    }
    case 'escopeta': {
      shape([[-24, -2], [-4, -5], [-4, 4], [-21, 11]], 0x7a4a24);
      line(-20, 1, -7, -1, 1.2, 0xb07a44);
      shape([[-4, -6], [12, -6], [12, 4], [-4, 4]], 0x2a2e36);
      shape([[12, -6], [46, -6], [46, -1.5], [12, -1.5]], 0x4e545e);
      shape([[12, -1.5], [42, -1.5], [42, 3], [12, 3]], 0x363b44);
      line(14, -5, 44, -5, 1, 0xa8b0ba);
      shape([[17, 3], [31, 3], [31, 8], [17, 8]], 0x8a5a2c);
      shape([[21, 4], [26, 4], [26, 7], [21, 7]], 0xff6a3d, false);
      break;
    }
    case 'baston':
    case 'staffE': {
      const gold = w === 'staffE';
      const sx = Math.cos(ang - 1.2 * f);
      const sy = Math.sin(ang - 1.2 * f);
      const at = (k: number) => ({ x: c.x + sx * k * s, y: c.y + sy * k * s });
      const top = at(46);
      const bot = at(-28);
      g.lineStyle(6 * s, INK, 1);
      g.lineBetween(bot.x, bot.y, top.x, top.y);
      g.lineStyle(3.5 * s, 0x2a3a48, 1);
      g.lineBetween(bot.x, bot.y, top.x, top.y);
      for (const k of [10, 30]) {
        const p = at(k);
        g.fillStyle(gold ? 0xffffff : 0xffc93c, 1);
        g.fillCircle(p.x, p.y, 2.6 * s);
      }
      const glow = gold ? 0xffe27a : 0x6fe3ff;
      g.fillStyle(glow, 0.18 + pulse * 0.12);
      g.fillCircle(top.x, top.y, 15 * s);
      // claw holding the crystal
      const px = -sy;
      const py = sx;
      g.lineStyle(2.4 * s, gold ? 0xffd86a : 0x8ab8c8, 1);
      g.lineBetween(top.x - sx * 6 * s, top.y - sy * 6 * s, top.x + px * 8 * s + sx * 4 * s, top.y + py * 8 * s + sy * 4 * s);
      g.lineBetween(top.x - sx * 6 * s, top.y - sy * 6 * s, top.x - px * 8 * s + sx * 4 * s, top.y - py * 8 * s + sy * 4 * s);
      const crystal = [
        new Phaser.Math.Vector2(top.x + sx * 10 * s, top.y + sy * 10 * s),
        new Phaser.Math.Vector2(top.x + px * 6 * s, top.y + py * 6 * s),
        new Phaser.Math.Vector2(top.x - sx * 6 * s, top.y - sy * 6 * s),
        new Phaser.Math.Vector2(top.x - px * 6 * s, top.y - py * 6 * s),
      ];
      g.fillStyle(gold ? 0xffd86a : 0x3aa8e8, 1);
      g.fillPoints(crystal, true);
      g.fillStyle(0xffffff, 0.85);
      g.fillPoints([crystal[0], crystal[1], new Phaser.Math.Vector2(top.x, top.y)], true);
      g.lineStyle(1.6 * s, INK, 1);
      g.strokePoints(crystal, true, true);
      break;
    }
    case 'shuriken': {
      const rot = t * 10;
      const pts: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < 8; i++) {
        const rr = (i % 2 === 0 ? 13 : 4) * s;
        const a = rot + (i * Math.PI) / 4;
        pts.push(new Phaser.Math.Vector2(c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr));
      }
      g.fillStyle(0xc8d2e0, 1);
      g.fillPoints(pts, true);
      g.fillStyle(0xffffff, 0.7);
      g.fillPoints([pts[0], pts[1], new Phaser.Math.Vector2(c.x, c.y), pts[7]], true);
      g.lineStyle(1.6 * s, INK, 1);
      g.strokePoints(pts, true, true);
      g.fillStyle(INK, 1);
      g.fillCircle(c.x, c.y, 2.8 * s);
      break;
    }
    case 'lanza': {
      const sx = Math.cos(ang - 1.25 * f);
      const sy = Math.sin(ang - 1.25 * f);
      const at = (k: number) => ({ x: c.x + sx * k * s, y: c.y + sy * k * s });
      const tip = at(58);
      const butt = at(-30);
      g.lineStyle(6.5 * s, INK, 1);
      g.lineBetween(butt.x, butt.y, tip.x, tip.y);
      g.lineStyle(4 * s, 0x2a4a52, 1);
      g.lineBetween(butt.x, butt.y, tip.x, tip.y);
      for (const k of [-6, 0, 6]) {
        const p = at(k);
        g.fillStyle(0x2ad4c4, 1);
        g.fillCircle(p.x, p.y, 2.4 * s);
      }
      const px = -sy;
      const py = sx;
      const blade = [
        new Phaser.Math.Vector2(tip.x + sx * 22 * s, tip.y + sy * 22 * s),
        new Phaser.Math.Vector2(tip.x + px * 7 * s + sx * 6 * s, tip.y + py * 7 * s + sy * 6 * s),
        new Phaser.Math.Vector2(tip.x, tip.y),
        new Phaser.Math.Vector2(tip.x - px * 7 * s + sx * 6 * s, tip.y - py * 7 * s + sy * 6 * s),
      ];
      g.fillStyle(0x6fe3d6, 1);
      g.fillPoints(blade, true);
      g.fillStyle(0xe8fffb, 0.9);
      g.fillPoints([blade[0], blade[1], blade[2]], true);
      g.lineStyle(1.6 * s, INK, 1);
      g.strokePoints(blade, true, true);
      break;
    }
    case 'sword': {
      const sx = Math.cos(ang - 1.0 * f);
      const sy = Math.sin(ang - 1.0 * f);
      const tip = { x: c.x + sx * 70 * s, y: c.y + sy * 70 * s };
      g.lineStyle(10 * s, INK, 1);
      g.lineBetween(c.x, c.y, tip.x, tip.y);
      g.lineStyle(7 * s, 0x9aa4ae, 1);
      g.lineBetween(c.x, c.y, tip.x, tip.y);
      g.lineStyle(2.5 * s, 0xeef2f6, 1);
      g.lineBetween(c.x + sx * 8 * s, c.y + sy * 8 * s, tip.x, tip.y);
      g.lineStyle(7 * s, INK, 1);
      g.lineBetween(c.x - sy * 11 * s, c.y + sx * 11 * s, c.x + sy * 11 * s, c.y - sx * 11 * s);
      g.lineStyle(4.5 * s, 0xc8a050, 1);
      g.lineBetween(c.x - sy * 10 * s, c.y + sx * 10 * s, c.x + sy * 10 * s, c.y - sx * 10 * s);
      break;
    }
    default:
      break;
  }
}
