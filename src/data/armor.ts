export interface ArmorDef {
  tier: number;
  name: string;
  desc: string;
  atk: number; // multiplier bonus
  hp: number;
  unlockText: string;
}

export const ARMORS: ArmorDef[] = [
  { tier: 0, name: 'Bufanda del Juramento', desc: 'La bufanda que Dante te regaló.', atk: 0, hp: 0, unlockText: 'Inicio' },
  { tier: 1, name: 'Capucha de Vigía', desc: 'Capucha azul con cuello de piel. Sintética.', atk: 0.1, hp: 0.15, unlockText: 'Vence el Capítulo 1' },
  { tier: 2, name: 'Armadura de Caballero', desc: 'Yelmo, hombreras y capa azul.', atk: 0.25, hp: 0.3, unlockText: 'Vence el Capítulo 2' },
  { tier: 3, name: 'Paladín de Tinta', desc: 'Oro, alas y un aura celeste.', atk: 0.45, hp: 0.5, unlockText: 'Vence el Capítulo 3 y llega a Rango 10' },
  { tier: 4, name: 'Heredero del Juramento', desc: 'Blanco y oro. La promesa hecha armadura.', atk: 0.8, hp: 0.8, unlockText: 'Vence el Capítulo 5 (u oleada 25 en El Abismo)' },
];
