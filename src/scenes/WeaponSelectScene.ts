import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { Save } from '../core/save';
import { weaponUnlocked } from '../core/stats';
import { CHAPTERS, type ChapterId } from '../data/chapters';
import { WEAPON_ORDER, WEAPONS } from '../data/weapons';
import { button, drawPanel, fadeIn, go, iconBox } from '../ui/widgets';

export class WeaponSelectScene extends Phaser.Scene {
  private chapter: ChapterId = 'c1';
  constructor() {
    super('WeaponSelect');
  }

  init(data: { chapter?: ChapterId }): void {
    this.chapter = data.chapter ?? 'c1';
  }

  create(): void {
    fadeIn(this);
    const ch = CHAPTERS[this.chapter];
    this.add.image(GAME_W / 2, GAME_H / 2, ch.bg);
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x05070a, 0.72);
    this.add.text(GAME_W / 2, 80, `${ch.num} · ${ch.name}`, txt(28, '#ffd34d', 6)).setOrigin(0.5);
    this.add.text(GAME_W / 2, 140, 'SELECCIONA ARMA', txt(54, '#ffffff', 10)).setOrigin(0.5);
    const line = this.add.graphics();
    line.lineStyle(2, 0x6a8aa8, 1).lineBetween(170, 190, 550, 190);

    const d = Save.d;
    WEAPON_ORDER.forEach((id, i) => {
      const w = WEAPONS[id];
      const unlocked = weaponUnlocked(d, id);
      const y = 230 + i * 182;
      const c = this.add.container(GAME_W / 2, y);
      const g = this.add.graphics();
      const sel = d.lastWeapon === id;
      drawPanel(g, -330, 0, 660, 165, unlocked ? (sel ? 0x24365a : 0x1c2a44) : 0x1a1d22, sel ? 0xffc93c : 0x05070a, 14);
      c.add(g);
      const ic = iconBox(this, -250, 82, 116, `ic_${id}`, '', 0xf6a63a);
      if (!unlocked) ic.setAlpha(0.35);
      c.add(ic);
      c.add(this.add.text(-170, 20, w.name, txt(38, unlocked ? '#ffc93c' : '#6a7480', 7)).setOrigin(0, 0));
      if (unlocked) {
        c.add(this.add.text(-170, 70, w.desc, { ...txt(22, '#bfe9ff', 4), align: 'left', lineSpacing: 2 }).setOrigin(0, 0));
        c.add(this.add.text(300, 130, `Nv. ${d.weaponLv[id]}`, txt(26, '#6aff8a', 5)).setOrigin(1, 0.5));
      } else {
        c.add(this.add.text(-170, 82, `Bloqueado: ${w.unlockText}`, txt(24, '#8a94a0', 4)).setOrigin(0, 0));
        c.add(this.add.image(270, 90, 'lock'));
      }
      const z = this.add.zone(0, 82, 660, 165).setInteractive({ useHandCursor: true });
      c.add(z);
      z.on('pointerdown', () => {
        Sound.unlock();
        if (!unlocked) {
          Sound.play('error');
          return;
        }
        Sound.play('click');
        d.lastWeapon = id;
        Save.write();
        this.tweens.add({ targets: c, scale: 1.04, duration: 90, yoyo: true });
        go(this, 'Battle', { chapter: this.chapter, weapon: id });
      });
    });

    button(this, GAME_W / 2, 1200, 300, 80, 'VOLVER', () => go(this, 'Chapters'), { size: 32, color: 0x3a4a5e });
  }
}
