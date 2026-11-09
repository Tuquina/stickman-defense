/**
 * Debug-only art gallery (?scene=gallery&page=N). Renders every character, armor tier,
 * weapon and enemy side by side so visual consistency can be reviewed in one place.
 */
import { GAME_H, GAME_W, txt } from '../config';
import { ENEMIES } from '../data/enemies';
import type { CharId } from '../data/story';
import { WEAPON_ORDER } from '../data/weapons';
import { drawCharacter } from '../gfx/characters';
import { drawStickman, POSES } from '../gfx/stickman';
import { ENEMY_TEX } from '../gfx/textures';

export class GalleryScene extends Phaser.Scene {
  private page = 0;
  constructor() {
    super('Gallery');
  }

  init(data: { page?: number }): void {
    this.page = data.page ?? 0;
  }

  create(): void {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x8a9aa8);
    const g = this.add.graphics();
    const label = (x: number, y: number, s: string) => this.add.text(x, y, s, txt(18, '#ffffff', 4)).setOrigin(0.5);
    if (this.page === 9) {
      // weapons & effects review sheet
      this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x141c26);
      const icons = ['ic_arco', 'ic_pistola', 'ic_baston', 'ic_escopeta', 'ic_shuriken', 'ic_lanza', 'ic_lluvia', 'ic_rayo', 'ic_bomba', 'ic_muro', 'ic_hielo', 'ic_tornado', 'ic_evo', 'ic_legend', 'pi_filo', 'pi_furia'];
      icons.forEach((k, i) => this.add.image(70 + (i % 6) * 116, 80 + Math.floor(i / 6) * 116, k).setDisplaySize(96, 96));
      const projs = ['p_arrow', 'p_arrowGold', 'p_bullet', 'p_orb', 'p_orbGold', 'p_pellet', 'p_star', 'p_starGold', 'p_lanza', 'p_lanzaGold', 'p_fall', 'p_bomb', 'p_eorb', 'p_web', 'p_turret'];
      projs.forEach((k, i) => this.add.image(80 + (i % 5) * 140, 470 + Math.floor(i / 5) * 90, k).setScale(1.6));
      const fx = ['fx_spark', 'fx_ring', 'fx_flash', 'fx_smoke', 'fx_muzzle', 'fx_flame', 'fx_target', 'fx_ice', 'tornado_0', 'fx_inkwave'];
      fx.forEach((k, i) => {
        const im = this.add.image(80 + (i % 5) * 140, 820 + Math.floor(i / 5) * 230, k);
        im.setScale(Math.min(1.2, 120 / im.height, 130 / im.width));
        if (k.startsWith('fx_') && k !== 'fx_ice' && k !== 'fx_target' && k !== 'fx_inkwave') im.setTint(0x9af0ff);
      });
      return;
    }
    if (this.page === 0) {
      // armor tiers × weapons
      for (let tier = 0; tier < 5; tier++) {
        const x = 75 + tier * 142;
        drawStickman(g, x, 260, 1.25, POSES.idle(0.3), { tier, eyes: 'determined', weapon: 'arco' }, 1, 0.3);
        label(x, 285, `T${tier}`);
      }
      WEAPON_ORDER.forEach((w, i) => {
        const x = 75 + i * 142;
        drawStickman(g, x, 560, 1.25, POSES.aim(0.3, 1.5), { tier: 2, eyes: 'angry', weapon: w }, 1, 0.3);
        label(x, 585, w);
      });
      const chars: CharId[] = ['linoKid', 'danteKid', 'lino', 'dante', 'clip', 'hueco', 'eco'];
      chars.forEach((id, i) => {
        const gg = this.add.graphics({ x: 60 + (i % 4) * 190, y: i < 4 ? 900 : 1230 });
        drawCharacter(gg, { id }, 0, 1.2, 1, 0.3);
        label(gg.x, gg.y + 20, id);
      });
    } else {
      // 15 enemies per page: ?scene=gallery:1, gallery:2, gallery:3…
      const ids = Object.keys(ENEMIES).slice((this.page - 1) * 15, this.page * 15);
      ids.forEach((id, i) => {
        const tex = ENEMY_TEX[id];
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 120 + col * 240;
        const y = 210 + row * 200;
        const img = this.add.image(x, y, `e_${id}_0`).setOrigin(0.5, 1);
        const k = Math.min(1, 180 / (tex?.h ?? 100), 220 / (tex?.w ?? 100));
        img.setScale(k);
        label(x, y + 14, `${id}${k < 1 ? ` (x${k.toFixed(2)})` : ''}`);
      });
    }
  }
}
