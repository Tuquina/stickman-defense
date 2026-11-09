import { FONT, txt } from '../config';
import { Sound } from '../core/audio';

export interface ButtonOpts {
  color?: number;
  edge?: number;
  size?: number;
  textColor?: string;
  disabled?: boolean;
  radius?: number;
}

export interface Button extends Phaser.GameObjects.Container {
  label: Phaser.GameObjects.Text;
  setEnabled(v: boolean): void;
  redraw(color?: number): void;
}

export function drawPanel(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color = 0x1c2a44, edge = 0x0a0f18, r = 16): void {
  g.fillStyle(edge, 1);
  g.fillRoundedRect(x - 4, y - 4, w + 8, h + 8, r + 3);
  g.fillStyle(color, 1);
  g.fillRoundedRect(x, y, w, h, r);
  g.fillStyle(0xffffff, 0.07);
  g.fillRoundedRect(x + 4, y + 4, w - 8, Math.min(h * 0.42, 40), { tl: r - 4, tr: r - 4, bl: 4, br: 4 });
}

export function button(scene: Phaser.Scene, x: number, y: number, w: number, h: number, text: string, onClick: () => void, o: ButtonOpts = {}): Button {
  const c = scene.add.container(x, y) as Button;
  const g = scene.add.graphics();
  let color = o.color ?? 0x2a9d8f;
  let enabled = !o.disabled;
  const r = o.radius ?? 18;
  const redraw = (col?: number) => {
    if (col !== undefined) color = col;
    g.clear();
    const cc = enabled ? color : 0x4a5260;
    g.fillStyle(o.edge ?? 0x0a0f18, 1);
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 10, r + 3);
    g.fillStyle(Phaser.Display.Color.ValueToColor(cc).darken(22).color, 1);
    g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, r);
    g.fillStyle(cc, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 2, r);
    g.fillStyle(0xffffff, 0.18);
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 4, w - 12, h * 0.36, { tl: r - 6, tr: r - 6, bl: 6, br: 6 });
  };
  redraw();
  const label = scene.add.text(0, -1, text, txt(o.size ?? 34, o.textColor ?? '#ffffff', 6)).setOrigin(0.5);
  const zone = scene.add.zone(0, 0, w, h + 8).setInteractive({ useHandCursor: true });
  c.add([g, label, zone]);
  c.label = label;
  c.redraw = redraw;
  c.setEnabled = (v: boolean) => {
    enabled = v;
    label.setAlpha(v ? 1 : 0.6);
    redraw();
  };
  if (!enabled) label.setAlpha(0.6);
  zone.on('pointerdown', () => {
    Sound.unlock();
    if (!enabled) {
      Sound.play('error');
      return;
    }
    scene.tweens.add({ targets: c, scale: 0.94, duration: 60, yoyo: true });
    Sound.play('click');
    onClick();
  });
  return c;
}

/** Small square icon: uses a baked texture when available, else a coloured box with a glyph. */
export function iconBox(scene: Phaser.Scene, x: number, y: number, size: number, key: string | null, glyph: string, color: number): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  if (key && scene.textures.exists(key)) {
    c.add(scene.add.image(0, 0, key).setDisplaySize(size, size));
  } else {
    const g = scene.add.graphics();
    g.fillStyle(0x0a0f18, 1);
    g.fillRoundedRect(-size / 2, -size / 2, size, size, size * 0.18);
    g.fillStyle(color, 1);
    g.fillRoundedRect(-size / 2 + 3, -size / 2 + 3, size - 6, size - 6, size * 0.15);
    g.fillStyle(0xffffff, 0.22);
    g.fillRoundedRect(-size / 2 + 6, -size / 2 + 6, size - 12, size * 0.3, size * 0.1);
    c.add(g);
    c.add(scene.add.text(0, 0, glyph, txt(Math.round(size * (glyph.length > 2 ? 0.32 : 0.42)), '#ffffff', 5)).setOrigin(0.5));
  }
  return c;
}

export function goldLabel(scene: Phaser.Scene, x: number, y: number, value: string, size = 30): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const icon = scene.add.image(0, 0, 'coin').setScale(size / 28);
  const t = scene.add.text(size * 0.7, 0, value, txt(size, '#ffd34d', 6)).setOrigin(0, 0.5);
  c.add([icon, t]);
  (c as unknown as { text: Phaser.GameObjects.Text }).text = t;
  return c;
}

export function stars(scene: Phaser.Scene, x: number, y: number, n: number, max: number, size = 22): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  for (let i = 0; i < max; i++) {
    const cx = i * size * 1.15;
    const p: Phaser.Math.Vector2[] = [];
    for (let k = 0; k < 10; k++) {
      const r = k % 2 === 0 ? size / 2 : size / 4.6;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      p.push(new Phaser.Math.Vector2(cx + Math.cos(a) * r, Math.sin(a) * r));
    }
    g.fillStyle(0x0a0a0a, 1);
    g.fillPoints(p.map((v) => new Phaser.Math.Vector2(v.x, v.y + 2)), true);
    g.fillStyle(i < n ? 0xffd34d : 0x1a1a1a, 1);
    g.fillPoints(p, true);
  }
  return g;
}

export function fadeIn(scene: Phaser.Scene, ms = 250): void {
  scene.cameras.main.fadeIn(ms, 0, 0, 0);
}

export function go(scene: Phaser.Scene, key: string, data?: object): void {
  scene.cameras.main.fadeOut(180, 0, 0, 0);
  scene.cameras.main.once('camerafadeoutcomplete', () => scene.scene.start(key, data));
}

export const FONT_FAMILY = FONT;
