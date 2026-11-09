import type { ChapterId } from '../data/chapters';
import type { UpgradeId } from '../data/upgrades';
import type { WeaponId } from '../data/weapons';

const KEY = 'juramento_de_tinta_save';
const VERSION = 1;

export interface ChapterProgress { cleared: boolean; bestWave: number }

export interface SaveData {
  version: number;
  gold: number;
  rank: number;
  rankXp: number;
  upgrades: Record<UpgradeId, number>;
  weaponLv: Record<WeaponId, number>;
  lastWeapon: WeaponId;
  armorEquipped: number;
  armorSeen: number; // highest armor tier the player has been notified about
  chapters: Record<ChapterId, ChapterProgress>;
  storySeen: string[];
  settings: { music: boolean; sfx: boolean; vibrate: boolean; speed2: boolean; lowFx: boolean };
  tutorial: { mark: boolean; skill: boolean; fury: boolean };
  /** ending chosen at the end of chapter 6 (season 1) */
  finale: 'venganza' | 'liberacion' | null;
  stats: { runs: number; kills: number; bossKills: number; goldEarned: number };
}

function fresh(): SaveData {
  return {
    version: VERSION,
    gold: 0,
    rank: 1,
    rankXp: 0,
    upgrades: { fuerza: 0, barricada: 0, agilidad: 0, precision: 0, codicia: 0, sabiduria: 0, furia: 0 },
    weaponLv: { arco: 1, pistola: 1, baston: 1, escopeta: 1, shuriken: 1, lanza: 1 },
    lastWeapon: 'arco',
    armorEquipped: 0,
    armorSeen: 0,
    chapters: {
      c1: { cleared: false, bestWave: 0 },
      c2: { cleared: false, bestWave: 0 },
      c3: { cleared: false, bestWave: 0 },
      c4: { cleared: false, bestWave: 0 },
      c5: { cleared: false, bestWave: 0 },
      c6: { cleared: false, bestWave: 0 },
      abismo: { cleared: false, bestWave: 0 },
    },
    storySeen: [],
    settings: { music: true, sfx: true, vibrate: true, speed2: false, lowFx: false },
    tutorial: { mark: false, skill: false, fury: false },
    finale: null,
    stats: { runs: 0, kills: 0, bossKills: 0, goldEarned: 0 },
  };
}

/** Deep-merges stored data onto defaults so new fields survive old saves. */
function merge<T>(base: T, src: unknown): T {
  if (typeof base !== 'object' || base === null || Array.isArray(base)) {
    return (src === undefined || src === null ? base : src) as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  if (src && typeof src === 'object') {
    for (const k of Object.keys(out)) {
      out[k] = merge(out[k], (src as Record<string, unknown>)[k]);
    }
  }
  return out as T;
}

let data: SaveData = load();

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const parsed = JSON.parse(raw);
    const merged = merge(fresh(), parsed);
    merged.version = VERSION;
    return merged;
  } catch {
    return fresh();
  }
}

export const Save = {
  get d(): SaveData {
    return data;
  },
  write(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage full or blocked: keep playing in memory */
    }
  },
  reset(): void {
    data = fresh();
    Save.write();
  },
  /** Replace in-memory data without persisting (debug/bot runs). */
  override(d: SaveData): void {
    data = d;
  },
  fresh,
};

export function rankXpNeed(rank: number): number {
  return Math.floor(100 * Math.pow(rank, 1.25));
}

/** Adds rank XP, returns number of ranks gained. */
export function addRankXp(xp: number): number {
  const d = Save.d;
  d.rankXp += xp;
  let gained = 0;
  while (d.rankXp >= rankXpNeed(d.rank)) {
    d.rankXp -= rankXpNeed(d.rank);
    d.rank++;
    gained++;
  }
  return gained;
}
