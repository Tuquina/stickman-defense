import { GAME_H, GAME_W, txt } from '../config';
import { Sound } from '../core/audio';
import { fmt } from '../core/format';
import { Save } from '../core/save';
import { armorUnlocked, power, weaponUnlocked } from '../core/stats';
import { ARMORS } from '../data/armor';
import { UPGRADES, upgradeCost } from '../data/upgrades';
import { WEAPON_MAX_LV, WEAPON_ORDER, WEAPONS, weaponLvCost } from '../data/weapons';
import { drawCharacter } from '../gfx/characters';
import { drawStickman, POSES } from '../gfx/stickman';
import { button, drawPanel, fadeIn, go, goldLabel, iconBox, onUpdate } from '../ui/widgets';

type Tab = 'mejoras' | 'armas' | 'armaduras';

export class WorkshopScene extends Phaser.Scene {
  private tab: Tab = 'mejoras';
  private content!: Phaser.GameObjects.Container;
  private header!: Phaser.GameObjects.Container;
  private tabs: Record<Tab, ReturnType<typeof button>> = {} as Record<Tab, ReturnType<typeof button>>;
  private armorIdx = 0;
  private preview: Phaser.GameObjects.Graphics | null = null;
  private t = 0;

  constructor() {
    super('Workshop');
  }

  create(): void {
    fadeIn(this);
    Sound.music('menu');
    this.add.image(GAME_W / 2, GAME_H / 2, 'bg_dusk');
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x05070a, 0.7);
    this.add.text(GAME_W / 2, 60, 'TALLER DEL TÍO CLIP', txt(46, '#ffffff', 9)).setOrigin(0.5);
    const clip = this.add.graphics({ x: 640, y: 150 }).setScale(0.8);
    onUpdate(this, (_a: number, dt: number) => {
      this.t += dt / 1000;
      drawCharacter(clip, { id: 'clip', eyes: 'cool', mouth: 'grin', pose: 'point' }, 0, 0.9, -1, this.t);
      if (this.preview) {
        drawStickman(this.preview.clear(), 0, 0, 2.6, POSES.idle(this.t), { tier: this.armorIdx, eyes: 'determined', weapon: Save.d.lastWeapon }, 1, this.t);
      }
    });
    this.header = this.add.container(0, 0);
    this.armorIdx = Save.d.armorEquipped;

