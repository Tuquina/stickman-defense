import type { Actor, CharId, PoseId } from '../data/story';
import { drawStickman, POSES, type Look, type Pose } from './stickman';

export function charLook(a: Pick<Actor, 'id' | 'eyes' | 'mouth'>, heroTier: number): Look {
  const base: Record<CharId, Look> = {
    linoKid: { kid: true, scarf: 0x2ad4c4, eyes: 'determined' },
    danteKid: { kid: true, headband: 0xe2552c, eyes: 'happy', mouth: 'grin' },
    lino: { tier: heroTier, eyes: 'determined' },
    dante: { corrupt: true, crown: true, outline: 0xb060ff, capeColor: 0x5a1a2a, eyes: 'smug' },
    clip: { sunglasses: true, clip: true, chain: true, eyes: 'cool', mouth: 'grin' },
    hueco: { helm: 'hollow', tier: 2, capeColor: 0x7a1e22, body: 0x15151a, weapon: 'sword', scarf: null },
    eco: { corrupt: true, crown: true, outline: 0x8a3ae0, capeColor: 0x3a1a5a, eyes: 'glow', body: 0x120a1a },
  };
  const l = { ...base[a.id] };
  if (a.eyes) l.eyes = a.eyes;
  if (a.mouth) l.mouth = a.mouth;
  return l;
}

export function poseFor(p: PoseId | undefined, t: number): Pose {
  switch (p) {
    case 'point': return POSES.point(t);
    case 'fist': return POSES.fist(t);
    case 'laugh': return POSES.laugh(t);
    case 'cross': return POSES.cross(t);
    case 'kneel': return POSES.kneel(t);
    case 'hands': return POSES.hands(t);
    case 'fallen': return { ...POSES.idle(0), armB: [-1.2, 0.3], armF: [2.4, 0.2], legB: [-0.3, 0.6], legF: [0.4, 0.1] };
    default: return POSES.idle(t);
  }
}

/** Draws a story/menu character into g with feet at (0,0). */
export function drawCharacter(g: Phaser.GameObjects.Graphics, a: Actor, heroTier: number, s: number, facing: number, t: number): void {
  g.clear();
  drawStickman(g, 0, 0, s, poseFor(a.pose, t), charLook(a, heroTier), facing, t);
}
