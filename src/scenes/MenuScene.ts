import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { fmt } from '../core/format';
import { rankXpNeed, Save } from '../core/save';
import { armorUnlocked, power } from '../core/stats';
import { ARMORS } from '../data/armor';
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
    const title = this.add.text(GAME_W / 2, 170, 'JURAMENTO DE TINTA', txt(56, '#ffffff', 10)).setOrigin(0.5);
    title.setShadow(0, 5, '#2ad4c4', 0, true, false);

    // hero + goal silhouette
    const p = power(d);
    // the goal silhouette is baked into a render texture so its alpha applies to the whole figure
    const goalPen = this.make.graphics({}, false);
    const goal = this.add.renderTexture(560, 820, 400, 520).setOrigin(0.5, 460 / 520).setAlpha(0.4);
    const hero = this.add.graphics({ x: 280, y: 860 });
    this.add.text(280, 330, fmt(p), txt(96, p >= 100000 ? '#d050ff' : '#e8f040', 14)).setOrigin(0.5);
    this.add.text(280, 400, 'PODER', txt(26, '#ffffff', 6)).setOrigin(0.5);
    const gt = this.add.text(560, 420, '100.000', txt(48, '#d050ff', 10)).setOrigin(0.5).setAlpha(0.7);
    gt.setShadow(0, 0, '#d050ff', 18, true, true);
    this.add.text(560, 462, 'META: DANTE', txt(22, '#d8b0ff', 5)).setOrigin(0.5).setAlpha(0.8);

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
      drawCharacter(goalPen, { id: 'dante', eyes: 'smug', pose: 'cross' }, 0, 2.0, -1, this.t);
      goal.clear().draw(goalPen, 200, 460);
    });

    // buttons
    button(this, GAME_W / 2, 1010, 520, 110, '¡COMBATIR!', () => go(this, 'Chapters'), { size: 54, color: 0xe2552c });
    button(this, 190, 1150, 300, 90, 'TALLER', () => go(this, 'Workshop'), { size: 36, color: 0x2a9d8f });
    button(this, 530, 1150, 300, 90, 'HISTORIA', () => go(this, 'Settings', { tab: 'story' }), { size: 36, color: 0x6a4ac0 });
    button(this, GAME_W - 60, 250, 76, 64, '', () => go(this, 'Settings', { tab: 'settings' }), { color: 0x3a4a5e }).add(this.add.image(0, 0, 'gear').setScale(0.9));

    // cheap affordance: show if something is affordable in the workshop
    this.add.text(GAME_W / 2, 1238, d.stats.runs === 0 ? 'Empieza por el Capítulo 1' : `Partidas: ${d.stats.runs} · Eliminaciones: ${fmt(d.stats.kills)}`, txt(20, '#9aa8b8', 4)).setOrigin(0.5);
  }

  private toast(msg: string): void {
    const t = this.add.text(GAME_W / 2, 560, msg, { ...txt(34, '#ffd34d', 8), wordWrap: { width: 640 } }).setOrigin(0.5).setDepth(100).setScale(0.5);
    Sound.play('legend');
    this.tweens.add({ targets: t, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, alpha: 0, delay: 2600, duration: 500, onComplete: () => t.destroy() });
  }
}
