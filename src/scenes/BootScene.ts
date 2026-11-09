import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { DEBUG } from '../core/debug';
import { Save } from '../core/save';
import type { ChapterId } from '../data/chapters';
import type { WeaponId } from '../data/weapons';
import { generateBackgrounds } from '../gfx/backgrounds';
import { drawCharacter } from '../gfx/characters';
import { generateTextures } from '../gfx/textures';
import { generateFx } from '../gfx/fx';
import { onUpdate } from '../ui/widgets';
import { STORY_ORDER } from '../data/story';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    generateTextures(this);
    generateFx(this);
    generateBackgrounds(this);
    this.makeDamageFont();

    if (DEBUG.meta !== null || DEBUG.armor !== null || DEBUG.unlock) {
      const d = Save.fresh();
      const m = DEBUG.meta ?? 0;
      for (const k of Object.keys(d.upgrades)) (d.upgrades as Record<string, number>)[k] = m;
      for (const k of Object.keys(d.weaponLv)) (d.weaponLv as Record<string, number>)[k] = Math.min(10, 1 + Math.floor(m / 3));
      d.armorEquipped = DEBUG.armor ?? 0;
      d.rank = 1 + Math.floor(m / 2);
      d.storySeen = ['prologo1', 'prologo2', 'c1_intro', 'c2_intro', 'c3_intro'];
      d.settings.music = false;
      d.settings.sfx = false;
      if (DEBUG.unlock) {
        for (const c of Object.values(d.chapters)) { c.cleared = true; c.bestWave = 20; }
        d.storySeen = STORY_ORDER.filter((s) => !s.startsWith('final_'));
        d.gold = 12345;
      }
      Save.override(d);
    }

    if (DEBUG.bot || DEBUG.chapter) {
      this.scene.start('Battle', { chapter: (DEBUG.chapter ?? 'c1') as ChapterId, weapon: (DEBUG.weapon ?? 'arco') as WeaponId });
      return;
    }
    if (DEBUG.scene) {
      const [s, arg] = DEBUG.scene.split(':');
      const map: Record<string, string> = { menu: 'Menu', workshop: 'Workshop', chapters: 'Chapters', story: 'Story', weapons: 'WeaponSelect', settings: 'Settings', gallery: 'Gallery' };
      this.scene.start(map[s] ?? 'Menu', s === 'story' ? { id: arg ?? 'prologo2', next: { scene: 'Menu' } } : s === 'gallery' ? { page: Number(arg ?? 0) } : { chapter: 'c1' });
      return;
    }
    this.titleScreen();
  }

  private makeDamageFont(): void {
    if (this.cache.bitmapFont.exists('dmg')) return;
    const chars = '0123456789KM,!+';
    const cw = 44;
    const ch = 58;
    const canvas = document.createElement('canvas');
    canvas.width = cw * chars.length;
    canvas.height = ch;
    const ctx = canvas.getContext('2d')!;
    ctx.font = '42px "Lilita One", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#0a0a0a';
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < chars.length; i++) {
      ctx.strokeText(chars[i], i * cw + cw / 2, ch / 2 + 2);
      ctx.fillText(chars[i], i * cw + cw / 2, ch / 2 + 2);
    }
    this.textures.addCanvas('dmgfont', canvas);
    this.cache.bitmapFont.add('dmg', Phaser.GameObjects.RetroFont.Parse(this, {
      image: 'dmgfont', width: cw, height: ch, chars, charsPerRow: chars.length,
      'offset.x': 0, 'offset.y': 0, 'spacing.x': 0, 'spacing.y': 0, lineSpacing: 0,
    } as unknown as Phaser.Types.GameObjects.BitmapText.RetroFontConfig));
  }

  private titleScreen(): void {
    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.35);
    const lino = this.add.graphics({ x: 230, y: 1010 });
    const dante = this.add.graphics({ x: 500, y: 1010 });
    this.add.image(GAME_W / 2, 270, 'inksplash');
    const title = this.add.text(GAME_W / 2, 250, 'JURAMENTO\nDE TINTA', { ...txt(96, '#ffffff', 14), lineSpacing: -10 }).setOrigin(0.5);
    title.setShadow(0, 6, '#2ad4c4', 0, true, false);
    this.add.text(GAME_W / 2, 420, 'Hermanos de trazo. Enemigos de poder.', txt(28, '#bfe9ff', 6)).setOrigin(0.5);
    const tap = this.add.text(GAME_W / 2, 1150, 'TOCA PARA EMPEZAR', txt(40, '#ffd34d', 8)).setOrigin(0.5);
    this.tweens.add({ targets: tap, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
    this.add.text(GAME_W / 2, 1240, 'v0.1 · MVP', txt(20, '#8899aa', 4)).setOrigin(0.5);

    onUpdate(this, (time: number) => {
      const t = time / 1000;
      drawCharacter(lino, { id: 'lino', eyes: 'angry', pose: 'fist' }, Save.d.armorEquipped, 2.3, 1, t);
      drawCharacter(dante, { id: 'dante', eyes: 'smug', pose: 'cross' }, 0, 2.3, -1, t);
    });

    this.input.once('pointerdown', () => {
      Sound.unlock();
      Sound.play('click');
      Sound.music('menu');
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (!Save.d.storySeen.includes('prologo1')) {
          this.scene.start('Story', { id: 'prologo1', next: { scene: 'Story', data: { id: 'prologo2', next: { scene: 'Menu' } } } });
        } else {
          this.scene.start('Menu');
        }
      });
    });
  }
}
