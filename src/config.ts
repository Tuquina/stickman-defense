export const GAME_W = 720;
export const GAME_H = 1280;

export const FONT = '"Lilita One", "Arial Black", system-ui, sans-serif';
/** Display font for the logo and big headlines. */
export const TITLE_FONT = '"Luckiest Guy", "Lilita One", "Arial Black", sans-serif';

/** Battlefield geometry (logical pixels). */
export const FIELD = {
  top: 430,
  bottom: 900,
  heroX: 92,
  heroY: 690,
  barricadeX: 190,
  spawnX: 770,
};

export const COLORS = {
  ink: 0x0b0b0e,
  hero: 0x2ad4c4,
  heroDark: 0x168f86,
  dante: 0xe2552c,
  corrupt: 0xa040ff,
  corruptGlow: 0xd27bff,
  gold: 0xffc93c,
  red: 0xe83a3a,
  panel: 0x141c26,
  panelLight: 0x223042,
  panelEdge: 0x3a5068,
  white: 0xffffff,
  xp: 0x5fe0d2,
};

export const TEXT_STROKE = '#0a0a0a';

/** Shared text style factory. */
export function txt(size: number, color = '#ffffff', stroke = 6): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    stroke: TEXT_STROKE,
    strokeThickness: stroke,
    align: 'center',
  };
}

/** Headline style (display font): screen titles, banners, victory/defeat. */
export function ttl(size: number, color = '#ffffff', stroke = 10): Phaser.Types.GameObjects.Text.TextStyle {
  return { ...txt(size, color, stroke), fontFamily: TITLE_FONT };
}
