import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { fmt } from '../core/format';
import { rankXpNeed, Save } from '../core/save';
import { armorUnlocked, power } from '../core/stats';
import { ARMORS } from '../data/armor';
import { CHAPTER_ORDER, CHAPTERS } from '../data/chapters';
import { drawCharacter } from '../gfx/characters';
import { drawStickman, POSES } from '../gfx/stickman';
import { button, drawPanel, fadeIn, go, goldLabel, onUpdate } from '../ui/widgets';

export class MenuScene extends Phaser.Scene {
  private t = 0;
  constructor() {
    super('Menu');
  }

  create(): void {
    fadeIn(this);
    Sound.music('menu');
    const d = Save.d;

    // auto-equip newly unlocked armor
    for (let tier = ARMORS.length - 1; tier > d.armorSeen; tier--) {
      if (armorUnlocked(d, tier)) {
        d.armorSeen = tier;
        d.armorEquipped = tier;
        Save.write();
        this.time.delayedCall(500, () => this.toast(`¡Nueva armadura: ${ARMORS[tier].name}!`));
        break;
      }
    }

    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.25);

    // top bar
    const top = this.add.graphics();
    drawPanel(top, 16, 16, GAME_W - 32, 84, 0x141c26, 0x05070a, 18);
    goldLabel(this, 52, 58, fmt(d.gold), 34);
    this.add.text(GAME_W - 40, 44, `RANGO ${d.rank}`, txt(30, '#5fe0d2', 6)).setOrigin(1, 0.5);
    const need = rankXpNeed(d.rank);
    const bar = this.add.graphics();
    bar.fillStyle(0x05070a, 1).fillRoundedRect(GAME_W - 250, 68, 210, 16, 8);
    bar.fillStyle(0x5fe0d2, 1).fillRoundedRect(GAME_W - 248, 70, Math.max(8, 206 * (d.rankXp / need)), 12, 6);

    // title
    this.add.image(GAME_W / 2, 178, 'logo').setScale(0.52);

    // hero + goal silhouette
    const p = power(d);
    // the goal silhouette is baked into a render texture so its alpha applies to the whole figure
    const goalPen = this.make.graphics({}, false);
    const goal = this.add.renderTexture(560, 820, 400, 520).setOrigin(0.5, 460 / 520).setAlpha(0.4);
    // pedestal: soft teal glow under the hero
    this.add.image(280, 862, 'fx_glow').setScale(4.2, 1.1).setTint(0x2ad4c4).setAlpha(0.45).setBlendMode(Phaser.BlendModes.ADD);
    const hero = this.add.graphics({ x: 280, y: 860 });
    this.add.text(280, 330, fmt(p), txt(96, p >= 100000 ? '#d050ff' : '#e8f040', 14)).setOrigin(0.5);
    this.add.text(280, 400, 'PODER', txt(26, '#ffffff', 6)).setOrigin(0.5);
    const fin = d.finale;
    // after the finale the goal becomes the outcome: brother at your side, or a revenge fulfilled
    if (fin === 'liberacion') goal.setAlpha(1);
    if (fin === 'venganza') goal.setAlpha(0.18);
    const gt = this.add.text(560, 420, fin === 'liberacion' ? 'HERMANO' : fin === 'venganza' ? 'VENGANZA' : '100.000', txt(48, fin === 'liberacion' ? '#6fe3d6' : fin === 'venganza' ? '#ff6a6a' : '#d050ff', 10)).setOrigin(0.5).setAlpha(fin ? 1 : 0.7);
    gt.setShadow(0, 0, fin === 'liberacion' ? '#2ad4c4' : fin === 'venganza' ? '#ff4a4a' : '#d050ff', 18, true, true);
    this.add.text(560, 462, fin === 'liberacion' ? 'JURAMENTO CUMPLIDO' : fin === 'venganza' ? 'CUMPLIDA' : 'META: DANTE', txt(22, fin === 'liberacion' ? '#bfffee' : '#d8b0ff', 5)).setOrigin(0.5).setAlpha(0.85);

