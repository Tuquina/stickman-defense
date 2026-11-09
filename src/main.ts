import './phaser-global';
import '@fontsource/lilita-one/latin.css';
import '@fontsource/lilita-one/latin-ext.css';
import Phaser from 'phaser';
import { GAME_H, GAME_W } from './config';
import { BattleScene } from './scenes/BattleScene';
import { BootScene } from './scenes/BootScene';
import { ChaptersScene } from './scenes/ChaptersScene';
import { CreditsScene } from './scenes/CreditsScene';
import { GalleryScene } from './scenes/GalleryScene';
import { MenuScene } from './scenes/MenuScene';
import { ResultsScene } from './scenes/ResultsScene';
import { SettingsScene } from './scenes/SettingsScene';
import { StoryScene } from './scenes/StoryScene';
import { WeaponSelectScene } from './scenes/WeaponSelectScene';
import { WorkshopScene } from './scenes/WorkshopScene';

async function start(): Promise<void> {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('40px "Lilita One"'), document.fonts.load('40px "Lilita One"', 'ñáéíóú¡¿')]),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch {
    /* fall back to system font */
  }
  document.getElementById('loading')?.remove();

  const game = new Phaser.Game({
    type: new URLSearchParams(location.search).get('canvas') === '1' ? Phaser.CANVAS : Phaser.AUTO,
    parent: 'game',
    width: GAME_W,
    height: GAME_H,
    backgroundColor: '#05070a',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    render: { antialias: true, roundPixels: false, powerPreference: 'high-performance' },
    input: { activePointers: 2 },
    fps: { target: 60 },
    scene: [BootScene, MenuScene, ChaptersScene, WeaponSelectScene, StoryScene, BattleScene, ResultsScene, WorkshopScene, SettingsScene, GalleryScene, CreditsScene],
  });
  (window as unknown as { game: Phaser.Game }).game = game;
}

void start();
