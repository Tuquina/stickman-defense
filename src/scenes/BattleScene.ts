import { COLORS, FIELD, GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { DEBUG } from '../core/debug';
import { clamp, fmt, fmtShort, pick, shuffle } from '../core/format';
import { Save } from '../core/save';
import { baseStats, weaponLvMult } from '../core/stats';
import {
  LEGENDS, MAX_PASSIVE, MAX_SKILL, MAX_SKILL_SLOTS, MAX_TURRETS, MILESTONES, PASSIVES, SKILLS,
  type LegendId, type PassiveId, type SkillId,
} from '../data/cards';
import { ABISMO_BOSSES, CHAPTERS, type ChapterDef, type ChapterId } from '../data/chapters';
import { ENEMIES, type EnemyDef } from '../data/enemies';
import { WEAPONS, type ProjKind, type WeaponDef, type WeaponId } from '../data/weapons';
import { drawStickman, POSES } from '../gfx/stickman';
import { ENEMY_TEX } from '../gfx/textures';
import { button, drawPanel, iconBox, stars } from '../ui/widgets';
import { ensureBackground } from '../gfx/backgrounds';

// ------------------------------------------------------------------ types
interface Enemy {
  def: EnemyDef;
  img: Phaser.GameObjects.Image;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  r: number;
  hitY: number;
  speed: number;
  dps: number;
  alive: boolean;
  boss: boolean;
  frameT: number;
  frame: number;
  flashT: number;
  frozenT: number;
  slowT: number;
  atWall: boolean;
  t: number; // behaviour timer
  t2: number;
  lift: number; // visual y offset (hops/flying)
  dashT: number;
  shieldT: number;
  phase: number;
  kb: number;
  tornadoTick: number;
  ice?: Phaser.GameObjects.Image;
}

interface Proj {
  img: Phaser.GameObjects.Image;
  active: boolean;
  kind: ProjKind | 'turret' | 'split';
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  dmg: number;
  pierce: number;
  bounce: number;
  aoe: number;
  life: number;
  homing: Enemy | null;
  hits: Set<Enemy>;
}

interface EProj {
  img: Phaser.GameObjects.Image;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  kind: 'arrow' | 'web' | 'orb';
  tx: number;
  ty: number;
}

interface Drop {
  img: Phaser.GameObjects.Image;
  kind: 'xp' | 'coin';
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  value: number;
  ground: number;
  flying: boolean;
}

interface DmgText { bt: Phaser.GameObjects.BitmapText; t: number; vy: number; active: boolean }

interface Fx { t: number; dur: number; step: (k: number, dt: number) => void; done?: () => void }

interface SkillSlot { id: SkillId; lv: number; cd: number }

type Card =
  | { type: 'weapon' }
  | { type: 'evo' }
  | { type: 'passive'; id: PassiveId }
  | { type: 'skill'; id: SkillId }
  | { type: 'turret' }
  | { type: 'legend'; id: LegendId }
  | { type: 'heal' }
  | { type: 'gold' };

interface Stats {
  dmg: number; rate: number; crit: number; critMult: number; combo: number; pierce: number;
  pellets: number; bounce: number; aoe: number; skillMult: number; cdMult: number;
  maxHp: number; regen: number; xpMult: number; goldMult: number; furyMult: number; multishot: number;
}

const HAND = { x: FIELD.heroX + 34, y: FIELD.heroY - 78 };
const SKILL_POS = [{ x: 105, y: 1040 }, { x: 245, y: 1040 }, { x: 385, y: 1040 }];
const FURY_POS = { x: 580, y: 1040 };
const GOLD_POS = { x: 330, y: 1190 };

export class BattleScene extends Phaser.Scene {
  // config
  private ch!: ChapterDef;
  private weaponId!: WeaponId;
  private wdef!: WeaponDef;

  // run state
  private stars = 1;
  private evolved = false;
  private passives: Record<PassiveId, number> = {} as Record<PassiveId, number>;
  private skills: SkillSlot[] = [];
  private legends = new Set<LegendId>();
  private turrets = 0;
  private level = 1;
  private xp = 0;
  private xpNeed = 7;
  private kills = 0;
  private bossKills = 0;
  private gold = 0;
  private rankXp = 0;
  private wave = 0;
  private waveT = 0;
  private spawnQ: { t: number; id: string; y?: number }[] = [];
  private boss: Enemy | null = null;
  private bossWave = false;
  private bossId: string | null = null;
  private minionT = 0;
  private hp = 200;
  private fury = 0;
  private furyT = 0;
  private heroSlowT = 0;
  private attackT = 0;
  private turretT = 0;
  private recoil = 0;
  private aimAngle = 1.5;
  private marked: Enemy | null = null;
  private simTime = 0;
  private st!: Stats;
  private pendingLevels = 0;
  private claimedMilestones = new Set<number>();
  private combo = 0;
  private comboT = 0;
  private bestCombo = 0;
  private rerolls = 1;
  private hitstop = 0;
  private slowmo = 0;
  private heartT = 0;
  private splats: Phaser.GameObjects.Image[] = [];
  private splatIdx = 0;
  private comboText!: Phaser.GameObjects.Text;
  private dangerImg!: Phaser.GameObjects.Image;
  private tutor: { box: Phaser.GameObjects.Container; label: Phaser.GameObjects.Text; dx: number; kind: 'mark' | 'skill' | 'fury' } | null = null;
  private lowFx = false;
  private pendingStart = false;
  private trailsG!: Phaser.GameObjects.Graphics;
  private muzzles: Phaser.GameObjects.Image[] = [];
  private muzzleIdx = 0;

  // flow
  private modal = false;
  private paused = false;
  private ended = false;
  private speed = 1;

  // objects
  private enemies: Enemy[] = [];
  private projs: Proj[] = [];
  private eprojs: EProj[] = [];
  private drops: Drop[] = [];
  private dmgTexts: DmgText[] = [];
  private fxs: Fx[] = [];
  private later: { t: number; fn: () => void }[] = [];
  private heroG!: Phaser.GameObjects.Graphics;
  private overlayG!: Phaser.GameObjects.Graphics; // hp bars + shadows
  private markImg!: Phaser.GameObjects.Image;
  private stakes: Phaser.GameObjects.Image[] = [];
  private turretImgs: Phaser.GameObjects.Image[] = [];
  private emitters: Record<string, Phaser.GameObjects.Particles.ParticleEmitter> = {};
  private furyVignette!: Phaser.GameObjects.Rectangle;

  // hud
  private hud!: {
    g: Phaser.GameObjects.Graphics;
    hpText: Phaser.GameObjects.Text;
    lvText: Phaser.GameObjects.Text;
    waveText: Phaser.GameObjects.Text;
    killText: Phaser.GameObjects.Text;
    goldText: Phaser.GameObjects.Text;
    bossName: Phaser.GameObjects.Text;
    skillG: Phaser.GameObjects.Graphics;
    skillIcons: (Phaser.GameObjects.Container | null)[];
    skillLv: Phaser.GameObjects.Text[];
    furyText: Phaser.GameObjects.Text;
    speedBtn: ReturnType<typeof button>;
    hint: Phaser.GameObjects.Text;
    weaponStars: Phaser.GameObjects.Graphics | null;
    portrait: Phaser.GameObjects.Graphics;
  };
  private modalLayer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super('Battle');
  }

  init(data: { chapter: ChapterId; weapon: WeaponId }): void {
    this.ch = CHAPTERS[data.chapter] ?? CHAPTERS.c1;
    this.weaponId = data.weapon ?? 'arco';
    this.wdef = WEAPONS[this.weaponId];
    // reset run state (scene instances are reused)
    this.stars = 1;
    this.evolved = false;
    this.passives = Object.fromEntries(Object.keys(PASSIVES).map((k) => [k, 0])) as Record<PassiveId, number>;
    this.skills = [];
    this.legends = new Set();
    this.turrets = 0;
    this.level = 1;
    this.xp = 0;
    this.xpNeed = this.xpFor(1);
    this.kills = 0;
    this.bossKills = 0;
    this.gold = 0;
    this.rankXp = 0;
    this.wave = 0;
    this.waveT = 0;
    this.spawnQ = [];
    this.boss = null;
    this.bossWave = false;
    this.bossId = null;
    this.minionT = 0;
    this.fury = 0;
    this.furyT = 0;
    this.heroSlowT = 0;
    this.attackT = 0;
    this.turretT = 0;
    this.marked = null;
    this.simTime = 0;
    this.pendingLevels = 0;
    this.claimedMilestones = new Set();
    this.combo = 0;
    this.comboT = 0;
    this.bestCombo = 0;
    this.rerolls = 1;
    this.hitstop = 0;
    this.slowmo = 0;
    this.heartT = 0;
    this.splats = [];
    this.splatIdx = 0;
    this.tutor = null;
    this.lowFx = Save.d.settings.lowFx;
    this.pendingStart = false;
    this.muzzles = [];
    this.muzzleIdx = 0;
    this.modal = false;
    this.paused = false;
    this.ended = false;
    this.speed = DEBUG.speed > 1 ? DEBUG.speed : Save.d.settings.speed2 ? 2 : 1;
    this.enemies = [];
    this.projs = [];
    this.eprojs = [];
    this.drops = [];
    this.dmgTexts = [];
    this.fxs = [];
    this.later = [];
    this.stakes = [];
    this.turretImgs = [];
    this.modalLayer = null;
  }

  // ================================================================= setup
  create(): void {
    this.cameras.main.fadeIn(250, 0, 0, 0);
    Sound.music(this.ch.music);
    this.recalc(true);
    this.hp = this.st.maxHp;

    ensureBackground(this, this.ch.bg);
    this.add.image(GAME_W / 2, GAME_H / 2, this.ch.bg).setDepth(-10);
    this.overlayG = this.add.graphics().setDepth(1);
    this.add.image(FIELD.heroX + 6, FIELD.heroY + 26, 'rock').setDepth(FIELD.heroY - 2);
    this.heroG = this.add.graphics().setDepth(FIELD.heroY);
    for (let i = 0; i < 8; i++) {
      const y = FIELD.top + 18 + i * 62;
      const x = FIELD.barricadeX - i * 4 + (i % 2) * 8;
      this.stakes.push(this.add.image(x, y, 'stake').setDepth(y + 20));
    }
    this.markImg = this.add.image(0, 0, 'mark').setDepth(2500).setVisible(false).setScale(0.7);
    this.furyVignette = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x2ad4c4, 0).setDepth(2900).setBlendMode(Phaser.BlendModes.ADD);

    const mkEm = (key: string, tint: number, extra: Partial<Phaser.Types.GameObjects.Particles.ParticleEmitterConfig> = {}) =>
      this.add.particles(0, 0, 'dot', {
        speed: { min: 80, max: 260 }, lifespan: { min: 250, max: 520 }, scale: { start: 0.9, end: 0 },
        gravityY: 300, tint, emitting: false, ...extra,
      }).setDepth(2600);
    this.emitters.ink = mkEm('ink', 0x15151a);
    this.emitters.red = mkEm('red', 0xd8323a);
    this.emitters.purple = mkEm('purple', 0xa040ff);
    this.emitters.gold = mkEm('gold', 0xffd34d, { gravityY: 0, speed: { min: 60, max: 200 } });
    this.emitters.cyan = mkEm('cyan', 0x6fe3ff, { gravityY: 0 });
    this.emitters.white = mkEm('white', 0xffffff, { gravityY: 0, speed: { min: 100, max: 400 }, lifespan: 300 });
    this.emitters.green = mkEm('green', 0x6aff8a, { gravityY: -100 });
    // polished VFX emitters (additive glow sprites)
    const ADD = Phaser.BlendModes.ADD;
    this.emitters.spark = this.add.particles(0, 0, 'fx_spark', {
      speed: { min: 120, max: 340 }, lifespan: { min: 140, max: 300 }, scale: { start: 0.55, end: 0 }, rotate: { min: 0, max: 360 },
      blendMode: ADD, emitting: false,
    }).setDepth(2620);
    this.emitters.smoke = this.add.particles(0, 0, 'fx_smoke', {
      speed: { min: 20, max: 90 }, lifespan: { min: 500, max: 900 }, scale: { start: 0.5, end: 1.6 }, alpha: { start: 0.55, end: 0 },
      gravityY: -40, tint: 0x3a3442, emitting: false,
    }).setDepth(2590);
    this.emitters.shard = this.add.particles(0, 0, 'fx_shard', {
      speed: { min: 160, max: 380 }, lifespan: { min: 250, max: 500 }, scale: { start: 1, end: 0.3 }, rotate: { min: 0, max: 360 },
      gravityY: 700, emitting: false,
    }).setDepth(2610);
    this.emitters.flame = this.add.particles(0, 0, 'fx_flame', {
      speedY: { min: -160, max: -90 }, speedX: { min: -25, max: 25 }, lifespan: { min: 260, max: 460 }, scale: { start: 0.9, end: 0.1 },
      alpha: { start: 0.8, end: 0 }, tint: 0x2ad4c4, blendMode: ADD, frequency: 35, emitting: false,
      x: { min: -26, max: 26 }, y: { min: -10, max: 30 },
    }).setDepth(FIELD.heroY - 1);
    this.emitters.flame.setPosition(FIELD.heroX, FIELD.heroY - 70);
    this.trailsG = this.add.graphics().setDepth(1995).setBlendMode(ADD);

    this.buildHud();
    this.ambient();
    this.comboText = this.add.text(GAME_W - 24, 330, '', txt(40, '#ffd34d', 8)).setOrigin(1, 0.5).setDepth(4100).setVisible(false);
    this.add.image(GAME_W / 2, GAME_H / 2, 'vignette').setDisplaySize(GAME_W, GAME_H).setAlpha(0.6).setDepth(1990);
    this.dangerImg = this.add.image(GAME_W / 2, GAME_H / 2, 'vignette').setDisplaySize(GAME_W, GAME_H).setTint(0xff1a1a).setAlpha(0).setDepth(2950);

    // input: mark enemies / collect coins
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      Sound.unlock();
      if (this.modal || this.paused || this.ended) return;
      if (p.y < FIELD.top - 120 || p.y > FIELD.bottom + 40) return;
      this.tapField(p.x, p.y);
    });
    this.game.events.on('hidden', this.onHidden, this);
    this.events.once('shutdown', () => this.game.events.off('hidden', this.onHidden, this));

    this.time.delayedCall(400, () => {
      // every run starts with a free skill pick: decisions from second one; the first wave starts after it
      this.pendingStart = true;
      this.showCards(this.starterCards(), 'ELIGE TU HABILIDAD', false, 'Tu primera habilidad de la partida');
    });
  }

  private onHidden(): void {
    if (!this.ended && !this.modal && !this.paused && !DEBUG.bot) this.openPause();
  }

  private xpFor(level: number): number {
    return Math.round(6 + level * 2.6 + level * level * 0.03);
  }

  private recalc(first = false): void {
    const b = baseStats();
    const p = this.passives;
    const w = this.wdef;
    const L = this.legends;
    const oldMax = this.st?.maxHp ?? 0;
    this.st = {
      dmg: b.atk * w.dmgMult * weaponLvMult(Save.d, this.weaponId) * (1 + 0.25 * (this.stars - 1)) * (1 + 0.15 * p.filo),
      rate: w.rate * b.spd * (1 + 0.12 * p.prisa) * (this.evolved && w.id === 'pistola' ? 2 : 1),
      crit: b.crit + 0.06 * p.critico + (L.has('tormenta') ? 0.1 : 0),
      critMult: L.has('tormenta') ? 3 : 2,
      combo: w.combo + 0.06 * p.combo + (w.id === 'pistola' ? 0.05 * (this.stars - 1) : 0),
      pierce: w.pierce + p.perforacion + (w.id === 'arco' ? (this.stars >= 3 ? 1 : 0) + (this.stars >= 5 ? 1 : 0) : 0) + (w.id === 'lanza' ? (this.stars >= 3 ? 1 : 0) + (this.stars >= 5 ? 1 : 0) : 0),
      pellets: (w.pellets ?? 0) + (w.id === 'escopeta' ? this.stars - 1 : 0),
      bounce: this.evolved && w.id === 'shuriken' ? 6 : (w.bounce ?? 0) + (w.id === 'shuriken' ? this.stars - 1 : 0),
      aoe: (w.aoe ?? 0) + (w.id === 'baston' ? 12 * (this.stars - 1) : 0),
      skillMult: 1 + (w.skillDmg ?? 0),
      cdMult: 1 - 0.08 * p.mente,
      maxHp: b.hp * 2 * (1 + 0.2 * p.estacas),
      regen: 0.004 * p.savia,
      xpMult: b.xp * (1 + 0.15 * p.sabiduria),
      goldMult: b.gold * (1 + 0.2 * p.bolsillos) * this.ch.goldMult,
      furyMult: b.fury * (1 + 0.2 * p.furia) * (L.has('furiaEterna') ? 1.5 : 1),
      multishot: L.has('dobleTrazo') ? 1 : 0,
    };
    if (!first && this.st.maxHp > oldMax) this.hp += this.st.maxHp - oldMax;
  }

  // ================================================================= HUD
  private buildHud(): void {
    const D = 5000;
    const g = this.add.graphics().setDepth(D);
    // top panel
    g.fillStyle(0x05070a, 0.78);
    g.fillRoundedRect(8, 8, GAME_W - 16, 186, 20);
    // bottom panel
    g.fillStyle(0x05070a, 0.92);
    g.fillRect(0, 930, GAME_W, GAME_H - 930);
    g.fillStyle(0x2ad4c4, 0.5);
    g.fillRect(0, 930, GAME_W, 4);

    const portrait = this.add.graphics({ x: 70, y: 78 }).setDepth(D + 2);
    const pm = this.make.graphics({}, false);
    pm.fillCircle(70, 78, 50);
    portrait.setMask(pm.createGeometryMask());

    const hpText = this.add.text(330, 42, '', txt(22, '#ffffff', 5)).setOrigin(0.5).setDepth(D + 2);
    const lvText = this.add.text(330, 88, '', txt(22, '#ffffff', 5)).setOrigin(0.5).setDepth(D + 2);
    this.add.text(588, 32, 'OLEADA', txt(18, '#9aa8b8', 4)).setOrigin(0.5).setDepth(D + 2);
    const waveText = this.add.text(588, 66, '', txt(34, '#ffffff', 6)).setOrigin(0.5).setDepth(D + 2);
    const pauseBtn = button(this, 672, 52, 64, 64, '', () => this.openPause(), { color: 0x3a4a5e, radius: 14 }).setDepth(D + 3);
    pauseBtn.add(this.add.image(0, 0, 'pause').setScale(0.7));
    // speed toggle lives in its own slot at the right of the milestone bar (never overlaps it)
    const speedBtn = button(this, 652, 150, 104, 50, `x${this.speed}`, () => this.toggleSpeed(), { color: this.speed > 1 ? 0x2a9d8f : 0x3a4a5e, size: 26, radius: 12 }).setDepth(D + 3);
    const ff = this.add.graphics();
    ff.fillStyle(0xffffff, 1);
    ff.fillTriangle(-40, -10, -40, 10, -28, 0);
    ff.fillTriangle(-28, -10, -28, 10, -16, 0);
    speedBtn.add(ff);
    speedBtn.label.setX(14);

    // milestone bar labels
    for (const m of MILESTONES) {
      const x = this.milestoneX(m);
      this.add.text(x, 178, `Lv.${m}`, txt(16, '#ffd34d', 4)).setOrigin(0.5).setDepth(D + 2);
    }

    const bossName = this.add.text(GAME_W / 2, 224, '', txt(26, '#ffffff', 6)).setOrigin(0.5).setDepth(D + 2).setVisible(false);

    // skills
    const skillG = this.add.graphics().setDepth(D + 1);
    const skillIcons: (Phaser.GameObjects.Container | null)[] = [null, null, null];
    const skillLv: Phaser.GameObjects.Text[] = [];
    SKILL_POS.forEach((p, i) => {
      skillLv.push(this.add.text(p.x + 40, p.y + 42, '', txt(20, '#ffd34d', 5)).setOrigin(0.5).setDepth(D + 4));
      const z = this.add.zone(p.x, p.y, 124, 124).setInteractive().setDepth(D + 5);
      z.on('pointerdown', () => {
        Sound.unlock();
        this.useSkill(i);
      });
    });
    const fz = this.add.zone(FURY_POS.x, FURY_POS.y, 170, 170).setInteractive().setDepth(D + 5);
    fz.on('pointerdown', () => {
      Sound.unlock();
      this.activateFury();
    });
    const furyText = this.add.text(FURY_POS.x, FURY_POS.y, 'FURIA', txt(30, '#ffffff', 7)).setOrigin(0.5).setDepth(D + 4);

    // bottom info
    this.add.image(GOLD_POS.x, GOLD_POS.y, 'coin').setDepth(D + 2).setScale(1.1);
    const goldText = this.add.text(GOLD_POS.x + 22, GOLD_POS.y, '0', txt(30, '#ffd34d', 6)).setOrigin(0, 0.5).setDepth(D + 2);
    const killText = this.add.text(520, GOLD_POS.y, '', txt(26, '#ffffff', 5)).setOrigin(0, 0.5).setDepth(D + 2);
    iconBox(this, 60, GOLD_POS.y, 64, `ic_${this.weaponId}`, '', 0xf6a63a).setDepth(D + 2);
    const hint = this.add.text(GAME_W / 2, 1252, 'Toca un enemigo para marcarlo · Toca las monedas: ×2', txt(19, '#9aa8b8', 4)).setOrigin(0.5).setDepth(D + 2);

    this.hud = {
      g: this.add.graphics().setDepth(D + 1), hpText, lvText, waveText, killText, goldText, bossName,
      skillG, skillIcons, skillLv, furyText, speedBtn, hint, weaponStars: null, portrait,
    };
    this.refreshWeaponStars();
  }

  private refreshWeaponStars(): void {
    this.hud.weaponStars?.destroy();
    this.hud.weaponStars = stars(this, 110, GOLD_POS.y, this.stars, 5, 22).setDepth(5003);
  }

  /** Gold grows with the wave: up to ×3 at wave 20 in chapters; El Abismo keeps growing until wave 60. */
  private goldWave(): number {
    const cap = this.ch.waves === Infinity ? 60 : 20;
    return 1 + Math.min(this.wave, cap) * 0.1;
  }

  private lootGold(): number {
    return Math.round(25 * this.st.goldMult * (0.5 + this.goldWave() * 0.5));
  }

  private milestoneX(level: number): number {
    return 40 + (level / 40) * 516;
  }

  private toggleSpeed(): void {
    this.speed = this.speed === 1 ? 2 : 1;
    Save.d.settings.speed2 = this.speed === 2;
    Save.write();
    this.hud.speedBtn.label.setText(`x${this.speed}`);
    this.hud.speedBtn.redraw(this.speed > 1 ? 0x2a9d8f : 0x3a4a5e);
    this.floatHud(this.speed > 1 ? 'VELOCIDAD ×2' : 'VELOCIDAD ×1', GAME_W / 2, 250, '#bfe9ff');
  }

  private drawHud(): void {
    const g = this.hud.g;
    g.clear();
    // portrait frame
    g.fillStyle(0x1c2a44, 1).fillCircle(70, 78, 54);
    g.lineStyle(5, COLORS.hero, 1).strokeCircle(70, 78, 54);
    // hp bar
    const hpk = clamp(this.hp / this.st.maxHp, 0, 1);
    g.fillStyle(0x0a0a0a, 1).fillRoundedRect(134, 26, 392, 34, 10);
    g.fillStyle(0x3a0a10, 1).fillRoundedRect(138, 30, 384, 26, 8);
    g.fillStyle(hpk < 0.35 ? 0xff2a2a : 0xd8323a, 1).fillRoundedRect(138, 30, Math.max(8, 384 * hpk), 26, 8);
    g.fillStyle(0xffffff, 0.2).fillRoundedRect(140, 32, Math.max(6, 380 * hpk), 9, 5);
    // xp bar
    const xpk = clamp(this.xp / this.xpNeed, 0, 1);
    g.fillStyle(0x0a0a0a, 1).fillRoundedRect(134, 72, 392, 32, 10);
    g.fillStyle(0x0b2a30, 1).fillRoundedRect(138, 76, 384, 24, 8);
    g.fillStyle(COLORS.xp, 1).fillRoundedRect(138, 76, Math.max(8, 384 * xpk), 24, 8);
    // milestone bar
    g.fillStyle(0x0a0a0a, 1).fillRoundedRect(36, 134, 528, 18, 9);
    const mk = clamp(this.level / 40, 0, 1);
    g.fillStyle(0xffc93c, 1).fillRoundedRect(39, 137, Math.max(8, 522 * mk), 12, 6);
    for (const m of MILESTONES) {
      const x = this.milestoneX(m);
      const got = this.claimedMilestones.has(m);
      g.fillStyle(0x0a0a0a, 1).fillCircle(x, 143, 14);
      g.fillStyle(got ? 0xb84ae0 : this.level >= m ? 0xffc93c : 0x4a4e56, 1).fillCircle(x, 143, 11);
    }
    // boss bar
    if (this.boss && this.boss.alive) {
      const k = clamp(this.boss.hp / this.boss.maxHp, 0, 1);
      g.fillStyle(0x0a0a0a, 0.85).fillRoundedRect(60, 244, 600, 30, 10);
      g.fillStyle(0x5a1a7a, 1).fillRoundedRect(64, 248, 592, 22, 8);
      g.fillStyle(0xd050ff, 1).fillRoundedRect(64, 248, Math.max(8, 592 * k), 22, 8);
    }
    this.hud.bossName.setVisible(!!(this.boss && this.boss.alive));

    // skills
    const sg = this.hud.skillG;
    sg.clear();
    SKILL_POS.forEach((p, i) => {
      const s = this.skills[i];
      sg.fillStyle(0x0a0a0a, 1).fillCircle(p.x, p.y, 62);
      sg.fillStyle(s ? 0x1c2a44 : 0x14181e, 1).fillCircle(p.x, p.y, 57);
      if (s) {
        const max = this.skillCd(s);
        if (s.cd > 0) {
          const k = s.cd / max;
          sg.fillStyle(0x000000, 0.65);
          sg.slice(p.x, p.y, 57, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k, false);
          sg.fillPath();
        } else {
          sg.lineStyle(5, 0xffd34d, 0.6 + Math.sin(this.simTime * 8) * 0.4).strokeCircle(p.x, p.y, 60);
        }
      } else {
        sg.lineStyle(3, 0x2a3240, 1).strokeCircle(p.x, p.y, 40);
      }
    });
    // fury
    const fk = this.furyT > 0 ? this.furyT / this.furyDur() : this.fury / 100;
    sg.fillStyle(0x0a0a0a, 1).fillCircle(FURY_POS.x, FURY_POS.y, 82);
    sg.fillStyle(0x2a0a14, 1).fillCircle(FURY_POS.x, FURY_POS.y, 76);
    sg.fillStyle(this.furyT > 0 ? COLORS.hero : 0xff3d6a, 1);
    sg.slice(FURY_POS.x, FURY_POS.y, 76, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fk, false);
    sg.fillPath();
    sg.fillStyle(0x14080c, 1).fillCircle(FURY_POS.x, FURY_POS.y, 58);
    if (this.fury >= 100 && this.furyT <= 0) {
      sg.lineStyle(6, 0xffd34d, 0.5 + Math.sin(this.simTime * 10) * 0.5).strokeCircle(FURY_POS.x, FURY_POS.y, 84);
    }
    this.hud.furyText.setText(this.furyT > 0 ? '¡TRAZO!' : this.fury >= 100 ? '¡FURIA!' : `${Math.floor(this.fury)}%`);
    this.hud.furyText.setColor(this.fury >= 100 || this.furyT > 0 ? '#ffd34d' : '#ffffff');

    this.hud.hpText.setText(`BARRICADA ${fmt(this.hp)}/${fmt(this.st.maxHp)}`);
    this.hud.lvText.setText(`Lv.${this.level}`);
    this.hud.waveText.setText(this.ch.waves === Infinity ? `${this.wave}` : `${this.wave}/${this.ch.waves}`);
    this.hud.goldText.setText(fmt(this.gold));
    this.hud.killText.setText(`${fmt(this.kills)} bajas`);

    // portrait
    const pg = this.hud.portrait;
    pg.clear();
    drawStickman(pg, -4, 168, 1.6, POSES.idle(this.simTime), { tier: Save.d.armorEquipped, eyes: this.hp / this.st.maxHp < 0.35 ? 'sad' : 'determined' }, 1, this.simTime);
  }

  private refreshSkillIcons(): void {
    SKILL_POS.forEach((p, i) => {
      const s = this.skills[i];
      if (s && !this.hud.skillIcons[i]) {
        this.hud.skillIcons[i] = iconBox(this, p.x, p.y, 84, `ic_${s.id}`, '', SKILLS[s.id].color).setDepth(5002);
      }
      this.hud.skillLv[i].setText(s ? `${s.lv}` : '');
    });
  }

  // ================================================================= waves
  private startWave(n: number): void {
    this.wave = n;
    this.waveT = 0;
    const endless = this.ch.waves === Infinity;
    const count = Math.round(Math.min(90, 8 + 2.1 * n));
    const pool = this.ch.pool.filter((p) => p.from <= n);
    const total = pool.reduce((a, p) => a + p.weight, 0);
    const choose = () => {
      let r = Math.random() * total;
      for (const p of pool) {
        r -= p.weight;
        if (r <= 0) return p.id;
      }
      return pool[0].id;
    };
    let t = 0.4;
    for (let i = 0; i < count; ) {
      const id = choose();
      // swarms: light enemies come in clusters
      const cluster = ENEMIES[id].hp < 25 && Math.random() < 0.45 ? 2 + Math.floor(Math.random() * 3) : 1;
      const y = Phaser.Math.Between(FIELD.top + 30, FIELD.bottom - 20);
      for (let k = 0; k < cluster && i < count; k++, i++) {
        this.spawnQ.push({ t: t + k * 0.12, id, y: clamp(y + Phaser.Math.Between(-50, 50), FIELD.top + 20, FIELD.bottom - 10) });
      }
      t += (16 / count) * cluster * (0.6 + Math.random() * 0.8);
    }

    const isBoss = endless ? n % 10 === 0 : n === this.ch.waves;
    const isMini = endless ? n % 10 === 5 && n > 10 : n === 10;
    if (isMini) {
      const id = endless ? pick(['aranaMadre', 'gargola', 'guardian']) : this.ch.mini;
      this.spawnQ.push({ t: 1.2, id, y: (FIELD.top + FIELD.bottom) / 2 });
    }
    this.bossWave = isBoss;
    if (isBoss) {
      const id = endless ? ABISMO_BOSSES[Math.floor(n / 10 - 1) % ABISMO_BOSSES.length] : this.ch.boss;
      this.bossId = id;
      this.spawnQ.push({ t: 1.5, id, y: (FIELD.top + FIELD.bottom) / 2 + 20 });
      Sound.music(id === 'dante' ? 'final' : 'boss');
    }
    this.spawnQ.sort((a, b) => a.t - b.t);
    this.banner(isBoss ? '¡JEFE!' : isMini ? `OLEADA ${n} · MINI-JEFE` : `OLEADA ${n}`, isBoss ? '#ff4a6a' : '#ffffff');
    Sound.play('wave');
  }

  private waveScale(): { hp: number; dmg: number; boss: number } {
    const w = this.wave;
    const endlessK = this.ch.waves === Infinity ? Math.pow(1.35, Math.floor(w / 5)) : 1;
    return {
      hp: this.ch.hpMult * (1 + 0.14 * (w - 1)) * endlessK,
      dmg: Math.sqrt(this.ch.hpMult) * (1 + 0.05 * (w - 1)) * endlessK,
      boss: this.ch.hpMult * (1 + 0.05 * (w - 1)) * endlessK,
    };
  }

  private spawn(id: string, x: number, y: number, hpMult = 1): Enemy {
    const def = ENEMIES[id];
    const sc = this.waveScale();
    const boss = !!def.rank;
    const hp = def.hp * (boss ? sc.boss : sc.hp) * hpMult;
    const img = this.add.image(x, y, `e_${id}_0`).setOrigin(0.5, 1);
    const tex = ENEMY_TEX[id];
    const e: Enemy = {
      def, img, x, y, hp, maxHp: hp, r: def.radius, hitY: Math.min((tex?.h ?? 60) * 0.45, def.radius * 1.5 + 24),
      speed: def.speed * (0.9 + Math.random() * 0.2), dps: def.dps * sc.dmg, alive: true, boss,
      frameT: Math.random(), frame: 0, flashT: 0, frozenT: 0, slowT: 0, atWall: false,
      t: Math.random() * 2, t2: 0, lift: 0, dashT: 0, shieldT: 0, phase: 0, kb: 0, tornadoTick: 0,
    };
    this.enemies.push(e);
    if (this.bossWave && id === this.bossId && !this.boss) {
      this.boss = e;
      this.hud.bossName.setText(`${def.name.toUpperCase()}`);
      this.cameras.main.shake(500, 0.01);
      Sound.play('roar');
      Sound.vibrate([60, 40, 120]);
      this.bossIntro(def);
    } else if (def.rank === 'mini' || (def.rank === 'boss' && !this.bossWave)) {
      this.bossQuote(id);
      Sound.play('roar');
      this.cameras.main.shake(300, 0.006);
    }
    return e;
  }

  private bossQuote(id: string): void {
    const q: Record<string, string> = {
      aranaMadre: '¡Más arañitas!',
      gargola: '¡KRAAAH!',
      guardian: 'La Corona no se toca.',
      hidra: '¡Glub! ¡Glub! ¡GLUB!',
      golemLibros: 'SILENCIO EN LA BIBLIOTECA.',
      ecoDante: 'Otra vez tú… Él te espera arriba.',
    };
    if (q[id]) this.banner(q[id], '#d8b0ff', 300, 30);
  }

  // ================================================================= main loop
  update(_time: number, delta: number): void {
    if (this.paused || this.modal) {
      this.drawHud();
      this.updateDmgTexts(delta / 1000);
      if (DEBUG.bot && this.modal) this.bot();
      return;
    }
    const real = Math.min(delta, 50) / 1000;
    if (this.hitstop > 0) {
      // micro-freeze on heavy hits: sells the impact
      this.hitstop -= real;
      this.render();
      return;
    }
    if (this.slowmo > 0) this.slowmo -= real;
    let dt = real * this.speed * (this.slowmo > 0 ? 0.25 : 1);
    // bot runs: fixed number of sim steps per frame regardless of frame rate (fast balancing)
    if (DEBUG.bot && DEBUG.speed > 1) dt = DEBUG.speed / 60;
    // fixed sub-steps keep collisions stable at high speed
    while (dt > 0) {
      const step = Math.min(dt, 1 / 60);
      this.sim(step);
      dt -= step;
      if (this.modal || this.ended) break;
    }
    this.render();
    if (DEBUG.bot) this.bot();
  }

  private sim(dt: number): void {
    if (this.ended) {
      this.simTime += dt;
      return;
    }
    this.simTime += dt;

    // scheduled callbacks
    for (let i = this.later.length - 1; i >= 0; i--) {
      this.later[i].t -= dt;
      if (this.later[i].t <= 0) {
        const fn = this.later[i].fn;
        this.later.splice(i, 1);
        fn();
      }
    }

    // waves
    this.waveT += dt;
    while (this.spawnQ.length && this.spawnQ[0].t <= this.waveT) {
      const s = this.spawnQ.shift()!;
      this.spawn(s.id, FIELD.spawnX + Math.random() * 40, s.y ?? Phaser.Math.Between(FIELD.top + 20, FIELD.bottom - 10));
    }
    if (this.bossWave) {
      if (this.boss && this.boss.alive) {
        this.minionT += dt;
        if (this.minionT > 2.4) {
          this.minionT = 0;
          const pool = this.ch.pool.filter((p) => p.from <= Math.min(this.wave, 8));
          this.spawn(pick(pool).id, FIELD.spawnX, Phaser.Math.Between(FIELD.top + 20, FIELD.bottom - 10));
        }
      }
    } else if (this.waveT >= 21 && this.spawnQ.length === 0) {
      this.waveCleared();
      if (this.wave < this.ch.waves) this.startWave(this.wave + 1);
    }

    // fury & timers
    if (this.furyT > 0) {
      this.furyT -= dt;
      if (this.furyT <= 0) {
        this.furyT = 0;
        this.emitters.flame.stop();
      }
    }
    if (this.heroSlowT > 0) this.heroSlowT -= dt;
    if (this.comboT > 0) {
      this.comboT -= dt;
      if (this.comboT <= 0) {
        this.combo = 0;
        this.tweens.add({ targets: this.comboText, alpha: 0, duration: 250 });
      }
    }
    if (this.st.regen > 0) this.hp = Math.min(this.st.maxHp, this.hp + this.st.maxHp * this.st.regen * dt);
    for (const s of this.skills) if (s.cd > 0) s.cd = Math.max(0, s.cd - dt);

    // hero attack
    const furyK = this.furyT > 0 ? 2 : 1;
    const slowK = this.heroSlowT > 0 ? 0.6 : 1;
    this.attackT += dt * this.st.rate * furyK * slowK;
    if (this.attackT >= 1) {
      const target = this.getTarget();
      if (target) {
        this.attackT = 0;
        this.fire(target);
        if (Math.random() < this.st.combo) this.later.push({ t: 0.09, fn: () => { const t2 = this.getTarget(); if (t2) this.fire(t2); } });
      } else {
        this.attackT = 1;
      }
    }

    // turrets
    if (this.turrets > 0) {
      this.turretT += dt * 1.25;
      if (this.turretT >= 1) {
        this.turretT = 0;
        this.turretImgs.forEach((ti) => {
          const t = this.nearestEnemy(ti.x, ti.y, 900);
          if (t) this.shoot('turret', ti.x + 16, ti.y - 30, t, this.st.dmg * 0.4, 0);
        });
      }
    }

    this.updateEnemies(dt);
    this.updateProjs(dt);
    this.updateEProjs(dt);
    this.updateDrops(dt);
    for (let i = this.fxs.length - 1; i >= 0; i--) {
      const f = this.fxs[i];
      f.t += dt;
      const k = Math.min(1, f.t / f.dur);
      f.step(k, dt);
      if (k >= 1) {
        this.fxs.splice(i, 1);
        f.done?.();
      }
    }
    this.recoil = Math.max(0, this.recoil - dt * 6);

    // cleanup dead enemies
    if (this.enemies.length > 0 && this.simTime % 1 < dt) this.enemies = this.enemies.filter((e) => e.alive);

    if (this.hp <= 0 && !this.ended) this.endRun(false);
  }

  // ================================================================= targeting & firing
  private onField(e: Enemy): boolean {
    return e.alive && e.x < GAME_W - 10;
  }

  private getTarget(): Enemy | null {
    if (this.marked && this.onField(this.marked)) return this.marked;
    let best: Enemy | null = null;
    for (const e of this.enemies) {
      if (!this.onField(e)) continue;
      if (!best || e.x < best.x) best = e;
    }
    return best;
  }

  private nearestEnemy(x: number, y: number, maxD: number, exclude?: Set<Enemy>): Enemy | null {
    let best: Enemy | null = null;
    let bd = maxD * maxD;
    for (const e of this.enemies) {
      if (!this.onField(e) || exclude?.has(e)) continue;
      const dx = e.x - x;
      const dy = e.y - e.hitY - y;
      const d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  }

  private fire(target: Enemy): void {
    const w = this.wdef;
    const dmg = this.st.dmg;
    const tx = target.x;
    const ty = target.y - target.hitY;
    const base = Math.atan2(ty - HAND.y, tx - HAND.x);
    this.aimAngle = Math.atan2(tx - HAND.x, ty - HAND.y);
    this.recoil = 1;
    this.muzzle(base, w.kind);
    const shots = 1 + this.st.multishot;
    for (let s = 0; s < shots; s++) {
      const off = shots > 1 ? (s - (shots - 1) / 2) * 0.14 : 0;
      switch (w.kind) {
        case 'arrow':
        case 'bullet':
        case 'lance':
          this.shootAngle(w.kind, HAND.x, HAND.y, base + off, dmg, this.st.pierce);
          break;
        case 'orb': {
          const t = s === 0 ? target : this.nearestEnemy(tx, ty, 400, new Set([target])) ?? target;
          this.shoot('orb', HAND.x, HAND.y - 20, t, dmg, 0);
          break;
        }
        case 'pellet': {
          const n = this.st.pellets;
          for (let i = 0; i < n; i++) this.shootAngle('pellet', HAND.x, HAND.y, base + off + (i - (n - 1) / 2) * 0.09, dmg, this.st.pierce);
          break;
        }
        case 'star':
          this.shootAngle('star', HAND.x, HAND.y, base + off, dmg, 0);
          break;
      }
    }
    const sfx: Record<ProjKind, Parameters<typeof Sound.play>[0]> = { arrow: 'arrow', bullet: 'bullet', orb: 'orb', pellet: 'pellet', star: 'star', lance: 'whoosh' };
    Sound.play(sfx[w.kind], 60);
  }

  private projTexture(kind: Proj['kind']): string {
    const evo = this.evolved;
    switch (kind) {
      case 'arrow': return evo ? 'p_arrowGold' : 'p_arrow';
      case 'split': return 'p_arrowGold';
      case 'bullet': return 'p_bullet';
      case 'orb': return evo ? 'p_orbGold' : 'p_orb';
      case 'pellet': return 'p_pellet';
      case 'star': return evo ? 'p_starGold' : 'p_star';
      case 'lance': return evo ? 'p_lanzaGold' : 'p_lanza';
      case 'turret': return 'p_turret';
    }
  }

  private getProj(kind: Proj['kind']): Proj {
    let p = this.projs.find((q) => !q.active);
    if (!p) {
      p = { img: this.add.image(0, 0, 'p_arrow').setDepth(2000), active: false, kind, x: 0, y: 0, vx: 0, vy: 0, speed: 0, dmg: 0, pierce: 0, bounce: 0, aoe: 0, life: 0, homing: null, hits: new Set() };
      this.projs.push(p);
    }
    p.active = true;
    p.kind = kind;
    p.hits.clear();
    p.homing = null;
    p.img.setTexture(this.projTexture(kind)).setVisible(true).setScale(this.furyT > 0 && kind !== 'turret' ? 1.25 : 1);
    if (this.furyT > 0 && kind !== 'turret') p.img.setTint(0xb8fff4);
    else p.img.clearTint();
    return p;
  }

  private shootAngle(kind: Proj['kind'], x: number, y: number, ang: number, dmg: number, pierce: number): Proj {
    const p = this.getProj(kind);
    const speed = kind === 'turret' ? 1100 : kind === 'split' ? 900 : this.wdef.speed;
    p.x = x;
    p.y = y;
    p.speed = speed;
    p.vx = Math.cos(ang) * speed;
    p.vy = Math.sin(ang) * speed;
    p.dmg = dmg;
    p.pierce = pierce;
    p.bounce = kind === 'star' ? this.st.bounce : 0;
    p.aoe = 0;
    p.life = kind === 'pellet' ? (this.wdef.range ?? 600) / speed : 1.6;
    return p;
  }

  private shoot(kind: Proj['kind'], x: number, y: number, target: Enemy, dmg: number, pierce: number): void {
    const ang = Math.atan2(target.y - target.hitY - y, target.x - x);
    const p = this.shootAngle(kind, x, y, ang, dmg, pierce);
    if (kind === 'orb') {
      p.homing = target;
      p.aoe = this.st.aoe;
      p.life = 2.5;
    }
  }

  // ================================================================= damage
  private damage(e: Enemy, base: number, opts: { canCrit?: boolean; skill?: boolean; silent?: boolean } = {}): void {
    if (!e.alive) return;
    let amt = base;
    let crit = false;
    if (opts.canCrit !== false && Math.random() < this.st.crit) {
      crit = true;
      amt *= this.st.critMult;
    }
    if (this.furyT > 0) amt *= 1.5;
    if (this.legends.has('corazon') && this.hp / this.st.maxHp < 0.35) amt *= 1.6;
    if (e === this.marked) amt *= 1.3;
    if (opts.skill) amt *= this.st.skillMult;
    if (e.frozenT > 0) amt *= 1.25; // synergy: Escarcha de Grafito
    let armor = e.def.armor ?? 0;
    if (e.shieldT > 0) armor = 0.8;
    amt *= 1 - armor;
    e.hp -= amt;
    e.flashT = 0.07;
    if (!opts.silent) this.dmgText(e.x + Phaser.Math.Between(-22, 22), e.y - e.hitY * 1.6 + Phaser.Math.Between(-12, 8), amt, crit);
    if (crit) {
      Sound.play('crit', 70);
      if (!this.lowFx && !opts.silent) this.flare(e.x, e.y - e.hitY, e.boss ? 120 : 70, 0xfff0a0, 140);
      if (e.boss) this.hitstop = Math.max(this.hitstop, 0.03);
      else e.kb += 14;
    } else Sound.play('hit', 50);
    if (this.legends.has('ejecutor') && !e.boss && e.hp > 0 && e.hp < e.maxHp * 0.12) {
      e.hp = 0;
      this.dmgText(e.x, e.y - e.hitY * 2, 0, true, '!!');
    }
    if (e.hp <= 0) this.kill(e);
  }

  private aoe(x: number, y: number, r: number, dmg: number, opts: { skill?: boolean; kb?: number; color?: string; silent?: boolean } = {}): void {
    const r2 = r * r;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = e.x - x;
      const dy = e.y - e.hitY - y;
      if (dx * dx + dy * dy <= r2 + e.r * e.r) {
        this.damage(e, dmg, { skill: opts.skill, silent: opts.silent });
        if (opts.kb && e.alive) e.kb += e.boss ? opts.kb * 0.2 : opts.kb;
      }
    }
    this.ring(x, y, r, opts.color === 'purple' ? 0xb060ff : 0xffd890, 260);
  }

  private kill(e: Enemy): void {
    e.alive = false;
    if (e.ice) {
      if (!this.lowFx) this.emitters.shard.setParticleTint(0xcff0ff).explode(10, e.x, e.y - e.hitY);
      e.ice.destroy();
      e.ice = undefined;
    }
    const img = e.img;
    if (this.lowFx) img.destroy();
    else {
      img.setTintFill(0xffffff);
      this.tweens.add({ targets: img, scaleX: 1.3, scaleY: 0.15, alpha: 0, duration: 170, ease: 'Quad.easeIn', onComplete: () => img.destroy() });
    }
    if (e === this.marked) {
      this.marked = null;
      this.markImg.setVisible(false);
    }
    this.kills++;
    const cy = e.y - e.hitY;
    const color = ['arana', 'aranaMadre', 'reina', 'escarabajo', 'seta'].includes(e.def.id) ? 'red' : ['mancha', 'manchita', 'sombra', 'guardian', 'ecoDante'].includes(e.def.id) ? 'purple' : 'ink';
    this.emitters[color].explode(e.boss ? 40 : 10, e.x, cy);
    this.emitters.ink.explode(e.boss ? 20 : 4, e.x, cy);
    this.splat(e.x, e.y, color === 'red' ? 0x3a1420 : color === 'purple' ? 0x2a1040 : 0x111116, e.boss ? 2.6 : Math.max(0.6, e.r / 24));
    Sound.play('death', 60);
    this.addCombo();

    // drops
    const sc = this.ch.waves === Infinity ? 1 + this.wave * 0.06 : 1 + (this.wave - 1) * 0.07;
    this.dropXp(e.x, cy, e.def.xp * sc * this.st.xpMult);
    if (Math.random() < e.def.gold) {
      const n = e.boss ? (e.def.rank === 'boss' ? 14 : 7) : 1;
      for (let i = 0; i < n; i++) this.dropCoin(e.x, e.y, Math.max(1, Math.round(this.goldWave() * this.st.goldMult * (e.boss ? 3 : 1))));
    }
    this.fury = Math.min(100, this.fury + (e.boss ? 20 : 1.5) * this.st.furyMult * (1 + Math.min(this.combo, 60) / 60));
    if (this.legends.has('vampiro')) this.hp = Math.min(this.st.maxHp, this.hp + this.st.maxHp * 0.005);
    if (this.legends.has('estallido') && !e.boss) {
      const r2 = 70 * 70;
      for (const o of this.enemies) {
        if (!o.alive || o === e) continue;
        const dx = o.x - e.x;
        const dy = o.y - e.y;
        if (dx * dx + dy * dy < r2) this.damage(o, this.st.dmg * 0.5, { canCrit: false, silent: true });
      }
      const ring = this.add.image(e.x, cy, 'ring').setDepth(2400).setScale(0.1).setTint(0x9a5cff);
      this.tweens.add({ targets: ring, scale: 1.1, alpha: 0, duration: 220, onComplete: () => ring.destroy() });
    }
    if (e.def.behavior === 'split') {
      for (let i = 0; i < 2; i++) this.spawn('manchita', e.x + 10, clamp(e.y + (i ? 30 : -30), FIELD.top, FIELD.bottom), 0.35 * (e.maxHp / (ENEMIES.mancha.hp * this.waveScale().hp)));
    }
    if (e.def.rank) {
      this.bossKills++;
      this.rankXp += e.def.rank === 'boss' ? 60 : 25;
      this.cameras.main.shake(400, 0.012);
      this.cameras.main.flash(200, 255, 255, 255);
      Sound.play('boom');
    }
    if (e === this.boss) {
      this.boss = null;
      if (this.ch.waves !== Infinity && this.bossWave) {
        // kill the rest and win
        this.later.push({ t: 0.6, fn: () => this.endRun(true) });
      } else if (this.bossWave) {
        this.bossWave = false;
        Sound.music(this.ch.music);
        this.waveCleared();
        this.startWave(this.wave + 1);
      }
    }
  }

  private waveCleared(): void {
    const g = Math.round(10 * this.goldWave() * this.st.goldMult);
    this.gold += g;
    if (this.hud) this.floatHud(`+${fmt(g)}`, GOLD_POS.x + 70, GOLD_POS.y - 40);
    this.rankXp += 10;
  }

  // ================================================================= enemies
  private updateEnemies(dt: number): void {
    const wallX = FIELD.barricadeX + 34;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.frameT += dt * (e.speed / 30);
      if (e.flashT > 0) e.flashT -= dt;
      if (e.shieldT > 0) e.shieldT -= dt;
      if (e.frozenT > 0) {
        e.frozenT -= dt;
        if (!e.boss) continue;
      }
      let spd = e.speed * (e.slowT > 0 ? 0.5 : 1) * (e.frozenT > 0 ? 0.5 : 1);
      if (e.slowT > 0) e.slowT -= dt;
      if (e.kb > 0) {
        const k = Math.min(e.kb, 600 * dt);
        e.x = Math.min(GAME_W - 30, e.x + k);
        e.kb -= k;
        e.atWall = false;
      }
      e.t += dt;
      const stopX = wallX + e.r * 0.6;
      const b = e.def.behavior;

      // behaviours
      switch (b) {
        case 'hop': {
          const cyc = e.t % 1.1;
          if (cyc < 0.45) {
            spd *= 2.4;
            e.lift = Math.sin((cyc / 0.45) * Math.PI) * 40;
          } else {
            spd = 0;
            e.lift = 0;
          }
          break;
        }
        case 'fly':
          e.lift = 40 + Math.sin(e.t * 3) * 14;
          e.y = clamp(e.y + Math.cos(e.t * 2.2) * 50 * dt, FIELD.top, FIELD.bottom);
          if (e.def.rank === 'mini' && e.t % 5 < 0.6 && e.x > stopX + 60) spd *= 4; // dive
          break;
        case 'dash':
          e.dashT -= dt;
          if (e.dashT <= 0 && e.t > 1.5) {
            e.dashT = 2.4;
            e.t2 = 0.3;
          }
          if (e.t2 > 0) {
            e.t2 -= dt;
            spd *= 5;
          }
          break;
        case 'ranged':
          if (e.x <= 470) {
            spd = 0;
            e.t2 += dt;
            if (e.t2 > 2.2) {
              e.t2 = 0;
              this.enemyShoot('arrow', e.x - 20, e.y - e.hitY - 10, FIELD.barricadeX + 10, e.y - 40, 7 * this.waveScale().dmg);
            }
          }
          break;
        case 'healer':
          if (e.x <= 540) spd = 0;
          e.t2 += dt;
          if (e.t2 > 3) {
            e.t2 = 0;
            for (const o of this.enemies) {
              if (!o.alive || o === e) continue;
              if (Math.abs(o.x - e.x) < 170 && Math.abs(o.y - e.y) < 170) o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.12);
            }
            this.emitters.green.explode(14, e.x, e.y - e.hitY);
            const ring = this.add.image(e.x, e.y - 30, 'ring').setDepth(2400).setScale(0.2).setTint(0x6aff8a);
            this.tweens.add({ targets: ring, scale: 2.8, alpha: 0, duration: 400, onComplete: () => ring.destroy() });
          }
          break;
        case 'spawner':
          e.t2 += dt;
          if (e.t2 > 3.5) {
            e.t2 = 0;
            for (let i = 0; i < 2; i++) this.spawn(e.def.spawn ?? 'arana', e.x + 10, clamp(e.y + Phaser.Math.Between(-60, 60), FIELD.top, FIELD.bottom));
          }
          break;
        case 'shield':
          if (e.def.rank === 'mini') {
            e.t2 += dt;
            if (e.t2 > 6) {
              e.t2 = 0;
              e.shieldT = 2;
            }
          }
          break;
        case 'boss':
          this.bossBehaviour(e, dt);
          if (e.t2 < 0) spd *= 4; // charge
          break;
        default:
          break;
      }

      if (e.x > stopX) {
        e.x -= spd * dt;
        e.atWall = false;
      } else {
        e.x = stopX;
        e.atWall = true;
        if (e.frozenT <= 0) {
          this.hp -= e.dps * dt;
          if (Math.random() < dt * 2) {
            Sound.play('barricade', 120);
            const s = this.stakes[Math.floor(clamp((e.y - FIELD.top) / 62, 0, 7))];
            s.setTint(0xff6a6a);
            this.later.push({ t: 0.08, fn: () => s.clearTint() });
          }
        }
      }
    }
  }

  private bossBehaviour(e: Enemy, dt: number): void {
    const id = e.def.id;
    if (id === 'reina') {
      if (e.t % 3.2 < dt) for (let i = 0; i < 3; i++) this.spawn('arana', e.x, clamp(e.y + Phaser.Math.Between(-90, 90), FIELD.top, FIELD.bottom));
      if (e.t % 5 < dt && e.t > 1) this.enemyShoot('web', e.x - 60, e.y - e.hitY, FIELD.heroX, FIELD.heroY - 60, 0);
    } else if (id === 'sirHueco') {
      if (e.t % 6 < dt && e.t > 2) {
        e.t2 = -0.45; // charge
        this.cameras.main.shake(300, 0.008);
        Sound.play('thud');
      }
      if (e.t2 < 0) e.t2 = Math.min(0, e.t2 + dt);
      if (e.t % 7 < dt) for (let i = 0; i < 3; i++) this.spawn('esqueleto', e.x + 20, clamp(e.y + Phaser.Math.Between(-100, 100), FIELD.top, FIELD.bottom));
    } else if (id === 'kraken') {
      // the creature that attacked the village: tentacle slams, ink blasts and blinding ink
      if (e.t % 3.6 < dt) for (let i = 0; i < 2; i++) this.spawn('sanguijuela', e.x, clamp(e.y + Phaser.Math.Between(-110, 110), FIELD.top, FIELD.bottom));
      if (e.t % 4.5 < dt && e.t > 1) this.enemyShoot('orb', e.x - 60, e.y - e.hitY, FIELD.barricadeX + 10, e.y - 40, this.st.maxHp * 0.035);
      if (e.t % 6.5 < dt && e.t > 3) {
        this.hp -= this.st.maxHp * 0.025;
        this.cameras.main.shake(350, 0.012);
        Sound.play('thud');
        this.emitters.ink.explode(26, FIELD.barricadeX + 20, (FIELD.top + FIELD.bottom) / 2);
      }
      if (e.phase === 0 && e.hp / e.maxHp < 0.5) {
        e.phase = 1;
        this.heroSlowT = 3.5;
        this.banner('¡TINTA CIEGA!', '#6fe3d6', 330, 52);
        this.cameras.main.flash(300, 10, 10, 14);
        Sound.play('roar');
      }
      if (e.phase === 1 && e.t % 9 < dt) this.heroSlowT = 2;
    } else if (id === 'recuerdo') {
      // a corrupted memory of kid Dante: teleports and throws the pages of the past
      if (e.t % 4.5 < dt && e.t > 1) {
        this.emitters.purple.explode(18, e.x, e.y - e.hitY);
        e.y = Phaser.Math.Between(FIELD.top + 40, FIELD.bottom - 20);
        e.x = Math.min(GAME_W - 70, e.x + 40);
        this.emitters.purple.explode(18, e.x, e.y - e.hitY);
        Sound.play('whoosh');
      }
      if (e.t % 2.6 < dt) this.enemyShoot('orb', e.x - 30, e.y - e.hitY, FIELD.barricadeX + 10, e.y - 40, this.st.maxHp * 0.03);
      const k = e.hp / e.maxHp;
      if ((e.phase === 0 && k < 0.66) || (e.phase === 1 && k < 0.33)) {
        e.phase++;
        for (let i = 0; i < 6; i++) this.spawn('pagina', e.x + 20, clamp(FIELD.top + 40 + i * 75, FIELD.top, FIELD.bottom));
        this.banner(e.phase === 1 ? '"¡Nadie te toca… excepto yo!"' : '"¡Nunca más voy a ser débil!"', '#ffb0c8', 330, 36);
        this.cameras.main.flash(250, 200, 120, 255);
        Sound.play('roar');
      }
    } else if (id === 'dante') {
      // final boss: three phases
      const k = e.hp / e.maxHp;
      const rage = e.phase >= 2 ? 1.8 : 1;
      if (e.t % (5 / rage) < dt && e.t > 2) {
        e.t2 = -0.5; // charge
        this.cameras.main.shake(300, 0.01);
        Sound.play('thud');
      }
      if (e.t2 < 0) e.t2 = Math.min(0, e.t2 + dt);
      if (e.t % (3 / rage) < dt) {
        for (const dy of [-90, 0, 90]) this.enemyShoot('orb', e.x - 40, e.y - e.hitY, FIELD.barricadeX + 10, clamp(e.y - 40 + dy, FIELD.top, FIELD.bottom), this.st.maxHp * 0.022);
      }
      if (e.phase >= 1 && e.t % 8 < dt) {
        e.shieldT = 2.5;
        this.emitters.purple.explode(20, e.x, e.y - e.hitY);
      }
      if ((e.phase === 0 && k < 0.66) || (e.phase === 1 && k < 0.33)) {
        e.phase++;
        this.slowmo = 1.2;
        if (e.phase === 1) {
          this.banner('LA CORONA DESPIERTA', '#d050ff', 330, 50);
          for (let i = 0; i < 5; i++) this.spawn('coronado', e.x + 20, clamp(FIELD.top + 40 + i * 90, FIELD.top, FIELD.bottom));
        } else {
          this.banner('¡CIEN MIL!', '#ff4a6a', 330, 70);
          e.speed *= 1.4;
          this.hp -= this.st.maxHp * 0.08;
          for (let i = 0; i < 4; i++) this.spawn('guardiaCorona', e.x + 30, clamp(FIELD.top + 60 + i * 110, FIELD.top, FIELD.bottom));
        }
        this.cameras.main.shake(600, 0.018);
        this.cameras.main.flash(300, 160, 64, 255);
        Sound.play('roar');
        Sound.vibrate([80, 40, 160]);
      }
    } else if (id === 'ecoDante') {
      if (e.t % 5 < dt && e.t > 1) {
        // teleport
        this.emitters.purple.explode(20, e.x, e.y - e.hitY);
        e.y = Phaser.Math.Between(FIELD.top + 40, FIELD.bottom - 20);
        e.x = Math.min(GAME_W - 70, e.x + 50);
        this.emitters.purple.explode(20, e.x, e.y - e.hitY);
        Sound.play('whoosh');
      }
      if (e.t % 3 < dt) this.enemyShoot('orb', e.x - 40, e.y - e.hitY, FIELD.barricadeX + 10, e.y - 40, this.st.maxHp * 0.03);
      const k = e.hp / e.maxHp;
      if ((e.phase === 0 && k < 0.66) || (e.phase === 1 && k < 0.33)) {
        e.phase++;
        for (let i = 0; i < 6; i++) this.spawn('sombra', e.x + 20, clamp(FIELD.top + 40 + i * 75, FIELD.top, FIELD.bottom));
        this.hp -= this.st.maxHp * 0.06;
        this.banner('¡CIEN MIL!', '#d050ff', 320, 56);
        this.cameras.main.shake(500, 0.015);
        this.cameras.main.flash(250, 160, 64, 255);
        Sound.play('roar');
      }
    }
  }

  private enemyShoot(kind: EProj['kind'], x: number, y: number, tx: number, ty: number, dmg: number): void {
    const key = kind === 'arrow' ? 'p_earrow' : kind === 'web' ? 'p_web' : 'p_eorb';
    const sp = kind === 'web' ? 420 : kind === 'orb' ? 360 : 600;
    const a = Math.atan2(ty - y, tx - x);
    const img = this.add.image(x, y, key).setDepth(2000).setRotation(kind === 'arrow' ? a + Math.PI : 0);
    this.eprojs.push({ img, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg, kind, tx, ty });
  }

  private updateEProjs(dt: number): void {
    for (let i = this.eprojs.length - 1; i >= 0; i--) {
      const p = this.eprojs[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind !== 'arrow') p.img.rotation += dt * 6;
      if (p.x <= p.tx) {
        if (p.kind === 'web') {
          this.heroSlowT = 2.5;
          this.dmgText(FIELD.heroX, FIELD.heroY - 140, 0, false, 'LENTO');
        } else {
          this.hp -= p.dmg;
          this.emitters[p.kind === 'orb' ? 'purple' : 'ink'].explode(8, p.x, p.y);
          Sound.play('barricade', 60);
        }
        p.img.destroy();
        this.eprojs.splice(i, 1);
      }
    }
  }

  // ================================================================= projectiles
  private updateProjs(dt: number): void {
    for (const p of this.projs) {
      if (!p.active) continue;
      if (p.homing) {
        if (p.homing.alive) {
          const a = Math.atan2(p.homing.y - p.homing.hitY - p.y, p.homing.x - p.x);
          p.vx = Math.cos(a) * p.speed;
          p.vy = Math.sin(a) * p.speed;
        } else {
          p.homing = this.nearestEnemy(p.x, p.y, 300);
        }
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0 || p.x > GAME_W + 40 || p.x < -40 || p.y < 150 || p.y > 960) {
        this.deactivate(p);
        continue;
      }
      const pr = p.kind === 'orb' ? 14 : 8;
      for (const e of this.enemies) {
        if (!e.alive || p.hits.has(e)) continue;
        const dx = e.x - p.x;
        const dy = e.y - e.hitY - p.y;
        const rr = e.r + pr;
        if (dx * dx + dy * dy > rr * rr) continue;
        p.hits.add(e);
        this.onHit(p, e);
        if (!p.active) break;
      }
    }
  }

  private deactivate(p: Proj): void {
    p.active = false;
    p.img.setVisible(false);
  }

  private onHit(p: Proj, e: Enemy): void {
    const evo = this.evolved;
    this.impact(p.kind, p.x, p.y);
    switch (p.kind) {
      case 'orb':
        this.aoe(p.x, p.y, p.aoe, p.dmg);
        this.emitters.cyan.explode(10, p.x, p.y);
        if (evo) this.chain(p.x, p.y, 3, p.dmg * 0.6, new Set([e]));
        this.deactivate(p);
        return;
      case 'star':
        this.damage(e, p.dmg);
        if (p.bounce > 0) {
          p.bounce--;
          const n = this.nearestEnemy(p.x, p.y, 280, p.hits);
          if (n) {
            const a = Math.atan2(n.y - n.hitY - p.y, n.x - p.x);
            p.vx = Math.cos(a) * p.speed;
            p.vy = Math.sin(a) * p.speed;
            p.life = 1;
            return;
          }
        }
        this.deactivate(p);
        return;
      default:
        this.damage(e, p.dmg);
        if (p.kind === 'pellet' && evo) this.aoe(p.x, p.y, 45, p.dmg * 0.5, { color: 'purple' });
        if (p.kind === 'lance' && evo) this.aoe(p.x, p.y, 60, p.dmg * 0.4, { color: 'purple' });
        if (p.kind === 'arrow' && evo) {
          for (const off of [-0.35, 0.35]) {
            const a = Math.atan2(p.vy, p.vx) + off;
            const s = this.shootAngle('split', p.x, p.y, a, p.dmg * 0.5, 0);
            s.hits.add(e);
          }
        }
        p.pierce--;
        if (p.pierce < 0) this.deactivate(p);
    }
  }

  // ================================================================= drops
  private dropXp(x: number, y: number, value: number): void {
    const free = this.drops.filter((d) => d.kind === 'xp').length < 70;
    if (!free) {
      this.gainXp(value);
      return;
    }
    const img = this.add.image(x, y, 'xp').setDepth(2100);
    this.drops.push({ img, kind: 'xp', x, y, vx: Phaser.Math.Between(-80, 80), vy: Phaser.Math.Between(-220, -120), t: 0, value, ground: y + 20, flying: false });
  }

  private dropCoin(x: number, y: number, value: number): void {
    const img = this.add.image(x, y - 30, 'coin').setDepth(2100);
    this.drops.push({ img, kind: 'coin', x, y: y - 30, vx: Phaser.Math.Between(-90, 90), vy: Phaser.Math.Between(-320, -180), t: 0, value, ground: y, flying: false });
  }

  private updateDrops(dt: number): void {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      d.t += dt;
      if (d.kind === 'xp') {
        if (d.t < 0.35) {
          d.vy += 600 * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
        } else {
          const dx = FIELD.heroX - d.x;
          const dy = FIELD.heroY - 60 - d.y;
          const dist = Math.hypot(dx, dy);
          const sp = 300 + d.t * 1400;
          if (dist < 30) {
            this.gainXp(d.value);
            d.img.destroy();
            this.drops.splice(i, 1);
            continue;
          }
          d.x += (dx / dist) * sp * dt;
          d.y += (dy / dist) * sp * dt;
        }
      } else {
        if (!d.flying) {
          d.vy += 900 * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          if (d.y > d.ground) {
            d.y = d.ground;
            d.vy *= -0.4;
            d.vx *= 0.6;
          }
          if (d.t > 1.8) d.flying = true;
        } else {
          const dx = GOLD_POS.x - d.x;
          const dy = GOLD_POS.y - d.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 30) {
            this.gold += d.value;
            Sound.play('coin', 70);
            d.img.destroy();
            this.drops.splice(i, 1);
            continue;
          }
          const sp = 600 + d.t * 600;
          d.x += (dx / dist) * sp * dt;
          d.y += (dy / dist) * sp * dt;
        }
      }
      d.img.setPosition(d.x, d.y);
    }
  }

  private tapField(x: number, y: number): void {
    // coins first
    let got = false;
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const d = this.drops[i];
      if (d.kind !== 'coin' || d.flying) continue;
      if (Math.hypot(d.x - x, d.y - y) < 70) {
        this.gold += d.value * 2;
        this.dmgText(d.x, d.y - 20, d.value * 2, true, '+');
        this.emitters.gold.explode(8, d.x, d.y);
        Sound.play('coin', 30);
        d.img.destroy();
        this.drops.splice(i, 1);
        got = true;
      }
    }
    if (got) return;
    // mark nearest enemy
    let best: Enemy | null = null;
    let bd = 110 * 110;
    for (const e of this.enemies) {
      if (!this.onField(e)) continue;
      const dx = e.x - x;
      const dy = e.y - e.hitY - y;
      const d = dx * dx + dy * dy - e.r * e.r;
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    this.marked = best;
    this.markImg.setVisible(!!best);
    if (best) {
      Sound.play('click');
      this.tutorDone('mark');
      this.markImg.setScale(1.3);
      this.tweens.add({ targets: this.markImg, scale: best.boss ? 1.5 : 0.75, duration: 150 });
      if (this.hud.hint.visible && this.kills > 5) this.hud.hint.setVisible(false);
    }
  }

  // ================================================================= xp & cards
  private gainXp(v: number): void {
    this.xp += v;
    Sound.play('xp', 40);
    while (this.xp >= this.xpNeed) {
      this.xp -= this.xpNeed;
      this.level++;
      this.xpNeed = this.xfor();
      this.pendingLevels++;
    }
    if (this.pendingLevels > 0 && !this.modal && !this.ended) this.openCards();
  }

  private xfor(): number {
    return this.xpFor(this.level);
  }

  private openCards(): void {
    if (this.pendingLevels <= 0 || this.ended) return;
    this.pendingLevels--;
    const milestone = MILESTONES.find((m) => this.level >= m && !this.claimedMilestones.has(m));
    if (milestone) {
      this.claimedMilestones.add(milestone);
      this.rerolls++;
      this.showCards(this.legendCards(), `COFRE DE HITO · Lv.${milestone}`, true);
      Sound.play('legend');
    } else {
      this.showCards(this.normalCards(), '¡SUBISTE DE NIVEL!', false);
      Sound.play('levelup');
    }
  }

  private normalCards(): Card[] {
    const opts: { c: Card; w: number }[] = [];
    if (this.stars < 5) opts.push({ c: { type: 'weapon' }, w: 3 });
    for (const id of Object.keys(SKILLS) as SkillId[]) {
      const owned = this.skills.find((s) => s.id === id);
      if (owned && owned.lv < MAX_SKILL) opts.push({ c: { type: 'skill', id }, w: 2 });
      if (!owned && this.skills.length < MAX_SKILL_SLOTS) opts.push({ c: { type: 'skill', id }, w: this.skills.length === 0 ? 3 : 1.4 });
    }
    for (const id of Object.keys(PASSIVES) as PassiveId[]) {
      if (this.passives[id] < MAX_PASSIVE) opts.push({ c: { type: 'passive', id }, w: 1.1 });
    }
    if (this.turrets < MAX_TURRETS) opts.push({ c: { type: 'turret' }, w: 1.2 });
    const out: Card[] = [];
    while (out.length < 3 && opts.length) {
      const total = opts.reduce((a, o) => a + o.w, 0);
      let r = Math.random() * total;
      let idx = 0;
      for (; idx < opts.length; idx++) {
        r -= opts[idx].w;
        if (r <= 0) break;
      }
      idx = Math.min(idx, opts.length - 1);
      out.push(opts[idx].c);
      opts.splice(idx, 1);
    }
    while (out.length < 3) out.push(out.length % 2 ? { type: 'gold' } : { type: 'heal' });
    return out;
  }

  private legendCards(): Card[] {
    const out: Card[] = [];
    if (this.stars >= 5 && !this.evolved) out.push({ type: 'evo' });
    const avail = shuffle((Object.keys(LEGENDS) as LegendId[]).filter((l) => !this.legends.has(l)));
    while (out.length < 3 && avail.length) out.push({ type: 'legend', id: avail.pop()! });
    while (out.length < 3) out.push({ type: 'gold' });
    return out;
  }

  private cardInfo(c: Card): { name: string; tag: string; desc: string; icon: string | null; glyph: string; color: number; lv: number; max: number } {
    switch (c.type) {
      case 'weapon':
        return { name: this.wdef.name, tag: 'Arma', desc: this.wdef.starDesc, icon: `ic_${this.weaponId}`, glyph: '', color: 0xf6a63a, lv: this.stars + 1, max: 5 };
      case 'evo':
        return { name: this.wdef.evoName, tag: 'EVOLUCIÓN', desc: this.wdef.evoDesc, icon: 'ic_evo', glyph: '', color: 0xff5a3a, lv: 0, max: 0 };
      case 'passive': {
        const p = PASSIVES[c.id];
        return { name: p.name, tag: 'Pasiva', desc: p.desc, icon: `pi_${c.id}`, glyph: p.icon, color: p.color, lv: this.passives[c.id] + 1, max: MAX_PASSIVE };
      }
      case 'skill': {
        const s = SKILLS[c.id];
        const owned = this.skills.find((x) => x.id === c.id);
        return { name: s.name, tag: owned ? 'Habilidad' : 'NUEVA habilidad', desc: owned ? `+30% daño, −8% recarga` : `${s.desc} · ${s.cd}s`, icon: `ic_${c.id}`, glyph: '', color: s.color, lv: (owned?.lv ?? 0) + 1, max: MAX_SKILL };
      }
      case 'turret':
        return { name: 'Torreta Lápiz', tag: 'Aliado', desc: 'Mini-stickman que dispara (40% de tu daño)', icon: 'ic_turret', glyph: '', color: 0x2a8a80, lv: this.turrets + 1, max: MAX_TURRETS };
      case 'legend': {
        const l = LEGENDS[c.id];
        return { name: l.name, tag: 'Legendaria', desc: l.desc, icon: 'ic_legend', glyph: '', color: 0xb84ae0, lv: 0, max: 0 };
      }
      case 'heal':
        return { name: 'Reparación', tag: 'Extra', desc: 'Cura 30% de la barricada', icon: 'ic_heal', glyph: '', color: 0x3aa05a, lv: 0, max: 0 };
      case 'gold':
        return { name: 'Botín', tag: 'Extra', desc: `+${this.lootGold()} de oro`, icon: 'ic_gold', glyph: '', color: 0xd8a020, lv: 0, max: 0 };
    }
  }

  private showCards(cards: Card[], title: string, legend: boolean, subtitle?: string): void {
    this.modal = true;
    const L = this.add.container(0, 0).setDepth(8000);
    this.modalLayer = L;
    const dim = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.72).setInteractive();
    L.add(dim);
    const tt = this.add.text(GAME_W / 2, 300, title, txt(legend ? 46 : 52, legend ? '#e0a0ff' : '#ffffff', 10)).setOrigin(0.5);
    L.add(tt);
    L.add(this.add.text(GAME_W / 2, 356, subtitle ?? (legend ? 'Elige un poder legendario' : `Nivel ${this.level}`), txt(26, '#bfe9ff', 5)).setOrigin(0.5));
    const lockUntil = this.time.now + 350;
    cards.forEach((c, i) => {
      const info = this.cardInfo(c);
      const y = 430 + i * 215;
      const cc = this.add.container(GAME_W / 2, y + 95);
      const g = this.add.graphics();
      const edge = legend ? 0xb84ae0 : c.type === 'evo' ? 0xff5a3a : 0x05070a;
      drawPanel(g, -335, -95, 670, 190, legend ? 0x2a1a44 : 0x1c2a44, edge, 16);
      cc.add(g);
      cc.add(iconBox(this, -250, 0, 120, info.icon, info.glyph, info.color));
      cc.add(this.add.text(-170, -66, info.name, txt(36, '#ffc93c', 7)).setOrigin(0, 0));
      cc.add(this.add.text(310, -50, info.tag, txt(22, legend ? '#e0a0ff' : '#ffc93c', 5)).setOrigin(1, 0.5));
      cc.add(this.add.text(-170, -14, info.desc, { ...txt(25, '#ffffff', 5), wordWrap: { width: 470 }, align: 'left' }).setOrigin(0, 0));
      if (info.max > 0) cc.add(stars(this, -160, 66, Math.min(info.lv, info.max), info.max, 24));
      const z = this.add.zone(0, 0, 670, 190).setInteractive({ useHandCursor: true });
      cc.add(z);
      z.on('pointerdown', () => {
        if (this.time.now < lockUntil) return;
        this.applyCard(c);
        this.closeCards();
      });
      cc.setScale(0.85).setAlpha(0);
      this.tweens.add({ targets: cc, scale: 1, alpha: 1, duration: 200, delay: i * 70, ease: 'Back.easeOut' });
      L.add(cc);
      (cc as unknown as { card: Card }).card = c;
    });
    if (this.rerolls > 0 && !subtitle) {
      const rb = button(this, GAME_W / 2, 1125, 300, 74, `CAMBIAR (${this.rerolls})`, () => {
        if (this.time.now < lockUntil) return;
        this.rerolls--;
        this.modalLayer?.destroy();
        this.showCards(legend ? this.legendCards() : this.normalCards(), title, legend);
      }, { size: 28, color: 0x3a4a5e });
      L.add(rb);
    }
  }

  private starterCards(): Card[] {
    return shuffle(Object.keys(SKILLS) as SkillId[]).slice(0, 3).map((id) => ({ type: 'skill', id }) as Card);
  }

  private closeCards(): void {
    this.modalLayer?.destroy();
    this.modalLayer = null;
    this.modal = false;
    if (this.pendingStart) {
      this.pendingStart = false;
      this.startWave(Math.max(1, DEBUG.wave));
    }
    if (this.pendingLevels > 0) this.openCards();
  }

  private applyCard(c: Card): void {
    Sound.play('buy');
    switch (c.type) {
      case 'weapon':
        this.stars = Math.min(5, this.stars + 1);
        this.refreshWeaponStars();
        break;
      case 'evo':
        this.evolved = true;
        this.banner(this.wdef.evoName, '#ffb340');
        Sound.play('legend');
        break;
      case 'passive':
        this.passives[c.id]++;
        break;
      case 'skill': {
        const owned = this.skills.find((s) => s.id === c.id);
        if (owned) owned.lv++;
        else this.skills.push({ id: c.id, lv: 1, cd: 0 });
        this.refreshSkillIcons();
        break;
      }
      case 'turret': {
        this.turrets++;
        const ys = [FIELD.top + 70, FIELD.bottom - 40, (FIELD.top + FIELD.bottom) / 2 + 20];
        const y = ys[this.turrets - 1];
        const img = this.add.image(FIELD.barricadeX - 32, y, 'turret').setOrigin(0.4, 1).setDepth(y + 21);
        this.turretImgs.push(img);
        this.emitters.cyan.explode(16, img.x, img.y - 30);
        break;
      }
      case 'legend':
        this.legends.add(c.id);
        break;
      case 'heal':
        this.hp = Math.min(this.st.maxHp, this.hp + this.st.maxHp * 0.3);
        Sound.play('heal');
        break;
      case 'gold':
        this.gold += this.lootGold();
        break;
    }
    this.recalc();
  }

  // ================================================================= skills
  private skillCd(s: SkillSlot): number {
    return SKILLS[s.id].cd * Math.pow(0.92, s.lv - 1) * this.st.cdMult;
  }

  private densest(): { x: number; y: number } | null {
    let best: Enemy | null = null;
    let bestN = -1;
    const vis = this.enemies.filter((e) => this.onField(e));
    for (const e of vis) {
      let n = 0;
      for (const o of vis) {
        const dx = o.x - e.x;
        const dy = o.y - e.y;
        if (dx * dx + dy * dy < 110 * 110) n += o.boss ? 3 : 1;
      }
      n += (GAME_W - e.x) / 400; // prefer closer to the wall
      if (n > bestN) {
        bestN = n;
        best = e;
      }
    }
    return best ? { x: best.x, y: best.y - best.hitY } : null;
  }

  private useSkill(i: number): void {
    if (this.modal || this.paused || this.ended) return;
    const s = this.skills[i];
    if (!s || s.cd > 0) {
      if (s) Sound.play('error');
      return;
    }
    const hasTargets = this.enemies.some((e) => this.onField(e));
    if (!hasTargets && s.id !== 'muro') {
      Sound.play('error');
      return;
    }
    s.cd = this.skillCd(s);
    this.tutorDone('skill');
    this.castSkill(s.id, s.lv, 1);
    if (this.legends.has('eco')) this.later.push({ t: 0.45, fn: () => this.castSkill(s.id, s.lv, 0.5) });
    const p = SKILL_POS[i];
    const ic = this.hud.skillIcons[i];
    if (ic) this.tweens.add({ targets: ic, scale: 1.2, duration: 80, yoyo: true });
    this.emitters.white.explode(10, p.x, p.y);
  }

  /** Ground marker shown where an area skill will land. */
  private target(x: number, y: number, ms: number, scale = 1): void {
    const m = this.add.image(x, y + 18, 'fx_target').setDepth(4).setScale(0.4 * scale).setAlpha(0);
    this.tweens.add({ targets: m, alpha: 1, scale: scale, duration: 140, ease: 'Back.easeOut' });
    this.tweens.add({ targets: m, angle: 0, alpha: 0, delay: ms, duration: 200, onComplete: () => m.destroy() });
  }

  private castSkill(id: SkillId, lv: number, k: number): void {
    const dm = this.st.dmg * (1 + 0.3 * (lv - 1)) * k;
    Sound.play('skill', 0);
    Sound.vibrate(30);
    switch (id) {
      case 'lluvia': {
        // a volley falls diagonally on the marked area; each arrow leaves a spark and a dust puff
        const c = this.densest();
        if (!c) return;
        const n = 12 + 2 * (lv - 1);
        this.target(c.x, c.y, 300 + n * 80, 1.05);
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * 110;
          const tx = c.x + Math.cos(a) * r;
          const ty = c.y + Math.sin(a) * r * 0.7;
          const sx = tx + 160;
          const sy = ty - 440;
          const img = this.add.image(sx, sy, 'p_fall').setDepth(2200).setVisible(false).setRotation(Math.atan2(ty - sy, tx - sx) - Math.PI / 2);
          this.fxs.push({
            t: -0.15 - i * 0.07, dur: 0.24,
            step: (kk) => {
              if (kk <= 0) return;
              img.setVisible(true).setPosition(sx + (tx - sx) * kk, sy + (ty - sy) * kk);
            },
            done: () => {
              img.destroy();
              this.aoe(tx, ty, 48, dm * 1.3, { skill: true, silent: true });
              if (!this.lowFx) {
                this.emitters.spark.setParticleTint(0xffe6b0).explode(4, tx, ty);
                this.emitters.smoke.setParticleTint(0x8a7a62).explode(1, tx, ty + 6);
              }
              Sound.play('arrow', 30);
            },
          });
        }
        break;
      }
      case 'rayo': {
        const start = this.getTarget();
        if (!start) return;
        this.flare(HAND.x, HAND.y, 120, 0x9ae8ff, 180);
        this.chain(HAND.x, HAND.y, 6 + lv, dm * 3, new Set(), start);
        this.cameras.main.flash(90, 160, 220, 255);
        Sound.play('zap', 0);
        break;
      }
      case 'bomba': {
        // ink bomb: sputtering fuse, ground shadow, then flash + shockwave + smoke
        const c = this.densest();
        if (!c) return;
        this.target(c.x, c.y, 520, 1.3);
        const img = this.add.image(HAND.x, HAND.y, 'p_bomb').setDepth(2200);
        const shadow = this.add.image(HAND.x, FIELD.heroY, 'shadow').setDepth(5).setAlpha(0.6);
        const sx = HAND.x;
        const sy = HAND.y;
        this.fxs.push({
          t: 0, dur: 0.55,
          step: (kk) => {
            const x = sx + (c.x - sx) * kk;
            const y = sy + (c.y - sy) * kk - Math.sin(kk * Math.PI) * 240;
            img.setPosition(x, y).setRotation(kk * 9);
            shadow.setPosition(x, sy + (c.y + 18 - sy) * kk).setScale(0.6 + kk * 0.8);
            if (!this.lowFx && Math.random() < 0.6) this.emitters.spark.setParticleTint(0xffc060).explode(1, x + 8, y - 14);
          },
          done: () => {
            img.destroy();
            shadow.destroy();
            this.aoe(c.x, c.y, 150, dm * 6, { skill: true, kb: 90, color: 'purple' });
            this.flare(c.x, c.y, 360, 0xd8a0ff, 260);
            this.flare(c.x, c.y, 180, 0xffffff, 140);
            this.ring(c.x, c.y + 10, 170, 0xb060ff, 380, 0.45);
            this.ring(c.x, c.y, 120, 0xffffff, 260);
            this.emitters.purple.explode(30, c.x, c.y);
            this.emitters.ink.explode(24, c.x, c.y);
            if (!this.lowFx) {
              this.emitters.smoke.setParticleTint(0x2a2236).explode(10, c.x, c.y);
              this.emitters.spark.setParticleTint(0xffd0ff).explode(14, c.x, c.y);
            }
            for (let i = 0; i < 3; i++) this.splat(c.x + Phaser.Math.Between(-60, 60), c.y + Phaser.Math.Between(-10, 30), 0x241030, 1.6);
            this.hitstop = Math.max(this.hitstop, 0.05);
            this.cameras.main.shake(320, 0.014);
            Sound.play('boom', 0);
          },
        });
        break;
      }
      case 'muro': {
        // a wave of ink rises from the barricade and sweeps the field
        this.hp = Math.min(this.st.maxHp, this.hp + this.st.maxHp * (0.15 + 0.03 * (lv - 1)) * k);
        for (const e of this.enemies) {
          if (!e.alive || !this.onField(e)) continue;
          this.damage(e, dm, { skill: true, silent: true });
          if (e.alive) e.kb += e.boss ? 30 : 110;
        }
        const midY = (FIELD.top + FIELD.bottom) / 2;
        const wave = this.add.image(FIELD.barricadeX + 20, midY + 10, 'fx_inkwave').setDepth(2300).setScale(0.4, 1.05).setAlpha(0.95);
        this.tweens.add({ targets: wave, x: GAME_W + 100, scaleX: 1.4, duration: 620, ease: 'Quad.easeOut' });
        this.tweens.add({ targets: wave, alpha: 0, delay: 380, duration: 260, onComplete: () => wave.destroy() });
        this.flare(FIELD.barricadeX, midY, 300, 0x2ad4c4, 300);
        for (const st of this.stakes) {
          this.emitters.green.explode(3, st.x, st.y);
          if (!this.lowFx) this.emitters.spark.setParticleTint(0x9affef).explode(2, st.x, st.y);
        }
        Sound.play('heal', 0);
        break;
      }
      case 'hielo': {
        // frost nova from the hero: every enemy is encased in ice
        const dur = (2.5 + 0.3 * (lv - 1)) * k;
        for (const e of this.enemies) {
          if (!e.alive || !this.onField(e)) continue;
          e.frozenT = Math.max(e.frozenT, dur);
          this.damage(e, dm, { skill: true, silent: true });
        }
        this.ring(FIELD.heroX, FIELD.heroY - 40, 760, 0xbfe9ff, 520, 0.55);
        this.ring(FIELD.heroX, FIELD.heroY - 40, 480, 0xffffff, 380, 0.55);
        this.flare(FIELD.heroX + 60, FIELD.heroY - 60, 280, 0xbfe9ff, 300);
        if (!this.lowFx) {
          for (let i = 0; i < 6; i++) this.emitters.spark.setParticleTint(0xdff6ff).explode(4, Phaser.Math.Between(220, 700), Phaser.Math.Between(FIELD.top, FIELD.bottom));
        }
        this.cameras.main.flash(220, 190, 230, 255);
        Sound.play('freeze', 0);
        break;
      }
      case 'tornado': {
        const c = this.densest();
        const ty = c ? c.y + 60 : (FIELD.top + FIELD.bottom) / 2;
        const img = this.add.image(FIELD.barricadeX + 40, ty, 'tornado_0').setOrigin(0.5, 1).setDepth(ty + 1).setScale(0.95).setAlpha(0.95);
        const base = this.add.image(FIELD.barricadeX + 40, ty, 'fx_ring').setDepth(4).setTint(0xd8dce4).setScale(1, 0.3).setAlpha(0.6).setBlendMode(Phaser.BlendModes.ADD);
        let frameT = 0;
        this.fxs.push({
          t: 0, dur: 2.0,
          step: (kk, dt) => {
            const x = FIELD.barricadeX + 40 + (GAME_W - FIELD.barricadeX) * kk;
            img.setX(x).setScale(0.95 + Math.sin(frameT * 9) * 0.04, 0.95);
            base.setX(x).setAngle(frameT * 400);
            frameT += dt;
            img.setTexture(`tornado_${Math.floor(frameT * 16) % 4}`);
            if (!this.lowFx && Math.random() < 0.35) this.emitters.smoke.setParticleTint(0x9a9488).explode(1, x + Phaser.Math.Between(-30, 30), ty - 10);
            for (const e of this.enemies) {
              if (!e.alive) continue;
              const dx = e.x - x;
              const dy = e.y - ty;
              if (Math.abs(dx) < 80 && Math.abs(dy) < 120) {
                if (!e.boss) {
                  e.y += (ty - e.y) * Math.min(1, dt * 4);
                  e.x += (x + 40 - e.x) * Math.min(1, dt * 3);
                }
                if (this.simTime - e.tornadoTick > 0.25) {
                  e.tornadoTick = this.simTime;
                  this.damage(e, dm * 0.6, { skill: true });
                }
              }
            }
          },
          done: () => {
            this.tweens.add({ targets: [img, base], alpha: 0, duration: 200, onComplete: () => { img.destroy(); base.destroy(); } });
          },
        });
        Sound.play('whoosh', 0);
        break;
      }
    }
  }

  /** Chain lightning: glow + white core + side branches, flickering briefly. */
  private chain(x: number, y: number, n: number, dmg: number, hit: Set<Enemy>, first?: Enemy): void {
    const g = this.add.graphics().setDepth(2450).setBlendMode(Phaser.BlendModes.ADD);
    const segs: { x: number; y: number }[][] = [];
    let px = x;
    let py = y;
    let next: Enemy | null = first ?? this.nearestEnemy(x, y, 320, hit);
    for (let i = 0; i < n && next; i++) {
      hit.add(next);
      const tx = next.x;
      const ty = next.y - next.hitY;
      const pts = [{ x: px, y: py }];
      for (let s2 = 1; s2 < 6; s2++) {
        const k2 = s2 / 6;
        pts.push({ x: px + (tx - px) * k2 + Phaser.Math.Between(-16, 16), y: py + (ty - py) * k2 + Phaser.Math.Between(-16, 16) });
      }
      pts.push({ x: tx, y: ty });
      segs.push(pts);
      // a short side branch
      const b = pts[Phaser.Math.Between(2, 4)];
      segs.push([b, { x: b.x + Phaser.Math.Between(-30, 30), y: b.y + Phaser.Math.Between(-36, 36) }, { x: b.x + Phaser.Math.Between(-50, 50), y: b.y + Phaser.Math.Between(-50, 50) }]);
      this.damage(next, next === this.marked ? dmg * 2 : dmg, { skill: true });
      this.flare(tx, ty, 90, 0x9ae8ff, 160);
      this.emitters.cyan.explode(6, tx, ty);
      px = tx;
      py = ty;
      next = this.nearestEnemy(px, py, 300, hit);
    }
    const draw = () => {
      g.clear();
      for (const pts of segs) {
        for (const [w, col, a] of [[12, 0x3aa8ff, 0.35], [6, 0x9ae8ff, 0.8], [2.5, 0xffffff, 1]] as const) {
          g.lineStyle(w, col, a);
          g.beginPath();
          g.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x + Phaser.Math.Between(-2, 2), pts[i].y + Phaser.Math.Between(-2, 2));
          g.strokePath();
        }
      }
    };
    draw();
    this.time.delayedCall(60, draw);
    this.time.delayedCall(120, draw);
    this.tweens.add({ targets: g, alpha: 0, delay: 130, duration: 200, onComplete: () => g.destroy() });
  }

  // ================================================================= fury
  private furyDur(): number {
    return this.legends.has('furiaEterna') ? 14 : 7;
  }

  private activateFury(): void {
    if (this.modal || this.paused || this.ended || this.fury < 100 || this.furyT > 0) return;
    this.fury = 0;
    this.furyT = this.furyDur();
    this.tutorDone('fury');
    if (!this.lowFx) this.emitters.flame.start();
    this.banner('¡MODO TRAZO!', '#2ad4c4');
    Sound.play('fury', 0);
    Sound.vibrate([40, 30, 80]);
    this.cameras.main.flash(250, 42, 212, 196);
    this.emitters.cyan.explode(40, FIELD.heroX, FIELD.heroY - 60);
  }

  /** Cheap atmospheric particles (≤ 24 alive): fireflies, dust, embers or falling ink. */
  private ambient(): void {
    if (this.lowFx) return;
    const cfg: Record<string, Phaser.Types.GameObjects.Particles.ParticleEmitterConfig> = {
      c1: { tint: 0xe8ff8a, speedX: { min: -12, max: 12 }, speedY: { min: -14, max: 6 }, scale: { start: 0.45, end: 0.15 } },
      c2: { tint: 0xfff0d0, speedX: { min: 6, max: 22 }, speedY: { min: -4, max: 6 }, scale: { start: 0.3, end: 0.1 } },
      c3: { tint: 0xff9a50, speedX: { min: -8, max: 8 }, speedY: { min: -45, max: -20 }, scale: { start: 0.4, end: 0.05 } },
      c4: { tint: 0x8affe0, speedX: { min: -10, max: 10 }, speedY: { min: -10, max: 8 }, scale: { start: 0.5, end: 0.15 } },
      c5: { tint: 0xe8d8ff, speedX: { min: -6, max: 6 }, speedY: { min: 8, max: 22 }, scale: { start: 0.35, end: 0.12 } },
      c6: { tint: 0xffc070, speedX: { min: -6, max: 6 }, speedY: { min: -40, max: -18 }, scale: { start: 0.4, end: 0.05 } },
      abismo: { tint: 0xb060ff, speedX: { min: -4, max: 4 }, speedY: { min: 20, max: 45 }, scale: { start: 0.45, end: 0.2 } },
    };
    const c = cfg[this.ch.id];
    if (!c) return;
    this.add.particles(0, 0, 'dot', {
      x: { min: 0, max: GAME_W }, y: { min: 160, max: 900 }, lifespan: { min: 3500, max: 6000 },
      alpha: { start: 0.9, end: 0 }, frequency: 260, maxAliveParticles: 24, blendMode: Phaser.BlendModes.ADD, ...c,
    }).setDepth(1980);
  }

  // ================================================================= weapon VFX
  private static readonly KIND_COLOR: Record<string, number> = {
    arrow: 0x8affef, split: 0xffe27a, bullet: 0xffc070, orb: 0x6fd8ff, pellet: 0xff8a3d, star: 0xe8eef6, lance: 0x6fe3d6, turret: 0x2ad4c4,
  };

  /** Short additive flash at the weapon's mouth. */
  private muzzle(angle: number, kind: ProjKind): void {
    if (this.lowFx) return;
    let m = this.muzzles[this.muzzleIdx];
    if (!m) {
      m = this.add.image(0, 0, 'fx_muzzle').setDepth(2050).setBlendMode(Phaser.BlendModes.ADD);
      this.muzzles.push(m);
    }
    this.muzzleIdx = (this.muzzleIdx + 1) % 4;
    const reach = kind === 'bullet' || kind === 'pellet' ? 26 : 14;
    const tint = kind === 'orb' ? 0x9af0ff : kind === 'lance' ? 0x9afff0 : kind === 'arrow' || kind === 'star' ? 0xffffff : 0xffd890;
    this.tweens.killTweensOf(m);
    m.setPosition(HAND.x + Math.cos(angle) * reach, HAND.y + Math.sin(angle) * reach).setRotation(angle).setTint(tint)
      .setScale(kind === 'pellet' ? 0.9 : kind === 'bullet' ? 0.55 : 0.4).setAlpha(1).setVisible(true);
    this.tweens.add({ targets: m, alpha: 0, scale: m.scale * 1.5, duration: 90, onComplete: () => m!.setVisible(false) });
  }

  /** Weapon-specific hit spark. */
  private impact(kind: Proj['kind'], x: number, y: number): void {
    if (this.lowFx) return;
    const col = BattleScene.KIND_COLOR[kind] ?? 0xffffff;
    const sp = this.emitters.spark;
    sp.setParticleTint(col);
    sp.explode(kind === 'pellet' || kind === 'bullet' ? 3 : 5, x, y);
    if (kind === 'arrow' || kind === 'split') this.emitters.shard.setParticleTint(0xc88a50).explode(2, x, y);
    if (kind === 'orb' || kind === 'lance') this.ring(x, y, kind === 'lance' ? 50 : 70, col, 220);
  }

  /** Expanding additive ring (shockwaves, ripples). */
  private ring(x: number, y: number, radius: number, tint: number, ms: number, squash = 1): void {
    const r = this.add.image(x, y, 'fx_ring').setDepth(2450).setBlendMode(Phaser.BlendModes.ADD).setTint(tint).setScale(0.1, 0.1 * squash);
    this.tweens.add({ targets: r, scaleX: (radius * 2) / 128, scaleY: ((radius * 2) / 128) * squash, alpha: 0, duration: ms, ease: 'Quad.easeOut', onComplete: () => r.destroy() });
  }

  /** Big additive flash (explosions, crits, lightning hits). */
  private flare(x: number, y: number, size: number, tint: number, ms = 200): void {
    const f = this.add.image(x, y, 'fx_flash').setDepth(2460).setBlendMode(Phaser.BlendModes.ADD).setTint(tint).setScale((size * 0.6) / 128);
    this.tweens.add({ targets: f, scale: size / 128, alpha: 0, duration: ms, ease: 'Quad.easeOut', onComplete: () => f.destroy() });
  }

  /** Light trails behind projectiles (one additive Graphics, redrawn each frame). */
  private drawTrails(): void {
    const g = this.trailsG;
    g.clear();
    if (this.lowFx) return;
    for (const p of this.projs) {
      if (!p.active) continue;
      const col = this.furyT > 0 ? 0x8affef : BattleScene.KIND_COLOR[p.kind] ?? 0xffffff;
      const len = p.kind === 'bullet' ? 0.05 : p.kind === 'orb' ? 0.09 : p.kind === 'lance' ? 0.07 : 0.045;
      const w = p.kind === 'orb' ? 12 : p.kind === 'lance' ? 7 : p.kind === 'pellet' ? 5 : 4;
      const tx = p.x - p.vx * len;
      const ty = p.y - p.vy * len;
      g.lineStyle(w, col, 0.22);
      g.lineBetween(tx, ty, p.x, p.y);
      g.lineStyle(w * 0.45, col, 0.55);
      g.lineBetween((tx + p.x) / 2, (ty + p.y) / 2, p.x, p.y);
    }
  }

  // ================================================================= juice & feedback
  /** Ink stain left on the ground; pooled so it costs nothing after warm-up. */
  private splat(x: number, y: number, tint: number, scale: number): void {
    if (this.lowFx) return;
    let img = this.splats[this.splatIdx];
    if (!img) {
      img = this.add.image(0, 0, 'splat').setDepth(3);
      this.splats.push(img);
    }
    this.splatIdx = (this.splatIdx + 1) % 28;
    this.tweens.killTweensOf(img);
    img.setPosition(x, y + 4).setTint(tint).setAlpha(0.75).setScale(scale * 0.4, scale * 0.16).setRotation(Math.random() * 0.4 - 0.2).setVisible(true);
    this.tweens.add({ targets: img, scaleX: scale, scaleY: scale * 0.38, duration: 120, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: img, alpha: 0, delay: 3500, duration: 1500 });
  }

  private addCombo(): void {
    this.combo++;
    this.comboT = 2.2;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    if (this.combo >= 5) {
      this.comboText.setText(`×${this.combo} COMBO`).setVisible(true).setAlpha(1);
      this.comboText.setColor(this.combo >= 50 ? '#ff4a6a' : this.combo >= 25 ? '#ffb340' : '#ffd34d');
      this.comboText.setScale(1.25);
      this.tweens.add({ targets: this.comboText, scale: 1, duration: 120 });
    }
    if (this.combo % 25 === 0) {
      const bonus = Math.round(this.combo * 0.6 * this.st.goldMult);
      this.gold += bonus;
      this.fury = Math.min(100, this.fury + 10);
      this.banner(this.combo >= 100 ? '¡IMPARABLE!' : this.combo >= 50 ? '¡MASACRE!' : '¡EN RACHA!', '#ffb340', 380, 48);
      this.floatHud(`+${fmt(bonus)}`, GOLD_POS.x + 70, GOLD_POS.y - 40);
      Sound.play('coin', 0);
    }
  }

  private floatHud(text: string, x: number, y: number, color = '#ffd34d'): void {
    const t = this.add.text(x, y, text, txt(30, color, 6)).setOrigin(0.5).setDepth(6000);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 1100, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  private bossIntro(def: EnemyDef): void {
    const sub: Record<string, string> = {
      reina: 'Madre del Bosque Sombrío',
      sirHueco: 'El primer vaciado por la Corona',
      ecoDante: 'Lo que la Corona dejó de Dante',
      kraken: 'La bestia que atacó la aldea',
      recuerdo: 'Dante, a los diez años. Corrompido.',
      dante: 'Hermano. Poder 100.000.',
    };
    const quote: Record<string, string> = {
      reina: '"¡Mis hijas tienen hambre, palito!"',
      sirHueco: '"Quien busca la Corona… encuentra el vacío."',
      ecoDante: '"¡CIEN MIL! ¡CIEN MIL!"',
      kraken: '"…" (el pantano entero tiembla)',
      recuerdo: '"Mientras yo esté… nadie te toca."',
      dante: '"Hey, hermanito. ¿Todavía no aprendes?"',
    };
    this.slowmo = 1.6;
    const D = 7000;
    const top = this.add.rectangle(GAME_W / 2, -70, GAME_W, 140, 0x000000).setDepth(D);
    const bot = this.add.rectangle(GAME_W / 2, GAME_H + 70, GAME_W, 140, 0x000000).setDepth(D);
    const name = this.add.text(GAME_W / 2, 560, def.name.toUpperCase(), txt(64, '#ffffff', 12)).setOrigin(0.5).setDepth(D).setAlpha(0).setScale(1.4);
    name.setShadow(0, 0, '#d050ff', 20, true, true);
    const st = this.add.text(GAME_W / 2, 625, sub[def.id] ?? 'Jefe', txt(28, '#d8b0ff', 6)).setOrigin(0.5).setDepth(D).setAlpha(0);
    const qt = this.add.text(GAME_W / 2, 680, quote[def.id] ?? '', { ...txt(26, '#ffffff', 6), wordWrap: { width: 640 } }).setOrigin(0.5).setDepth(D).setAlpha(0);
    this.tweens.add({ targets: top, y: 70, duration: 250, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: bot, y: GAME_H - 70, duration: 250, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: name, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.tweens.add({ targets: [st, qt], alpha: 1, delay: 250, duration: 300 });
    this.time.delayedCall(2000, () => {
      this.tweens.add({ targets: top, y: -70, duration: 250 });
      this.tweens.add({ targets: bot, y: GAME_H + 70, duration: 250 });
      this.tweens.add({ targets: [name, st, qt], alpha: 0, duration: 250, onComplete: () => [top, bot, name, st, qt].forEach((o) => o.destroy()) });
    });
  }

  // ---------------------------------------------------------------- tutorial (first runs only)
  private updateTutor(): void {
    if (DEBUG.bot || this.ended) return;
    const tut = Save.d.tutorial;
    if (this.tutor) {
      const k = this.tutor.kind;
      if (tut[k]) {
        this.tutor.box.destroy();
        this.tutor = null;
      } else if (k === 'mark') {
        const t = this.getTarget();
        if (t) this.tutor.box.setPosition(t.x, t.y - t.hitY);
      }
      this.keepOnScreen();
      return;
    }
    if (!tut.mark && this.simTime > 4) {
      const t = this.getTarget();
      if (t && t.x < GAME_W - 80) {
        this.showTutor('mark', t.x, t.y - t.hitY, '¡Tócalo para marcarlo!\n+30% de daño');
        return;
      }
    }
    // teach one thing at a time: skills only after marking was learned (or after a while)
    if (!tut.mark && this.simTime < 16) return;
    if (!tut.skill && this.skills.some((sk) => sk.cd <= 0) && this.enemies.some((e) => this.onField(e))) {
      const i = this.skills.findIndex((sk) => sk.cd <= 0);
      this.showTutor('skill', SKILL_POS[i].x, SKILL_POS[i].y, '¡Usa tu habilidad!');
    } else if (!tut.fury && this.fury >= 100) {
      this.showTutor('fury', FURY_POS.x, FURY_POS.y, '¡Activa la FURIA!');
    }
  }

  private showTutor(kind: 'mark' | 'skill' | 'fury', x: number, y: number, text: string): void {
    const box = this.add.container(x, y).setDepth(6500);
    const hand = this.add.image(18, 40, 'hand').setOrigin(0.2, 0);
    const above = kind !== 'mark';
    const label = this.add.text(kind === 'fury' ? -60 : kind === 'skill' ? 90 : 0, above ? -110 : 150, text, { ...txt(26, '#ffffff', 7), align: 'center' }).setOrigin(0.5);
    box.add([hand, label]);
    this.tweens.add({ targets: hand, y: 22, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tutor = { box, label, dx: label.x, kind };
    this.keepOnScreen();
  }

  /** Keeps the tutorial text fully inside the screen wherever the pointer is. */
  private keepOnScreen(): void {
    if (!this.tutor) return;
    const { box, label, dx } = this.tutor;
    const half = label.width / 2 + 12;
    label.x = clamp(dx, half - box.x, GAME_W - half - box.x);
  }

  private tutorDone(kind: 'mark' | 'skill' | 'fury'): void {
    if (Save.d.tutorial[kind]) return;
    Save.d.tutorial[kind] = true;
    if (!DEBUG.bot && DEBUG.meta === null) Save.write();
  }

  // ================================================================= rendering
  private render(): void {
    const t = this.simTime;
    // hero
    const hg = this.heroG;
    hg.clear();
    if (this.furyT > 0) {
      hg.fillStyle(COLORS.hero, 0.18 + Math.sin(t * 12) * 0.08);
      hg.fillCircle(FIELD.heroX, FIELD.heroY - 60, 80);
    }
    const armAng = clamp(this.aimAngle, 0.6, 2.6);
    const pose = POSES.aim(t, armAng - this.recoil * 0.15);
    if (this.wdef.kind === 'orb' || this.wdef.kind === 'star') pose.armF = [armAng, 0.2];
    const weapon = this.evolved ? (this.weaponId === 'arco' ? 'bowE' : this.weaponId === 'baston' ? 'staffE' : this.weaponId) : this.weaponId;
    drawStickman(hg, FIELD.heroX - this.recoil * 3, FIELD.heroY, 1.05, pose, {
      tier: Save.d.armorEquipped, eyes: this.hp / this.st.maxHp < 0.3 ? 'sad' : 'angry', weapon,
      twin: this.evolved && this.weaponId === 'pistola', outline: this.furyT > 0 ? COLORS.hero : null,
    }, 1, t);
    if (this.heroSlowT > 0) {
      hg.lineStyle(2, 0xffffff, 0.8);
      hg.strokeCircle(FIELD.heroX, FIELD.heroY - 60, 40);
    }
    this.furyVignette.setAlpha(this.furyT > 0 ? 0.08 + Math.sin(t * 8) * 0.04 : 0);
    const hpk = this.hp / this.st.maxHp;
    if (hpk < 0.35 && !this.ended) {
      this.dangerImg.setAlpha(0.35 + Math.sin(t * 7) * 0.2);
      if (t - this.heartT > 0.85) {
        this.heartT = t;
        Sound.play('heart', 0);
      }
    } else this.dangerImg.setAlpha(0);
    this.updateTutor();

    // enemies
    const og = this.overlayG;
    og.clear();
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.frameT > 0.5) {
        e.frameT = 0;
        e.frame ^= 1;
        e.img.setTexture(`e_${e.def.id}_${e.frame}`);
      }
      e.img.setPosition(e.x, e.y - e.lift).setDepth(e.y);
      // translucent ice block over frozen enemies (shatters when it thaws)
      if (e.frozenT > 0 && !e.ice) {
        e.ice = this.add.image(e.x, e.y, 'fx_ice').setOrigin(0.5, 1).setAlpha(0.8)
          .setDisplaySize(Math.max(50, e.r * 2.6), Math.max(60, e.hitY * 2.3));
      }
      if (e.ice) {
        if (e.frozenT <= 0) {
          if (!this.lowFx) this.emitters.shard.setParticleTint(0xcff0ff).explode(8, e.x, e.y - e.hitY);
          e.ice.destroy();
          e.ice = undefined;
        } else e.ice.setPosition(e.x, e.y + 4 - e.lift).setDepth(e.y + 0.5);
      }
      if (e.flashT > 0) e.img.setTintFill(0xffffff);
      else if (e.frozenT > 0) e.img.setTint(0x9fd8ff);
      else if (e.shieldT > 0) e.img.setTint(0xd8a0ff);
      else e.img.clearTint();
      if (e.def.id === 'ecoDante') e.img.setAlpha(0.85 + Math.sin(t * 6) * 0.1);
      // shadow
      const sw = e.r * 2.2;
      og.fillStyle(0x000000, 0.28);
      og.fillEllipse(e.x, e.y + 2, sw, sw * 0.28);
      // hp bar (only when damaged)
      if (e.hp < e.maxHp && !e.boss) {
        const w = Math.max(36, e.r * 1.8);
        const by = e.y - e.lift - e.hitY * 2 - 12;
        og.fillStyle(0x0a0a0a, 0.9).fillRect(e.x - w / 2 - 2, by - 2, w + 4, 9);
        og.fillStyle(0xe83a3a, 1).fillRect(e.x - w / 2, by, w * (e.hp / e.maxHp), 5);
      }
    }
    if (this.marked && this.marked.alive) {
      this.markImg.setPosition(this.marked.x, this.marked.y - this.marked.lift - this.marked.hitY).setRotation(t * 2);
    }
    // projectiles
    this.drawTrails();
    for (const p of this.projs) {
      if (!p.active) continue;
      p.img.setPosition(p.x, p.y);
      if (p.kind === 'star') p.img.rotation += 0.4;
      else if (p.kind !== 'orb' && p.kind !== 'pellet') p.img.setRotation(Math.atan2(p.vy, p.vx));
    }
    for (const p of this.eprojs) p.img.setPosition(p.x, p.y);
    // stakes wobble when low
    const low = this.hp / this.st.maxHp < 0.3;
    this.stakes.forEach((s, i) => s.setRotation(low ? Math.sin(t * 20 + i) * 0.05 : 0));

    this.updateDmgTexts(1 / 60);
    this.drawHud();
  }

  private dmgText(x: number, y: number, amount: number, crit: boolean, prefix = ''): void {
    let d = this.dmgTexts.find((q) => !q.active);
    if (!d) {
      if (this.dmgTexts.length >= 45) return;
      d = { bt: this.add.bitmapText(0, 0, 'dmg', '').setOrigin(0.5).setDepth(3000).setLetterSpacing(-19), t: 0, vy: 0, active: false };
      this.dmgTexts.push(d);
    }
    const label = prefix === 'LENTO' ? '' : prefix === '!!' ? '!!' : `${prefix}${fmtShort(amount)}${crit && !prefix ? '!' : ''}`;
    if (!label) {
      const tx = this.add.text(x, y, prefix, txt(28, '#ffffff', 6)).setOrigin(0.5).setDepth(3000);
      this.tweens.add({ targets: tx, y: y - 50, alpha: 0, duration: 700, onComplete: () => tx.destroy() });
      return;
    }
    d.active = true;
    d.t = 0;
    d.vy = -90;
    d.bt.setText(label).setPosition(x, y).setVisible(true).setAlpha(1);
    d.bt.setScale(crit ? 0.95 : 0.62);
    d.bt.setTint(prefix === '+' ? 0xffd34d : crit ? 0xffe14a : 0xffffff);
  }

  private updateDmgTexts(dt: number): void {
    for (const d of this.dmgTexts) {
      if (!d.active) continue;
      d.t += dt;
      d.bt.y += d.vy * dt;
      d.vy *= 0.94;
      if (d.t > 0.45) d.bt.setAlpha(1 - (d.t - 0.45) / 0.35);
      if (d.t > 0.8) {
        d.active = false;
        d.bt.setVisible(false);
      }
    }
  }

  private banner(text: string, color: string, y = 330, size = 64): void {
    const t = this.add.text(GAME_W / 2, y, text, { ...txt(size, color, 12), wordWrap: { width: 680 } }).setOrigin(0.5).setDepth(4000).setScale(0.4).setAlpha(0);
    this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, alpha: 0, y: y - 40, delay: 1300, duration: 400, onComplete: () => t.destroy() });
  }

  // ================================================================= pause / end
  private openPause(): void {
    if (this.paused || this.ended || this.modal) return;
    this.paused = true;
    const L = this.add.container(0, 0).setDepth(8000);
    this.modalLayer = L;
    L.add(this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.78).setInteractive());
    const g = this.add.graphics();
    drawPanel(g, 80, 250, 560, 800, 0x1c2a44, 0x05070a, 22);
    L.add(g);
    L.add(this.add.text(GAME_W / 2, 310, 'PAUSA', txt(60, '#ffffff', 10)).setOrigin(0.5));
    // run summary
    const waves = this.ch.waves === Infinity ? `${this.wave}` : `${this.wave}/${this.ch.waves}`;
    L.add(this.add.text(GAME_W / 2, 368, `${this.ch.num} · ${this.ch.name}`, txt(24, '#ffd34d', 5)).setOrigin(0.5));
    const info = this.add.graphics();
    info.fillStyle(0x0b111a, 0.8).fillRoundedRect(120, 395, 480, 74, 14);
    L.add(info);
    [['OLEADA', waves], ['NIVEL', `${this.level}`], ['ORO', fmt(this.gold)], ['BAJAS', fmt(this.kills)]].forEach(([k, v], idx) => {
      const x = 180 + idx * 120;
      L.add(this.add.text(x, 416, k, txt(16, '#9aa8b8', 4)).setOrigin(0.5));
      L.add(this.add.text(x, 448, v, txt(26, k === 'ORO' ? '#ffd34d' : '#ffffff', 5)).setOrigin(0.5));
    });

    const s = Save.d.settings;
    const close = () => {
      L.destroy();
      this.modalLayer = null;
      this.paused = false;
    };
    const toggle = (y: number, label: string, get: () => string, act: () => void, on: () => boolean) => {
      const b = button(this, GAME_W / 2, y, 440, 74, `${label}: ${get()}`, () => {
        act();
        Save.write();
        Sound.applySettings();
        b.label.setText(`${label}: ${get()}`);
        b.redraw(on() ? 0x2a7a72 : 0x3a4a5e);
      }, { color: on() ? 0x2a7a72 : 0x3a4a5e, size: 28 });
      L.add(b);
    };
    L.add(button(this, GAME_W / 2, 545, 440, 88, 'CONTINUAR', close, { color: 0x2a9d8f, size: 38 }));
    toggle(645, 'MÚSICA', () => (s.music ? 'SÍ' : 'NO'), () => { s.music = !s.music; }, () => s.music);
    toggle(730, 'SONIDOS', () => (s.sfx ? 'SÍ' : 'NO'), () => { s.sfx = !s.sfx; }, () => s.sfx);
    toggle(815, 'VELOCIDAD', () => `x${this.speed}`, () => this.toggleSpeed(), () => this.speed > 1);
    toggle(900, 'EFECTOS VISUALES', () => (s.lowFx ? 'NO' : 'SÍ'), () => { s.lowFx = !s.lowFx; this.lowFx = s.lowFx; }, () => !s.lowFx);
    let confirm = false;
    const quit = button(this, GAME_W / 2, 995, 440, 74, 'ABANDONAR', () => {
      if (!confirm) {
        confirm = true;
        quit.label.setText('¿SEGURO? Te quedas el oro');
        quit.label.setFontSize(24);
        quit.redraw(0xd8402e);
        return;
      }
      close();
      this.endRun(false, true);
    }, { color: 0xb83a3a, size: 28 });
    L.add(quit);
  }

  private endRun(victory: boolean, abandoned = false): void {
    if (this.ended) return;
    this.ended = true;
    this.modal = false;
    this.modalLayer?.destroy();
    this.modalLayer = null;
    // collect remaining coins
    for (const d of this.drops) {
      if (d.kind === 'coin') this.gold += d.value;
      d.img.destroy();
    }
    this.drops = [];

    const d = Save.d;
    const id = this.ch.id;
    const prog = d.chapters[id];
    const waveReached = victory ? this.wave : Math.max(0, this.wave - (abandoned ? 1 : 0));
    const firstClear = victory && !prog.cleared;
    if (victory) {
      prog.cleared = true;
      this.gold += Math.round(150 * this.ch.goldMult);
      this.rankXp += 50;
    }
    prog.bestWave = Math.max(prog.bestWave, waveReached);
    d.gold += this.gold;
    d.stats.runs++;
    d.stats.kills += this.kills;
    d.stats.bossKills += this.bossKills;
    d.stats.goldEarned += this.gold;
    const rankBefore = d.rank;
    // rank XP is applied (and saved) by the Results scene so it can animate the rank-up
    const rx = this.rankXp + Math.floor(this.kills / 25);
    const result = {
      chapter: id, victory, wave: this.wave, kills: this.kills, bestCombo: this.bestCombo, gold: this.gold, rankXp: rx, level: this.level,
      firstClear, rankBefore, weapon: this.weaponId,
    };
    if (!DEBUG.bot && DEBUG.meta === null) Save.write();

    if (DEBUG.bot) {
      const w = window as unknown as { __bot: object };
      w.__bot = { ...result, done: true, hp: Math.round(this.hp), maxHp: Math.round(this.st.maxHp), dmg: Math.round(this.st.dmg), stars: this.stars, skills: this.skills.map((s) => `${s.id}${s.lv}`), legends: [...this.legends], time: Math.round(this.simTime) };
      console.log('[BOT] END', JSON.stringify(w.__bot));
    }

    Sound.music(null);
    Sound.play(victory ? 'victory' : 'defeat', 0);
    this.banner(victory ? '¡VICTORIA!' : abandoned ? 'RETIRADA' : 'DERROTA', victory ? '#ffd34d' : '#ff4a6a', 560, 90);
    if (!victory) this.cameras.main.shake(400, 0.01);
    this.time.delayedCall(DEBUG.bot ? 300 : 2000, () => {
      if (DEBUG.bot) return;
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Results', result));
    });
  }

  // ================================================================= bot (testing only)
  private botT = 0;
  private bot(): void {
    const w = window as unknown as { __bot: object };
    this.botT++;
    if (this.botT % 60 === 0 && !this.ended) {
      w.__bot = { done: false, wave: this.wave, level: this.level, hp: Math.round(this.hp), maxHp: Math.round(this.st.maxHp), kills: this.kills, enemies: this.enemies.filter((e) => e.alive).length, dmg: Math.round(this.st.dmg) };
    }
    if (this.ended) return;
    if (this.modal && this.modalLayer) {
      const cards = this.modalLayer.list.filter((o) => (o as unknown as { card?: Card }).card) as unknown as { card: Card }[];
      if (cards.length) {
        const prio = (c: Card) => c.type === 'evo' ? 10 : c.type === 'weapon' ? 8 : c.type === 'legend' ? 7 : c.type === 'skill' ? 6 : c.type === 'turret' ? 5 : c.type === 'passive' ? (['filo', 'prisa', 'critico', 'estacas'].includes(c.id) ? 5 : 3) : 1;
        cards.sort((a, b) => prio(b.card) - prio(a.card) + (Math.random() - 0.5));
        this.applyCard(cards[0].card);
        this.closeCards();
      }
      return;
    }
    this.skills.forEach((s, i) => {
      if (s.cd <= 0 && this.enemies.filter((e) => this.onField(e)).length >= 3) this.useSkill(i);
    });
    // a human taps several times per second; the bot gets one look per frame
    if (this.hp / this.st.maxHp < 0.5) {
      const m = this.skills.findIndex((s) => s.id === 'muro' && s.cd <= 0);
      if (m >= 0) this.useSkill(m);
    }
    if (this.fury >= 100) this.activateFury();
    for (const d of this.drops) if (d.kind === 'coin' && !d.flying && d.t > 0.3) this.tapField(d.x, d.y);
    if (this.boss && this.boss.alive && this.marked !== this.boss) {
      this.marked = this.boss;
      this.markImg.setVisible(true);
    }
  }
}
