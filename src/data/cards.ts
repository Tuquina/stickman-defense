export type PassiveId =
  | 'filo' | 'prisa' | 'critico' | 'combo' | 'estacas' | 'savia'
  | 'mente' | 'perforacion' | 'sabiduria' | 'bolsillos' | 'furia';

export type SkillId = 'lluvia' | 'rayo' | 'bomba' | 'muro' | 'hielo' | 'tornado';

export type LegendId =
  | 'dobleTrazo' | 'vampiro' | 'eco' | 'tormenta' | 'corazon' | 'ejecutor' | 'furiaEterna' | 'estallido';

export interface PassiveDef { id: PassiveId; name: string; desc: string; icon: string; color: number }
export interface SkillDef { id: SkillId; name: string; desc: string; cd: number; color: number }
export interface LegendDef { id: LegendId; name: string; desc: string }

export const MAX_PASSIVE = 5;
export const MAX_SKILL = 5;
export const MAX_SKILL_SLOTS = 3;
export const MAX_TURRETS = 3;
export const MILESTONES = [10, 25, 40];

export const PASSIVES: Record<PassiveId, PassiveDef> = {
  filo: { id: 'filo', name: 'Filo de Tinta', desc: '+15% daño', icon: 'ATK', color: 0xe8553a },
  prisa: { id: 'prisa', name: 'Prisa', desc: '+12% velocidad de ataque', icon: 'VEL', color: 0x3ad1e8 },
  critico: { id: 'critico', name: 'Ojo Crítico', desc: '+6% prob. de crítico', icon: 'CRT', color: 0xffc93c },
  combo: { id: 'combo', name: 'Combo', desc: '+6% prob. de volver a disparar al instante', icon: 'x2', color: 0xff8a3c },
  estacas: { id: 'estacas', name: 'Estacas Reforzadas', desc: '+20% vida máx. de barricada', icon: 'HP', color: 0x9c6b3c },
  savia: { id: 'savia', name: 'Savia', desc: 'Regenera 0,4% barricada/seg', icon: '+', color: 0x4fd06a },
  mente: { id: 'mente', name: 'Mente Rápida', desc: '−8% recarga de habilidades', icon: 'CD', color: 0x7a7cff },
  perforacion: { id: 'perforacion', name: 'Perforación', desc: '+1 enemigo atravesado', icon: '>>', color: 0xc0c8d8 },
  sabiduria: { id: 'sabiduria', name: 'Sabiduría', desc: '+15% XP', icon: 'XP', color: 0x5fe0d2 },
  bolsillos: { id: 'bolsillos', name: 'Bolsillos Hondos', desc: '+20% oro', icon: '$', color: 0xffd34d },
  furia: { id: 'furia', name: 'Furia Creciente', desc: '+20% carga de Furia', icon: '!!', color: 0xff3d6a },
};

export const SKILLS: Record<SkillId, SkillDef> = {
  lluvia: { id: 'lluvia', name: 'Lluvia de Flechas', desc: '12 flechas caen sobre el grupo más denso', cd: 10, color: 0xc98a4b },
  rayo: { id: 'rayo', name: 'Cadena de Rayos', desc: 'Salta entre 6 enemigos · ×2 a marcados', cd: 7, color: 0x6fd8ff },
  bomba: { id: 'bomba', name: 'Bomba de Borrón', desc: 'Gran explosión que empuja', cd: 12, color: 0x9a5cff },
  muro: { id: 'muro', name: 'Muro de Tinta', desc: 'Cura 15% la barricada y empuja a todos', cd: 15, color: 0x2ad4c4 },
  hielo: { id: 'hielo', name: 'Escarcha de Grafito', desc: 'Congela a todos 2,5 s · congelados reciben +25% daño', cd: 18, color: 0xbfe9ff },
  tornado: { id: 'tornado', name: 'Tornado de Papel', desc: 'Arrastra y agrupa enemigos (combo ideal para bombas)', cd: 12, color: 0xf0f0f0 },
};