    // progress to goal
    const prog = Math.min(1, p / 100000);
    const pg = this.add.graphics();
    pg.fillStyle(0x05070a, 0.8).fillRoundedRect(110, 880, 500, 26, 13);
    pg.fillStyle(0xe8f040, 1).fillRoundedRect(113, 883, Math.max(20, 494 * Math.pow(prog, 0.5)), 20, 10);
    this.add.text(GAME_W / 2, 893, `Camino a los 100.000 · ${(prog * 100).toFixed(1).replace('.', ',')}%`, txt(18, '#ffffff', 4)).setOrigin(0.5);
    this.add.text(280, 920, ARMORS[d.armorEquipped].name, txt(22, '#bfe9ff', 5)).setOrigin(0.5);

    onUpdate(this, (_t: number, dt: number) => {
      this.t += dt / 1000;
      hero.clear().fillStyle(0x000000, 0.3).fillEllipse(0, 4, 110, 26);
      drawStickman(hero, 0, 0, 2.6, POSES.idle(this.t), { tier: d.armorEquipped, eyes: 'determined', weapon: d.lastWeapon }, 1, this.t);
      drawCharacter(goalPen, fin === 'liberacion' ? { id: 'danteLibre', eyes: 'happy', mouth: 'grin', pose: 'idle' } : { id: 'dante', eyes: 'smug', pose: 'cross' }, 0, 2.0, -1, this.t);
      goal.clear().draw(goalPen, 200, 460);
    });

    // buttons
    const withIcon = (b: ReturnType<typeof button>, icon: string, dx: number, scale = 0.8) => {
      b.add(this.add.image(dx, -2, icon).setScale(scale));
      b.label.setX(b.label.x + 28);
      return b;
    };
    const fight = withIcon(button(this, GAME_W / 2, 1010, 520, 110, '¡COMBATIR!', () => go(this, 'Chapters'), { size: 54, color: 0xe2552c }), 'ui_swords', -190, 1.05);
    this.tweens.add({ targets: fight, scale: 1.03, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    withIcon(button(this, 190, 1150, 300, 90, 'TALLER', () => go(this, 'Workshop'), { size: 36, color: 0x2a9d8f }), 'ui_hammer', -90, 0.75);
    withIcon(button(this, 530, 1150, 300, 90, 'HISTORIA', () => go(this, 'Settings', { tab: 'story' }), { size: 36, color: 0x6a4ac0 }), 'ui_book', -100, 0.75);
    button(this, GAME_W - 56, 178, 76, 64, '', () => go(this, 'Settings', { tab: 'settings' }), { color: 0x3a4a5e }).add(this.add.image(0, 0, 'gear').setScale(0.9));

    // cheap affordance: show if something is affordable in the workshop
    // next goal: first unlocked chapter not cleared yet (or the endless record)
    const next = CHAPTER_ORDER.find((id) => id !== 'abismo' && !d.chapters[id].cleared && (!CHAPTERS[id].requires || d.chapters[CHAPTERS[id].requires!].cleared));
    const goalText = next ? `Siguiente: ${CHAPTERS[next].num} · ${CHAPTERS[next].name}` : `Récord del Abismo: oleada ${d.chapters.abismo.bestWave}`;
    this.add.text(GAME_W / 2, 1240, goalText, txt(22, '#bfe9ff', 5)).setOrigin(0.5);
  }

  private toast(msg: string): void {
    const t = this.add.text(GAME_W / 2, 560, msg, { ...txt(34, '#ffd34d', 8), wordWrap: { width: 640 } }).setOrigin(0.5).setDepth(100).setScale(0.5);
    Sound.play('legend');
    this.tweens.add({ targets: t, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, alpha: 0, delay: 2600, duration: 500, onComplete: () => t.destroy() });
  }
}
