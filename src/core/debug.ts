/**
 * URL debug flags (for automated testing / balancing only):
 *   ?bot=1        the game plays itself (cards, skills, fury, coins)
 *   &ch=c2        start directly in a chapter
 *   &w=pistola    weapon for the direct start
 *   &meta=10      simulate meta upgrades at this level (in memory only, never saved)
 *   &speed=4      simulation speed multiplier
 *   &scene=menu   jump straight into a scene (menu, workshop, chapters, story:<id>)
 */
const q = new URLSearchParams(typeof location !== 'undefined' ? location.search : '');

export const DEBUG = {
  bot: q.get('bot') === '1',
  chapter: q.get('ch'),
  weapon: q.get('w'),
  meta: q.get('meta') ? Number(q.get('meta')) : null,
  speed: q.get('speed') ? Number(q.get('speed')) : 1,
  scene: q.get('scene'),
  armor: q.get('armor') ? Number(q.get('armor')) : null,
};
