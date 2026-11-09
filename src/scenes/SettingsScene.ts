import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { Save } from '../core/save';
import { STORY, STORY_ORDER } from '../data/story';
import { button, drawPanel, fadeIn, go } from '../ui/widgets';

export class SettingsScene extends Phaser.Scene {
  private tab: 'settings' | 'story' = 'settings';
  constructor() {
    super('Settings');
  }

  init(data: { tab?: 'settings' | 'story' }): void {
    this.tab = data.tab ?? 'settings';
  }

  create(): void {
    fadeIn(this);
    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x05070a, 0.72);
    if (this.tab === 'story') this.buildStory();
    else this.buildSettings();
    button(this, GAME_W / 2, 1200, 300, 80, 'VOLVER', () => go(this, 'Menu'), { size: 32, color: 0x3a4a5e });
  }

  private buildStory(): void {
    this.add.text(GAME_W / 2, 90, 'HISTORIA', txt(56, '#ffffff', 10)).setOrigin(0.5);
    this.add.text(GAME_W / 2, 150, 'Vuelve a ver las escenas desbloqueadas', txt(24, '#bfe9ff', 5)).setOrigin(0.5);
    const seen = Save.d.storySeen;
    STORY_ORDER.forEach((id, i) => {
      const s = STORY[id];
      const ok = seen.includes(id);
      const y = 230 + i * 112;
      button(this, GAME_W / 2, y, 600, 92, ok ? s.title : '???', () => {
        if (ok) go(this, 'Story', { id, next: { scene: 'Settings', data: { tab: 'story' } } });
      }, { size: 28, color: ok ? 0x6a4ac0 : 0x2a2e36, disabled: !ok });
    });
  }

  private buildSettings(): void {
    this.add.text(GAME_W / 2, 90, 'AJUSTES', txt(56, '#ffffff', 10)).setOrigin(0.5);
    const s = Save.d.settings;
    const toggle = (y: number, label: string, get: () => boolean, set: (v: boolean) => void) => {
      const b = button(this, GAME_W / 2, y, 520, 90, `${label}: ${get() ? 'SÍ' : 'NO'}`, () => {
        set(!get());
        Save.write();
        Sound.applySettings();
        b.label.setText(`${label}: ${get() ? 'SÍ' : 'NO'}`);
        b.redraw(get() ? 0x2a9d8f : 0x5a3a3a);
      }, { size: 34, color: get() ? 0x2a9d8f : 0x5a3a3a });
    };
    toggle(230, 'MÚSICA', () => s.music, (v) => { s.music = v; });
    toggle(340, 'EFECTOS', () => s.sfx, (v) => { s.sfx = v; });
    toggle(450, 'VIBRACIÓN', () => s.vibrate, (v) => { s.vibrate = v; });

    let step = 0;
    const reset = button(this, GAME_W / 2, 600, 520, 90, 'BORRAR PROGRESO', () => {
      step++;
      if (step === 1) {
        reset.label.setText('¿SEGURO? TOCA OTRA VEZ');
        return;
      }
      Save.reset();
      Sound.play('defeat');
      this.scene.start('Boot');
    }, { size: 30, color: 0xb83a3a });

    const g = this.add.graphics();
    drawPanel(g, 60, 700, 600, 420, 0x1c2a44, 0x05070a, 18);
    this.add.text(GAME_W / 2, 740, 'CRÉDITOS', txt(34, '#ffc93c', 6)).setOrigin(0.5);
    this.add.text(GAME_W / 2, 910, [
      'Juramento de Tinta · v0.1 (MVP)',
      'Diseño, código, arte y música: generados',
      'por código (Phaser 3 + WebAudio).',
      'Tipografía: Lilita One (SIL OFL).',
      '',
      'Guardado local en este dispositivo.',
    ].join('\n'), { ...txt(24, '#ffffff', 4), lineSpacing: 6 }).setOrigin(0.5);
  }
}