    const tabs: [Tab, string, number][] = [['mejoras', 'MEJORAS', 130], ['armas', 'ARMAS', 360], ['armaduras', 'ARMADURAS', 590]];
    for (const [id, label, x] of tabs) {
      this.tabs[id] = button(this, x, 220, 210, 70, label, () => {
        this.tab = id;
        this.refresh();
      }, { size: 28, color: 0x3a4a5e });
    }
    button(this, GAME_W / 2, 1215, 300, 80, 'VOLVER', () => go(this, 'Menu'), { size: 32, color: 0x3a4a5e });
    this.refresh();
  }

  private refresh(): void {
    this.content?.destroy();
    this.preview = null;
    this.header.removeAll(true);
    const d = Save.d;
    this.header.add(goldLabel(this, 50, 135, fmt(d.gold), 38));
    this.header.add(this.add.text(50, 172, `Poder: ${fmt(power(d))}`, txt(24, '#e8f040', 5)).setOrigin(0, 0.5));
    for (const k of Object.keys(this.tabs) as Tab[]) this.tabs[k].redraw(k === this.tab ? 0x2a9d8f : 0x3a4a5e);
    this.content = this.add.container(0, 0);
    if (this.tab === 'mejoras') this.buildUpgrades();
    else if (this.tab === 'armas') this.buildWeapons();
    else this.buildArmor();
  }

  private row(y: number, h: number): Phaser.GameObjects.Graphics {
    const g = this.add.graphics();
    drawPanel(g, 30, y, 660, h, 0x1c2a44, 0x05070a, 14);
    this.content.add(g);
    return g;
  }

  private buy(cost: number, apply: () => void): void {
    const d = Save.d;
    if (d.gold < cost) {
      Sound.play('error');
      this.cameras.main.shake(120, 0.004);
      return;
    }
    d.gold -= cost;
    apply();
    Save.write();
    Sound.play('buy');
    this.refresh();
  }

  /** Adds a coin icon to a price button. */
  private priceTag(b: ReturnType<typeof button>, maxed: boolean): ReturnType<typeof button> {
    if (!maxed) {
      b.label.setX(14);
      b.addAt(this.add.image(-48, -1, 'coin').setScale(0.95), 2);
    }
    return b;
  }

  private buildUpgrades(): void {
    const d = Save.d;
    UPGRADES.forEach((u, i) => {
      const y = 280 + i * 125;
      this.row(y, 112);
      const lv = d.upgrades[u.id];
      const maxed = lv >= u.max;
      const cost = upgradeCost(u, lv);
      this.content.add(iconBox(this, 90, y + 56, 84, u.tex, u.icon, u.color));
      this.content.add(this.add.text(150, y + 14, `${u.name}  Nv.${lv}`, txt(32, '#ffc93c', 6)).setOrigin(0, 0));
      const now = u.id === 'precision' ? `+${(lv * u.per * 100).toFixed(0)}%` : `+${Math.round(lv * u.per * 100)}%`;
      this.content.add(this.add.text(150, y + 60, `${now} ${u.desc} (+${Math.round(u.per * 100)}%/nv)`, txt(21, '#bfe9ff', 4)).setOrigin(0, 0));
      const b = button(this, 590, y + 56, 170, 76, maxed ? 'MÁX' : fmt(cost), () => this.buy(cost, () => { d.upgrades[u.id]++; }), {
        size: 28, color: maxed ? 0x4a5260 : d.gold >= cost ? 0xe2a020 : 0x6a5a3a, disabled: maxed,
      });
      this.content.add(this.priceTag(b, maxed));
    });
  }

  private buildWeapons(): void {
    const d = Save.d;
    WEAPON_ORDER.forEach((id, i) => {
      const w = WEAPONS[id];
      const y = 272 + i * 148;
      this.row(y, 134);
      const unlocked = weaponUnlocked(d, id);
      const lv = d.weaponLv[id];
      const maxed = lv >= WEAPON_MAX_LV;
      const cost = weaponLvCost(lv);
      const ic = iconBox(this, 96, y + 67, 100, `ic_${id}`, '', 0xf6a63a);
      if (!unlocked) ic.setAlpha(0.35);
      this.content.add(ic);
      this.content.add(this.add.text(162, y + 10, w.name, txt(30, unlocked ? '#ffc93c' : '#6a7480', 6)).setOrigin(0, 0));
      if (unlocked) {
        this.content.add(this.add.text(162, y + 52, `Nivel ${lv}/${WEAPON_MAX_LV} · Daño +${(lv - 1) * 10}%`, txt(23, '#bfe9ff', 4)).setOrigin(0, 0));
        this.content.add(this.add.text(162, y + 88, `Evolución: ${w.evoName}`, txt(20, '#ffb340', 4)).setOrigin(0, 0));
        this.content.add(this.priceTag(button(this, 590, y + 67, 170, 72, maxed ? 'MÁX' : fmt(cost), () => this.buy(cost, () => { d.weaponLv[id]++; }), {
          size: 28, color: maxed ? 0x4a5260 : d.gold >= cost ? 0xe2a020 : 0x6a5a3a, disabled: maxed,
        }), maxed));
      } else {
        this.content.add(this.add.text(162, y + 58, `Bloqueado: ${w.unlockText}`, txt(23, '#8a94a0', 4)).setOrigin(0, 0));
        this.content.add(this.add.image(600, y + 67, 'lock'));
      }
    });
  }

  private buildArmor(): void {
    const d = Save.d;
    const a = ARMORS[this.armorIdx];
    const unlocked = armorUnlocked(d, a.tier);
    const g = this.add.graphics();
    drawPanel(g, 30, 280, 660, 880, 0x1c2a44, 0x05070a, 18);
    this.content.add(g);
    this.content.add(this.add.text(GAME_W / 2, 320, `TIER ${a.tier}`, txt(26, '#ffc93c', 5)).setOrigin(0.5));
    this.content.add(this.add.text(GAME_W / 2, 362, a.name, txt(42, unlocked ? '#ffffff' : '#6a7480', 8)).setOrigin(0.5));
    this.preview = this.add.graphics({ x: GAME_W / 2 - 10, y: 820 });
    if (!unlocked) this.preview.setAlpha(0.25);
    this.content.add(this.preview);
    if (!unlocked) this.content.add(this.add.image(GAME_W / 2, 600, 'lock').setScale(2));
    this.content.add(this.add.text(GAME_W / 2, 870, a.desc, txt(24, '#bfe9ff', 4)).setOrigin(0.5));
    this.content.add(this.add.text(GAME_W / 2, 915, a.tier === 0 ? 'Sin bonus' : `+${Math.round(a.atk * 100)}% daño · +${Math.round(a.hp * 100)}% vida`, txt(30, '#6aff8a', 6)).setOrigin(0.5));
    if (!unlocked) this.content.add(this.add.text(GAME_W / 2, 960, `Se desbloquea: ${a.unlockText}`, txt(24, '#ff9a6a', 5)).setOrigin(0.5));

    const equipped = d.armorEquipped === a.tier;
    this.content.add(button(this, GAME_W / 2, 1070, 360, 90, equipped ? 'EQUIPADA' : unlocked ? 'EQUIPAR' : 'BLOQUEADA', () => {
      if (!unlocked || equipped) return;
      d.armorEquipped = a.tier;
      Save.write();
      Sound.play('legend');
      this.refresh();
    }, { size: 34, color: equipped ? 0x2a9d8f : 0xe2552c, disabled: !unlocked }));
    const nav = (dir: number) => {
      this.armorIdx = (this.armorIdx + dir + ARMORS.length) % ARMORS.length;
      this.refresh();
    };
    this.content.add(button(this, 90, 600, 80, 120, '<', () => nav(-1), { size: 50, color: 0x3a4a5e }));
    this.content.add(button(this, 630, 600, 80, 120, '>', () => nav(1), { size: 50, color: 0x3a4a5e }));
  }
}
