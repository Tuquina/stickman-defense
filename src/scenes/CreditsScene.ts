import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { Save } from '../core/save';
import { drawCharacter } from '../gfx/characters';
import { fadeIn, go, onUpdate } from '../ui/widgets';

/** End of season 1: scrolling credits that reflect the chosen ending. */
export class CreditsScene extends Phaser.Scene {
  private finale: 'venganza' | 'liberacion' = 'liberacion';
  constructor() {
    super('Credits');
  }

  init(data: { finale?: 'venganza' | 'liberacion' }): void {
    this.finale = data.finale ?? Save.d.finale ?? 'liberacion';
  }

  create(): void {
    fadeIn(this, 600);
    const lib = this.finale === 'liberacion';
    Sound.music(lib ? 'story' : 'sad');
    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x05070a, 0.7);

    const lino = this.add.graphics({ x: lib ? 250 : 360, y: 1180 });
    const dante = lib ? this.add.graphics({ x: 470, y: 1180 }) : null;
    let t = 0;
    onUpdate(this, (_a, dt) => {
      t += dt / 1000;
      drawCharacter(lino, { id: 'lino', eyes: lib ? 'happy' : 'sad', mouth: lib ? 'grin' : 'none', pose: lib ? 'fist' : 'idle' }, Save.d.armorEquipped, 1.6, 1, t);
      if (dante) drawCharacter(dante, { id: 'danteLibre', eyes: 'happy', mouth: 'grin', pose: 'fist' }, 0, 1.6, -1, t);
    });

    const lines = [
      ['JURAMENTO DE TINTA', 64, '#ffffff'],
      ['Fin de la Temporada 1', 34, '#ffd34d'],
      ['', 30, '#ffffff'],
      [lib ? 'Final: LIBERACIÓN' : 'Final: VENGANZA', 40, lib ? '#6fe3d6' : '#ff6a6a'],
      [lib ? '"Siempre vamos a ser hermanos."' : '"La venganza no devuelve a nadie."', 28, '#bfe9ff'],
      ['', 30, '#ffffff'],
      ['Lino · el hermanito', 28, '#ffffff'],
      ['Dante · el hermano', 28, '#ffffff'],
      ['Tío Clip · mercader y coach', 28, '#ffffff'],
      ['Sir Hueco · el primer vaciado', 28, '#ffffff'],
      ['La Corona Hueca · la verdadera villana', 28, '#d8b0ff'],
      ['', 30, '#ffffff'],
      ['Arte, música y código: generados por código', 24, '#9aa8b8'],
      ['Phaser 3 · WebAudio · Lilita One (OFL)', 24, '#9aa8b8'],
      ['', 30, '#ffffff'],
      ['El Abismo sigue abierto.', 30, '#ffd34d'],
      ['¿Hasta qué oleada llegas?', 30, '#ffd34d'],
      ['', 30, '#ffffff'],
      ['Gracias por jugar', 44, '#ffffff'],
    ] as const;
    const c = this.add.container(0, GAME_H);
    let y = 0;
    for (const [text, size, color] of lines) {
      c.add(this.add.text(GAME_W / 2, y, text, txt(size, color, 7)).setOrigin(0.5));
      y += size + 26;
    }
    const total = y + GAME_H * 0.55;
    this.tweens.add({ targets: c, y: GAME_H - total, duration: total * 16, ease: 'Linear', onComplete: () => this.time.delayedCall(2500, () => go(this, 'Menu')) });
    this.add.text(GAME_W / 2, 40, 'toca para saltar', txt(20, '#9aa8b8', 4)).setOrigin(0.5);
    this.time.delayedCall(1500, () => this.input.once('pointerdown', () => go(this, 'Menu')));
  }
}
