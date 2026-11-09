import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { Save } from '../core/save';
import { CHAPTER_ORDER, CHAPTERS, type ChapterId } from '../data/chapters';
import { button, drawPanel, fadeIn, go } from '../ui/widgets';

export class ChaptersScene extends Phaser.Scene {
  constructor() {
    super('Chapters');
  }

  create(): void {
    fadeIn(this);
    Sound.music('menu');
    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x05070a, 0.6);
    this.add.text(GAME_W / 2, 90, 'ELIGE TU BATALLA', txt(52, '#ffffff', 10)).setOrigin(0.5);
    const line = this.add.graphics();
    line.lineStyle(2, 0x6a8aa8, 1).lineBetween(180, 140, 540, 140);
    line.fillStyle(0xbfe9ff, 1).fillPoints([new Phaser.Math.Vector2(360, 132), new Phaser.Math.Vector2(368, 140), new Phaser.Math.Vector2(360, 148), new Phaser.Math.Vector2(352, 140)], true);

    const d = Save.d;
    CHAPTER_ORDER.forEach((id, i) => {
      const ch = CHAPTERS[id];
      const y = 200 + i * 235;
      const unlocked = !ch.requires || d.chapters[ch.requires].cleared;
      const prog = d.chapters[id];
      const c = this.add.container(GAME_W / 2, y);
      const g = this.add.graphics();
      drawPanel(g, -320, 0, 640, 210, unlocked ? 0x1c2a44 : 0x1a1d22, 0x05070a, 18);
      // preview strip of the chapter background
      const thumb = this.add.image(-200, 147, ch.bg).setDisplaySize(220, 391);
      const mask = this.make.graphics({}, false);
      mask.fillRoundedRect(GAME_W / 2 - 310, y + 10, 220, 190, 12);
      thumb.setMask(mask.createGeometryMask());
      if (!unlocked) thumb.setTint(0x333333);
      c.add([g, thumb]);
      c.add(this.add.text(-70, 22, ch.num, txt(24, unlocked ? '#ffd34d' : '#6a7480', 5)).setOrigin(0, 0));
      c.add(this.add.text(-70, 54, ch.name, txt(40, unlocked ? '#ffffff' : '#6a7480', 7)).setOrigin(0, 0));
      c.add(this.add.text(-70, 106, unlocked ? ch.subtitle : `Bloqueado: ${ch.requiresText}`, { ...txt(22, unlocked ? '#bfe9ff' : '#8a94a0', 4), wordWrap: { width: 370 } }).setOrigin(0, 0));
      let status = '';
      if (id === 'abismo') status = prog.bestWave > 0 ? `Récord: oleada ${prog.bestWave}` : 'Sin récord';
      else status = prog.cleared ? '✔ COMPLETADO' : prog.bestWave > 0 ? `Mejor: oleada ${prog.bestWave}/20` : 'Nuevo';
      if (unlocked) c.add(this.add.text(-70, 160, status, txt(24, prog.cleared ? '#6aff8a' : '#ffffff', 5)).setOrigin(0, 0));
      if (!unlocked) c.add(this.add.image(250, 105, 'lock'));
      const z = this.add.zone(0, 105, 640, 210).setInteractive({ useHandCursor: true });
      c.add(z);
      z.on('pointerdown', () => {
        Sound.unlock();
        if (!unlocked) {
          Sound.play('error');
          this.tweens.add({ targets: c, x: c.x + 10, duration: 50, yoyo: true, repeat: 2 });
          return;
        }
        Sound.play('click');
        this.pick(id);
      });
    });

    button(this, GAME_W / 2, 1200, 300, 80, 'VOLVER', () => go(this, 'Menu'), { size: 32, color: 0x3a4a5e });
  }

  private pick(id: ChapterId): void {
    const ch = CHAPTERS[id];
    if (ch.intro && !Save.d.storySeen.includes(ch.intro)) {
      go(this, 'Story', { id: ch.intro, next: { scene: 'WeaponSelect', data: { chapter: id } } });
    } else {
      go(this, 'WeaponSelect', { chapter: id });
    }
  }
}
