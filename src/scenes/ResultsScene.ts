import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { fmt, pick } from '../core/format';
import { addRankXp, Save } from '../core/save';
import { armorUnlocked } from '../core/stats';
import { ARMORS } from '../data/armor';
import { CHAPTERS, type ChapterId } from '../data/chapters';
import { DEFEAT_QUIPS, VICTORY_QUIPS } from '../data/story';
import { WEAPONS, type WeaponId } from '../data/weapons';
import { drawCharacter } from '../gfx/characters';
import { button, drawPanel, fadeIn, go } from '../ui/widgets';

interface Result {
  chapter: ChapterId; victory: boolean; wave: number; kills: number; gold: number; rankXp: number;
  level: number; firstClear: boolean; rankBefore: number; weapon: WeaponId;
}

export class ResultsScene extends Phaser.Scene {
  private r!: Result;
  private t = 0;
  constructor() {
    super('Results');
  }

  init(data: Result): void {
    this.r = data;
  }

  create(): void {
    fadeIn(this, 300);
    const r = this.r;
    const ch = CHAPTERS[r.chapter];
    const d = Save.d;
    const ranks = addRankXp(r.rankXp);
    Save.write();
    Sound.music(r.victory ? 'menu' : 'sad');

    this.add.image(GAME_W / 2, GAME_H / 2, ch.bg);
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x05070a, 0.75);
    const title = this.add.text(GAME_W / 2, 120, r.victory ? '¡VICTORIA!' : 'DERROTA', txt(92, r.victory ? '#ffd34d' : '#ff4a6a', 14)).setOrigin(0.5).setScale(0.5);
    this.tweens.add({ targets: title, scale: 1, duration: 400, ease: 'Back.easeOut' });
    this.add.text(GAME_W / 2, 200, `${ch.num} · ${ch.name}`, txt(28, '#bfe9ff', 6)).setOrigin(0.5);

    const g = this.add.graphics();
    drawPanel(g, 60, 250, 600, 420, 0x1c2a44, 0x05070a, 20);
    const rows: [string, string, string][] = [
      ['Oleada alcanzada', ch.waves === Infinity ? `${r.wave}` : `${r.wave}/${ch.waves}`, '#ffffff'],
      ['Nivel en batalla', `Lv.${r.level}`, '#5fe0d2'],
      ['Enemigos eliminados', fmt(r.kills), '#ffffff'],
      ['XP de Rango', `+${fmt(r.rankXp)}`, '#5fe0d2'],
      ['Oro ganado', `+${fmt(r.gold)}`, '#ffd34d'],
    ];
    rows.forEach(([k, v, c], i) => {
      const y = 300 + i * 72;
      this.add.text(100, y, k, txt(30, '#bfc8d4', 5)).setOrigin(0, 0);
      const vt = this.add.text(620, y, v, txt(36, c, 6)).setOrigin(1, 0).setAlpha(0);
      this.tweens.add({ targets: vt, alpha: 1, x: { from: 660, to: 620 }, delay: 250 + i * 160, duration: 220, onStart: () => Sound.play('coin', 0) });
    });

    // unlocks
    const unlocks: string[] = [];
    if (ranks > 0) unlocks.push(`¡Subiste a RANGO ${d.rank}!`);
    if (r.firstClear) {
      if (r.chapter === 'c1') unlocks.push(`Nueva arma: ${WEAPONS.escopeta.name}`, 'Capítulo 2 desbloqueado');
      if (r.chapter === 'c2') unlocks.push(`Nueva arma: ${WEAPONS.shuriken.name}`, 'Capítulo 3 desbloqueado');
      if (r.chapter === 'c3') unlocks.push('¡EL ABISMO desbloqueado!');
    }
    ARMORS.forEach((a, i) => {
      if (i > d.armorSeen && armorUnlocked(d, i)) unlocks.push(`Armadura: ${a.name}`);
    });
    unlocks.forEach((u, i) => {
      const t = this.add.text(GAME_W / 2, 715 + i * 44, u, txt(30, '#6aff8a', 6)).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, delay: 1100 + i * 200, duration: 300, onStart: () => Sound.play('legend', 0) });
    });

    // Tío Clip quip
    const clipG = this.add.graphics({ x: 110, y: 1090 });
    const quip = r.victory ? pick(VICTORY_QUIPS) : pick(DEFEAT_QUIPS);
    const bubble = this.add.graphics();
    drawPanel(bubble, 180, 930, 500, 120, 0xf2efe6, 0x05070a, 18);
    bubble.fillStyle(0xf2efe6, 1).fillTriangle(180, 1010, 150, 1030, 190, 1040);
    this.add.text(430, 990, quip, { ...txt(26, '#1a1a1a', 0), wordWrap: { width: 470 } }).setOrigin(0.5);
    this.events.on('update', (_a: number, dt: number) => {
      this.t += dt / 1000;
      drawCharacter(clipG, { id: 'clip', eyes: 'cool', mouth: r.victory ? 'grin' : 'frown', pose: r.victory ? 'point' : 'cross' }, 0, 1.4, 1, this.t);
    });

    const outro = r.victory && r.firstClear && ch.outro && !d.storySeen.includes(ch.outro) ? ch.outro : null;
    if (outro) {
      button(this, GAME_W / 2, 1180, 460, 96, 'CONTINUAR', () => go(this, 'Story', { id: outro, next: { scene: 'Menu' } }), { color: 0xe2552c, size: 40 });
    } else {
      button(this, 190, 1180, 300, 90, 'MENÚ', () => go(this, 'Menu'), { color: 0x3a4a5e, size: 36 });
      button(this, 530, 1180, 300, 90, r.victory ? 'OTRA VEZ' : 'REINTENTAR', () => go(this, 'Battle', { chapter: r.chapter, weapon: r.weapon }), { color: 0xe2552c, size: 34 });
    }
  }
}
