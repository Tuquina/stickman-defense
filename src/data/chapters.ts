import type { TrackId } from '../core/audio';

export type ChapterId = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'abismo';

export interface SpawnEntry { id: string; weight: number; from: number }

export interface ChapterDef {
  id: ChapterId;
  num: string;
  name: string;
  subtitle: string;
  bg: string;
  music: TrackId;
  pool: SpawnEntry[];
  mini: string;
  boss: string;
  hpMult: number;
  goldMult: number;
  waves: number; // Infinity for endless
  intro?: string;
  outro?: string;
  requires?: ChapterId;
  requiresText: string;
  color: number;
}

export const CHAPTERS: Record<ChapterId, ChapterDef> = {
  c1: {
    id: 'c1', num: 'CAPÍTULO 1', name: 'Bosque Sombrío', subtitle: 'Las arañas bajaron del bosque.',
    bg: 'bg_c1', music: 'c1',
    pool: [
      { id: 'arana', weight: 10, from: 1 },
      { id: 'seta', weight: 4, from: 3 },
      { id: 'escarabajo', weight: 3, from: 5 },
    ],
    mini: 'aranaMadre', boss: 'reina', hpMult: 1, goldMult: 1, waves: 20,
    intro: 'c1_intro', outro: 'c1_outro', requiresText: '', color: 0x2f8f6b,
  },
  c2: {
    id: 'c2', num: 'CAPÍTULO 2', name: 'Ruinas del Castillo', subtitle: 'Aquí jugábamos de niños.',
    bg: 'bg_c2', music: 'c2',
    pool: [
      { id: 'esqueleto', weight: 10, from: 1 },
      { id: 'murcielago', weight: 6, from: 2 },
      { id: 'arquero', weight: 3, from: 4 },
      { id: 'caballero', weight: 3, from: 6 },
    ],
    mini: 'gargola', boss: 'sirHueco', hpMult: 2.3, goldMult: 2.5, waves: 20,
    intro: 'c2_intro', outro: 'c2_outro', requires: 'c1', requiresText: 'Vence el Capítulo 1', color: 0x8a7a64,
  },
  c3: {
    id: 'c3', num: 'CAPÍTULO 3', name: 'Ciudadela de Ceniza', subtitle: 'Donde dicen que pasó Dante.',
    bg: 'bg_c3', music: 'c3',
    pool: [
      { id: 'mancha', weight: 8, from: 1 },
      { id: 'sombra', weight: 6, from: 2 },
      { id: 'brujo', weight: 2, from: 4 },
      { id: 'golem', weight: 3, from: 6 },
    ],
    mini: 'guardian', boss: 'ecoDante', hpMult: 4.4, goldMult: 3.5, waves: 20,
    intro: 'c3_intro', outro: 'c3_outro', requires: 'c2', requiresText: 'Vence el Capítulo 2', color: 0x9b4fd0,
  },
  c4: {
    id: 'c4', num: 'CAPÍTULO 4', name: 'Marisma de Tinta', subtitle: 'De aquí salieron los monstruos.',
    bg: 'bg_c4', music: 'c4',
    pool: [
      { id: 'renacuajo', weight: 9, from: 1 },
      { id: 'sanguijuela', weight: 6, from: 2 },
      { id: 'pescador', weight: 3, from: 4 },
      { id: 'tortuga', weight: 3, from: 6 },
    ],
    mini: 'hidra', boss: 'kraken', hpMult: 12, goldMult: 7, waves: 20,
    intro: 'c4_intro', outro: 'c4_outro', requires: 'c3', requiresText: 'Vence el Capítulo 3', color: 0x1f6a6a,
  },
  c5: {
    id: 'c5', num: 'CAPÍTULO 5', name: 'Torre del Olvido', subtitle: 'Donde la Corona guarda lo que borra.',
    bg: 'bg_c5', music: 'c5',
    pool: [
      { id: 'pagina', weight: 9, from: 1 },
      { id: 'tintero', weight: 4, from: 2 },
      { id: 'escriba', weight: 2, from: 4 },
      { id: 'guardiaCorona', weight: 3, from: 6 },
    ],
    mini: 'golemLibros', boss: 'recuerdo', hpMult: 16, goldMult: 20, waves: 20,
    intro: 'c5_intro', outro: 'c5_outro', requires: 'c4', requiresText: 'Vence el Capítulo 4', color: 0x4a5ab0,
  },
  c6: {
    id: 'c6', num: 'CAPÍTULO 6', name: 'Trono de la Corona', subtitle: 'Cien mil. Frente a frente.',
    bg: 'bg_c6', music: 'c6',
    pool: [
      { id: 'coronado', weight: 7, from: 1 },
      { id: 'mancha', weight: 5, from: 1 },
      { id: 'tintero', weight: 3, from: 3 },
      { id: 'guardiaCorona', weight: 3, from: 5 },
      { id: 'escriba', weight: 2, from: 7 },
    ],
    mini: 'ecoDante', boss: 'dante', hpMult: 17.5, goldMult: 28, waves: 20,
    intro: 'c6_intro', outro: 'c6_outro', requires: 'c5', requiresText: 'Vence el Capítulo 5', color: 0x8a2ad0,
  },
  abismo: {
    id: 'abismo', num: 'MODO INFINITO', name: 'El Abismo', subtitle: '¿Hasta qué oleada llegas?',
    bg: 'bg_abismo', music: 'abismo',
    pool: [
      { id: 'arana', weight: 6, from: 1 },
      { id: 'esqueleto', weight: 5, from: 1 },
      { id: 'murcielago', weight: 4, from: 2 },
      { id: 'mancha', weight: 5, from: 3 },
      { id: 'sombra', weight: 4, from: 4 },
      { id: 'escarabajo', weight: 3, from: 5 },
      { id: 'arquero', weight: 2, from: 6 },
      { id: 'brujo', weight: 2, from: 8 },
      { id: 'caballero', weight: 2, from: 8 },
      { id: 'golem', weight: 2, from: 10 },
      { id: 'renacuajo', weight: 3, from: 12 },
      { id: 'pagina', weight: 3, from: 14 },
      { id: 'coronado', weight: 2, from: 16 },
      { id: 'tortuga', weight: 1, from: 18 },
    ],
    mini: 'gargola', boss: 'ecoDante', hpMult: 2.2, goldMult: 6, waves: Infinity,
    requires: 'c3', requiresText: 'Vence el Capítulo 3', color: 0x5a2a8a,
  },
};

export const CHAPTER_ORDER: ChapterId[] = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'abismo'];

/** Bosses cycled through in the endless mode. */
export const ABISMO_BOSSES = ['aranaMadre', 'reina', 'gargola', 'sirHueco', 'guardian', 'ecoDante', 'hidra', 'kraken', 'golemLibros', 'recuerdo', 'dante'];
