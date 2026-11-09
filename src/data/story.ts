import type { Eyes } from '../gfx/stickman';

export type CharId = 'linoKid' | 'danteKid' | 'lino' | 'dante' | 'clip' | 'hueco' | 'eco';
export type PoseId = 'idle' | 'point' | 'fist' | 'laugh' | 'cross' | 'kneel' | 'fallen' | 'hands';

export interface Actor {
  id: CharId;
  power?: string;
  powerColor?: string;
  glow?: boolean;
  eyes?: Eyes;
  mouth?: 'none' | 'grin' | 'open' | 'frown';
  pose?: PoseId;
  alpha?: number;
}

export interface Beat {
  /** who is speaking: 'L' (left), 'R' (right), 'N' narrator, 'C' caption (big centered) */
  who: 'L' | 'R' | 'N' | 'C';
  text: string;
  hl?: string; // highlighted line (orange) under the text
  left?: Actor | null;
  right?: Actor | null;
  bg?: string;
  fx?: ('shake' | 'flash' | 'purple' | 'dark' | 'light' | 'pushL' | 'exitR' | 'pulse')[];
  music?: 'story' | 'sad' | 'boss' | 'menu';
}

export interface StoryScene {
  id: string;
  title: string;
  bg: string;
  music: 'story' | 'sad' | 'boss' | 'menu';
  beats: Beat[];
}

export const CHAR_NAMES: Record<CharId, string> = {
  linoKid: 'Lino', lino: 'Lino', danteKid: 'Dante', dante: 'Dante', clip: 'Tío Clip', hueco: 'Sir Hueco', eco: 'Eco de Dante',
};

const BLUE = '#5fc8ff';
const YELLOW = '#e8f040';
const PURPLE = '#d050ff';

const linoKid = (o: Partial<Actor> = {}): Actor => ({ id: 'linoKid', power: '10', powerColor: BLUE, ...o });
const danteKid = (o: Partial<Actor> = {}): Actor => ({ id: 'danteKid', power: '10', powerColor: BLUE, ...o });
const lino = (o: Partial<Actor> = {}): Actor => ({ id: 'lino', power: '500', powerColor: YELLOW, ...o });
const dante = (o: Partial<Actor> = {}): Actor => ({ id: 'dante', power: '100.000', powerColor: PURPLE, glow: true, ...o });
const clip = (o: Partial<Actor> = {}): Actor => ({ id: 'clip', power: '¿?', powerColor: '#ffc93c', ...o });
const eco = (o: Partial<Actor> = {}): Actor => ({ id: 'eco', power: '100.000', powerColor: PURPLE, glow: true, ...o });
const hueco = (o: Partial<Actor> = {}): Actor => ({ id: 'hueco', power: '20.000', powerColor: '#ff6a6a', ...o });

