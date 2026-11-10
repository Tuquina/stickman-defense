import { ARMORS } from '../data/armor';
import { CHAPTERS } from '../data/chapters';
import { UPGRADES } from '../data/upgrades';
import type { WeaponId } from '../data/weapons';
import { Save, type SaveData } from './save';

export interface BaseStats {
  atk: number; // base damage before weapon multiplier
  hp: number; // barricade max HP
  spd: number; // attack speed multiplier
  crit: number;
  gold: number;
  xp: number;
  fury: number;
  rankBonus: number;
}

function up(d: SaveData, id: string): number {
  const def = UPGRADES.find((u) => u.id === id)!;
  return (d.upgrades as Record<string, number>)[id] * def.per;
}

export function baseStats(d: SaveData = Save.d): BaseStats {
  const armor = ARMORS[d.armorEquipped] ?? ARMORS[0];
  const rankBonus = 1 + (d.rank - 1) * 0.01;
  return {
    atk: 10 * (1 + up(d, 'fuerza')) * (1 + armor.atk) * rankBonus,
    hp: 100 * (1 + up(d, 'barricada')) * (1 + armor.hp) * rankBonus,
    spd: 1 + up(d, 'agilidad'),
    crit: 0.05 + up(d, 'precision'),
    gold: 1 + up(d, 'codicia'),
    xp: 1 + up(d, 'sabiduria'),
    fury: 1 + up(d, 'furia'),
    rankBonus,
  };
}

export function weaponLvMult(d: SaveData, w: WeaponId): number {
  return 1 + (d.weaponLv[w] - 1) * 0.1;
}

/** The "Poder" number shown above the hero. Starts at 500. Dante has 100.000. */
export function power(d: SaveData = Save.d): number {
  const b = baseStats(d);
  const bestWeapon = Math.max(...Object.values(d.weaponLv));
  const atkF = (b.atk / 10) * (1 + (bestWeapon - 1) * 0.1);
  const hpF = b.hp / 100;
  const critF = 1 + (b.crit - 0.05);
  return Math.round(500 * atkF * Math.sqrt(hpF) * b.spd * critF);
}

/** Returns which armor tiers are unlocked given the current progress. */
export function armorUnlocked(d: SaveData, tier: number): boolean {
  switch (tier) {
    case 0: return true;
    case 1: return d.chapters.c1.cleared;
    case 2: return d.chapters.c2.cleared;
    // one armor per story milestone, always in order (no shortcuts that skip a tier)
    case 3: return d.chapters.c3.cleared;
    case 4: return d.chapters.c5.cleared;
    default: return false;
  }
}

export function weaponUnlocked(d: SaveData, w: WeaponId): boolean {
  if (w === 'escopeta') return d.chapters.c1.cleared;
  if (w === 'shuriken') return d.chapters.c2.cleared;
  if (w === 'lanza') return d.chapters.c4.cleared;
  return true;
}

/** Story chapters cleared (c1..c6). */
export function chaptersCleared(d: SaveData = Save.d): number {
  return (['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const).filter((c) => d.chapters[c].cleared).length;
}

/**
 * Workshop stock grows with the story: the highest upgrade level you can buy depends on how many
 * chapters you have cleared. It keeps a few levels of margin over what each chapter needs (bot runs:
 * c2 ≈ 10, c3 ≈ 16, c4 ≈ 19, c5 ≈ 23, c6 ≈ 30) but stops farming an early chapter to steamroll the rest.
 */
const UPGRADE_CAPS = [6, 14, 20, 25, 29, 36, 50];
const WEAPON_CAPS = [3, 5, 7, 9, 10, 10, 10];
export function upgradeCap(d: SaveData = Save.d): number {
  return UPGRADE_CAPS[chaptersCleared(d)];
}
export function weaponCap(d: SaveData = Save.d): number {
  return WEAPON_CAPS[chaptersCleared(d)];
}
/** Name of the chapter that raises the caps next (null when everything is unlocked). */
export function nextCapChapter(d: SaveData = Save.d): string | null {
  const k = chaptersCleared(d);
  if (k >= 6) return null;
  return CHAPTERS[(['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const)[k]].num;
}

/** The Abyss pays in line with your story progress (half of your best chapter), never less than ×2. */
export function abismoGoldMult(d: SaveData = Save.d): number {
  let best = 0;
  for (const c of ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const) if (d.chapters[c].cleared) best = CHAPTERS[c].goldMult;
  return Math.max(2, best * 0.5);
}
