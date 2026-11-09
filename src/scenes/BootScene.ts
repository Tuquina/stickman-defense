import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { DEBUG } from '../core/debug';
import { fmt } from '../core/format';
import { Save } from '../core/save';
import { power } from '../core/stats';
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
      const map: Record<string, string> = { menu: 'Menu', workshop: 'Workshop', chapters: 'Chapters', story: 'Story', weapons: 'WeaponSelect', settings: 'Settings', gallery: 'Gallery', results: 'Results', credits: 'Credits', story_list: 'Settings' };
      const data: Record<string, object> = {
        story: { id: arg ?? 'prologo2', next: { scene: 'Menu' } },
        gallery: { page: Number(arg ?? 0) },
        results: { chapter: 'c2', victory: arg !== 'lose', wave: arg === 'lose' ? 11 : 20, kills: 612, bestCombo: 48, gold: 7340, rankXp: 340, level: 41, firstClear: arg !== 'lose', rankBefore: 3, weapon: 'arco' },
        credits: { finale: arg ?? 'liberacion' },
        story_list: { tab: 'story' },
      };
      this.scene.start(map[s] ?? 'Menu', data[s] ?? { chapter: 'c1' });
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
    const d = Save.d;
    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    // mood: darker edges, slowly turning light rays behind the logo
    const grad = this.add.graphics();
    for (let i = 0; i < 40; i++) {
      grad.fillStyle(0x05070a, 0.55 * (1 - i / 40));
      grad.fillRect(0, i * 6, GAME_W, 6);
      grad.fillStyle(0x05070a, 0.7 * (i / 40));
      grad.fillRect(0, 1040 + i * 6, GAME_W, 6);
    }
    const rays = this.add.image(GAME_W / 2, 250, 'fx_rays').setScale(2.4).setAlpha(0.16).setBlendMode(Phaser.BlendModes.ADD).setTint(0x9af0ff);
    this.tweens.add({ targets: rays, angle: 360, duration: 60000, repeat: -1 });
    this.add.image(GAME_W / 2, 250, 'inksplash').setScale(1.05, 1.15).setAlpha(0.85);
    const logo = this.add.image(GAME_W / 2, 240, 'logo').setScale(0.9);
    this.tweens.add({ targets: logo, scale: 0.93, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.add.text(GAME_W / 2, 425, 'Hermanos de trazo. Enemigos de poder.', txt(27, '#bfe9ff', 6)).setOrigin(0.5);

    // the two brothers face each other, with their power numbers (the hook of the story)
    const lino = this.add.graphics({ x: 200, y: 1000 });
    const dante = this.add.graphics({ x: 530, y: 1000 });
    const glowL = this.add.image(200, 1000, 'fx_glow').setScale(4, 1.2).setTint(0x2ad4c4).setAlpha(0.35).setBlendMode(Phaser.BlendModes.ADD);
    const glowR = this.add.image(530, 1000, 'fx_glow').setScale(4, 1.2).setTint(0xa040ff).setAlpha(0.45).setBlendMode(Phaser.BlendModes.ADD);
    void glowL; void glowR;
    const pl = power(d);
    this.add.text(200, 585, fmt(pl), txt(68, pl >= 100000 ? '#d050ff' : '#e8f040', 12)).setOrigin(0.5);
    const freed = d.finale === 'liberacion';
    const pd = this.add.text(530, 585, freed ? '10' : '100.000', txt(freed ? 68 : 62, freed ? '#5fc8ff' : '#d050ff', 12)).setOrigin(0.5);
    if (!freed) pd.setShadow(0, 0, '#d050ff', 22, true, true);
    this.add.text(200, 630, 'LINO', txt(22, '#6fe3d6', 5)).setOrigin(0.5);
    this.add.text(530, 630, 'DANTE', txt(22, '#d8b0ff', 5)).setOrigin(0.5);
    const vs = this.add.text(GAME_W / 2, 800, freed ? 'JUNTOS' : 'VS', txt(freed ? 46 : 84, freed ? '#6fe3d6' : '#ff6a3d', 12)).setOrigin(0.5).setAngle(-8);
    vs.setShadow(0, 0, freed ? '#2ad4c4' : '#ff6a3d', 20, true, true);
    this.tweens.add({ targets: vs, scale: 1.12, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // purple crackle between them every few seconds
    const bolt = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    const crackle = () => {
      bolt.clear();
      for (const [w, col, a] of [[10, 0x8a3ae0, 0.4], [4, 0xd27bff, 0.9], [1.5, 0xffffff, 1]] as const) {
        bolt.lineStyle(w, col, a);
        bolt.beginPath();
        bolt.moveTo(470, 760);
        for (let k = 1; k <= 6; k++) bolt.lineTo(470 - k * 40, 760 + Phaser.Math.Between(-40, 40));
        bolt.strokePath();
      }
      bolt.setAlpha(1);
      this.tweens.add({ targets: bolt, alpha: 0, duration: 260 });
    };
    if (!freed) this.time.addEvent({ delay: 2600, loop: true, callback: crackle });
    // drifting ink motes
    this.add.particles(0, 0, 'fx_glow', {
      x: { min: 0, max: GAME_W }, y: { min: 300, max: 1150 }, lifespan: { min: 3000, max: 5000 }, speedY: { min: -30, max: -10 },
      scale: { start: 0.18, end: 0 }, alpha: { start: 0.7, end: 0 }, tint: [0x2ad4c4, 0xa040ff], blendMode: Phaser.BlendModes.ADD,
      frequency: 220, maxAliveParticles: 20,
    });

    // call to action
    const pill = this.add.graphics();
    pill.fillStyle(0x05070a, 0.75).fillRoundedRect(GAME_W / 2 - 230, 1112, 460, 76, 38);
    pill.lineStyle(3, 0xffd34d, 0.8).strokeRoundedRect(GAME_W / 2 - 230, 1112, 460, 76, 38);
    const tap = this.add.text(GAME_W / 2 + 20, 1150, 'TOCA PARA EMPEZAR', txt(36, '#ffd34d', 8)).setOrigin(0.5);
    this.add.image(GAME_W / 2 - 185, 1158, 'hand').setScale(0.45).setAngle(-15);
    this.tweens.add({ targets: [tap, pill], alpha: 0.45, duration: 750, yoyo: true, repeat: -1 });
    this.add.text(GAME_W / 2, 1245, 'v0.5 · Temporada 1', txt(18, '#8899aa', 4)).setOrigin(0.5);

    onUpdate(this, (time: number) => {
      const t = time / 1000;
      drawCharacter(lino, { id: 'lino', eyes: 'angry', pose: 'fist' }, d.armorEquipped, 2.5, 1, t);
      drawCharacter(dante, d.finale === 'liberacion' ? { id: 'danteLibre', eyes: 'happy', mouth: 'grin', pose: 'fist' } : { id: 'dante', eyes: 'smug', pose: 'cross' }, 0, 2.5, -1, t);
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