export const LEGENDS: Record<LegendId, LegendDef> = {
  dobleTrazo: { id: 'dobleTrazo', name: 'Doble Trazo', desc: '+1 proyectil por disparo' },
  vampiro: { id: 'vampiro', name: 'Vampiro de Tinta', desc: 'Cada eliminación cura 0,5% de la barricada' },
  eco: { id: 'eco', name: 'Eco Arcano', desc: 'Las habilidades se repiten al 50%' },
  tormenta: { id: 'tormenta', name: 'Tormenta Crítica', desc: '+10% crítico y los críticos hacen ×3' },
  corazon: { id: 'corazon', name: 'Corazón de Hermano', desc: '+60% daño con la barricada bajo 35%' },
  ejecutor: { id: 'ejecutor', name: 'Ejecutor', desc: 'Enemigos normales bajo 12% de vida mueren al instante' },
  furiaEterna: { id: 'furiaEterna', name: 'Furia Eterna', desc: 'La Furia dura el doble y carga 50% más rápido' },
  estallido: { id: 'estallido', name: 'Estallido de Tinta', desc: 'Los enemigos explotan al morir' },
};

// ------------------------------------------------------------------ Juramentos de Tinta (late-run, exclusive)
/**
 * From level OATH_LEVEL on, level-ups also offer "Juramentos": three groups of three, and only ONE
 * oath per group can be active. Picking another oath of a group you already hold swaps it (the level
 * is kept), so late choices are about shaping the build instead of stacking more of everything.
 */
export type OathGroup = 'tinta' | 'barricada' | 'heroe';
export type OathId = 'ardiente' | 'helada' | 'electrica' | 'espinas' | 'raices' | 'muro' | 'francotirador' | 'berserker' | 'cazador';
export interface OathDef { id: OathId; group: OathGroup; name: string; desc: [string, string, string] }
export const OATH_LEVEL = 30;
export const OATH_MAX = 3;
export const OATH_GROUPS: Record<OathGroup, { name: string; color: number }> = {
  tinta: { name: 'Tinta', color: 0xff8a3c },
  barricada: { name: 'Barricada', color: 0x4fd06a },
  heroe: { name: 'Héroe', color: 0x6fd8ff },
};
export const OATHS: Record<OathId, OathDef> = {
  ardiente: { id: 'ardiente', group: 'tinta', name: 'Tinta Ardiente', desc: ['Tus disparos queman: +30% del golpe en 3 s', 'Quema +45%', 'Quema +60%'] },
  helada: { id: 'helada', group: 'tinta', name: 'Tinta Helada', desc: ['30% de ralentizar al golpear', '45% de ralentizar', '60% de ralentizar'] },
  electrica: { id: 'electrica', group: 'tinta', name: 'Tinta Eléctrica', desc: ['12% de soltar un rayo en cadena', '18% de rayo en cadena', '24% de rayo en cadena'] },
  espinas: { id: 'espinas', group: 'barricada', name: 'Espinas', desc: ['Quien golpea la barricada se hiere', 'Espinas más filosas', 'Espinas brutales'] },
  raices: { id: 'raices', group: 'barricada', name: 'Raíces', desc: ['Si no la golpean 2 s, se regenera 0,6%/s', 'Regenera 1%/s', 'Regenera 1,4%/s'] },
  muro: { id: 'muro', group: 'barricada', name: 'Muro Vivo', desc: ['+25% vida máx. de barricada', '+40% vida máx.', '+60% vida máx.'] },
  francotirador: { id: 'francotirador', group: 'heroe', name: 'Francotirador', desc: ['+30% daño a enemigos lejanos', '+50% a lejanos', '+70% a lejanos'] },
  berserker: { id: 'berserker', group: 'heroe', name: 'Berserker', desc: ['Hasta +40% velocidad cuanto más dañada la barricada', 'Hasta +60%', 'Hasta +80%'] },
  cazador: { id: 'cazador', group: 'heroe', name: 'Cazador', desc: ['+40% daño extra al marcado', '+70% al marcado', '+100% al marcado'] },
};
