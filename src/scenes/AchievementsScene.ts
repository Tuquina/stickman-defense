import { GAME_H, GAME_W, ttl, txt } from '../config';
import { Sound } from '../core/audio';
import { fmt } from '../core/format';
import { Save } from '../core/save';
import { ACHIEVEMENTS, achDone, type AchDef } from '../data/achievements';
import { button, drawPanel, fadeIn, go, goldLabel, scrollList } from '../ui/widgets';

/** Achievements: progress bars, gold rewards to claim. */
export class AchievementsScene extends Phaser.Scene {
  constructor() {
    super('Achievements');
  }

  create(): void {
    fadeIn(this);
    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x05070a, 0.74);
    this.build();
  }

  private build(): void {
    const d = Save.d;
    this.add.text(GAME_W / 2, 80, 'LOGROS', ttl(56, '#ffffff', 10)).setOrigin(0.5);
    const done = ACHIEVEMENTS.filter((a) => d.achClaimed.includes(a.id)).length;
    this.add.text(GAME_W / 2, 136, `${done} de ${ACHIEVEMENTS.length} reclamados`, txt(24, '#bfe9ff', 5)).setOrigin(0.5);
    const gold = goldLabel(this, 50, 190, fmt(d.gold), 32);
    void gold;

    // claimable first, then in progress, then claimed
    const order = (a: AchDef) => (d.achClaimed.includes(a.id) ? 2 : achDone(d, a) ? 0 : 1);
    const list = [...ACHIEVEMENTS].sort((a, b) => order(a) - order(b));
    const ROW = 132;
    const top = 230;
    const bottom = 1130;
    const sl = scrollList(this, top, bottom, list.length * ROW + 10);
    list.forEach((a, i) => {
      const y = i * ROW + 6;
      const claimed = d.achClaimed.includes(a.id);
      const ready = achDone(d, a) && !claimed;
      const g = this.add.graphics();
      drawPanel(g, 30, y, 660, ROW - 12, ready ? 0x2a3a24 : claimed ? 0x1a1d22 : 0x1c2a44, ready ? 0xffd34d : 0x05070a, 14);
      sl.add(g);
      sl.add(this.add.text(52, y + 14, a.cat.toUpperCase(), txt(15, '#9aa8b8', 3)).setOrigin(0, 0));
      sl.add(this.add.text(52, y + 32, a.name, txt(28, claimed ? '#8a94a0' : '#ffc93c', 6)).setOrigin(0, 0));
      sl.add(this.add.text(52, y + 68, a.desc, txt(20, '#bfe9ff', 4)).setOrigin(0, 0));
      // progress bar
      const v = Math.min(a.value(d), a.goal);
      const bw = 300;
      const bar = this.add.graphics();
      bar.fillStyle(0x0b111a, 1).fillRoundedRect(52, y + 96, bw, 12, 6);
      bar.fillStyle(claimed ? 0x5a6470 : ready ? 0xffd34d : 0x2ad4c4, 1).fillRoundedRect(52, y + 96, Math.max(12, bw * (v / a.goal)), 12, 6);
      sl.add(bar);
      sl.add(this.add.text(52 + bw + 12, y + 102, a.goal > 1 ? `${fmt(v)}/${fmt(a.goal)}` : v >= 1 ? 'Hecho' : 'Pendiente', txt(17, '#ffffff', 4)).setOrigin(0, 0.5));
      // reward / claim
      if (claimed) {
        sl.add(this.add.text(610, y + ROW / 2 - 6, '✓', txt(48, '#6aff8a', 6)).setOrigin(0.5));
      } else {
        const b = button(this, 590, y + 58, 170, 70, ready ? 'RECLAMAR' : fmt(a.reward), () => {}, { size: ready ? 24 : 26, color: ready ? 0xe2a020 : 0x3a4a5e, disabled: !ready });
        if (!ready) {
          b.label.setX(14);
          b.addAt(this.add.image(-50, -1, 'coin').setScale(0.85), 2);
        }
        const z = b.list[b.list.length - 1] as Phaser.GameObjects.Zone;
        z.removeAllListeners('pointerdown');
        z.on('pointerup', (p: Phaser.Input.Pointer) => {
          if (!sl.isTap(p) || !ready) return;
          d.achClaimed.push(a.id);
          d.gold += a.reward;
          Save.write();
          Sound.play('legend');
          this.coinBurst(p.x, p.y, a.reward);
          this.time.delayedCall(450, () => this.scene.restart());
        });
        sl.add(b);
      }
    });
    this.add.text(GAME_W / 2, 1148, 'Desliza para ver más', txt(18, '#9aa8b8', 4)).setOrigin(0.5);
    button(this, GAME_W / 2, 1210, 300, 76, 'VOLVER', () => go(this, 'Menu'), { size: 32, color: 0x3a4a5e });
  }

  private coinBurst(x: number, y: number, amount: number): void {
    for (let i = 0; i < 14; i++) {
      const c = this.add.image(x, y, 'coin').setDepth(50).setScale(0.8);
      this.tweens.add({ targets: c, x: 60 + Math.random() * 40, y: 190, delay: i * 25, duration: 420, ease: 'Quad.easeIn', onComplete: () => c.destroy() });
    }
    const t = this.add.text(x, y - 40, `+${fmt(amount)}`, ttl(44, '#ffd34d', 8)).setOrigin(0.5).setDepth(51);
    this.tweens.add({ targets: t, y: y - 120, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }
}
