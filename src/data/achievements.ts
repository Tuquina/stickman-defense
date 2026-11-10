import { armorUnlocked } from '../core/stats';
import type { SaveData } from '../core/save';

/**
 * Achievements: long-term goals that reward gold once claimed. Progress is read straight from the
 * save (chapters, stats, workshop), so they also count what the player did before they existed.
 */
export interface AchDef {
  id: string;
  cat: 'Historia' | 'Combate' | 'Progreso';
  name: string;
  desc: string;
  goal: number;
  reward: number;
  value: (d: SaveData) => number;
}

const cleared = (c: keyof SaveData['chapters']) => (d: SaveData) => (d.chapters[c].cleared ? 1 : 0);
const endings = (d: SaveData) => new Set([...(d.stats.endings ?? []), ...(d.finale ? [d.finale] : [])]).size;

export const ACHIEVEMENTS: AchDef[] = [
  // ---- story
  { id: 'cap1', cat: 'Historia', name: 'Primera línea', desc: 'Vence el Capítulo 1', goal: 1, reward: 300, value: cleared('c1') },
  { id: 'cap2', cat: 'Historia', name: 'El guardián vacío', desc: 'Vence el Capítulo 2', goal: 1, reward: 800, value: cleared('c2') },
  { id: 'cap3', cat: 'Historia', name: 'Lo que había dentro', desc: 'Vence el Capítulo 3', goal: 1, reward: 2000, value: cleared('c3') },
  { id: 'cap4', cat: 'Historia', name: 'Hoy, yo protejo', desc: 'Vence el Capítulo 4', goal: 1, reward: 6000, value: cleared('c4') },
  { id: 'cap5', cat: 'Historia', name: 'La página', desc: 'Vence el Capítulo 5', goal: 1, reward: 15000, value: cleared('c5') },
  { id: 'cap6', cat: 'Historia', name: 'Juramento cumplido', desc: 'Vence a Dante', goal: 1, reward: 35000, value: cleared('c6') },
  { id: 'finales', cat: 'Historia', name: 'Las dos caras', desc: 'Mira los dos finales', goal: 2, reward: 20000, value: endings },
  // ---- combat
  { id: 'kills1', cat: 'Combate', name: 'Limpieza', desc: 'Derrota 1.000 enemigos', goal: 1000, reward: 500, value: (d) => d.stats.kills },
  { id: 'kills2', cat: 'Combate', name: 'Marea contenida', desc: 'Derrota 10.000 enemigos', goal: 10000, reward: 4000, value: (d) => d.stats.kills },
  { id: 'kills3', cat: 'Combate', name: 'Tinta sin fin', desc: 'Derrota 100.000 enemigos', goal: 100000, reward: 30000, value: (d) => d.stats.kills },
  { id: 'jefes1', cat: 'Combate', name: 'Matajefes', desc: 'Derrota 10 jefes o mini-jefes', goal: 10, reward: 2000, value: (d) => d.stats.bossKills },
  { id: 'jefes2', cat: 'Combate', name: 'Cazador de coronas', desc: 'Derrota 50 jefes o mini-jefes', goal: 50, reward: 15000, value: (d) => d.stats.bossKills },
  { id: 'combo1', cat: 'Combate', name: 'En racha', desc: 'Haz un combo de ×50', goal: 50, reward: 1000, value: (d) => d.stats.bestCombo },
  { id: 'combo2', cat: 'Combate', name: 'Imparable', desc: 'Haz un combo de ×150', goal: 150, reward: 6000, value: (d) => d.stats.bestCombo },
  { id: 'bombas', cat: 'Combate', name: 'Artificiero', desc: 'Detona 50 Bombitas con el dedo', goal: 50, reward: 2500, value: (d) => d.stats.bombs },
  { id: 'escudos', cat: 'Combate', name: 'Rompeescudos', desc: 'Rompe 50 escudos de tinta', goal: 50, reward: 2500, value: (d) => d.stats.shields },
  { id: 'defensas', cat: 'Combate', name: 'Arquitecto', desc: 'Construye o mejora 50 defensas', goal: 50, reward: 2500, value: (d) => d.stats.builds },
  { id: 'juramentos', cat: 'Combate', name: 'Juramentado', desc: 'Elige 10 Juramentos de Tinta', goal: 10, reward: 4000, value: (d) => d.stats.oaths },
  // ---- progress
  { id: 'evo1', cat: 'Progreso', name: 'Evolución', desc: 'Evoluciona un arma en una partida', goal: 1, reward: 1500, value: (d) => d.stats.evolved.length },
  { id: 'evo6', cat: 'Progreso', name: 'Arsenal legendario', desc: 'Evoluciona las 6 armas', goal: 6, reward: 25000, value: (d) => d.stats.evolved.length },
  { id: 'armas3', cat: 'Progreso', name: 'Versátil', desc: 'Vence capítulos con 3 armas distintas', goal: 3, reward: 3000, value: (d) => d.stats.wins.length },
  { id: 'armas6', cat: 'Progreso', name: 'Maestro de armas', desc: 'Vence capítulos con las 6 armas', goal: 6, reward: 20000, value: (d) => d.stats.wins.length },
  { id: 'abismo1', cat: 'Progreso', name: 'Al borde', desc: 'Llega a la oleada 20 del Abismo', goal: 20, reward: 4000, value: (d) => d.chapters.abismo.bestWave },
  { id: 'abismo2', cat: 'Progreso', name: 'Sin fondo', desc: 'Llega a la oleada 40 del Abismo', goal: 40, reward: 20000, value: (d) => d.chapters.abismo.bestWave },
  { id: 'taller', cat: 'Progreso', name: 'Trabajo de taller', desc: 'Lleva una mejora al Nv.20', goal: 20, reward: 5000, value: (d) => Math.max(...Object.values(d.upgrades)) },
  { id: 'armaduras', cat: 'Progreso', name: 'Heredero', desc: 'Desbloquea las 5 armaduras', goal: 5, reward: 10000, value: (d) => [0, 1, 2, 3, 4].filter((t) => armorUnlocked(d, t)).length },
  { id: 'rango', cat: 'Progreso', name: 'Veterano', desc: 'Llega a Rango 15', goal: 15, reward: 8000, value: (d) => d.rank },
];

export function achDone(d: SaveData, a: AchDef): boolean {
  return a.value(d) >= a.goal;
}

/** Completed but not claimed yet (menu badge). */
export function achClaimable(d: SaveData): AchDef[] {
  return ACHIEVEMENTS.filter((a) => achDone(d, a) && !d.achClaimed.includes(a.id));
}

/** Completed and never announced: returns them and marks them as announced. */
export function achAnnounce(d: SaveData): AchDef[] {
  const out = ACHIEVEMENTS.filter((a) => achDone(d, a) && !d.achSeen.includes(a.id));
  for (const a of out) d.achSeen.push(a.id);
  return out;
}
