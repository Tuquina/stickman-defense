import type { TrackId } from '../core/audio';

export type ChapterId = 'c1' | 'c2' | 'c3' | 'abismo';

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
    id: 'c1', num: 'CAPÍTULO 1', name: 'Bosque Sombrío', subtitle: 'Las arañas están en oferta.',
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
    mini: 'gargola', boss: 'sirHueco', hpMult: 2.3, goldMult: 1.6, waves: 20,
    intro: 'c2_intro', outro: 'c2_outro', requires: 'c1', requiresText: 'Vence el Capítulo 1', color: 0x8a7a64,
  },
  c3: {
    id: 'c3', num: 'CAPÍTULO 3', name: 'Ciudadela de Ceniza', subtitle: 'Decoración minimalista.',
    bg: 'bg_c3', music: 'c3',
    pool: [
      { id: 'mancha', weight: 8, from: 1 },
      { id: 'sombra', weight: 6, from: 2 },
      { id: 'brujo', weight: 2, from: 4 },
      { id: 'golem', weight: 3, from: 6 },
    ],
    mini: 'guardian', boss: 'ecoDante', hpMult: 4.4, goldMult: 2.4, waves: 20,
    intro: 'c3_intro', outro: 'c3_outro', requires: 'c2', requiresText: 'Vence el Capítulo 2', color: 0x9b4fd0,
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
    ],
    mini: 'gargola', boss: 'ecoDante', hpMult: 2.2, goldMult: 1.5, waves: Infinity,
    requires: 'c3', requiresText: 'Vence el Capítulo 3', color: 0x5a2a8a,
  },
};

export const CHAPTER_ORDER: ChapterId[] = ['c1', 'c2', 'c3', 'abismo'];

/** Bosses cycled through in the endless mode. */
export const ABISMO_BOSSES = ['aranaMadre', 'reina', 'gargola', 'sirHueco', 'guardian', 'ecoDante'];
