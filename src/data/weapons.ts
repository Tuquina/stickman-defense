export type WeaponId = 'arco' | 'pistola' | 'baston' | 'escopeta' | 'shuriken' | 'lanza';
export type ProjKind = 'arrow' | 'bullet' | 'orb' | 'pellet' | 'star' | 'lance';

export interface WeaponDef {
  id: WeaponId;
  name: string;
  evoName: string;
  rarity: string;
  desc: string;
  starDesc: string;
  evoDesc: string;
  kind: ProjKind;
  dmgMult: number;
  rate: number; // shots per second
  speed: number; // projectile px/s
  combo: number; // chance of instant double shot
  pierce: number; // extra enemies pierced
  pellets?: number;
  aoe?: number;
  bounce?: number;
  range?: number;
  skillDmg?: number;
  unlockText: string;
  color: number;
}

export const WEAPONS: Record<WeaponId, WeaponDef> = {
  arco: {
    id: 'arco', name: 'ARCO', evoName: 'ARCO DEL ALBA', rarity: 'Legendario',
    desc: 'Flechas veloces que atraviesan.\nCombo +10%',
    starDesc: '+25% daño · +1 perforación en 3★ y 5★',
    evoDesc: 'Cada flecha se divide en 3 al impactar.',
    kind: 'arrow', dmgMult: 1.0, rate: 1.45, speed: 1000, combo: 0.1, pierce: 0,
    unlockText: 'Disponible', color: 0xc98a4b,
  },
  pistola: {
    id: 'pistola', name: 'PISTOLA', evoName: 'PISTOLAS GEMELAS', rarity: 'Legendario',
    desc: 'Cadencia altísima, daño bajo.\nCombo +15%',
    starDesc: '+25% daño · +5% combo',
    evoDesc: 'Dos pistolas: ×2 cadencia.',
    kind: 'bullet', dmgMult: 0.55, rate: 3.0, speed: 1400, combo: 0.15, pierce: 0,
    unlockText: 'Disponible', color: 0xffb340,
  },
  baston: {
    id: 'baston', name: 'BASTÓN ORÁCULO', evoName: 'BASTÓN SUPREMO', rarity: 'Legendario',
    desc: 'Orbe teledirigido que explota.\nDaño de habilidad +15%',
    starDesc: '+25% daño · +12 área',
    evoDesc: 'El orbe lanza 3 rayos encadenados.',
    kind: 'orb', dmgMult: 1.55, rate: 0.85, speed: 620, combo: 0.05, pierce: 0, aoe: 58, skillDmg: 0.15,
    unlockText: 'Disponible', color: 0x6fe3ff,
  },
  escopeta: {
    id: 'escopeta', name: 'ESCOPETA', evoName: 'CAÑÓN BORRÓN', rarity: 'Legendario',
    desc: 'Abanico de 5 perdigones.\nCorto alcance',
    starDesc: '+25% daño · +1 perdigón',
    evoDesc: 'Los perdigones explotan.',
    kind: 'pellet', dmgMult: 0.42, rate: 0.95, speed: 1100, combo: 0.08, pierce: 0, pellets: 5, range: 560,
    unlockText: 'Vence el Capítulo 1', color: 0xff6a3d,
  },
  shuriken: {
    id: 'shuriken', name: 'SHURIKEN', evoName: 'ESTRELLA INFINITA', rarity: 'Legendario',
    desc: 'Rebota entre 2 enemigos.',
    starDesc: '+25% daño · +1 rebote',
    evoDesc: '+4 rebotes, más alcance y cada rebote pega 15% más fuerte.',
    kind: 'star', dmgMult: 0.85, rate: 1.5, speed: 900, combo: 0.1, pierce: 0, bounce: 2,
    unlockText: 'Vence el Capítulo 2', color: 0xc8d2e0,
  },
  lanza: {
    id: 'lanza', name: 'LANZA DE TINTA', evoName: 'LANZA DEL JURAMENTO', rarity: 'Legendario',
    desc: 'Atraviesa filas enteras.\nLenta pero devastadora',
    starDesc: '+25% daño · +1 perforación en 3★ y 5★',
    evoDesc: 'Cada impacto estalla en tinta.',
    kind: 'lance', dmgMult: 2.1, rate: 0.6, speed: 1150, combo: 0.05, pierce: 2,
    unlockText: 'Vence el Capítulo 4', color: 0x6fe3d6,
  },
};

export const WEAPON_ORDER: WeaponId[] = ['arco', 'pistola', 'baston', 'escopeta', 'shuriken', 'lanza'];
export const WEAPON_MAX_LV = 10;
export function weaponLvCost(lv: number): number {
  return Math.round(120 * Math.pow(1.45, lv - 1));
}