export const STORY: Record<string, StoryScene> = {
  prologo1: {
    id: 'prologo1', title: 'Prólogo I · El Juramento', bg: 'bg_day', music: 'story',
    beats: [
      { who: 'C', text: 'HACE 5 AÑOS…', left: linoKid({ eyes: 'sad' }), right: danteKid({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'R', text: 'Hey, hermanito. ¿Otra vez te ganó una araña?' , right: danteKid({ eyes: 'happy', mouth: 'open', pose: 'laugh' }) },
      { who: 'L', text: '…Era una araña MUY grande.', left: linoKid({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Jajaja. Tranqui. Mientras yo esté,', hl: 'nadie te toca.', right: danteKid({ eyes: 'determined', mouth: 'grin', pose: 'fist' }) },
      { who: 'L', text: 'Dante… prometamos algo.', left: linoKid({ eyes: 'determined', pose: 'idle' }), right: danteKid({ eyes: 'shock', mouth: 'none', pose: 'idle' }) },
      { who: 'L', text: 'Que nunca nos vamos a abandonar.', left: linoKid({ eyes: 'determined', pose: 'point' }) },
      { who: 'R', text: 'No importa quién tenga más nivel…', hl: 'siempre vamos a ser hermanos.', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'point' }) },
      { who: 'N', text: '¡JURAMENTO DE TINTA!', left: linoKid({ eyes: 'happy', mouth: 'grin', pose: 'fist' }), right: danteKid({ eyes: 'happy', mouth: 'open', pose: 'fist' }), fx: ['flash'] },
      { who: 'N', text: 'Esa noche, La Mancha atacó la aldea.', fx: ['dark', 'shake'], music: 'sad' },
      { who: 'N', text: 'Dante no pudo proteger a Lino.\nLino casi no la cuenta.', fx: ['dark'] },
      { who: 'N', text: 'Y Dante juró algo más. En silencio.', hl: '"Nunca más voy a ser débil."', fx: ['dark', 'purple'] },
    ],
  },
  prologo2: {
    id: 'prologo2', title: 'Prólogo II · 5 años después', bg: 'bg_day', music: 'boss',
    beats: [
      { who: 'C', text: '5 AÑOS DESPUÉS…', left: lino({ eyes: 'determined' }), right: dante({ eyes: 'smug', pose: 'cross' }) },
      { who: 'R', text: 'Hey, hermanito.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'cross' }) },
      { who: 'L', text: '¿Dante…? ¿Qué te pasó?\n¿Qué es esa corona?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Mi poder ya es de', hl: '¡CIEN MIL!', right: dante({ eyes: 'glow', mouth: 'open', pose: 'fist' }), fx: ['shake', 'purple', 'pulse'] },
      { who: 'L', text: '¿Y el juramento?\nDijiste que siempre…', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: '¿Juramento? Los juramentos', hl: 'son para los de nivel bajo.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'laugh' }) },
      { who: 'R', text: 'Mírate. Quinientos.', hl: 'Eres basura, Lino.', right: dante({ eyes: 'angry', mouth: 'frown', pose: 'point' }) },
      { who: 'N', text: '¡PUM!', left: lino({ eyes: 'closed', pose: 'fallen' }), fx: ['shake', 'flash', 'pushL'] },
      { who: 'R', text: 'Ni siquiera vale la pena absorberte.', right: dante({ eyes: 'smug', mouth: 'none', pose: 'cross' }) },
      { who: 'N', text: '(Dante se va. Ni mira atrás.)', right: dante({ eyes: 'smug', pose: 'idle' }), fx: ['exitR'] },
      { who: 'L', text: '…', left: lino({ eyes: 'sad', pose: 'kneel' }), right: null, music: 'sad' },
      { who: 'L', text: 'Esto…', hl: 'no va a quedar así.', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'light'], music: 'boss' },
      { who: 'C', text: 'JURAMENTO DE TINTA', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['flash'] },
    ],
  },
  c1_intro: {
    id: 'c1_intro', title: 'Cap. 1 · Tío Clip', bg: 'bg_c1', music: 'menu',
    beats: [
      { who: 'R', text: 'Psst. Tú. El de la bufanda triste.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool', mouth: 'grin' }) },
      { who: 'L', text: '¿Y tú quién eres?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Tío Clip. Emprendedor. Mercader.', hl: 'Coach motivacional.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }) },
      { who: 'R', text: 'Vi lo que pasó. Tu hermano te dejó', hl: 'en visto… emocionalmente.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'Necesito hacerme fuerte.', hl: 'Muy fuerte.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Tráeme oro y te vendo poder.', hl: 'Sin estafas. Casi.', right: clip({ eyes: 'cool', mouth: 'open', pose: 'hands' }) },
      { who: 'R', text: 'Empieza por el Bosque Sombrío.', hl: 'Las arañas están en oferta.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }) },
      { who: 'N', text: 'Tu héroe ataca solo.\nTOCA un enemigo para marcarlo:', hl: '+30% de daño al marcado.' },
      { who: 'N', text: 'Usa las HABILIDADES de abajo\ny la FURIA cuando se llene.', hl: '¡Toca las monedas: valen el doble!' },
    ],
  },
  c1_outro: {
    id: 'c1_outro', title: 'Cap. 1 · La marca', bg: 'bg_c1', music: 'story',
    beats: [
      { who: 'L', text: 'Esa araña… tenía una marca morada', hl: 'en la corona.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Ah, sí. La marca de la Corona Hueca.', hl: 'Un clásico.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'cross' }) },
      { who: 'L', text: '¿La qué?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Un artefacto de las Ruinas del Castillo.', hl: 'Roba el trazo de los que derrotas.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'point' }) },
      { who: 'L', text: 'Así llegó a cien mil…', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Te armé algo: Capucha de Vigía.', hl: 'Piel sintética. Soy vegano.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', text: '¡Desbloqueaste la CAPUCHA DE VIGÍA\ny la ESCOPETA!', fx: ['flash'] },
    ],
  },
  c2_intro: {
    id: 'c2_intro', title: 'Cap. 2 · Las Ruinas', bg: 'bg_c2', music: 'story',
    beats: [
      { who: 'L', text: 'Las Ruinas del Castillo…', hl: 'aquí jugábamos de niños.', left: lino({ eyes: 'sad' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Ahora juegan esqueletos.', hl: 'La gentrificación es terrible.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'N', text: '¿?: "Quien busca la Corona…', hl: '…encuentra el vacío."', fx: ['dark'] },
      { who: 'L', text: 'No busco la Corona.', hl: 'Busco a mi hermano.', left: lino({ eyes: 'angry', pose: 'fist' }) },
    ],
  },
  c2_outro: {
    id: 'c2_outro', title: 'Cap. 2 · El precio', bg: 'bg_c2', music: 'sad',
    beats: [
      { who: 'R', text: 'Yo… fui el primero.', hl: 'Tu hermano me derrotó aquí.', left: lino({ eyes: 'determined' }), right: hueco({ pose: 'kneel' }) },
      { who: 'R', text: 'La Corona tomó mi trazo. Mi nombre.', hl: 'Y a mi familia… de mi memoria.', right: hueco({ pose: 'kneel' }) },
      { who: 'L', text: '¿De tu memoria?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'La Corona da poder, pero cobra en vínculos.', hl: 'Borra lo que más amas.', right: hueco({ pose: 'kneel' }), fx: ['purple'] },
      { who: 'L', text: 'Entonces Dante…', hl: '¿se está olvidando de todo?', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'De todo. Y de todos.', hl: 'Apúrate, chico.', right: hueco({ pose: 'kneel' }) },
      { who: 'R', text: 'Bueno, ¡qué drama! Toma: Armadura de Caballero.', hl: 'Brilla. Combina con tu trauma.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }), music: 'menu' },
      { who: 'N', text: '¡Desbloqueaste la ARMADURA DE CABALLERO\ny el SHURIKEN!', fx: ['flash'] },
    ],
  },
  c3_intro: {
    id: 'c3_intro', title: 'Cap. 3 · La Ciudadela', bg: 'bg_c3', music: 'boss',
    beats: [
      { who: 'L', text: 'La Ciudadela de Ceniza.', hl: 'Aquí vive ahora.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Decoración minimalista: ceniza,', hl: 'ceniza y… más ceniza.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'R', text: 'Hermanito… viniste.', right: eco({ eyes: 'glow', pose: 'cross' }), fx: ['purple', 'shake'] },
      { who: 'L', text: '¡DANTE!', left: lino({ eyes: 'angry', pose: 'point' }) },
      { who: 'R', text: 'No soy Dante. Soy lo que la Corona', hl: 'dejó de él. Un eco.', right: eco({ eyes: 'glow', pose: 'idle' }) },
      { who: 'R', text: 'Mi poder ya es de', hl: '¡CIEN MIL! ¡CIEN MIL!', right: eco({ eyes: 'glow', mouth: 'open', pose: 'fist' }), fx: ['shake', 'pulse'] },
      { who: 'R', text: 'Ok, eso fue perturbador.', hl: 'Disco rayado nivel jefe.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
    ],
  },
  c3_outro: {
    id: 'c3_outro', title: 'Cap. 3 · No recuerdo', bg: 'bg_c3', music: 'sad',
    beats: [
      { who: 'R', text: 'Hermanito… ¿por qué', hl: 'peleas tanto?', left: lino({ eyes: 'determined' }), right: eco({ eyes: 'glow', pose: 'kneel', alpha: 0.75 }) },
      { who: 'L', text: 'Por el juramento.', hl: '¡¿No lo recuerdas?!', left: lino({ eyes: 'angry', pose: 'point' }) },
      { who: 'R', text: '¿Juramento…?', hl: 'No recuerdo ningún juramento.', right: eco({ eyes: 'closed', pose: 'kneel', alpha: 0.5 }) },
      { who: 'L', text: '…', left: lino({ eyes: 'sad', pose: 'hands' }), right: null },
      { who: 'L', text: 'Entonces voy a hacer que lo recuerdes.', hl: 'Aunque tenga que llegar a cien mil.', left: lino({ eyes: 'determined', pose: 'fist' }), music: 'boss' },
      { who: 'N', text: 'Dante (a lo lejos): "Interesante…', hl: '…hermanito."', fx: ['purple', 'shake'] },
      { who: 'R', text: 'Bueno… se viene temporada 2.', hl: 'Mientras, el ABISMO te espera.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }), music: 'menu' },
      { who: 'N', text: '¡Desbloqueaste EL ABISMO!\nOleada 25 = set HEREDERO DEL JURAMENTO.', fx: ['flash'] },
    ],
  },
};

export const STORY_ORDER = ['prologo1', 'prologo2', 'c1_intro', 'c1_outro', 'c2_intro', 'c2_outro', 'c3_intro', 'c3_outro'];

export const DEFEAT_QUIPS = [
  'Skill issue, hermano.',
  'F en el chat.',
  'La barricada era de cartón. Literal.',
  'Tranqui, todos empezamos siendo basura.\nBueno, tú un poquito más.',
  'Dante se está riendo en algún lado.',
  'Mejora en el Taller. Acepto oro. Solo oro.',
];

export const VICTORY_QUIPS = [
  '¡Eso, campeón! Ahora gástalo conmigo.',
  'Dante sintió un escalofrío. Seguro.',
  'Nivel de poder: subiendo. Nivel de trauma: estable.',
];
