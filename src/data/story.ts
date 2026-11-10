import type { Eyes } from '../gfx/stickman';

export type CharId = 'linoKid' | 'danteKid' | 'lino' | 'dante' | 'clip' | 'hueco' | 'eco' | 'recuerdo' | 'danteLibre';
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
  fx?: ('shake' | 'flash' | 'purple' | 'dark' | 'light' | 'pushL' | 'exitR' | 'pulse' | 'page')[];
  /** branching beat: shows buttons instead of advancing on tap */
  choice?: { label: string; desc: string; next: string; finale: 'venganza' | 'liberacion'; color: number }[];
  music?: 'story' | 'sad' | 'boss' | 'menu';
}

export interface StoryScene {
  id: string;
  title: string;
  bg: string;
  music: 'story' | 'sad' | 'boss' | 'menu';
  beats: Beat[];
}

/** Name-plate colour of each speaker in the dialogue box. */
export const CHAR_COLORS: Record<CharId, number> = {
  linoKid: 0x2ad4c4, lino: 0x2ad4c4, danteKid: 0xe2552c, dante: 0xa040ff, clip: 0xd8a020, hueco: 0xb83a3a,
  eco: 0x7a3ad8, recuerdo: 0xb060ff, danteLibre: 0xe2552c,
};

export const CHAR_NAMES: Record<CharId, string> = {
  linoKid: 'Lino', lino: 'Lino', danteKid: 'Dante', dante: 'Dante', clip: 'Tío Clip', hueco: 'Sir Hueco', eco: 'Eco de Dante',
  recuerdo: 'El Recuerdo Roto', danteLibre: 'Dante',
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
const recuerdo = (o: Partial<Actor> = {}): Actor => ({ id: 'recuerdo', power: '10', powerColor: PURPLE, glow: true, ...o });
const libre = (o: Partial<Actor> = {}): Actor => ({ id: 'danteLibre', power: '10', powerColor: BLUE, ...o });

export const STORY: Record<string, StoryScene> = {
  prologo1: {
    id: 'prologo1', title: 'Prólogo I · El Juramento', bg: 'bg_day', music: 'story',
    beats: [
      { who: 'C', text: 'VALTINTA · HACE 5 AÑOS', left: linoKid({ eyes: 'sad' }), right: danteKid({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'N', text: 'En Valtinta todo está hecho de tinta.', hl: 'El poder de cada uno se llama Trazo.' },
      { who: 'R', text: 'Hey, hermanito. ¿Otra vez te ganó una araña?', right: danteKid({ eyes: 'happy', mouth: 'open', pose: 'laugh' }) },
      { who: 'L', text: '…Era una araña MUY grande.', left: linoKid({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Jajaja. Tranqui. Mientras yo esté,', hl: 'nadie te toca.', right: danteKid({ eyes: 'determined', mouth: 'grin', pose: 'fist' }) },
      { who: 'L', text: 'Dante… prometamos algo.', left: linoKid({ eyes: 'determined', pose: 'idle' }), right: danteKid({ eyes: 'shock', mouth: 'none', pose: 'idle' }) },
      { who: 'L', text: 'Que nunca nos vamos a abandonar.', hl: 'Pase lo que pase.', left: linoKid({ eyes: 'determined', pose: 'point' }) },
      { who: 'R', text: 'No importa quién tenga más nivel…', hl: 'siempre vamos a ser hermanos.', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'point' }) },
      { who: 'R', text: 'Escribámoslo. Lo que se escribe con tinta', hl: 'no se borra.', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', text: 'Y lo firmaron los dos:', hl: '¡JURAMENTO DE TINTA!', left: linoKid({ eyes: 'happy', mouth: 'grin', pose: 'fist' }), right: danteKid({ eyes: 'happy', mouth: 'open', pose: 'fist' }), fx: ['flash', 'page'] },
      { who: 'N', text: 'Esa misma noche, La Mancha atacó la aldea:', hl: 'una marea de monstruos de tinta.', fx: ['dark', 'shake'], music: 'sad' },
      { who: 'N', text: 'Dante no pudo protegerlo.', hl: 'Lino casi no sobrevive.', fx: ['dark'] },
      { who: 'N', text: 'Mientras Lino se recuperaba, Dante juró algo más. En silencio:', hl: '"Nunca más voy a ser débil."', fx: ['dark', 'purple'] },
    ],
  },
  prologo2: {
    id: 'prologo2', title: 'Prólogo II · Cinco años después', bg: 'bg_day', music: 'boss',
    beats: [
      { who: 'C', text: 'CINCO AÑOS DESPUÉS…', left: lino({ eyes: 'determined' }), right: null },
      { who: 'N', text: 'Dante desapareció aquella noche.', hl: 'Hoy volvió. Con una corona.', right: dante({ eyes: 'smug', pose: 'cross' }), fx: ['purple'] },
      { who: 'R', text: 'Hey, hermanito.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'cross' }) },
      { who: 'L', text: '¿Dante? ¿Dónde estuviste?', hl: '¿Qué es esa corona?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Mi poder ya es de', hl: '¡CIEN MIL!', right: dante({ eyes: 'glow', mouth: 'open', pose: 'fist' }), fx: ['shake', 'purple', 'pulse'] },
      { who: 'L', text: '¿Y el juramento?', hl: 'Dijiste que siempre…', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: '¿Juramento? Los juramentos', hl: 'son para los de nivel bajo.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'laugh' }) },
      { who: 'R', text: 'Mírate. Quinientos.', hl: 'Eres basura, Lino.', right: dante({ eyes: 'angry', mouth: 'frown', pose: 'point' }) },
      { who: 'N', text: '¡PUM!', left: lino({ eyes: 'closed', pose: 'fallen' }), fx: ['shake', 'flash', 'pushL'] },
      { who: 'R', text: 'La Corona se alimenta del Trazo de los que venzo.', hl: 'El tuyo ni siquiera vale la pena.', right: dante({ eyes: 'smug', mouth: 'none', pose: 'cross' }) },
      { who: 'N', text: 'Dante se va.', hl: 'No mira atrás.', right: dante({ eyes: 'smug', pose: 'idle' }), fx: ['exitR'] },
      { who: 'L', text: '…', left: lino({ eyes: 'sad', pose: 'kneel' }), right: null, music: 'sad' },
      { who: 'L', text: 'Esto…', hl: 'no va a quedar así.', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'light'], music: 'boss' },
      { who: 'C', text: 'JURAMENTO DE TINTA', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['flash'] },
    ],
  },
  c1_intro: {
    id: 'c1_intro', title: 'Capítulo 1 · El Bosque Sombrío', bg: 'bg_c1', music: 'menu',
    beats: [
      { who: 'N', text: 'Días después, La Mancha vuelve a moverse.', hl: 'Sus arañas van directo hacia la aldea.', left: lino({ eyes: 'determined' }), right: null },
      { who: 'R', text: 'Psst. Tú. El de la bufanda triste.', right: clip({ eyes: 'cool', mouth: 'grin' }) },
      { who: 'L', text: '¿Y tú quién eres?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Tío Clip. Mercader, emprendedor', hl: 'y coach motivacional.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }) },
      { who: 'R', text: 'Vi lo que te hizo tu hermano.', hl: 'Te dejó en visto… emocionalmente.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'Necesito hacerme fuerte.', hl: 'Lo suficiente para alcanzarlo.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Trato: tú frenas a los monstruos y yo te vendo mejoras.', hl: 'Sin estafas. Casi.', right: clip({ eyes: 'cool', mouth: 'open', pose: 'hands' }) },
      { who: 'R', text: 'Las arañas cruzan el Bosque Sombrío.', hl: 'Arma una barricada y no las dejes pasar.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }) },
      { who: 'N', text: 'Tu héroe dispara solo. TOCA a un enemigo para marcarlo:', hl: 'recibe +30% de daño.' },
      { who: 'N', text: 'Usa las HABILIDADES de abajo y la FURIA cuando se llene.', hl: '¡Toca las monedas: valen el doble!' },
    ],
  },
  c1_outro: {
    id: 'c1_outro', title: 'Capítulo 1 · La marca violeta', bg: 'bg_c1', music: 'story',
    beats: [
      { who: 'L', text: 'La Reina Telaraña tenía una marca violeta.', hl: 'La misma luz que la corona de Dante.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Ah, sí. La marca de la Corona Hueca.', hl: 'Un clásico.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'cross' }) },
      { who: 'L', text: '¿La Corona… qué?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Un artefacto de las Ruinas del Castillo.', hl: 'Le roba el Trazo a quien derrotas.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'point' }) },
      { who: 'L', text: 'Así llegó a cien mil…', hl: 'quitándoselo a otros.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'L', text: 'Si la Corona salió de las Ruinas,', hl: 'ahí voy a encontrar respuestas.', left: lino({ eyes: 'determined', pose: 'fist' }) },
      { who: 'R', text: 'Antes, toma: Capucha de Vigía.', hl: 'Piel sintética. Soy vegano.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', text: '¡Desbloqueaste la CAPUCHA DE VIGÍA, la ESCOPETA', hl: 'y el CAPÍTULO 2!', fx: ['flash'] },
    ],
  },
  c2_intro: {
    id: 'c2_intro', title: 'Capítulo 2 · Las Ruinas del Castillo', bg: 'bg_c2', music: 'story',
    beats: [
      { who: 'L', text: 'Las Ruinas del Castillo…', hl: 'aquí jugábamos de niños.', left: lino({ eyes: 'sad' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Ahora juegan esqueletos.', hl: 'La gentrificación es terrible.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'N', text: 'Una voz retumba entre las piedras:', hl: '"Quien busca la Corona… encuentra el vacío."', fx: ['dark'] },
      { who: 'L', text: 'No busco la Corona.', hl: 'Busco a mi hermano.', left: lino({ eyes: 'angry', pose: 'fist' }) },
    ],
  },
  c2_outro: {
    id: 'c2_outro', title: 'Capítulo 2 · El primer vaciado', bg: 'bg_c2', music: 'sad',
    beats: [
      { who: 'R', text: 'Yo… fui el primero.', hl: 'Tu hermano me venció aquí, hace cinco años.', left: lino({ eyes: 'determined' }), right: hueco({ pose: 'kneel' }) },
      { who: 'R', text: 'La Corona se llevó mi Trazo. Mi nombre.', hl: 'Y el rostro de mi familia.', right: hueco({ pose: 'kneel' }) },
      { who: 'L', text: '¿Te borró los recuerdos?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'La Corona da poder, pero cobra en recuerdos.', hl: 'Borra primero lo que más amas.', right: hueco({ pose: 'kneel' }), fx: ['purple'] },
      { who: 'L', text: 'Entonces Dante…', hl: '¿se está olvidando de mí?', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Lo vi irse a la Ciudadela de Ceniza.', hl: 'Apúrate, chico. Antes de que no quede nada.', right: hueco({ pose: 'kneel' }) },
      { who: 'N', text: 'Sir Hueco se deshace en tinta…', hl: '…libre, por fin.', right: null },
      { who: 'R', text: 'Uf, qué drama. Toma: Armadura de Caballero.', hl: 'Brilla. Combina con tu trauma.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }), music: 'menu' },
      { who: 'N', text: '¡Desbloqueaste la ARMADURA DE CABALLERO, el SHURIKEN', hl: 'y el CAPÍTULO 3!', fx: ['flash'] },
    ],
  },
  c3_intro: {
    id: 'c3_intro', title: 'Capítulo 3 · La Ciudadela de Ceniza', bg: 'bg_c3', music: 'boss',
    beats: [
      { who: 'L', text: 'La Ciudadela de Ceniza.', hl: 'Aquí se esconde Dante.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Decoración minimalista: ceniza,', hl: 'ceniza y… más ceniza.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'R', text: 'Hermanito… viniste.', right: eco({ eyes: 'glow', pose: 'cross' }), fx: ['purple', 'shake'] },
      { who: 'L', text: '¡DANTE!', left: lino({ eyes: 'angry', pose: 'point' }) },
      { who: 'R', text: 'No soy Dante. Soy lo que la Corona dejó de él:', hl: 'un eco.', right: eco({ eyes: 'glow', pose: 'idle' }) },
      { who: 'R', text: 'Mi poder ya es de', hl: '¡CIEN MIL! ¡CIEN MIL!', right: eco({ eyes: 'glow', mouth: 'open', pose: 'fist' }), fx: ['shake', 'pulse'] },
      { who: 'R', text: 'Ok, eso fue perturbador.', hl: 'Está rayado como disco viejo.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
    ],
  },
  c3_outro: {
    id: 'c3_outro', title: 'Capítulo 3 · No recuerdo', bg: 'bg_c3', music: 'sad',
    beats: [
      { who: 'R', text: 'Hermanito… ¿por qué', hl: 'peleas tanto?', left: lino({ eyes: 'determined' }), right: eco({ eyes: 'glow', pose: 'kneel', alpha: 0.75 }) },
      { who: 'L', text: 'Por el juramento.', hl: '¡¿No lo recuerdas?!', left: lino({ eyes: 'angry', pose: 'point' }) },
      { who: 'R', text: '¿Juramento…?', hl: 'No recuerdo ningún juramento.', right: eco({ eyes: 'closed', pose: 'kneel', alpha: 0.5 }) },
      { who: 'R', text: 'El Trono de la Corona… está sobre La Mancha…', hl: '…donde todo empezó.', right: eco({ eyes: 'closed', pose: 'kneel', alpha: 0.35 }) },
      { who: 'L', text: '…', left: lino({ eyes: 'sad', pose: 'hands' }), right: null },
      { who: 'L', text: 'Entonces voy a hacer que lo recuerdes.', hl: 'Aunque tenga que llegar a cien mil.', left: lino({ eyes: 'determined', pose: 'fist' }), music: 'boss' },
      { who: 'N', text: 'Desde muy lejos, una voz:', hl: '"Interesante… hermanito."', fx: ['purple', 'shake'] },
      { who: 'R', text: 'La Mancha nació en la Marisma de Tinta.', hl: 'Si quieres llegar a tu hermano, empieza ahí.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'point' }), music: 'menu' },
      { who: 'N', text: '¡Desbloqueaste el CAPÍTULO 4', hl: 'y EL ABISMO (modo infinito)!', fx: ['flash'] },
    ],
  },

  c4_intro: {
    id: 'c4_intro', title: 'Capítulo 4 · La Marisma de Tinta', bg: 'bg_c4', music: 'story',
    beats: [
      { who: 'L', text: 'La Marisma de Tinta. De aquí salió', hl: 'la marea que atacó la aldea.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Huele a calcetín mojado', hl: 'y a trauma no resuelto.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'La bestia que me hirió aquella noche…', hl: 'sigue aquí. La siento.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'N', text: 'Algo enorme se mueve bajo el agua.', fx: ['dark', 'shake'] },
      { who: 'L', text: 'Hace cinco años me escondí.', hl: 'Hoy, yo protejo.', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['light'] },
    ],
  },
  c4_outro: {
    id: 'c4_outro', title: 'Capítulo 4 · El plan de la Corona', bg: 'bg_c4', music: 'sad',
    beats: [
      { who: 'N', text: 'El Kraken se hunde. En su frente', hl: 'brilla la marca de la Corona.', left: lino({ eyes: 'shock' }), right: clip({ eyes: 'cool' }), fx: ['purple'] },
      { who: 'L', text: 'Esa marca… ya la tenía hace cinco años.', left: lino({ eyes: 'shock' }) },
      { who: 'L', text: 'El ataque a la aldea no fue un accidente.', hl: 'La Corona lo planeó.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'L', text: 'Quería que Dante se sintiera débil…', hl: '…para que fuera a buscarla.', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake'] },
      { who: 'R', text: 'Wow. Manipulación', hl: 'nivel villano de telenovela.', right: clip({ eyes: 'cool', mouth: 'open', pose: 'cross' }) },
      { who: 'L', text: 'Si la Corona borra recuerdos…', hl: '¿a dónde van a parar?', left: lino({ eyes: 'determined' }) },
      { who: 'R', text: 'A la Torre del Olvido. Todo lo borrado termina ahí.', hl: 'Como los mensajes de mi ex.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'point' }) },
      { who: 'R', text: 'Y toma, la encontré en el lodo: la Lanza de Tinta.', hl: 'Lavada. Casi.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }), music: 'menu' },
      { who: 'N', text: '¡Desbloqueaste la LANZA DE TINTA', hl: 'y el CAPÍTULO 5!', fx: ['flash'] },
    ],
  },
  c5_intro: {
    id: 'c5_intro', title: 'Capítulo 5 · La Torre del Olvido', bg: 'bg_c5', music: 'story',
    beats: [
      { who: 'L', text: 'La Torre del Olvido. Aquí la Corona', hl: 'guarda todo lo que borra.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Una biblioteca. Por fin, silencio.', hl: 'Ah, no: las páginas muerden.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'N', text: 'Miles de páginas flotan.', hl: 'En cada una, un recuerdo robado.', fx: ['purple'] },
      { who: 'L', text: 'Si los recuerdos de Dante están aquí…', hl: '…voy a recuperarlos.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Hey, hermanito.', hl: '¿Otra vez te ganó una araña?', right: recuerdo({ eyes: 'glow', mouth: 'grin' }), fx: ['purple', 'shake'], music: 'boss' },
      { who: 'L', text: '¿Dante…? ¿Eres tú… de niño?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Soy todo lo que la Corona le borró:', hl: 'cada recuerdo contigo.', right: recuerdo({ eyes: 'glow', pose: 'point' }) },
      { who: 'R', text: 'Y la Corona dice que eres basura.', hl: '¡Ya no te necesitamos!', right: recuerdo({ eyes: 'angry', mouth: 'open', pose: 'fist' }), fx: ['shake'] },
    ],
  },
  c5_outro: {
    id: 'c5_outro', title: 'Capítulo 5 · La página', bg: 'bg_c5', music: 'sad',
    beats: [
      { who: 'R', text: 'Mientras yo esté…', hl: '…nadie te toca…', left: lino({ eyes: 'sad' }), right: recuerdo({ eyes: 'closed', pose: 'kneel', alpha: 0.6 }) },
      { who: 'L', text: 'Lo sé. Siempre lo cumpliste.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'N', text: 'El recuerdo se deshace en tinta.', hl: 'Entre las gotas queda una página.', right: null },
      { who: 'N', text: 'Es la hoja que firmaron de niños:', hl: '"Nunca nos vamos a abandonar."', fx: ['light', 'page'] },
      { who: 'L', text: 'Lo que se escribe con tinta, no se borra.', hl: 'Se lo voy a devolver.', left: lino({ eyes: 'determined', pose: 'fist' }), music: 'story' },
      { who: 'R', text: 'Te hice algo con mis últimos ahorros:', hl: 'el set Heredero del Juramento.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }), music: 'menu' },
      { who: 'R', text: 'La escalera de esta torre sube al Trono.', hl: 'Ahí te espera tu hermano.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'point' }) },
      { who: 'N', text: '¡Desbloqueaste el set HEREDERO DEL JURAMENTO', hl: 'y el CAPÍTULO 6!', fx: ['flash'] },
    ],
  },
  c6_intro: {
    id: 'c6_intro', title: 'Capítulo 6 · El Trono de la Corona', bg: 'bg_c6', music: 'boss',
    beats: [
      { who: 'C', text: 'EL TRONO DE LA CORONA', left: lino({ eyes: 'determined' }), right: dante({ eyes: 'smug', pose: 'cross' }) },
      { who: 'R', text: 'Hey, hermanito.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'cross' }) },
      { who: 'R', text: 'Llegaste lejos para ser basura.', hl: '¿Cuánto tienes ya? ¿Mil? ¿Diez mil?', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'laugh' }) },
      { who: 'L', text: 'No vine a ganarte en números.', hl: 'Vine a devolverte algo.', left: lino({ eyes: 'determined', pose: 'point' }) },
      { who: 'N', text: 'LA CORONA: "Destrúyelo. Bórralo.', hl: 'Es tu último recuerdo."', fx: ['purple', 'shake'] },
      { who: 'R', text: '¡Cállate, Corona! No necesito que me digas', hl: 'lo que tengo que hacer.', right: dante({ eyes: 'angry', mouth: 'open', pose: 'hands' }), fx: ['pulse'] },
      { who: 'R', text: '¡Ven, Lino!', hl: '¡Terminemos con esto!', right: dante({ eyes: 'angry', mouth: 'open', pose: 'fist' }), fx: ['shake'] },
    ],
  },
  c6_outro: {
    id: 'c6_outro', title: 'Capítulo 6 · La decisión', bg: 'bg_c6', music: 'sad',
    beats: [
      { who: 'R', text: 'Imposible…', hl: 'tengo cien mil…', left: lino({ eyes: 'determined' }), right: dante({ eyes: 'shock', pose: 'kneel' }) },
      { who: 'L', text: 'Y yo tengo esto.', hl: '"Nunca nos vamos a abandonar."', left: lino({ eyes: 'determined', pose: 'point' }), fx: ['light', 'page'] },
      { who: 'R', text: 'Esa letra…', hl: '…es mía.', right: dante({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'N', text: 'LA CORONA: "¡NO! ¡Es mío!', hl: '¡Su poder es MÍO!"', fx: ['purple', 'shake'] },
      { who: 'R', text: 'Lino… la Corona no me suelta.', hl: 'Si la rompes… me voy con ella.', right: dante({ eyes: 'sad', pose: 'kneel' }) },
      {
        who: 'N', text: '¿Qué hará Lino?',
        choice: [
          { label: 'VENGANZA', desc: 'Romper la Corona. Que Dante pague.', next: 'final_venganza', finale: 'venganza', color: 0xb83a3a },
          { label: 'LIBERACIÓN', desc: 'Arrancársela con las manos. Cumplir el juramento.', next: 'final_liberacion', finale: 'liberacion', color: 0x2a9d8f },
        ],
      },
    ],
  },
  final_venganza: {
    id: 'final_venganza', title: 'Final · Venganza', bg: 'bg_c6', music: 'boss',
    beats: [
      { who: 'L', text: 'Me llamaste basura.', hl: 'Me dejaste tirado en el suelo.', left: lino({ eyes: 'angry', pose: 'point' }), right: dante({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'L', text: 'Esto es por aquella tarde.', hl: '¡Se acabó, Dante!', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'flash'] },
      { who: 'N', text: 'Lino parte la Corona en dos.', hl: 'Un grito llena el vacío.', fx: ['purple', 'shake'] },
      { who: 'N', text: 'Cuando la tinta se disipa, Dante ya no está.', hl: 'Solo queda su bufanda roja.', right: null, music: 'sad' },
      { who: 'L', text: '…Gané.', left: lino({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'L', text: 'Entonces…', hl: '¿por qué se siente así?', left: lino({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'R', text: 'Porque la venganza no devuelve a nadie, chico.', hl: 'Pero te deja seguir adelante.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'C', text: 'FINAL: VENGANZA', right: null },
    ],
  },
  final_liberacion: {
    id: 'final_liberacion', title: 'Final · Liberación', bg: 'bg_c6', music: 'story',
    beats: [
      { who: 'L', text: 'Dijimos que nunca nos íbamos a abandonar.', left: lino({ eyes: 'determined' }), right: dante({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'L', text: '¡Y yo cumplo mis promesas!', hl: '¡Suéltalo, Corona!', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'light'], music: 'boss' },
      { who: 'N', text: 'Lino agarra la Corona con las dos manos.', hl: 'La tinta le quema. No la suelta.', fx: ['purple', 'shake'] },
      { who: 'N', text: 'Un crujido. La Corona estalla en mil pedazos…', hl: '…y Dante cae, libre.', fx: ['flash'], right: libre({ eyes: 'closed', pose: 'kneel' }), music: 'story' },
      { who: 'C', text: 'DÍAS DESPUÉS · EL PATIO DONDE LO JURARON', bg: 'bg_day', left: lino({ eyes: 'determined' }), right: libre({ eyes: 'sad', pose: 'idle' }) },
      { who: 'R', text: 'Lino… lo que te dije aquella tarde…', hl: 'Perdóname.', right: libre({ eyes: 'sad', pose: 'hands' }) },
      { who: 'L', text: 'Eso lo dijo la Corona, no tú.', hl: 'Mi hermano volvió. Eso me basta.', left: lino({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'R', text: '…¿Y? ¿Otra vez', hl: 'te ganó una araña?', right: libre({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'L', text: '…Era una araña MUY grande.', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'R', text: 'No importa quién tenga más nivel…', hl: 'siempre vamos a ser hermanos.', right: libre({ eyes: 'happy', mouth: 'grin', pose: 'point' }), fx: ['light'] },
      { who: 'R', text: 'Ok, estoy llorando.', hl: 'Es alergia. A la tinta.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
      { who: 'C', text: 'FINAL: LIBERACIÓN', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'fist' }), right: libre({ eyes: 'happy', mouth: 'grin', pose: 'fist' }) },
    ],
  },
};

export const STORY_ORDER = ['prologo1', 'prologo2', 'c1_intro', 'c1_outro', 'c2_intro', 'c2_outro', 'c3_intro', 'c3_outro', 'c4_intro', 'c4_outro', 'c5_intro', 'c5_outro', 'c6_intro', 'c6_outro', 'final_venganza', 'final_liberacion'];

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
