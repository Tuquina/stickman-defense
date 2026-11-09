export type Behavior = 'walk' | 'hop' | 'fly' | 'ranged' | 'split' | 'healer' | 'spawner' | 'dash' | 'shield' | 'boss';

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  speed: number;
  dps: number; // damage per second to the barricade
  xp: number;
  armor?: number; // damage reduction 0..1
  radius: number;
  behavior: Behavior;
  gold: number; // coin drop chance
  rank?: 'mini' | 'boss';
  /** horizontal offset of the sprite's "feet" from its center (for hit radius). */
  yOff?: number;
}

export const ENEMIES: Record<string, EnemyDef> = {
  // ---- Capítulo 1: Bosque Sombrío
  arana: { id: 'arana', name: 'Araña Carmesí', hp: 14, speed: 68, dps: 4, xp: 1, radius: 20, behavior: 'walk', gold: 0.2 },
  escarabajo: { id: 'escarabajo', name: 'Escarabajo Acorazado', hp: 70, speed: 30, dps: 10, xp: 4, armor: 0.3, radius: 28, behavior: 'walk', gold: 0.45 },
  seta: { id: 'seta', name: 'Seta Saltarina', hp: 24, speed: 55, dps: 6, xp: 2, radius: 22, behavior: 'hop', gold: 0.3 },
  aranaMadre: { id: 'aranaMadre', name: 'Araña Madre', hp: 900, speed: 20, dps: 25, xp: 40, armor: 0.1, radius: 52, behavior: 'spawner', gold: 1, rank: 'mini' },
  reina: { id: 'reina', name: 'Reina Telaraña', hp: 3800, speed: 13, dps: 60, xp: 120, armor: 0.15, radius: 78, behavior: 'boss', gold: 1, rank: 'boss' },

  // ---- Capítulo 2: Ruinas del Castillo
  esqueleto: { id: 'esqueleto', name: 'Esqueleto de Tinta', hp: 30, speed: 52, dps: 6, xp: 2, radius: 22, behavior: 'walk', gold: 0.25 },
  murcielago: { id: 'murcielago', name: 'Murciélago', hp: 18, speed: 105, dps: 4, xp: 1, radius: 20, behavior: 'fly', gold: 0.2 },
  caballero: { id: 'caballero', name: 'Caballero Hueco', hp: 120, speed: 27, dps: 16, xp: 5, armor: 0.5, radius: 28, behavior: 'shield', gold: 0.5 },
  arquero: { id: 'arquero', name: 'Arquero Esqueleto', hp: 34, speed: 44, dps: 0, xp: 3, radius: 22, behavior: 'ranged', gold: 0.35 },
  gargola: { id: 'gargola', name: 'Gárgola', hp: 1500, speed: 34, dps: 20, xp: 60, armor: 0.2, radius: 50, behavior: 'fly', gold: 1, rank: 'mini' },
  sirHueco: { id: 'sirHueco', name: 'Sir Hueco', hp: 7200, speed: 15, dps: 80, xp: 160, armor: 0.3, radius: 80, behavior: 'boss', gold: 1, rank: 'boss' },

  // ---- Capítulo 3: Ciudadela de Ceniza
  mancha: { id: 'mancha', name: 'Mancha', hp: 42, speed: 44, dps: 7, xp: 2, radius: 24, behavior: 'split', gold: 0.25 },
  manchita: { id: 'manchita', name: 'Manchita', hp: 15, speed: 70, dps: 3, xp: 1, radius: 14, behavior: 'walk', gold: 0.05 },
  sombra: { id: 'sombra', name: 'Sombra', hp: 36, speed: 60, dps: 8, xp: 2, radius: 22, behavior: 'dash', gold: 0.3 },
  brujo: { id: 'brujo', name: 'Brujo Vacío', hp: 60, speed: 34, dps: 5, xp: 4, radius: 22, behavior: 'healer', gold: 0.5 },
  golem: { id: 'golem', name: 'Gólem de Ceniza', hp: 280, speed: 21, dps: 30, xp: 8, armor: 0.35, radius: 34, behavior: 'walk', gold: 0.6 },
  guardian: { id: 'guardian', name: 'Guardián de la Corona', hp: 4500, speed: 18, dps: 50, xp: 80, armor: 0.25, radius: 54, behavior: 'shield', gold: 1, rank: 'mini' },
  ecoDante: { id: 'ecoDante', name: 'Eco de Dante', hp: 16000, speed: 14, dps: 120, xp: 250, armor: 0.25, radius: 80, behavior: 'boss', gold: 1, rank: 'boss' },
};
