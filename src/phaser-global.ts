// Must be the first import in main.ts: exposes Phaser as a global before any scene module evaluates.
import Phaser from 'phaser';

(window as unknown as { Phaser: typeof Phaser }).Phaser = Phaser;
