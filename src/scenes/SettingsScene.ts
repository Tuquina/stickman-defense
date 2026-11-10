import { GAME_H, GAME_W, ttl, txt } from '../config';
import { Sound } from '../core/audio';
import { Save } from '../core/save';
import { STORY, STORY_ORDER } from '../data/story';
import { button, drawPanel, fadeIn, go, scrollList } from '../ui/widgets';

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
    this.add.text(GAME_W / 2, 90, 'HISTORIA', ttl(54, '#ffffff', 10)).setOrigin(0.5);
    this.add.text(GAME_W / 2, 150, 'Vuelve a ver las escenas desbloqueadas', txt(24, '#bfe9ff', 5)).setOrigin(0.5);
    const seen = Save.d.storySeen;
    const list = scrollList(this, 190, 1130, STORY_ORDER.length * 100);
    this.add.text(GAME_W / 2, 1148, 'Desliza para ver más', txt(18, '#9aa8b8', 4)).setOrigin(0.5);
    STORY_ORDER.forEach((id, i) => {
      const st = STORY[id];
      const ok = seen.includes(id);
      const b = button(this, GAME_W / 2, 50 + i * 100, 600, 84, ok ? st.title : '???', () => {}, { size: 27, color: ok ? 0x6a4ac0 : 0x2a2e36, disabled: !ok });
      // scroll-safe tap: ignore drags and taps outside the visible area
      const z = b.list[b.list.length - 1] as Phaser.GameObjects.Zone;
      z.removeAllListeners('pointerdown');
      z.on('pointerup', (p: Phaser.Input.Pointer) => {
        if (!list.isTap(p)) return;
        Sound.unlock();
        if (!ok) return Sound.play('error');
        Sound.play('click');
        go(this, 'Story', { id, next: { scene: 'Settings', data: { tab: 'story' } } });
      });
      list.add(b);
    });
  }

  private buildSettings(): void {
    this.add.text(GAME_W / 2, 90, 'AJUSTES', ttl(54, '#ffffff', 10)).setOrigin(0.5);
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
    toggle(340, 'SONIDOS', () => s.sfx, (v) => { s.sfx = v; });
    toggle(450, 'VIBRACIÓN', () => s.vibrate, (v) => { s.vibrate = v; });
    toggle(560, 'EFECTOS VISUALES', () => !s.lowFx, (v) => { s.lowFx = !v; });
    this.add.text(GAME_W / 2, 618, 'Desactívalos si tu celular va lento', txt(20, '#9aa8b8', 4)).setOrigin(0.5);

    let step = 0;
    const reset = button(this, GAME_W / 2, 700, 520, 90, 'BORRAR PROGRESO', () => {
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
    drawPanel(g, 60, 790, 600, 340, 0x1c2a44, 0x05070a, 18);
    this.add.text(GAME_W / 2, 830, 'CRÉDITOS', ttl(34, '#ffc93c', 7)).setOrigin(0.5);
    this.add.text(GAME_W / 2, 975, [
      'Juramento de Tinta · v0.9 · Temporada 1',
      'Diseño, código, arte y música: generados',
      'por código (Phaser 3 + WebAudio).',
      'Tipografías: Lilita One (OFL) y Luckiest Guy (Apache 2.0).',
      '',
      'Guardado local en este dispositivo.',
    ].join('\n'), { ...txt(24, '#ffffff', 4), lineSpacing: 6 }).setOrigin(0.5);
  }
}
