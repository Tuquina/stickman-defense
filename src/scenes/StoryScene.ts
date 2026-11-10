import { GAME_H, GAME_W, ttl, txt } from '../config';
import { Sound } from '../core/audio';
import { fmt } from '../core/format';
import { Save } from '../core/save';
import { power } from '../core/stats';
import { CHAR_COLORS, CHAR_NAMES, STORY, VOICES, type Actor, type Beat, type StoryScene as StoryDef } from '../data/story';
import { drawCharacter } from '../gfx/characters';
import { button } from '../ui/widgets';
import { ensureBackground } from '../gfx/backgrounds';
import { ensureCinema, HOUSES_BOTTOM, ROOF_FIRES } from '../gfx/cinema';

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
/** prologue staging */
const BEAST_X = 380;
const BEAST_Y = 880;
const BED_TOP = 990;
const SIT_X = 150;
const BED_X = 50;
const BED_LIE_X = 370;

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
  // ---- staging for animated scenes (the attack in the prologue)
  private mood: NonNullable<Beat['mood']> = 'day';
  private nightR!: Phaser.GameObjects.Rectangle;
  private warmR!: Phaser.GameObjects.Rectangle;
  private moon!: Phaser.GameObjects.Graphics;
  private fireG!: Phaser.GameObjects.Graphics;
  private smoke!: Phaser.GameObjects.Particles.ParticleEmitter;
  private embers!: Phaser.GameObjects.Particles.ParticleEmitter;
  private houses!: Phaser.GameObjects.Image;
  private fires: { img: Phaser.GameObjects.Image; glow: Phaser.GameObjects.Image }[] = [];
  private tentBack!: Phaser.GameObjects.Graphics;
  private tentFront!: Phaser.GameObjects.Graphics;
  private beast: Phaser.GameObjects.Image | null = null;
  private beastEyes: Phaser.GameObjects.Image | null = null;
  private beastT = 0;
  private bed!: Phaser.GameObjects.Image;
  private blanket!: Phaser.GameObjects.Image;
  private candle!: Phaser.GameObjects.Image;
  private candleGlow!: Phaser.GameObjects.Image;
  private rays!: Phaser.GameObjects.Image;
  private ambient: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private ambientKey = '';
  private uiCam!: Phaser.Cameras.Scene2D.Camera;
  private pushed = false;
  private bedOn = false;
  private broom!: Phaser.GameObjects.Image;
  private horde: Phaser.GameObjects.Image[] = [];
  private hordeOn = false;
  private hordeT = 0;
  private frameT = 0;
  private frame = 0;

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
    this.mood = 'day';
    this.beast = null;
    this.beastEyes = null;
    this.fires = [];
    this.ambient = null;
    this.ambientKey = '';
    this.pushed = false;
    this.horde = [];
    this.hordeOn = false;
  }

  create(): void {
    Sound.music(this.def.music);
    for (const b of [this.def.bg, ...this.def.beats.map((x) => x.bg)]) if (b) ensureBackground(this, b);
    this.bg = this.add.image(GAME_W / 2, GAME_H / 2, this.def.bg);
    this.shade = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0).setDepth(5);
    this.tint = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xa040ff, 0).setDepth(6);
    this.buildStage();
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
    this.setupCameras();
    this.setAmbient(this.def.bg);
    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.uiCam.fadeIn(300, 0, 0, 0);
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
    if (a.pose === 'fallen' && this.bedOn && slot === this.slots.L) slot.g.x = BED_LIE_X;
    slot.g.y = a.pose === 'fallen' ? GROUND - 20 : a.pose === 'sit' ? BED_TOP : GROUND;
    if (a.pose === 'sit') {
      slot.g.x = SIT_X;
      if (prev?.pose === 'fallen') {
        // waking up: sits up in bed
        slot.g.setAlpha(0).setY(BED_TOP + 40);
        this.tweens.add({ targets: slot.g, alpha: a.alpha ?? 1, y: BED_TOP, duration: 700, ease: 'Back.easeOut' });
      }
    }
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
    if (b.bg) {
      this.bg.setTexture(b.bg);
      this.setAmbient(b.bg);
    }
    if (this.pushed) {
      this.resetCam(600);
      this.pushed = false;
    }
    if (b.music) Sound.music(b.music);
    const cine = b.cine ?? [];
    const swipe = cine.includes('swipe');
    this.bedOn = cine.includes('bed');
    if (!swipe) this.setActor(this.slots.L, b.left);
    this.setActor(this.slots.R, b.right);
    this.setMood(b.mood);

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
      this.inkBurst(this.slots.R.baseX, GROUND - 170);
      Sound.play('whoosh');
    }
    if (fx.includes('pulse')) {
      this.tweens.add({ targets: this.slots.R.power, scale: 1.25, duration: 120, yoyo: true, repeat: 2 });
      Sound.play('roar');
    }
    if (fx.includes('pushL') && !swipe) {
      // knocked down: the body lies towards the left, so anchor the feet further right
      const s = this.slots.L;
      s.g.x = 380;
      this.tweens.add({ targets: s.g, x: 320, duration: 260, ease: 'Cubic.easeOut' });
    } else {
      const lp = this.slots.L.actor?.pose;
      this.slots.L.g.x = lp === 'sit' ? SIT_X : lp === 'fallen' ? (this.bedOn ? BED_LIE_X : 320) : this.slots.L.baseX;
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
    // staged animation
    this.bed.setVisible(cine.includes('bed'));
    this.blanket.setVisible(cine.includes('bed'));
    this.broom.setVisible(cine.includes('broom'));
    if (fx.includes('push')) {
      // slow push-in on whoever speaks (or the middle for the narrator)
      const x = b.who === 'L' ? 250 : b.who === 'R' ? 480 : GAME_W / 2;
      this.push(x, 820, 1.14, 2800);
      this.pushed = true;
    }
    if (cine.includes('wake')) {
      this.push(230, 900, 1.2, 1800);
      this.pushed = true;
    }
    if (cine.includes('look')) {
      // Lino looks for his brother: the camera drifts to the empty side of the room, then back
      this.push(520, 860, 1.22, 1500);
      this.time.delayedCall(1900, () => this.push(240, 880, 1.16, 1300));
      this.pushed = true;
    }
    this.setHorde(cine.includes('horde'));
    this.setBeast(cine.includes('beast'));
    if (cine.includes('crack')) this.crack();
    if (swipe) {
      this.swipe(() => {
        this.setActor(this.slots.L, b.left);
        const sl = this.slots.L;
        if (fx.includes('pushL')) {
          sl.g.x = 400;
          this.tweens.add({ targets: sl.g, x: 320, duration: 300, ease: 'Cubic.easeOut' });
        }
        this.cameras.main.shake(450, 0.02);
        this.cameras.main.flash(260, 255, 70, 70);
        this.inkBurst(sl.baseX, GROUND - 120);
        Sound.play('thud');
        Sound.vibrate([60, 30, 120]);
      });
    }
    if (fx.includes('page') || cine.includes('note')) {
      const y = b.who === 'N' || b.who === 'C' ? 820 : 600;
      this.page = this.add.image(GAME_W / 2, y, cine.includes('note') ? 'dante_note' : 'oath_page').setDepth(9).setScale(0.4).setAlpha(0).setAngle(-12);
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
    // with the beast on stage the narration goes to the bottom box so it never hides the creature
    const lowNarr = b.who === 'N' && !b.voice && cine.includes('beast');
    if (lowNarr) {
      this.dlg.fillStyle(0x05070a, 0.9).fillRoundedRect(18, 1020, GAME_W - 36, 238, 22);
      this.dlg.lineStyle(3, 0xffffff, 0.2).strokeRoundedRect(18, 1020, GAME_W - 36, 238, 22);
    } else if (b.who === 'C' || b.who === 'N') {
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
    if (b.who === 'N' && !lowNarr) {
      this.line.setY(b.hl ? 530 : 570).setFontSize(b.text.length > 40 ? 38 : 44);
      this.hl.setY(625);
    } else {
      this.line.setY(b.hl ? 1098 : 1135).setFontSize(b.text.length > 36 ? 34 : 40);
      this.hl.setY(1185);
    }
  }

  update(time: number, delta: number): void {
    this.t += delta / 1000;
    this.updateStage(delta / 1000);
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

  // ================================================================ staging (animated scenes)
  private buildStage(): void {
    ensureCinema(this);
    this.nightR = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a1238, 1).setDepth(1).setAlpha(0);
    this.warmR = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0xff7a30, 1).setDepth(1.1).setAlpha(0);
    // moon (only for the daytime backgrounds turned into night; the night village paints its own)
    this.moon = this.add.graphics().setDepth(1.2).setAlpha(0);
    this.moon.fillStyle(0xfff4d0, 0.08).fillCircle(590, 200, 110);
    this.moon.fillStyle(0xfff4d0, 0.16).fillCircle(590, 200, 70);
    this.moon.fillStyle(0xf4ecd2, 1).fillCircle(590, 200, 42);
    // beast (behind the houses) and its live tentacles
    this.tentBack = this.add.graphics().setDepth(1.45);
    this.tentFront = this.add.graphics().setDepth(1.7);
    // houses of the village: a separate layer so the creature rises behind them
    this.houses = this.add.image(GAME_W / 2, HOUSES_BOTTOM, 'village_houses').setOrigin(0.5, 1).setDepth(1.6).setVisible(false);
    // roof fires: painted flame frames + a soft glow each (additive)
    for (const f of ROOF_FIRES) {
      const glowI = this.add.image(f.x, f.y - 30, 'fx_glow').setDepth(1.62).setTint(0xff7a2a).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setScale(2.4 * f.s);
      const img = this.add.image(f.x, f.y + 6, 'flame_0').setOrigin(0.5, 1).setDepth(1.66).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setScale(f.s);
      img.setData('ph', Math.random() * 10).setData('s', f.s);
      this.fires.push({ img, glow: glowI });
    }
    // burning glow rising from the street
    this.fireG = this.add.graphics().setDepth(1.3).setAlpha(0);
    for (let i = 0; i < 44; i++) {
      this.fireG.fillStyle(0xff5a1a, Math.pow(i / 44, 1.8) * 0.45);
      this.fireG.fillRect(0, 480 + i * 12, GAME_W, 12);
    }
    this.smoke = this.add.particles(0, 0, 'fx_smoke', {
      x: { min: 20, max: GAME_W - 20 }, y: { min: 520, max: 660 }, speedY: { min: -60, max: -25 }, speedX: { min: -8, max: 22 },
      scale: { start: 1, end: 2.8 }, alpha: { start: 0.4, end: 0 }, tint: [0x16121e, 0x221a28, 0x32241e],
      lifespan: 3600, frequency: 160, emitting: false,
    }).setDepth(1.55);
    this.embers = this.add.particles(0, 0, 'fx_spark', {
      x: { min: 0, max: GAME_W }, y: { min: 640, max: 1060 }, speedY: { min: -200, max: -70 }, speedX: { min: -50, max: 50 },
      scale: { start: 0.5, end: 0 }, alpha: { start: 1, end: 0 }, tint: [0xffa040, 0xff6020, 0xffd080],
      lifespan: 2600, frequency: 45, emitting: false, blendMode: Phaser.BlendModes.ADD,
    }).setDepth(2.95);
    // healer's house: bed (behind the characters) + quilt (over them) + the candle on the table
    this.bed = this.add.image(BED_X, BED_TOP - 86, 'bed').setOrigin(0, 0).setDepth(2.8).setVisible(false);
    this.blanket = this.add.image(BED_X + 150, BED_TOP - 34, 'blanket').setOrigin(0, 0).setDepth(3.2).setVisible(false);
    this.broom = this.add.image(560, 1040, 'broom_broken').setDepth(2.85).setVisible(false);
    this.candleGlow = this.add.image(434, 828, 'fx_glow').setDepth(1.2).setTint(0xffa040).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setScale(5);
    this.candle = this.add.image(434, 840, 'flame_0').setOrigin(0.5, 1).setDepth(1.25).setScale(0.22).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    this.rays = this.add.image(540, 400, 'fx_rays').setDepth(1.15).setTint(0xffc88a).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0).setScale(2.2).setAngle(-30);
    // cinematic vignette over the scenery
    this.add.image(GAME_W / 2, GAME_H / 2, 'vignette').setScale(2).setDepth(7.4).setAlpha(0.85);
  }

  /** Two cameras: the world one moves (zoom, pans, shakes) and the UI stays still. */
  private setupCameras(): void {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, GAME_W, GAME_H);
    this.uiCam = this.cameras.add(0, 0, GAME_W, GAME_H);
    this.uiCam.setBackgroundColor('rgba(0,0,0,0)');
    this.events.on('prerender', () => this.routeCameras());
  }

  private routeCameras(): void {
    const main = this.cameras.main.id;
    const ui = this.uiCam.id;
    for (const o of this.children.list) o.cameraFilter = (o as unknown as { depth: number }).depth >= 8 ? main : ui;
  }

  /** Slow push-in towards a point (emotional lines); reset() brings the camera back. */
  private push(x: number, y: number, zoom = 1.12, ms = 2600): void {
    const cam = this.cameras.main;
    cam.zoomTo(zoom, ms, 'Sine.easeInOut', true);
    cam.pan(x, y, ms, 'Sine.easeInOut', true);
  }

  private resetCam(ms = 500): void {
    const cam = this.cameras.main;
    cam.zoomTo(1, ms, 'Sine.easeInOut', true);
    cam.pan(GAME_W / 2, GAME_H / 2, ms, 'Sine.easeInOut', true);
  }

  private setMood(m: Beat['mood']): void {
    if (!m || m === this.mood) return;
    this.mood = m;
    const painted = this.bg.texture.key === 'bg_village_night' || this.bg.texture.key === 'bg_room';
    const night = painted ? (m === 'fire' ? 0.18 : m === 'dawn' ? 0.05 : 0.12) : m === 'night' ? 0.74 : m === 'fire' ? 0.64 : m === 'dawn' ? 0.3 : m === 'candle' ? 0.3 : 0;
    this.tweens.add({ targets: this.nightR, alpha: night, duration: 700 });
    this.tweens.add({ targets: this.warmR, alpha: m === 'dawn' ? 0.2 : m === 'candle' ? 0.06 : 0, duration: 900 });
    this.tweens.add({ targets: this.moon, alpha: m === 'night' && !painted ? 1 : 0, duration: 700 });
    this.tweens.add({ targets: this.fireG, alpha: m === 'fire' ? 1 : 0, duration: 600 });
    this.tweens.add({ targets: this.rays, alpha: m === 'dawn' && this.bg.texture.key === 'bg_room' ? 0.22 : 0, duration: 1400 });
    const candle = m === 'candle' || (m === 'dawn' && this.bg.texture.key === 'bg_room');
    this.tweens.add({ targets: [this.candle, this.candleGlow], alpha: candle ? (m === 'dawn' ? 0.5 : 1) : 0, duration: 600 });
    // roof fires catch one after another
    this.fires.forEach((f, i) => {
      const on = m === 'fire';
      this.tweens.add({ targets: f.img, alpha: on ? 1 : 0, duration: 500, delay: on ? i * 90 : 0 });
      this.tweens.add({ targets: f.glow, alpha: on ? 0.55 : 0, duration: 500, delay: on ? i * 90 : 0 });
    });
    if (m === 'fire') {
      this.embers.start();
      this.smoke.start();
    } else {
      this.embers.stop();
      this.smoke.stop();
    }
  }

  /** Ambient particles that suit each background (dust, fireflies, ash, pages…). */
  private setAmbient(key: string): void {
    if (this.ambientKey === key) return;
    this.ambientKey = key;
    this.ambient?.destroy();
    const cfg: Record<string, { tint: number[]; up: boolean; tex?: string; freq?: number }> = {
      bg_day: { tint: [0xfff2c8], up: true },
      bg_dusk: { tint: [0xffd0a0], up: true },
      bg_village_night: { tint: [0xb8c8ff], up: true, freq: 420 },
      bg_room: { tint: [0xffd09a], up: true, freq: 300 },
      bg_c1: { tint: [0xd8ff7a, 0xa0ff9a], up: true, freq: 260 },
      bg_c2: { tint: [0xf0e0c0], up: false },
      bg_c3: { tint: [0x8a8090, 0xb0a0b0], up: false, tex: 'fx_smoke', freq: 220 },
      bg_c4: { tint: [0x7affe0, 0x9ad8ff], up: true, freq: 240 },
      bg_c5: { tint: [0xd0b0ff, 0xfff0d0], up: true },
      bg_c6: { tint: [0xd050ff, 0xff7ad0], up: true, freq: 200 },
    };
    const c = cfg[key];
    if (!c) {
      this.ambient = null;
      return;
    }
    const smoke = c.tex === 'fx_smoke';
    this.ambient = this.add.particles(0, 0, c.tex ?? 'fx_spark', {
      x: { min: 0, max: GAME_W }, y: c.up ? { min: 500, max: 1150 } : { min: -20, max: 200 },
      speedY: c.up ? { min: -26, max: -8 } : { min: 30, max: 70 }, speedX: { min: -14, max: 14 },
      scale: smoke ? { start: 0.25, end: 0.1 } : { start: 0.28, end: 0.05 }, alpha: { start: 0.75, end: 0 },
      tint: c.tint, lifespan: 6000, frequency: c.freq ?? 340, blendMode: smoke ? Phaser.BlendModes.NORMAL : Phaser.BlendModes.ADD,
    }).setDepth(4.5);
  }

  private setHorde(on: boolean): void {
    if (on && !this.hordeOn) this.hordeT = 0;
    this.hordeOn = on;
  }

  /** One ink monster running across the village street, behind the characters. */
  private spawnRunner(): void {
    const keys = ['e_arana', 'e_manchita', 'e_renacuajo', 'e_mancha', 'e_sanguijuela', 'e_escarabajo'].filter((k) => this.textures.exists(`${k}_0`));
    if (!keys.length) return;
    const k = keys[Math.floor(Math.random() * keys.length)];
    const y = Phaser.Math.Between(915, 990);
    const img = this.add.image(GAME_W + 90, y, `${k}_0`).setOrigin(0.5, 1).setDepth(2 + (y - 900) / 220)
      .setScale(Phaser.Math.FloatBetween(0.9, 1.3)).setTint(0x7a7298);
    img.setData('k', k);
    this.horde.push(img);
    this.tweens.add({
      targets: img, x: -120, duration: Phaser.Math.Between(1500, 2500),
      onComplete: () => {
        this.horde = this.horde.filter((o) => o !== img);
        img.destroy();
      },
    });
  }

  private setBeast(on: boolean): void {
    if (on && !this.beast) {
      // the creature rises out of the river behind the houses; the camera pulls back to reveal it
      const img = this.add.image(BEAST_X, 1500, 'beast_body').setOrigin(0.5, 1).setDepth(1.5).setScale(1.25);
      const eyes = this.add.image(BEAST_X, 0, 'fx_glow').setDepth(1.52).setTint(0xb060ff).setBlendMode(Phaser.BlendModes.ADD).setScale(5, 2).setAlpha(0);
      this.beast = img;
      this.beastEyes = eyes;
      this.beastT = 0;
      this.tweens.add({ targets: img, y: BEAST_Y, duration: 1500, ease: 'Back.easeOut' });
      this.tweens.add({ targets: eyes, alpha: 0.8, delay: 900, duration: 500 });
      const cam = this.cameras.main;
      cam.setZoom(1.2);
      cam.centerOn(GAME_W / 2, 820);
      cam.zoomTo(1, 1600, 'Sine.easeInOut', true);
      cam.pan(GAME_W / 2, GAME_H / 2, 1600, 'Sine.easeInOut', true);
      cam.shake(1400, 0.009);
      Sound.play('roar');
      Sound.vibrate([80, 40, 160]);
    } else if (!on && this.beast) {
      // it sinks back into the river
      const img = this.beast;
      const eyes = this.beastEyes;
      this.beast = null;
      this.beastEyes = null;
      this.tweens.killTweensOf(img);
      this.tweens.add({ targets: img, y: BEAST_Y + 260, alpha: 0, duration: 1500, ease: 'Sine.easeIn', onComplete: () => img.destroy() });
      if (eyes) this.tweens.add({ targets: eyes, alpha: 0, duration: 600, onComplete: () => eyes.destroy() });
      this.cameras.main.shake(900, 0.004);
    }
  }

  /** Live tentacles: tapered, swaying, with a violet rim and suckers. */
  private drawTentacles(): void {
    this.tentBack.clear();
    this.tentFront.clear();
    const img = this.beast;
    if (!img) return;
    const t = this.beastT;
    const top = img.y - img.displayHeight;
    const arms: [Phaser.GameObjects.Graphics, number, number, number, number, number, number][] = [
      // g, base x, base y (from the beast's top), angle, length, width, phase
      [this.tentBack, -250, 0.62, -2.5, 330, 40, 0],
      [this.tentBack, 260, 0.6, -0.6, 320, 40, 1.7],
      [this.tentBack, -200, 0.82, -3.0, 260, 34, 3.1],
      [this.tentBack, 210, 0.84, -0.15, 260, 34, 4.4],
      [this.tentFront, -150, 0.95, 2.2, 260, 36, 2.2],
      [this.tentFront, 170, 0.95, 0.85, 250, 36, 5.3],
    ];
    for (const [g, bx, by, a0, len, w0, ph] of arms) {
      const N = 18;
      let x = img.x + bx;
      let y = top + img.displayHeight * by;
      let a = a0;
      const left: Phaser.Math.Vector2[] = [];
      const right: Phaser.Math.Vector2[] = [];
      const mid: { x: number; y: number; w: number; a: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const w = w0 * (1 - u * 0.88);
        mid.push({ x, y, w, a });
        left.push(new Phaser.Math.Vector2(x + Math.cos(a - Math.PI / 2) * w, y + Math.sin(a - Math.PI / 2) * w));
        right.push(new Phaser.Math.Vector2(x + Math.cos(a + Math.PI / 2) * w, y + Math.sin(a + Math.PI / 2) * w));
        a += Math.sin(t * 1.7 + ph + u * 3) * 0.09 + (a0 > -Math.PI / 2 && a0 < Math.PI / 2 ? 0.035 : -0.035);
        x += Math.cos(a) * (len / N);
        y += Math.sin(a) * (len / N);
      }
      const pts = left.concat(right.reverse());
      g.fillStyle(0x7a4ad8, 0.85).fillPoints(pts.map((p) => new Phaser.Math.Vector2(p.x, p.y - 3)), true);
      g.fillStyle(0x140a24, 1).fillPoints(pts, true);
      for (let i = 2; i < N; i += 2) {
        const m = mid[i];
        const sx = m.x + Math.cos(m.a + Math.PI / 2) * m.w * 0.55;
        const sy = m.y + Math.sin(m.a + Math.PI / 2) * m.w * 0.55;
        g.fillStyle(0xc9a0ff, 0.75).fillCircle(sx, sy, m.w * 0.24);
        g.fillStyle(0x3a2060, 1).fillCircle(sx, sy, m.w * 0.12);
      }
    }
  }

  /** A tentacle lashes out from the beast and hits the left character. */
  private swipe(onHit: () => void): void {
    const g = this.add.graphics().setDepth(3.6);
    const from = { x: BEAST_X + 160, y: 760 };
    const ctrl = { x: 470, y: 420 };
    const to = { x: this.slots.L.baseX + 30, y: GROUND - 120 };
    const st = { p: 0 };
    const draw = () => {
      g.clear();
      const n = 40;
      const m = Math.max(1, Math.floor(n * st.p));
      for (const pass of [0, 1]) {
        for (let i = 0; i <= m; i++) {
          const u = i / n;
          const x = (1 - u) * (1 - u) * from.x + 2 * (1 - u) * u * ctrl.x + u * u * to.x;
          const y = (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * ctrl.y + u * u * to.y;
          const r = 36 - 24 * u;
          if (pass === 0) g.fillStyle(0x8a5ae8, 0.9).fillCircle(x, y - 3, r + 4);
          else {
            g.fillStyle(0x140a24, 1).fillCircle(x, y, r);
            if (i % 4 === 2) g.fillStyle(0xc9a0ff, 0.8).fillCircle(x, y + r * 0.45, r * 0.24);
          }
        }
      }
    };
    Sound.play('whoosh');
    this.cameras.main.zoomTo(1.06, 200, 'Quad.easeIn', true);
    this.tweens.add({
      targets: st, p: 1, duration: 260, ease: 'Quad.easeIn', onUpdate: draw,
      onComplete: () => {
        onHit();
        this.hitStop(110);
        this.tweens.add({ targets: st, p: 0, delay: 220, duration: 480, ease: 'Quad.easeIn', onUpdate: draw, onComplete: () => g.destroy() });
        this.cameras.main.zoomTo(1, 600, 'Sine.easeOut', true);
      },
    });
  }

  /** Brief freeze on impact: sells the hit. */
  private hitStop(ms: number): void {
    this.tweens.timeScale = 0.05;
    setTimeout(() => (this.tweens.timeScale = 1), ms);
  }

  /** The broom snaps in two. */
  private crack(): void {
    const x = this.slots.R.baseX - 90;
    const y = GROUND - 250;
    const t = this.add.text(x, y, '¡CRAC!', ttl(64, '#ffd34d', 11)).setOrigin(0.5).setDepth(9).setAngle(-14).setScale(0.3);
    this.tweens.add({ targets: t, scale: 1.1, duration: 220, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, alpha: 0, y: y - 40, delay: 900, duration: 400, onComplete: () => t.destroy() });
    const em = this.add.particles(0, 0, 'fx_shard', {
      x, y: y + 40, speed: { min: 150, max: 380 }, angle: { min: 180, max: 360 }, gravityY: 700,
      scale: { start: 0.6, end: 0.2 }, tint: [0xa0682e, 0xe0b85a], lifespan: 700, emitting: false,
    }).setDepth(7);
    em.explode(16);
    this.time.delayedCall(900, () => em.destroy());
    this.cameras.main.shake(220, 0.01);
    Sound.play('thud');
  }

  private inkBurst(x: number, y: number): void {
    const em = this.add.particles(0, 0, 'fx_smoke', {
      x, y, speed: { min: 120, max: 420 }, angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 }, alpha: { start: 0.95, end: 0 }, tint: [0x2a1048, 0x7a3ad8, 0x0b0b0e, 0xb060ff],
      lifespan: 750, gravityY: 300, emitting: false,
    }).setDepth(7);
    em.explode(32);
    this.time.delayedCall(1000, () => em.destroy());
  }

  private updateStage(dt: number): void {
    if (this.mood === 'fire' && this.fireG.alpha > 0.5) {
      this.fireG.alpha = 0.8 + 0.2 * Math.sin(this.t * 11) * Math.sin(this.t * 6.3);
    }
    // painted flames: frame cycling + breathing scale + flickering glow
    if (this.mood === 'fire' || this.fires[0]?.img.alpha > 0) {
      for (const f of this.fires) {
        const ph = f.img.getData('ph') as number;
        const sc = f.img.getData('s') as number;
        f.img.setTexture(`flame_${Math.floor(this.t * 12 + ph) % 4}`);
        f.img.setScale(sc * (0.92 + 0.1 * Math.sin(this.t * 9 + ph)), sc * (0.9 + 0.16 * Math.sin(this.t * 7 + ph * 2)));
        if (f.glow.alpha > 0.1) f.glow.setAlpha(0.45 + 0.15 * Math.sin(this.t * 13 + ph));
      }
    }
    if (this.candle.alpha > 0) {
      this.candle.setTexture(`flame_${Math.floor(this.t * 10) % 4}`);
      this.candle.setScale(0.2 + 0.02 * Math.sin(this.t * 11), 0.22 + 0.03 * Math.sin(this.t * 7));
      this.candleGlow.setScale(5 + 0.4 * Math.sin(this.t * 9) * Math.sin(this.t * 5.3));
    }
    if (this.hordeOn) {
      this.hordeT -= dt;
      if (this.hordeT <= 0) {
        this.spawnRunner();
        this.hordeT = Phaser.Math.FloatBetween(0.12, 0.24);
      }
    }
    this.frameT += dt;
    if (this.frameT > 0.14) {
      this.frameT = 0;
      this.frame ^= 1;
      for (const img of this.horde) img.setTexture(`${img.getData('k')}_${this.frame}`);
    }
    if (this.beast) {
      this.beastT += dt;
      // breathing
      this.beast.setScale(1.25 + Math.sin(this.beastT * 2.2) * 0.012, 1.25 + Math.sin(this.beastT * 2.2 + 0.6) * 0.02);
      if (this.beastEyes) {
        this.beastEyes.setPosition(this.beast.x, this.beast.y - this.beast.displayHeight * 0.5);
        if (this.beastEyes.alpha > 0.3) this.beastEyes.setAlpha(0.6 + 0.25 * Math.sin(this.beastT * 4));
      }
    }
    this.drawTentacles();
    this.houses.setVisible(this.bg.texture.key === 'bg_village_night');
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
    if (!Save.d.stats.endings.includes(o.finale)) Save.d.stats.endings.push(o.finale);
    if (!Save.d.storySeen.includes(this.def.id)) Save.d.storySeen.push(this.def.id);
    Save.write();
    Sound.play(o.finale === 'venganza' ? 'roar' : 'legend');
    this.input.removeAllListeners();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.uiCam.fadeOut(400, 0, 0, 0);
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
    this.uiCam.fadeOut(250, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.next.scene, this.next.data));
  }
}
