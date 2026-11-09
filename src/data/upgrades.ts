export type UpgradeId = 'fuerza' | 'barricada' | 'agilidad' | 'precision' | 'codicia' | 'sabiduria' | 'furia';

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  desc: string;
  per: number;
  base: number;
  max: number;
  icon: string;
  color: number;
  /** baked icon texture (shares the passive icon set) */
  tex: string;
}

export const UPGRADES: UpgradeDef[] = [
  { id: 'fuerza', tex: 'pi_filo', name: 'Fuerza', desc: 'daño', per: 0.06, base: 40, max: 50, icon: 'ATK', color: 0xe8553a },
  { id: 'barricada', tex: 'pi_estacas', name: 'Barricada', desc: 'vida de barricada', per: 0.08, base: 40, max: 50, icon: 'HP', color: 0x9c6b3c },
  { id: 'agilidad', tex: 'pi_prisa', name: 'Agilidad', desc: 'velocidad de ataque', per: 0.03, base: 60, max: 30, icon: 'VEL', color: 0x3ad1e8 },
  { id: 'precision', tex: 'pi_critico', name: 'Precisión', desc: 'prob. de crítico', per: 0.01, base: 60, max: 25, icon: 'CRT', color: 0xffc93c },
  { id: 'codicia', tex: 'pi_bolsillos', name: 'Codicia', desc: 'oro', per: 0.05, base: 80, max: 30, icon: '$', color: 0xffd34d },
  { id: 'sabiduria', tex: 'pi_sabiduria', name: 'Sabiduría', desc: 'XP en batalla', per: 0.04, base: 80, max: 25, icon: 'XP', color: 0x5fe0d2 },
  { id: 'furia', tex: 'pi_furia', name: 'Furia', desc: 'carga de Furia', per: 0.05, base: 70, max: 20, icon: '!!', color: 0xff3d6a },
];

export function upgradeCost(def: UpgradeDef, lv: number): number {
  return Math.round(def.base * Math.pow(1.3, lv));
}
