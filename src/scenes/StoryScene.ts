import { GAME_H, GAME_W, ttl, txt } from '../config';
import { Sound } from '../core/audio';
import { fmt } from '../core/format';
import { Save } from '../core/save';
import { power } from '../core/stats';
import { CHAR_COLORS, CHAR_NAMES, STORY, VOICES, type Actor, type Beat, type StoryScene as StoryDef } from '../data/story';
import { drawCharacter } from '../gfx/characters';
import { button } from '../ui/widgets';
import { ensureBackground } from '../gfx/backgrounds';

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
  /** set when a new character takes the slot this beat (it walks in) */
  entering: boolean;
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
  private choosing = false;
  private dlg!: Phaser.GameObjects.Graphics;
  private arrow!: Phaser.GameObjects.Graphics;
  private dialogOn = false;
  private page: Phaser.GameObjects.Image | null = null;
  private carding = false;

  constructor() {
    super('Story');
  }

  init(data: { id: string; next?: Next }): void {
    this.def = STORY[data.id] ?? STORY.prologo1;
    this.next = data.next ?? { scene: 'Menu' };
    this.idx = -1;
    this.choosing = false;
    this.page = null;
    this.carding = false;
    this.dialogOn = false;
  }

  create(): void {
    this.cameras.main.fadeIn(300, 0, 0, 0);
    Sound.music(this.def.music);
    for (const b of [this.def.bg, ...this.def.beats.map((x) => x.bg)]) if (b) ensureBackground(this, b);
    this.bg = this.add.image(GAME_W / 2, GAME_H / 2, this.def.bg);
    this.shade = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0).setDepth(5);
    this.tint = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xa040ff, 0).setDepth(6);
    // visual-novel style dialogue box (drawn per beat with the speaker's colour)
    this.dlg = this.add.graphics().setDepth(8);
    this.arrow = this.add.graphics().setDepth(11);

    const mk = (x: number, facing: number): Slot => ({
      g: this.add.renderTexture(x, GROUND, RT_W, RT_H).setOrigin(FEET_X / RT_W, FEET_Y / RT_H).setDepth(3),
      pen: this.make.graphics({}, false),
      power: this.add.text(x, 330, '', txt(110, '#5fc8ff', 14)).setOrigin(0.5).setDepth(4),
      actor: null,
      baseX: x,
      facing,
      entering: false,
    });
    this.slots = { L: mk(200, 1), R: mk(530, -1) };

    this.nameTag = this.add.text(60, 1004, '', txt(26, '#ffffff', 6)).setOrigin(0, 0.5).setDepth(10);
    this.line = this.add.text(GAME_W / 2, 1100, '', { ...txt(40, '#ffffff', 8), wordWrap: { width: 640 } }).setOrigin(0.5).setDepth(10);
    this.hl = this.add.text(GAME_W / 2, 1185, '', { ...txt(44, '#ffa62b', 9), wordWrap: { width: 640 } }).setOrigin(0.5).setDepth(10);
    // narrator/caption box sits between the power numbers and the characters' heads
    this.narr = this.add.graphics().setDepth(9);
    this.caption = this.add.text(GAME_W / 2, 570, '', { ...ttl(54, '#ffffff', 11), wordWrap: { width: 640 } }).setOrigin(0.5).setDepth(10);

    button(this, GAME_W - 90, 50, 140, 54, 'SALTAR', () => this.finish(), { size: 24, color: 0x3a4a5e }).setDepth(20);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.y < 90 && p.x > GAME_W - 180) return;
      Sound.unlock();
      if (this.carding) return;
      if (this.choosing || this.time.now < this.lock) return;
      if (this.typing) {
        this.shown = this.full.length;
        return;
      }
      this.advance();
    });
    this.titleCard();
  }

  /** Cinematic title card at the start of every scene (tap to skip). */
  private titleCard(): void {
    const [head, sub] = this.def.title.split(' · ');
    this.carding = true;
    const D = 40;
    const top = this.add.rectangle(GAME_W / 2, -90, GAME_W, 180, 0x000000).setDepth(D);
    const bot = this.add.rectangle(GAME_W / 2, GAME_H + 90, GAME_W, 180, 0x000000).setDepth(D);
    const dim = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x05070a, 0.55).setDepth(D - 1);
    const t1 = this.add.text(GAME_W / 2, 560, head.toUpperCase(), ttl(34, '#ffd34d', 8)).setOrigin(0.5).setDepth(D).setAlpha(0);
    const t2 = this.add.text(GAME_W / 2, 625, sub ?? '', { ...ttl(54, '#ffffff', 11), wordWrap: { width: 640 }, align: 'center' }).setOrigin(0.5).setDepth(D).setAlpha(0);
    const line = this.add.rectangle(GAME_W / 2, 590, 0, 3, 0xffd34d).setDepth(D);
    this.tweens.add({ targets: top, y: 90, duration: 300, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: bot, y: GAME_H - 90, duration: 300, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 400, delay: 150 });
    this.tweens.add({ targets: line, width: 380, duration: 500, delay: 150, ease: 'Quad.easeOut' });
    Sound.play('whoosh');
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      this.tweens.add({ targets: [top, bot, dim, t1, t2, line], alpha: 0, duration: 300, onComplete: () => [top, bot, dim, t1, t2, line].forEach((o) => o.destroy()) });
      this.time.delayedCall(150, () => {
        this.carding = false;
        this.advance();
      });
    };
    this.time.delayedCall(1700, end);
    this.input.once('pointerup', () => this.time.delayedCall(0, end));
  }

  private setActor(slot: Slot, a: Actor | null | undefined): void {
    if (a === undefined) return;
    const prev = slot.actor;
    slot.entering = !!a && (!prev || prev.id !== a.id) && a.pose !== 'fallen';
    if (!a) {
      // walks out: fade the last drawn frame instead of popping away
      slot.actor = null;
      if (prev && slot.g.visible) {
        this.tweens.add({ targets: [slot.g, slot.power], alpha: 0, duration: 280, onComplete: () => { slot.g.setVisible(false); slot.power.setVisible(false); } });
      } else {
        slot.g.setVisible(false);
        slot.power.setVisible(false);
      }
      return;
    }
    slot.actor = a;
    this.tweens.killTweensOf([slot.g, slot.power]);
    slot.g.setVisible(true);
    slot.power.setVisible(!!a.power).setAlpha(1);
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
    if (fx.includes('zoom')) {
      // camera punch on the big lines
      const cam = this.cameras.main;
      cam.zoomTo(1.08, 110, 'Quad.easeOut', true);
      this.time.delayedCall(260, () => cam.zoomTo(1, 380, 'Sine.easeInOut', true));
    }
    if (fx.includes('ink')) {
      // ink burst where the right-hand character stands (dissolving / breaking free)
      const em = this.add.particles(0, 0, 'fx_smoke', {
        x: this.slots.R.baseX, y: GROUND - 170, speed: { min: 120, max: 420 }, angle: { min: 0, max: 360 },
        scale: { start: 0.9, end: 0 }, alpha: { start: 0.95, end: 0 }, tint: [0x2a1048, 0x7a3ad8, 0x0b0b0e, 0xb060ff],
        lifespan: 750, gravityY: 300, emitting: false,
      }).setDepth(7);
      em.explode(32);
      this.time.delayedCall(1000, () => em.destroy());
      Sound.play('whoosh');
    }
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

    // characters that just took a slot walk in from their side
    for (const k of ['L', 'R'] as const) {
      const sl = this.slots[k];
      if (!sl.entering || !sl.actor) continue;
      const dir = k === 'L' ? -1 : 1;
      const base = sl.actor.alpha ?? 1;
      if (fx.includes('reveal')) {
        // appears in place, out of the ink (someone freed from a possession)
        sl.g.setX(sl.baseX).setAlpha(0).setScale(0.8);
        sl.power.setX(sl.baseX).setAlpha(0);
        this.tweens.add({ targets: sl.g, alpha: base, scale: 1, duration: 650, ease: 'Back.easeOut' });
        this.tweens.add({ targets: sl.power, alpha: 1, duration: 400, delay: 500 });
        continue;
      }
      sl.g.setX(sl.baseX + dir * 260).setAlpha(0);
      sl.power.setX(sl.baseX).setAlpha(0);
      this.tweens.add({ targets: sl.g, x: sl.baseX, alpha: base, duration: 380, ease: 'Cubic.easeOut' });
      this.tweens.add({ targets: sl.power, alpha: 1, duration: 380, delay: 150 });
    }
    // story prop: the oath page
    if (this.page) {
      const pg = this.page;
      this.page = null;
      this.tweens.add({ targets: pg, alpha: 0, scale: 0.8, duration: 200, onComplete: () => pg.destroy() });
    }
    if (fx.includes('page')) {
      const y = b.who === 'N' || b.who === 'C' ? 820 : 600;
      this.page = this.add.image(GAME_W / 2, y, 'oath_page').setDepth(9).setScale(0.4).setAlpha(0).setAngle(-12);
      this.tweens.add({ targets: this.page, scale: 1.1, alpha: 1, angle: -4, duration: 420, ease: 'Back.easeOut' });
      Sound.play('legend', 0);
    }

    // text
    this.caption.setText('');
    this.line.setText('');
    this.hl.setText('');
    this.nameTag.setText('');
    this.narr.clear();
    this.dlg.clear();
    this.arrow.clear();
    this.dialogOn = false;
    this.line.setColor('#ffffff');
    this.hl.setColor('#ffa62b');
    if (b.who === 'C' || b.who === 'N') {
      const h = b.who === 'C' ? 200 : b.hl ? 230 : 170;
      const v = b.voice ? VOICES[b.voice] : null;
      this.narr.fillStyle(v ? 0x0c0414 : 0x05070a, v ? 0.88 : 0.72).fillRoundedRect(24, 570 - h / 2, GAME_W - 48, h, 22);
      this.narr.lineStyle(v ? 4 : 3, v ? v.color : 0xffffff, v ? 0.95 : 0.15).strokeRoundedRect(24, 570 - h / 2, GAME_W - 48, h, 22);
      if (v) {
        // an off-screen voice speaks: plate with its name over the box
        this.nameTag.setText(v.name);
        const w = this.nameTag.width + 44;
        const y = 570 - h / 2 - 22;
        this.narr.fillStyle(v.color, 1).fillRoundedRect(48, y, w, 44, 14);
        this.narr.lineStyle(3, 0x05070a, 1).strokeRoundedRect(48, y, w, 44, 14);
        this.nameTag.setOrigin(0, 0.5).setPosition(70, y + 22);
        this.line.setColor(v.text);
        this.hl.setColor('#ff8ae0');
      }
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
      const col = a ? CHAR_COLORS[a.id] : 0x3a4a5e;
      this.dialogOn = true;
      // box
      this.dlg.fillStyle(0x05070a, 0.9).fillRoundedRect(18, 1020, GAME_W - 36, 238, 22);
      this.dlg.lineStyle(4, col, 0.9).strokeRoundedRect(18, 1020, GAME_W - 36, 238, 22);
      this.dlg.lineStyle(2, 0xffffff, 0.08).strokeRoundedRect(26, 1028, GAME_W - 52, 222, 18);
      // name plate on the speaker's side
      if (a) {
        this.nameTag.setText(CHAR_NAMES[a.id]);
        const w = this.nameTag.width + 44;
        const x = b.who === 'L' ? 44 : GAME_W - 44 - w;
        this.dlg.fillStyle(col, 1).fillRoundedRect(x, 984, w, 44, 14);
        this.dlg.lineStyle(3, 0x05070a, 1).strokeRoundedRect(x, 984, w, 44, 14);
        this.nameTag.setOrigin(0, 0.5).setPosition(x + 22, 1006);
      }
    }
    this.full = b.text;
    this.shown = 0;
    this.typing = true;
    if (b.choice) this.showChoice(b.choice);
    this.hl.setData('text', b.hl ?? '');
    const hlLen = (b.hl ?? '').length;
    this.hl.setFontSize(hlLen > 32 ? 32 : hlLen > 22 ? 38 : 44);
    if (b.who === 'N') {
      this.line.setY(b.hl ? 530 : 570).setFontSize(b.text.length > 40 ? 38 : 44);
      this.hl.setY(625);
    } else {
      this.line.setY(b.hl ? 1098 : 1135).setFontSize(b.text.length > 36 ? 34 : 40);
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
    // "continue" arrow once the line is fully written
    this.arrow.clear();
    if (this.dialogOn && !this.typing && !this.choosing) {
      const bob = Math.sin(this.t * 6) * 4;
      this.arrow.fillStyle(0xffd34d, 0.6 + Math.sin(this.t * 6) * 0.4);
      this.arrow.fillTriangle(664, 1226 + bob, 690, 1226 + bob, 677, 1242 + bob);
    }
    void time;
  }

  /** Branching point (ending choice): two big buttons instead of tap-to-advance. */
  private showChoice(options: NonNullable<Beat['choice']>): void {
    this.choosing = true;
    options.forEach((o, i) => {
      const y = 800 + i * 170;
      const b = button(this, GAME_W / 2, y, 600, 140, '', () => this.pick(o), { color: o.color, radius: 22 }).setDepth(30).setAlpha(0);
      b.add(this.add.text(0, -24, o.label, txt(48, '#ffffff', 9)).setOrigin(0.5));
      b.add(this.add.text(0, 30, o.desc, txt(24, '#ffffff', 5)).setOrigin(0.5));
      this.tweens.add({ targets: b, alpha: 1, delay: 600 + i * 200, duration: 300 });
    });
  }

  private pick(o: NonNullable<Beat['choice']>[number]): void {
    Save.d.finale = o.finale;
    if (!Save.d.storySeen.includes(this.def.id)) Save.d.storySeen.push(this.def.id);
    Save.write();
    Sound.play(o.finale === 'venganza' ? 'roar' : 'legend');
    this.input.removeAllListeners();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Story', { id: o.next, next: { scene: 'Credits', data: { finale: o.finale } } }));
  }

  private finish(): void {
    if (this.choosing) return;
    // "skip" never skips a decision: jump to the choice beat instead
    const ci = this.def.beats.findIndex((b) => b.choice);
    if (ci >= 0 && this.idx < ci) {
      this.idx = ci - 1;
      this.advance();
      return;
    }
    if (!Save.d.storySeen.includes(this.def.id)) {
      Save.d.storySeen.push(this.def.id);
      Save.write();
    }
    this.input.removeAllListeners();
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.next.scene, this.next.data));
  }
}
