import { GAME_H, GAME_W, TITLE_FONT, txt } from '../config';
import { Sound } from '../core/audio';
import { DEBUG } from '../core/debug';
import { fmt } from '../core/format';
import { Save } from '../core/save';
import { power } from '../core/stats';
import { CHAPTER_ORDER, CHAPTERS, type ChapterId } from '../data/chapters';
import { ARMORS } from '../data/armor';
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
    Sound.music('title');
    Sound.tryAutostart();
    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    // darker top/bottom for contrast with the logo and the call to action
    const grad = this.add.graphics();
    for (let i = 0; i < 40; i++) {
      grad.fillStyle(0x05070a, 0.6 * (1 - i / 40));
      grad.fillRect(0, i * 7, GAME_W, 7);
      grad.fillStyle(0x05070a, 0.75 * (i / 40));
      grad.fillRect(0, 1000 + i * 7, GAME_W, 7);
    }
    const rays = this.add.image(GAME_W / 2, 230, 'fx_rays').setScale(2.6).setAlpha(0.18).setBlendMode(Phaser.BlendModes.ADD).setTint(0xb48cff);
    this.tweens.add({ targets: rays, angle: 360, duration: 70000, repeat: -1 });

    // ---- logo (auto-fitted texture) drops in
    const logo = this.add.image(GAME_W / 2, 215, 'logo').setScale(0.95).setAlpha(0).setY(150);
    this.tweens.add({ targets: logo, alpha: 1, y: 215, duration: 650, ease: 'Back.easeOut' });
    this.tweens.add({ targets: logo, scale: 0.98, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: 700 });

    // ---- teaser: what the game is about, one line at a time
    const pl = power(d);
    const teaser = [
      'Juraron no abandonarse nunca.',
      'Cinco años después, él tiene 100.000 de poder.',
      `Tú tienes ${fmt(pl)}. Y una barricada.`,
      'Resiste las oleadas. Hazte más fuerte.',
      '¿Venganza… o liberación?',
    ];
    const tline = this.add.text(GAME_W / 2, 420, teaser[0], txt(26, '#e8f6ff', 6)).setOrigin(0.5);
    let ti = 0;
    this.time.addEvent({
      delay: 2600, loop: true, callback: () => {
        this.tweens.add({ targets: tline, alpha: 0, duration: 250, onComplete: () => {
          ti = (ti + 1) % teaser.length;
          tline.setText(teaser[ti]);
          this.tweens.add({ targets: tline, alpha: 1, duration: 250 });
        } });
      },
    });

    // ---- the brothers + enemies marching in the background (it's a defense game)
    const horde = ['e_arana_0', 'e_esqueleto_0', 'e_mancha_0', 'e_sombra_0', 'e_murcielago_0'];
    for (let k = 0; k < 6; k++) {
      const im = this.add.image(GAME_W + 60 + k * 140, 1000 - (k % 2) * 30, horde[k % horde.length]).setOrigin(0.5, 1).setScale(0.7).setTint(0x1a1024).setAlpha(0.85);
      this.tweens.add({ targets: im, x: 380, alpha: 0, duration: 9000, delay: k * 1500, repeat: -1, onRepeat: () => im.setAlpha(0.85) });
    }
    const lino = this.add.graphics({ x: 190, y: 990 });
    const dante = this.add.graphics({ x: 535, y: 990 });
    this.add.image(190, 990, 'fx_glow').setScale(4, 1.1).setTint(0x2ad4c4).setAlpha(0.4).setBlendMode(Phaser.BlendModes.ADD);
    this.add.image(535, 990, 'fx_glow').setScale(4, 1.1).setTint(0xa040ff).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD);
    const freed = d.finale === 'liberacion';
    this.add.text(190, 560, fmt(pl), txt(64, pl >= 100000 ? '#d050ff' : '#e8f040', 12)).setOrigin(0.5);
    const pd = this.add.text(535, 560, freed ? '10' : '100.000', txt(freed ? 64 : 56, freed ? '#5fc8ff' : '#d050ff', 12)).setOrigin(0.5);
    if (!freed) pd.setShadow(0, 0, '#d050ff', 22, true, true);
    this.add.text(190, 604, 'LINO', txt(22, '#6fe3d6', 5)).setOrigin(0.5);
    this.add.text(535, 604, 'DANTE', txt(22, '#d8b0ff', 5)).setOrigin(0.5);
    const vs = this.add.text(GAME_W / 2, 790, freed ? 'JUNTOS' : 'VS', { ...txt(freed ? 44 : 92, freed ? '#6fe3d6' : '#ff6a3d', 14), fontFamily: TITLE_FONT }).setOrigin(0.5).setAngle(-8);
    vs.setShadow(0, 0, freed ? '#2ad4c4' : '#ff6a3d', 22, true, true);
    this.tweens.add({ targets: vs, scale: 1.12, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const bolt = this.add.graphics().setBlendMode(Phaser.BlendModes.ADD);
    if (!freed) {
      this.time.addEvent({ delay: 2600, loop: true, callback: () => {
        bolt.clear();
        for (const [w, col, a] of [[10, 0x8a3ae0, 0.4], [4, 0xd27bff, 0.9], [1.5, 0xffffff, 1]] as const) {
          bolt.lineStyle(w, col, a);
          bolt.beginPath();
          bolt.moveTo(470, 740);
          for (let k = 1; k <= 6; k++) bolt.lineTo(470 - k * 40, 740 + Phaser.Math.Between(-40, 40));
          bolt.strokePath();
        }
        bolt.setAlpha(1);
        this.tweens.add({ targets: bolt, alpha: 0, duration: 260 });
      } });
    }
    this.add.particles(0, 0, 'fx_glow', {
      x: { min: 0, max: GAME_W }, y: { min: 300, max: 1150 }, lifespan: { min: 3000, max: 5000 }, speedY: { min: -30, max: -10 },
      scale: { start: 0.18, end: 0 }, alpha: { start: 0.7, end: 0 }, tint: [0x2ad4c4, 0xa040ff], blendMode: Phaser.BlendModes.ADD,
      frequency: 220, maxAliveParticles: 20,
    });

    // ---- player card: where you are in your journey
    const card = this.add.graphics();
    card.fillStyle(0x05070a, 0.78).fillRoundedRect(40, 1030, GAME_W - 80, 92, 18);
    card.lineStyle(2, 0x2ad4c4, 0.6).strokeRoundedRect(40, 1030, GAME_W - 80, 92, 18);
    const next = CHAPTER_ORDER.find((id) => id !== 'abismo' && !d.chapters[id].cleared && (!CHAPTERS[id].requires || d.chapters[CHAPTERS[id].requires!].cleared));
    const fresh = d.stats.runs === 0 && !d.chapters.c1.cleared;
    const where = fresh ? 'Tu historia empieza aquí' : next ? `${CHAPTERS[next].num}: ${CHAPTERS[next].name}` : `Temporada completa · Abismo: oleada ${d.chapters.abismo.bestWave}`;
    this.add.text(70, 1058, `RANGO ${d.rank}`, txt(26, '#5fe0d2', 6)).setOrigin(0, 0.5);
    this.add.text(GAME_W - 70, 1058, ARMORS[d.armorEquipped].name, txt(20, '#bfe9ff', 5)).setOrigin(1, 0.5);
    this.add.text(GAME_W / 2, 1095, where, txt(23, '#ffd34d', 5)).setOrigin(0.5);

    // ---- call to action: first tap = enable sound + music, second = play
    const pill = this.add.graphics();
    const drawPill = (col: number) => {
      pill.clear();
      pill.fillStyle(0x05070a, 0.8).fillRoundedRect(GAME_W / 2 - 230, 1150, 460, 76, 38);
      pill.lineStyle(3, col, 0.9).strokeRoundedRect(GAME_W / 2 - 230, 1150, 460, 76, 38);
    };
    drawPill(0xffd34d);
    const tap = this.add.text(GAME_W / 2 + 20, 1188, 'TOCA PARA EMPEZAR', txt(34, '#ffd34d', 8)).setOrigin(0.5);
    const hand = this.add.image(GAME_W / 2 - 185, 1196, 'hand').setScale(0.42).setAngle(-15);
    const blink = this.tweens.add({ targets: [tap, pill, hand], alpha: 0.45, duration: 750, yoyo: true, repeat: -1 });
    this.add.text(GAME_W / 2, 1255, 'v0.8 · Temporada 1', txt(16, '#8899aa', 4)).setOrigin(0.5);

    onUpdate(this, (time: number) => {
      const t = time / 1000;
      drawCharacter(lino, { id: 'lino', eyes: 'angry', pose: 'fist' }, d.armorEquipped, 2.4, 1, t);
      drawCharacter(dante, freed ? { id: 'danteLibre', eyes: 'happy', mouth: 'grin', pose: 'fist' } : { id: 'dante', eyes: 'smug', pose: 'cross' }, 0, 2.4, -1, t);
    });

    let armed = false;
    const enter = () => {
      Sound.play('click');
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        if (!Save.d.storySeen.includes('prologo1')) {
          this.scene.start('Story', { id: 'prologo1', next: { scene: 'Story', data: { id: 'prologo2', next: { scene: 'Menu' } } } });
        } else {
          this.scene.start('Menu');
        }
      });
    };
    this.input.on('pointerup', () => {
      Sound.unlock();
      if (armed) {
        enter();
        return;
      }
      // first tap: the music starts (browsers need a gesture), the logo flashes and the button becomes JUGAR
      armed = true;
      Sound.play('legend', 0);
      this.cameras.main.flash(260, 180, 140, 255);
      this.tweens.add({ targets: logo, scale: 1.08, duration: 140, yoyo: true });
      blink.stop();
      [tap, pill, hand].forEach((o) => o.setAlpha(1));
      tap.setText(fresh ? '¡JUGAR!' : 'CONTINUAR').setColor('#ffffff').setFontSize(40).setX(GAME_W / 2 + 10);
      drawPill(0x2ad4c4);
      this.tweens.add({ targets: [tap, hand], scale: '+=0.06', duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
  }
}
