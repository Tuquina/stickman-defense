import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { fmt } from '../core/format';
import { Save } from '../core/save';
import { power } from '../core/stats';
import { CHAR_NAMES, STORY, type Actor, type Beat, type StoryScene as StoryDef } from '../data/story';
import { drawCharacter } from '../gfx/characters';
import { button } from '../ui/widgets';

interface Next { scene: string; data?: object }
interface Slot {
  /** Displayed view. Characters are baked into a render texture each frame so that
   *  transparency, scale and rotation apply to the whole figure (no overlapping joints). */
  g: Phaser.GameObjects.RenderTexture;
  pen: Phaser.GameObjects.Graphics;
  power: Phaser.GameObjects.Text;
  actor: Actor | null;
  baseX: number;
  facing: number;
}

const GROUND = 1000;
const SCALE = 2.7;
const RT_W = 600;
const RT_H = 760;
const FEET_X = 300;
const FEET_Y = 700;

export class StoryScene extends Phaser.Scene {
  private def!: StoryDef;
  private next!: Next;
  private idx = 0;
  private slots!: { L: Slot; R: Slot };
  private bg!: Phaser.GameObjects.Image;
  private shade!: Phaser.GameObjects.Rectangle;
  private tint!: Phaser.GameObjects.Rectangle;
  private nameTag!: Phaser.GameObjects.Text;
  private line!: Phaser.GameObjects.Text;
  private hl!: Phaser.GameObjects.Text;
  private caption!: Phaser.GameObjects.Text;
  private narr!: Phaser.GameObjects.Graphics;
  private full = '';
  private shown = 0;
  private typing = false;
  private t = 0;
  private lock = 0;

  constructor() {
    super('Story');
  }

  init(data: { id: string; next?: Next }): void {
    this.def = STORY[data.id] ?? STORY.prologo1;
    this.next = data.next ?? { scene: 'Menu' };
    this.idx = -1;
  }

