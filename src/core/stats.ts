import { ARMORS } from '../data/armor';
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
    case 3: return d.chapters.c3.cleared && d.rank >= 10;
    case 4: return d.chapters.abismo.bestWave >= 25;
    default: return false;
  }
}

export function weaponUnlocked(d: SaveData, w: WeaponId): boolean {
  if (w === 'escopeta') return d.chapters.c1.cleared;
  if (w === 'shuriken') return d.chapters.c2.cleared;
  return true;
}
