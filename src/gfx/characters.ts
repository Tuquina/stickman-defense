import type { Actor, CharId, PoseId } from '../data/story';
import { drawStickman, POSES, type Look, type Pose } from './stickman';

export function charLook(a: Pick<Actor, 'id' | 'eyes' | 'mouth' | 'pose'> & Partial<Pick<Actor, 'prop' | 'tears' | 'bandage'>>, heroTier: number): Look {
  const base: Record<CharId, Look> = {
    linoKid: { kid: true, scarf: 0x2ad4c4, eyes: 'determined' },
    danteKid: { kid: true, collar: 0xe2552c, eyes: 'happy', mouth: 'grin' },
    lino: { tier: heroTier, eyes: 'determined' },
    // Dante keeps a faded version of his red-orange scarf: the only thing left of the kid he was.
    dante: { corrupt: true, crown: true, outline: 0xb060ff, capeColor: 0x6a1e1e, scarf: 0xa8442a, eyes: 'smug' },
    clip: { sunglasses: true, clip: true, chain: true, eyes: 'cool', mouth: 'grin' },
    hueco: { helm: 'hollow', tier: 2, capeColor: 0x7a1e22, body: 0x15151a, weapon: 'sword', scarf: null },
    // The Echo is a hollow shadow of Dante: no cape, no scarf, violet ink body.
    eco: { corrupt: true, crown: true, outline: 0x8a3ae0, capeColor: null, eyes: 'glow', body: 0x2a1048 },
    // a corrupted memory of kid Dante (chapter 5)
    recuerdo: { kid: true, collar: 0xe2552c, crown: true, outline: 0xb060ff, eyes: 'glow', eyeColor: 0xffb0c8, body: 0x1a0a28 },
    // Dante freed from the Crown: no armor, his red-orange scarf restored
    danteLibre: { scarf: 0xe2552c, eyes: 'sad' },
    // Pluma, the Citadel scribe the Crown used as its Echo (chapter 3 on)
    pluma: { scribe: true, collar: 0x5a9cff, eyes: 'determined', mouth: 'none' },
  };
  const l = { ...base[a.id] };
  if (a.id === 'hueco' && (a as Actor).pose === 'kneel') l.weapon = null;
  if (a.eyes) l.eyes = a.eyes;
  if (a.mouth) l.mouth = a.mouth;
  if (a.prop) l.weapon = a.prop;
  if (a.tears) l.tears = true;
  if (a.bandage) l.bandage = true;
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
  if (a.pose !== 'fallen') {
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(0, 3, 40 * s, 10 * s);
  }
  drawStickman(g, 0, 0, s, poseFor(a.pose, t), charLook(a, heroTier), facing, t);
}