  create(): void {
    this.cameras.main.fadeIn(300, 0, 0, 0);
    Sound.music(this.def.music);
    this.bg = this.add.image(GAME_W / 2, GAME_H / 2, this.def.bg);
    this.shade = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0).setDepth(5);
    this.tint = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xa040ff, 0).setDepth(6);
    // bottom gradient for readability
    const grad = this.add.graphics().setDepth(7);
    for (let i = 0; i < 30; i++) {
      grad.fillStyle(0x000000, (i / 30) * 0.6);
      grad.fillRect(0, 980 + i * 10, GAME_W, 10);
    }

    const mk = (x: number, facing: number): Slot => ({
      g: this.add.renderTexture(x, GROUND, RT_W, RT_H).setOrigin(FEET_X / RT_W, FEET_Y / RT_H).setDepth(3),
      pen: this.make.graphics({}, false),
      power: this.add.text(x, 330, '', txt(110, '#5fc8ff', 14)).setOrigin(0.5).setDepth(4),
      actor: null,
      baseX: x,
      facing,
    });
    this.slots = { L: mk(200, 1), R: mk(530, -1) };

    this.nameTag = this.add.text(40, 1040, '', txt(30, '#ffd34d', 6)).setOrigin(0, 0.5).setDepth(10);
    this.line = this.add.text(GAME_W / 2, 1110, '', { ...txt(44, '#ffffff', 10), wordWrap: { width: 660 } }).setOrigin(0.5).setDepth(10);
    this.hl = this.add.text(GAME_W / 2, 1190, '', { ...txt(48, '#ffa62b', 10), wordWrap: { width: 680 } }).setOrigin(0.5).setDepth(10);
    // narrator/caption box sits between the power numbers and the characters' heads
    this.narr = this.add.graphics().setDepth(9);
    this.caption = this.add.text(GAME_W / 2, 570, '', { ...txt(68, '#ffffff', 12), wordWrap: { width: 660 } }).setOrigin(0.5).setDepth(10);
    this.add.text(GAME_W / 2, 1256, 'toca para continuar', txt(18, '#9aa8b8', 4)).setOrigin(0.5).setDepth(10).setAlpha(0.7);

    button(this, GAME_W - 90, 50, 140, 54, 'SALTAR', () => this.finish(), { size: 24, color: 0x3a4a5e }).setDepth(20);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.y < 90 && p.x > GAME_W - 180) return;
      Sound.unlock();
      if (this.time.now < this.lock) return;
      if (this.typing) {
        this.shown = this.full.length;
        return;
      }
      this.advance();
    });
    this.advance();
  }

  private setActor(slot: Slot, a: Actor | null | undefined): void {
    if (a === undefined) return;
    slot.actor = a;
    slot.g.setVisible(!!a);
    slot.power.setVisible(!!a && !!a.power);
    if (!a) return;
    slot.g.setAlpha(a.alpha ?? 1);
    slot.g.setRotation(a.pose === 'fallen' ? -1.45 * slot.facing : 0);
    slot.g.y = a.pose === 'fallen' ? GROUND - 20 : GROUND;
    // after the prologue, Lino shows the player's real power
    const real = a.id === 'lino' && this.def.id !== 'prologo2' ? fmt(power(Save.d)) : null;
    slot.power.setText(real ?? a.power ?? '');
    slot.power.setColor(a.powerColor ?? '#ffffff');
    if (a.glow) slot.power.setShadow(0, 0, '#d050ff', 26, true, true);
    else slot.power.setShadow(0, 0, '#000000', 0, false, false);
    slot.power.setFontSize((real ?? a.power ?? '').length > 5 ? 92 : 110);
  }

  private advance(): void {
    this.idx++;
    if (this.idx >= this.def.beats.length) {
      this.finish();
      return;
    }
    const b: Beat = this.def.beats[this.idx];
    this.lock = this.time.now + 180;
    if (b.bg) this.bg.setTexture(b.bg);
    if (b.music) Sound.music(b.music);
    this.setActor(this.slots.L, b.left);
    this.setActor(this.slots.R, b.right);

    // dim the non-speaker
    for (const k of ['L', 'R'] as const) {
      const s = this.slots[k];
      if (!s.actor) continue;
      const speaking = b.who === k;
      const base = s.actor.alpha ?? 1;
      s.g.setAlpha(base);
      const dialog = b.who === 'L' || b.who === 'R';
      this.tweens.add({ targets: s.g, scale: !dialog ? 1 : speaking ? 1.04 : 0.96, duration: 160 });
    }

    const fx = b.fx ?? [];
    this.shade.setAlpha(fx.includes('dark') ? 0.75 : 0);
    this.tint.setAlpha(0);
    if (fx.includes('purple')) {
      this.tint.setAlpha(0.35);
      this.tweens.add({ targets: this.tint, alpha: 0.1, duration: 900 });
    }
    if (fx.includes('light')) {
      this.tint.setFillStyle(0x2ad4c4, 1).setAlpha(0.3);
      this.tweens.add({ targets: this.tint, alpha: 0, duration: 900, onComplete: () => this.tint.setFillStyle(0xa040ff, 1) });
    }
    if (fx.includes('shake')) {
      this.cameras.main.shake(350, 0.012);
      Sound.play('thud');
      Sound.vibrate(80);
    }
    if (fx.includes('flash')) this.cameras.main.flash(300, 255, 255, 255);
    if (fx.includes('pulse')) {
      this.tweens.add({ targets: this.slots.R.power, scale: 1.25, duration: 120, yoyo: true, repeat: 2 });
      Sound.play('roar');
    }
    if (fx.includes('pushL')) {
      // knocked down: the body lies towards the left, so anchor the feet further right
      const s = this.slots.L;
      s.g.x = 380;
      this.tweens.add({ targets: s.g, x: 320, duration: 260, ease: 'Cubic.easeOut' });
    } else {
      this.slots.L.g.x = this.slots.L.actor?.pose === 'fallen' ? 320 : this.slots.L.baseX;
    }
    if (fx.includes('exitR')) {
      Sound.play('whoosh');
      this.tweens.add({ targets: [this.slots.R.g, this.slots.R.power], x: '+=420', alpha: 0, duration: 1100, ease: 'Sine.easeIn' });
    } else if (b.right !== undefined) {
      this.slots.R.g.x = this.slots.R.baseX;
      this.slots.R.power.x = this.slots.R.baseX;
      this.slots.R.power.setAlpha(1);
    }

    // text
    this.caption.setText('');
    this.line.setText('');
    this.hl.setText('');
    this.nameTag.setText('');
    this.narr.clear();
    if (b.who === 'C' || b.who === 'N') {
      const h = b.who === 'C' ? 200 : b.hl ? 230 : 170;
      this.narr.fillStyle(0x05070a, 0.72).fillRoundedRect(24, 570 - h / 2, GAME_W - 48, h, 22);
      this.narr.lineStyle(3, 0xffffff, 0.15).strokeRoundedRect(24, 570 - h / 2, GAME_W - 48, h, 22);
    }
    if (b.who === 'C') {
      this.caption.setText(b.text).setAlpha(0).setScale(0.9);
      this.tweens.add({ targets: this.caption, alpha: 1, scale: 1, duration: 500 });
      this.typing = false;
      this.lock = this.time.now + 600;
      Sound.play('whoosh');
      return;
    }
    if (b.who === 'L' || b.who === 'R') {
      const a = this.slots[b.who].actor;
      if (a) this.nameTag.setText(CHAR_NAMES[a.id]).setX(b.who === 'L' ? 40 : GAME_W - 40).setOrigin(b.who === 'L' ? 0 : 1, 0.5);
    }
    this.full = b.text;
    this.shown = 0;
    this.typing = true;
    this.hl.setData('text', b.hl ?? '');
    const hlLen = (b.hl ?? '').length;
    this.hl.setFontSize(hlLen > 30 ? 34 : hlLen > 22 ? 40 : 48);
    if (b.who === 'N') {
      this.line.setY(b.hl ? 530 : 570).setFontSize(b.text.length > 40 ? 38 : 44);
      this.hl.setY(625);
    } else {
      this.line.setY(b.hl ? 1100 : 1130).setFontSize(b.text.length > 36 ? 38 : 42);
      this.hl.setY(1185);
    }
  }

  update(time: number, delta: number): void {
    this.t += delta / 1000;
    for (const k of ['L', 'R'] as const) {
      const s = this.slots[k];
      if (!s.actor) continue;
      const tier = Save.d.armorEquipped;
      drawCharacter(s.pen, s.actor, s.actor.id === 'lino' ? tier : 0, s.actor.id.endsWith('Kid') ? SCALE * 0.95 : SCALE, s.facing, s.actor.pose === 'fallen' ? 0 : this.t);
      s.g.clear();
      s.g.draw(s.pen, FEET_X, FEET_Y);
      s.power.y = 330 + Math.sin(this.t * 2 + (k === 'L' ? 0 : 1)) * 6;
      if (s.actor.pose === 'fallen') s.power.setVisible(false);
    }
    if (this.typing) {
      const prev = Math.floor(this.shown);
      this.shown += (delta / 1000) * 45;
      const n = Math.min(this.full.length, Math.floor(this.shown));
      if (n !== prev && n % 2 === 0) Sound.play('type', 30);
      this.line.setText(this.full.slice(0, n));
      if (n >= this.full.length) {
        this.typing = false;
        const hl = this.hl.getData('text') as string;
        if (hl) {
          this.hl.setText(hl).setScale(0.6).setAlpha(0);
          this.tweens.add({ targets: this.hl, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });
        }
      }
    }
    void time;
  }

  private finish(): void {
    if (!Save.d.storySeen.includes(this.def.id)) {
      Save.d.storySeen.push(this.def.id);
      Save.write();
    }
    this.input.removeAllListeners();
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.next.scene, this.next.data));
  }
}
