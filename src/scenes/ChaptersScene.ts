import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { Save } from '../core/save';
import { CHAPTER_ORDER, CHAPTERS, type ChapterId } from '../data/chapters';
import { button, drawPanel, fadeIn, go, scrollList } from '../ui/widgets';
import { ensureBackground } from '../gfx/backgrounds';

export class ChaptersScene extends Phaser.Scene {
  constructor() {
    super('Chapters');
  }

  create(): void {
    fadeIn(this);
    Sound.music('menu');
    for (const id of CHAPTER_ORDER) ensureBackground(this, CHAPTERS[id].bg);
    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x05070a, 0.6);
    this.add.text(GAME_W / 2, 90, 'ELIGE TU BATALLA', txt(52, '#ffffff', 10)).setOrigin(0.5);
    const line = this.add.graphics();
    line.lineStyle(2, 0x6a8aa8, 1).lineBetween(180, 140, 540, 140);
    line.fillStyle(0xbfe9ff, 1).fillPoints([new Phaser.Math.Vector2(360, 132), new Phaser.Math.Vector2(368, 140), new Phaser.Math.Vector2(360, 148), new Phaser.Math.Vector2(352, 140)], true);

    const d = Save.d;
    const CARD = 190;
    const STEP = 206;
    const list = scrollList(this, 165, 1135, CHAPTER_ORDER.length * STEP);
    let focus = 0;
    CHAPTER_ORDER.forEach((id, i) => {
      const ch = CHAPTERS[id];
      const y = i * STEP + 8;
      const unlocked = !ch.requires || d.chapters[ch.requires].cleared;
      if (unlocked && !d.chapters[id].cleared && id !== 'abismo' && !focus) focus = Math.max(0, y - 220);
      const prog = d.chapters[id];
      const c = this.add.container(GAME_W / 2, y);
      const g = this.add.graphics();
      drawPanel(g, -320, 0, 640, CARD, unlocked ? 0x1c2a44 : 0x1a1d22, 0x05070a, 18);
      // preview of the chapter background (cropped, no nested masks)
      const k = 220 / GAME_W;
      const cropY = 250;
      const thumb = this.add.image(-310, 10 - cropY * k, ch.bg).setOrigin(0, 0).setScale(k).setCrop(0, cropY, GAME_W, (CARD - 20) / k);
      if (!unlocked) thumb.setTint(0x333333);
      const frame = this.add.graphics();
      frame.lineStyle(3, 0x05070a, 1).strokeRect(-310, 10, 220, CARD - 20);
      c.add([g, thumb, frame]);
      c.add(this.add.text(-70, 18, ch.num, txt(22, unlocked ? '#ffd34d' : '#6a7480', 5)).setOrigin(0, 0));
      // gold reward multiplier: later chapters pay proportionally more
      c.add(this.add.image(232, 30, 'coin').setScale(0.85).setAlpha(unlocked ? 1 : 0.4));
      c.add(this.add.text(250, 30, `×${ch.goldMult}`, txt(22, unlocked ? '#ffd34d' : '#6a7480', 5)).setOrigin(0, 0.5));
      c.add(this.add.text(-70, 46, ch.name, txt(36, unlocked ? '#ffffff' : '#6a7480', 7)).setOrigin(0, 0));
      c.add(this.add.text(-70, 94, unlocked ? ch.subtitle : `Bloqueado: ${ch.requiresText}`, { ...txt(21, unlocked ? '#bfe9ff' : '#8a94a0', 4), wordWrap: { width: 370 } }).setOrigin(0, 0));
      let status = '';
      if (id === 'abismo') status = prog.bestWave > 0 ? `Récord: oleada ${prog.bestWave}` : 'Sin récord';
      else status = prog.cleared ? '✔ COMPLETADO' : prog.bestWave > 0 ? `Mejor: oleada ${prog.bestWave}/20` : 'Nuevo';
      if (unlocked) c.add(this.add.text(-70, 146, status, txt(23, prog.cleared ? '#6aff8a' : '#ffffff', 5)).setOrigin(0, 0));
      if (!unlocked) c.add(this.add.image(250, CARD / 2, 'lock'));
      const z = this.add.zone(0, CARD / 2, 640, CARD).setInteractive({ useHandCursor: true });
      c.add(z);
      z.on('pointerup', (p: Phaser.Input.Pointer) => {
        if (!list.isTap(p)) return;
        Sound.unlock();
        if (!unlocked) {
          Sound.play('error');
          this.tweens.add({ targets: c, x: c.x + 10, duration: 50, yoyo: true, repeat: 2 });
          return;
        }
        Sound.play('click');
        this.pick(id);
      });
      list.add(c);
    });
    list.scrollTo(focus);
    this.add.text(GAME_W / 2, 1150, 'Desliza para ver más', txt(18, '#9aa8b8', 4)).setOrigin(0.5);

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
