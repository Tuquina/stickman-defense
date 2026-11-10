import type { Eyes } from '../gfx/stickman';

export type CharId = 'linoKid' | 'danteKid' | 'lino' | 'dante' | 'clip' | 'hueco' | 'eco' | 'recuerdo' | 'danteLibre' | 'pluma';
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
  /** 'zoom' camera punch · 'reveal' new actor appears in place (no walk-in) · 'ink' ink burst on the right slot */
  fx?: ('shake' | 'flash' | 'purple' | 'dark' | 'light' | 'pushL' | 'exitR' | 'pulse' | 'page' | 'zoom' | 'reveal' | 'ink')[];
  /** narrator beats spoken by an off-screen voice (name plate over the box) */
  voice?: 'corona' | 'voz';
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
  eco: 0x7a3ad8, recuerdo: 0xb060ff, danteLibre: 0xe2552c, pluma: 0x5a9cff,
};

/** Off-screen voices: name and colour of their plate. */
export const VOICES = {
  corona: { name: 'La Corona Hueca', color: 0x8a2be2, text: '#e6c2ff' },
  voz: { name: '???', color: 0x4a5568, text: '#d0d8e4' },
} as const;

export const CHAR_NAMES: Record<CharId, string> = {
  linoKid: 'Lino', lino: 'Lino', danteKid: 'Dante', dante: 'Dante', clip: 'Tío Clip', hueco: 'Sir Hueco', eco: 'Eco de Dante',
  recuerdo: 'El Recuerdo Roto', danteLibre: 'Dante', pluma: 'Pluma',
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
const pluma = (o: Partial<Actor> = {}): Actor => ({ id: 'pluma', power: '1', powerColor: '#bfe9ff', ...o });

export const STORY: Record<string, StoryScene> = {
  prologo1: {
    id: 'prologo1', title: 'Prólogo I · El Juramento', bg: 'bg_day', music: 'story',
    beats: [
      { who: 'C', text: 'VALTINTA · HACE 5 AÑOS', left: linoKid({ eyes: 'sad' }), right: danteKid({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'N', text: 'En Valtinta todo está hecho de tinta.', hl: 'Y la fuerza de cada uno se llama Trazo.' },
      { who: 'R', text: 'Hey, hermanito. ¿Otra vez te ganó una araña?', right: danteKid({ eyes: 'happy', mouth: 'open', pose: 'laugh' }) },
      { who: 'L', text: '…Era una araña MUY grande.', left: linoKid({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Era del tamaño de una uva.', hl: 'Una uva con actitud, eso sí.', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'cross' }) },
      { who: 'L', text: '¡Algún día voy a ser más fuerte que tú!', left: linoKid({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Jajaja. Tranqui. Mientras yo esté,', hl: 'nadie te toca.', right: danteKid({ eyes: 'determined', mouth: 'grin', pose: 'fist' }) },
      { who: 'L', text: 'Dante… prometamos algo.', left: linoKid({ eyes: 'determined', pose: 'idle' }), right: danteKid({ eyes: 'shock', mouth: 'none', pose: 'idle' }) },
      { who: 'L', text: 'Que nunca nos vamos a abandonar.', hl: 'Pase lo que pase.', left: linoKid({ eyes: 'determined', pose: 'point' }) },
      { who: 'R', text: 'No importa quién tenga más nivel…', hl: 'siempre vamos a ser hermanos.', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'point' }) },
      { who: 'R', text: 'Escribámoslo. Lo que se escribe con tinta', hl: 'no se borra.', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', text: 'Y lo firmaron los dos:', hl: '¡JURAMENTO DE TINTA!', left: linoKid({ eyes: 'happy', mouth: 'grin', pose: 'fist' }), right: danteKid({ eyes: 'happy', mouth: 'open', pose: 'fist' }), fx: ['flash', 'page'] },
      { who: 'N', text: 'Esa misma noche, La Mancha atacó la aldea:', hl: 'una marea de monstruos de tinta.', fx: ['dark', 'shake'], music: 'sad' },
      { who: 'N', text: 'Dante no pudo proteger a Lino.', hl: 'Lino casi no sobrevive.', fx: ['dark'] },
      { who: 'N', text: 'Al amanecer, Dante se había ido.', hl: 'Dejó una nota: "Nunca más voy a ser débil."', left: linoKid({ eyes: 'sad', pose: 'kneel' }), right: null, fx: ['dark', 'purple'] },
    ],
  },
  prologo2: {
    id: 'prologo2', title: 'Prólogo II · Cinco años después', bg: 'bg_day', music: 'story',
    beats: [
      { who: 'C', text: 'CINCO AÑOS DESPUÉS…', left: lino({ eyes: 'determined' }), right: null },
      { who: 'L', text: 'Cinco años entrenando.', hl: 'Poder: quinientos. ¡Nada mal!', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'fist' }) },
      { who: 'N', text: 'Entonces, el cielo se tiñe de violeta.', hl: 'Dante volvió. Con una corona.', left: lino({ eyes: 'shock' }), right: dante({ eyes: 'smug', pose: 'cross' }), fx: ['purple', 'shake'], music: 'boss' },
      { who: 'R', text: 'Hey, hermanito.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'cross' }) },
      { who: 'L', text: '¿Dante? ¡Te busqué por todas partes!', hl: '¿Qué es esa corona?', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Mi poder ya es de', hl: '¡CIEN MIL!', right: dante({ eyes: 'glow', mouth: 'open', pose: 'fist' }), fx: ['shake', 'purple', 'pulse', 'zoom'] },
      { who: 'L', text: '¿¡Cien mil!? Yo tengo quinientos…', hl: '…y estaba orgulloso.', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'L', text: '¿Y el juramento?', hl: 'Dijiste que siempre…', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: '¿Juramento? Los juramentos', hl: 'son para los de nivel bajo.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'laugh' }) },
      { who: 'R', text: 'Mírate. Quinientos.', hl: 'Eres basura, Lino.', right: dante({ eyes: 'angry', mouth: 'frown', pose: 'point' }), fx: ['zoom'] },
      { who: 'N', text: '¡PUM!', left: lino({ eyes: 'closed', pose: 'fallen' }), fx: ['shake', 'flash', 'pushL'] },
      { who: 'N', voice: 'corona', text: '«Tómalo, Dante. Su Trazo es tuyo.', hl: 'Bórralo y por fin serás completo.»', fx: ['purple'] },
      { who: 'R', text: '…No.', hl: 'Su Trazo ni siquiera vale la pena.', right: dante({ eyes: 'closed', mouth: 'none', pose: 'cross' }) },
      { who: 'N', text: 'Dante se va.', hl: 'No mira atrás.', right: dante({ eyes: 'smug', pose: 'idle' }), fx: ['exitR'] },
      { who: 'L', text: '…', left: lino({ eyes: 'sad', pose: 'kneel' }), right: null, music: 'sad' },
      { who: 'L', text: 'Esto…', hl: 'no va a quedar así.', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'light', 'zoom'], music: 'boss' },
      { who: 'C', text: 'JURAMENTO DE TINTA', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['flash'] },
    ],
  },
  c1_intro: {
    id: 'c1_intro', title: 'Capítulo 1 · El Bosque Sombrío', bg: 'bg_c1', music: 'menu',
    beats: [
      { who: 'N', text: 'Días después, La Mancha despierta otra vez.', hl: 'Sus arañas marchan hacia la aldea.', left: lino({ eyes: 'determined' }), right: null },
      { who: 'L', text: 'Arañas.', hl: 'Tenían que ser arañas.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Psst. Tú. El de la bufanda triste.', right: clip({ eyes: 'cool', mouth: 'grin' }) },
      { who: 'L', text: '¿Y tú quién eres?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Tío Clip. Mercader, emprendedor', hl: 'y coach motivacional.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }) },
      { who: 'L', text: '¿Tío de quién?', left: lino({ eyes: 'determined' }) },
      { who: 'R', text: 'De todos. Es un título honorífico.', hl: 'Me lo di yo.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'cross' }) },
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
      { who: 'R', text: 'Le ganaste a una araña gigante.', hl: 'Tu hermano estaría orgulloso. El de antes.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }) },
      { who: 'L', text: 'La Reina tenía una marca violeta.', hl: 'La misma luz que la corona de Dante.', left: lino({ eyes: 'determined', pose: 'point' }) },
      { who: 'R', text: 'Ah, sí. La marca de la Corona Hueca.', hl: 'Un clásico.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'cross' }) },
      { who: 'L', text: '¿Tú sabes qué es?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Un artefacto antiguo. Le roba el Trazo', hl: 'a todo el que su dueño derrota.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'point' }), fx: ['purple'] },
      { who: 'R', text: 'Y a los monstruos que marca,', hl: 'los manda a donde ella quiere.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
      { who: 'L', text: 'Así llegó a cien mil…', hl: 'quitándoselo a otros.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Dicen que la guardaban en las Ruinas del Castillo.', hl: 'Con un caballero de guardia. Muy serio.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'cross' }) },
      { who: 'L', text: 'Entonces ahí voy.', hl: 'Quiero saber qué le pasó a mi hermano.', left: lino({ eyes: 'determined', pose: 'fist' }) },
      { who: 'R', text: 'Antes, toma: Capucha de Vigía.', hl: 'Piel sintética. Soy vegano.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', text: '¡Desbloqueaste la CAPUCHA DE VIGÍA, la ESCOPETA', hl: 'y el CAPÍTULO 2!', fx: ['flash'] },
    ],
  },
  c2_intro: {
    id: 'c2_intro', title: 'Capítulo 2 · Las Ruinas del Castillo', bg: 'bg_c2', music: 'story',
    beats: [
      { who: 'L', text: 'Las Ruinas del Castillo…', hl: 'aquí jugábamos de niños.', left: lino({ eyes: 'sad' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Ahora juegan esqueletos.', hl: 'La gentrificación es terrible.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'Dante siempre era el caballero.', hl: 'Yo era el dragón. O la princesa. Según el día.', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'R', text: 'No juzgo.', hl: 'Bueno, un poquito.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', voice: 'voz', text: '"Quien busca la Corona…', hl: '…encuentra el vacío."', fx: ['dark'] },
      { who: 'L', text: 'No busco la Corona.', hl: 'Busco a mi hermano.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'N', text: 'Entre las piedras se alza un caballero sin rostro:', hl: 'Sir Hueco, el guardián de la Corona.', right: hueco({ pose: 'idle' }), fx: ['shake', 'dark'], music: 'boss' },
    ],
  },
  c2_outro: {
    id: 'c2_outro', title: 'Capítulo 2 · El guardián vacío', bg: 'bg_c2', music: 'sad',
    beats: [
      { who: 'R', text: 'Yo era el guardián de la Corona.', hl: 'Hace cinco años, un niño vino a pedírmela.', left: lino({ eyes: 'determined' }), right: hueco({ pose: 'kneel' }) },
      { who: 'L', text: '¿Un niño…? ¿Dante?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Lloraba. Decía que su hermano casi muere.', hl: '"Nunca más voy a ser débil", repetía.', right: hueco({ pose: 'kneel' }), fx: ['purple'] },
      { who: 'L', text: '…Lo hizo por mí.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Se la negué. Peleamos… y ganó él.', hl: 'Se puso la Corona. Yo fui su primera víctima.', right: hueco({ pose: 'kneel' }), fx: ['purple'] },
      { who: 'R', text: 'Me quitó el Trazo, el nombre…', hl: '…y el rostro de mi familia. Por eso soy "Hueco".', right: hueco({ pose: 'kneel' }) },
      { who: 'L', text: '¿Te borró los recuerdos?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'La Corona da poder, pero cobra en recuerdos.', hl: 'Borra primero lo que más amas.', right: hueco({ pose: 'kneel' }), fx: ['purple', 'zoom'] },
      { who: 'R', text: 'Y a los que vence, los vacía y los usa de muñecos.', hl: 'Su tinta me movía. Hasta que tú la rompiste.', right: hueco({ pose: 'kneel', power: '0', powerColor: '#9aa8b8' }), fx: ['ink'] },
      { who: 'L', text: 'Entonces Dante…', hl: '¿se está olvidando de mí?', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Lo vi irse a la Ciudadela de Ceniza.', hl: 'Apúrate, chico. Antes de que no quede nada.', right: hueco({ pose: 'kneel', alpha: 0.7, power: '0', powerColor: '#9aa8b8' }) },
      { who: 'N', text: 'Sir Hueco se deshace en tinta…', hl: '…libre, por fin.', right: null, fx: ['ink'] },
      { who: 'R', text: 'Uf, qué drama. Toma: Armadura de Caballero.', hl: 'Brilla. Combina con tu trauma.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }), music: 'menu' },
      { who: 'N', text: '¡Desbloqueaste la ARMADURA DE CABALLERO, el SHURIKEN', hl: 'y el CAPÍTULO 3!', fx: ['flash'] },
    ],
  },
  c3_intro: {
    id: 'c3_intro', title: 'Capítulo 3 · La Ciudadela de Ceniza', bg: 'bg_c3', music: 'story',
    beats: [
      { who: 'L', text: 'La Ciudadela de Ceniza.', hl: 'Sir Hueco dijo que Dante vino aquí.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Decoración minimalista: ceniza,', hl: 'ceniza y… más ceniza.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'R', text: 'Hermanito… viniste.', right: eco({ eyes: 'glow', pose: 'cross' }), fx: ['purple', 'shake'], music: 'boss' },
      { who: 'L', text: '¡DANTE!', left: lino({ eyes: 'angry', pose: 'point' }), fx: ['zoom'] },
      { who: 'L', text: 'Espera… no tiene su bufanda.', hl: 'Dante NUNCA se la quita.', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Dante está ocupado. Me mandó a mí.', hl: 'Soy su Eco.', right: eco({ eyes: 'glow', pose: 'idle' }) },
      { who: 'R', text: 'Mi poder ya es de', hl: '¡CIEN MIL! ¡CIEN MIL!', right: eco({ eyes: 'glow', mouth: 'open', pose: 'fist' }), fx: ['shake', 'pulse'] },
      { who: 'R', text: 'Ok, eso fue perturbador.', hl: 'Está rayado como disco viejo.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
      { who: 'R', text: 'Un Eco es un disfraz de tinta de la Corona.', hl: 'Adentro siempre hay alguien atrapado.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'point' }) },
      { who: 'L', text: '¿Como Sir Hueco?', hl: '¿Un vencido que la Corona usa de muñeco?', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Igualito.', hl: 'Pero con la cara de tu hermano. Más cruel.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'Entonces lo saco de ahí.', hl: 'A golpes, si hace falta.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Con cariño.', hl: 'Pero a golpes.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'cross' }) },
    ],
  },
  c3_outro: {
    id: 'c3_outro', title: 'Capítulo 3 · Lo que había dentro', bg: 'bg_c3', music: 'sad',
    beats: [
      { who: 'R', text: 'Hermanito… ¿por qué', hl: 'peleas tanto?', left: lino({ eyes: 'determined' }), right: eco({ eyes: 'glow', pose: 'kneel', alpha: 0.8 }) },
      { who: 'L', text: 'Por el juramento.', hl: '¡Algo que tu Corona nunca va a entender!', left: lino({ eyes: 'angry', pose: 'point' }) },
      { who: 'R', text: '¿Juramento…?', hl: 'No… recuerdo… ningún…', right: eco({ eyes: 'closed', pose: 'kneel', alpha: 0.6 }) },
      { who: 'N', text: 'La tinta violeta se escurre como lluvia…', hl: '…y adentro hay una chica.', right: pluma({ eyes: 'closed', pose: 'kneel' }), fx: ['flash', 'ink', 'reveal'] },
      { who: 'R', text: '¿Dónde…?', hl: '¿Qué día es hoy?', right: pluma({ eyes: 'shock', pose: 'kneel' }) },
      { who: 'L', text: '¿Quién eres?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Pluma. Escriba de la Ciudadela.', hl: 'O lo era, antes de que la Corona me usara.', right: pluma({ eyes: 'sad', pose: 'idle' }) },
      { who: 'L', text: '…¿Poder UNO?', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Me vaciaron, ¿ok?', hl: 'Estoy en modo ahorro de batería.', right: pluma({ eyes: 'angry', pose: 'cross' }) },
      { who: 'R', text: 'Dante me venció hace un año. La Corona me vació', hl: 'y me usó de disfraz: un títere con su cara.', right: pluma({ eyes: 'sad', pose: 'hands' }) },
      { who: 'L', text: '¿Entonces Dante nunca estuvo aquí?', left: lino({ eyes: 'sad' }) },
      { who: 'R', text: 'No. Pero la Corona conecta a todos sus títeres.', hl: 'Desde adentro oía a Dante pelear con ella.', right: pluma({ eyes: 'determined', pose: 'point' }), fx: ['light'], music: 'story' },
      { who: 'R', text: 'Aquella tarde, la Corona le ordenó que te borrara.', hl: 'No te dejó vivo por desprecio. No pudo.', right: pluma({ eyes: 'determined', pose: 'hands' }), fx: ['light', 'zoom'] },
      { who: 'L', text: '…Dante.', left: lino({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'R', text: 'Su Trono flota sobre La Mancha. La única escalera', hl: 'es la Torre del Olvido, cruzando la Marisma.', right: pluma({ eyes: 'determined', pose: 'point' }) },
      { who: 'N', voice: 'corona', text: '«Interesante… hermanito.', hl: 'Sube. Te estoy esperando.»', fx: ['purple', 'shake'], music: 'boss' },
      { who: 'R', text: '¿Alguien más escuchó a la corona parlante', hl: 'o ya me hizo mal la ceniza?', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }), music: 'menu' },
      { who: 'R', text: 'Voy con ustedes. Le debo una paliza a esa Corona.', hl: 'Y tengo mapas.', right: pluma({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Bienvenida. La membresía cuesta 50 de oro.', hl: 'Es broma. Son 40.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }) },
      { who: 'N', text: '¡Pluma se une al equipo! ¡Desbloqueaste el CAPÍTULO 4', hl: 'y EL ABISMO (modo infinito)!', fx: ['flash'] },
    ],
  },

  c4_intro: {
    id: 'c4_intro', title: 'Capítulo 4 · La Marisma de Tinta', bg: 'bg_c4', music: 'story',
    beats: [
      { who: 'L', text: 'La Marisma de Tinta. De aquí salió', hl: 'la marea que atacó la aldea.', left: lino({ eyes: 'determined' }), right: pluma({ eyes: 'determined' }) },
      { who: 'R', text: 'Según mis mapas, el camino a la Torre cruza el pantano.', hl: 'Según mi nariz, huele a calcetín mojado.', right: pluma({ eyes: 'sad', pose: 'cross' }) },
      { who: 'R', text: 'Oye, los chistes eran mi trabajo.', hl: 'Me estás robando el puesto.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'La bestia que me hirió aquella noche…', hl: 'sigue aquí. La siento.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'N', text: 'Algo enorme se mueve bajo el agua.', hl: 'Las burbujas forman… ¿una corona?', fx: ['dark', 'shake'], music: 'boss' },
      { who: 'R', text: 'Lino. Si esa cosa es de la Corona…', hl: '…no fue a tu aldea por casualidad.', right: pluma({ eyes: 'shock', pose: 'hands' }) },
      { who: 'L', text: 'Hace cinco años me escondí.', hl: 'Hoy, yo protejo.', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['light', 'zoom'] },
    ],
  },
  c4_outro: {
    id: 'c4_outro', title: 'Capítulo 4 · El plan de la Corona', bg: 'bg_c4', music: 'sad',
    beats: [
      { who: 'N', text: 'El Kraken se hunde. En su frente', hl: 'brilla la marca de la Corona.', left: lino({ eyes: 'shock' }), right: pluma({ eyes: 'determined' }), fx: ['purple'] },
      { who: 'L', text: 'Esa marca… ya la tenía hace cinco años.', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Las marcas de la Corona no se borran.', hl: 'Ella lo mandó a tu aldea.', right: pluma({ eyes: 'sad', pose: 'point' }) },
      { who: 'L', text: 'El ataque no fue un accidente.', hl: 'La Corona lo planeó.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Necesitaba a alguien desesperado por ser fuerte…', hl: '…que fuera a buscarla.', right: pluma({ eyes: 'determined', pose: 'hands' }) },
      { who: 'L', text: 'Usó a Dante.', hl: '¡Nos usó a los dos!', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'zoom'] },
      { who: 'R', text: 'Wow. Manipulación', hl: 'nivel villano de telenovela.', right: clip({ eyes: 'cool', mouth: 'open', pose: 'cross' }) },
      { who: 'L', text: 'Si la Corona borra recuerdos…', hl: '¿a dónde van a parar?', left: lino({ eyes: 'determined' }) },
      { who: 'R', text: 'A la Torre del Olvido.', hl: 'Todo lo borrado termina ahí.', right: pluma({ eyes: 'determined', pose: 'point' }) },
      { who: 'R', text: 'Como los mensajes de mi ex.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
      { who: 'R', text: 'Y toma, la encontré en el lodo: la Lanza de Tinta.', hl: 'Lavada. Casi.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }), music: 'menu' },
      { who: 'N', text: '¡Desbloqueaste la LANZA DE TINTA', hl: 'y el CAPÍTULO 5!', fx: ['flash'] },
    ],
  },
  c5_intro: {
    id: 'c5_intro', title: 'Capítulo 5 · La Torre del Olvido', bg: 'bg_c5', music: 'story',
    beats: [
      { who: 'L', text: 'La Torre del Olvido. Aquí la Corona', hl: 'guarda todo lo que borra.', left: lino({ eyes: 'determined' }), right: pluma({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'R', text: 'Una biblioteca. Por fin, mi hábitat natural.', hl: 'Ah, no: las páginas muerden.', right: pluma({ eyes: 'shock', pose: 'hands' }) },
      { who: 'N', text: 'Miles de páginas flotan.', hl: 'En cada una, un recuerdo robado.', fx: ['purple'] },
      { who: 'R', text: 'Mira: esta dice "Lino y Dante, pescando".', hl: 'Y esta: "Lino llora por una araña".', right: pluma({ eyes: 'happy', mouth: 'grin', pose: 'point' }) },
      { who: 'L', text: '¡Eso es privado!', hl: '¡Y era una araña MUY grande!', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'L', text: 'Si los recuerdos de Dante están aquí…', hl: '…voy a recuperarlos.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Hey, hermanito.', hl: '¿Otra vez te ganó una araña?', right: recuerdo({ eyes: 'glow', mouth: 'grin' }), fx: ['purple', 'shake'], music: 'boss' },
      { who: 'L', text: '¿Dante…? ¿Eres tú… de niño?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Soy todo lo que la Corona le borró:', hl: 'cada recuerdo contigo.', right: recuerdo({ eyes: 'glow', pose: 'point' }) },
      { who: 'R', text: 'Y la Corona dice que eres basura.', hl: '¡Ya no te necesitamos!', right: recuerdo({ eyes: 'angry', mouth: 'open', pose: 'fist' }), fx: ['shake'] },
      { who: 'R', text: 'La Corona se metió en esos recuerdos, como en mí.', hl: 'No es Dante. Es su títere.', right: pluma({ eyes: 'determined', pose: 'point' }) },
      { who: 'L', text: 'Entonces te voy a liberar.', hl: 'Igual que a Pluma.', left: lino({ eyes: 'determined', pose: 'fist' }), fx: ['light'] },
    ],
  },
  c5_outro: {
    id: 'c5_outro', title: 'Capítulo 5 · La página', bg: 'bg_c5', music: 'sad',
    beats: [
      { who: 'R', text: 'Mientras yo esté…', hl: '…nadie te toca…', left: lino({ eyes: 'sad' }), right: recuerdo({ eyes: 'closed', pose: 'kneel', alpha: 0.6 }) },
      { who: 'L', text: 'Lo sé.', hl: 'Siempre lo cumpliste.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'N', text: 'El recuerdo se deshace en tinta.', hl: 'Entre las gotas queda una página.', right: null, fx: ['ink'] },
      { who: 'N', text: 'Es la hoja que firmaron de niños:', hl: '"Nunca nos vamos a abandonar."', fx: ['light', 'page'] },
      { who: 'R', text: 'La Corona no pudo borrarla.', hl: 'Por eso la escondió aquí.', right: pluma({ eyes: 'determined', pose: 'point' }) },
      { who: 'L', text: 'Lo que se escribe con tinta, no se borra.', hl: 'Se la voy a devolver.', left: lino({ eyes: 'determined', pose: 'fist' }), music: 'story' },
      { who: 'R', text: 'Te hice algo con mis últimos ahorros:', hl: 'el set Heredero del Juramento.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }), music: 'menu' },
      { who: 'R', text: '¿Lo hiciste gratis?', hl: 'Esto sí que es un milagro.', right: pluma({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Shhh. Tengo una reputación.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'R', text: 'La escalera de esta torre sube al Trono.', hl: 'Ahí te espera tu hermano.', right: pluma({ eyes: 'determined', pose: 'point' }) },
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
      { who: 'N', voice: 'corona', text: '«Es tu último recuerdo, Dante.', hl: 'Bórralo y por fin serás completo.»', fx: ['purple', 'shake'] },
      { who: 'R', text: '¡Cállate! No necesito que me digas', hl: 'lo que tengo que hacer.', right: dante({ eyes: 'glow', mouth: 'open', pose: 'hands' }), fx: ['pulse'] },
      { who: 'L', text: 'Sé que peleas con ella.', hl: 'Aquella tarde no pudiste borrarme.', left: lino({ eyes: 'determined', pose: 'hands' }) },
      { who: 'R', text: '¡MENTIRA!', hl: 'Te dejé vivo porque no vales nada.', right: dante({ eyes: 'angry', mouth: 'open', pose: 'point' }), fx: ['shake', 'zoom'] },
      { who: 'L', text: 'Entonces demuéstralo.', hl: '¡Ven, Dante!', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: '¡Terminemos con esto!', right: dante({ eyes: 'angry', mouth: 'open', pose: 'fist' }), fx: ['shake', 'purple'] },
    ],
  },
  c6_outro: {
    id: 'c6_outro', title: 'Capítulo 6 · La decisión', bg: 'bg_c6', music: 'sad',
    beats: [
      { who: 'R', text: 'Imposible…', hl: 'tengo cien mil…', left: lino({ eyes: 'determined' }), right: dante({ eyes: 'shock', pose: 'kneel' }) },
      { who: 'L', text: 'Y yo tengo esto.', hl: '"Nunca nos vamos a abandonar."', left: lino({ eyes: 'determined', pose: 'point' }), fx: ['light', 'page'] },
      { who: 'R', text: 'Esa letra…', hl: '…es mía.', right: dante({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'R', text: 'Lino… me acuerdo de la araña.', hl: 'Era del tamaño de una uva.', right: dante({ eyes: 'sad', mouth: 'grin', pose: 'kneel' }) },
      { who: 'L', text: '…Era una araña MUY grande.', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', voice: 'corona', text: '«¡NO! ¡Es MÍO!', hl: '¡Su Trazo, su nombre, su hermano!»', fx: ['purple', 'shake', 'zoom'] },
      { who: 'R', text: 'Lino… la Corona no me suelta.', hl: 'Si la rompes… me voy con ella.', right: dante({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'R', text: 'Y si la arrancas con las manos…', hl: '…te puede quemar a ti.', right: dante({ eyes: 'sad', pose: 'hands' }) },
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
      { who: 'R', text: 'Lo sé.', hl: 'Hazlo.', right: dante({ eyes: 'closed', pose: 'kneel' }) },
      { who: 'L', text: 'Esto es por aquella tarde.', hl: '¡Se acabó, Dante!', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'flash', 'zoom'] },
      { who: 'N', text: 'Lino parte la Corona en dos.', hl: 'Un grito llena el vacío.', fx: ['purple', 'shake', 'ink'] },
      { who: 'N', text: 'Cuando la tinta se disipa, Dante ya no está.', hl: 'Solo queda su bufanda roja.', right: null, music: 'sad' },
      { who: 'L', text: '…Gané.', left: lino({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'L', text: 'Entonces…', hl: '¿por qué se siente así?', left: lino({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'R', text: 'Porque no querías ganarle.', hl: 'Querías a tu hermano de vuelta.', right: pluma({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'La venganza no devuelve a nadie, chico.', hl: 'Pero te deja seguir adelante.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'N', text: 'Lino recoge la bufanda.', hl: 'La tinta todavía se mueve. Apenas.', fx: ['light'] },
      { who: 'C', text: 'FINAL: VENGANZA', right: null },
    ],
  },
  final_liberacion: {
    id: 'final_liberacion', title: 'Final · Liberación', bg: 'bg_c6', music: 'story',
    beats: [
      { who: 'L', text: 'Dijimos que nunca nos íbamos a abandonar.', left: lino({ eyes: 'determined' }), right: dante({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'L', text: '¡Y yo cumplo mis promesas!', hl: '¡Suéltalo, Corona!', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'light'], music: 'boss' },
      { who: 'N', text: 'Lino agarra la Corona con las dos manos.', hl: 'La tinta le quema. No la suelta.', fx: ['purple', 'shake'] },
      { who: 'N', voice: 'corona', text: '«¡Suelta! ¡Eres basura!', hl: '¡Un simple… nivel… bajo…!»', fx: ['purple', 'shake'] },
      { who: 'L', text: 'Seré de nivel bajo…', hl: '¡pero soy SU HERMANO!', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['light', 'zoom', 'shake'] },
      { who: 'N', text: 'Un crujido. La Corona estalla en mil pedazos…', hl: '…y Dante cae, libre.', fx: ['flash', 'ink', 'reveal'], right: libre({ eyes: 'closed', pose: 'kneel' }), music: 'story' },
      { who: 'C', text: 'DÍAS DESPUÉS · EL PATIO DONDE LO JURARON', bg: 'bg_day', left: lino({ eyes: 'determined' }), right: libre({ eyes: 'sad', pose: 'idle' }) },
      { who: 'R', text: 'Lino… lo que te dije aquella tarde…', hl: 'Perdóname.', right: libre({ eyes: 'sad', pose: 'hands' }) },
      { who: 'L', text: 'Eso lo dijo la Corona, no tú.', hl: 'Mi hermano volvió. Eso me basta.', left: lino({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'R', text: '…¿Y? ¿Otra vez', hl: 'te ganó una araña?', right: libre({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'L', text: '…Era una araña MUY grande.', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'R', text: 'No importa quién tenga más nivel…', hl: 'siempre vamos a ser hermanos.', right: libre({ eyes: 'happy', mouth: 'grin', pose: 'point' }), fx: ['light'] },
      { who: 'R', text: 'Anotado.', hl: 'Página uno de una historia nueva.', right: pluma({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'R', text: 'Ok, estoy llorando.', hl: 'Es alergia. A la tinta.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
      { who: 'C', text: 'FINAL: LIBERACIÓN', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'fist' }), right: libre({ eyes: 'happy', mouth: 'grin', pose: 'fist' }) },
    ],
  },
};

export type BattleSpeaker = 'clip' | 'pluma' | 'lino' | 'corona' | 'voz';
/** Short radio lines during battles (Hades-style banter), keyed by chapter and wave. */
export const BATTLE_LINES: Record<string, { wave: number; who: BattleSpeaker; text: string }[]> = {
  c1: [
    { wave: 1, who: 'clip', text: 'Recuerda: tú disparas, yo cobro.' },
    { wave: 6, who: 'clip', text: 'Toca a las grandotas. Marcadas caen más rápido.' },
    { wave: 13, who: 'lino', text: 'Más arañas… Dante se estaría riendo.' },
    { wave: 17, who: 'voz', text: '…hermanito…' },
  ],
  c2: [
    { wave: 1, who: 'lino', text: 'Aquí jugábamos a los caballeros. Ahora va en serio.' },
    { wave: 6, who: 'clip', text: 'Esqueletos con armadura. Tienen mejor seguro médico que yo.' },
    { wave: 14, who: 'voz', text: 'Quien busca la Corona… encuentra el vacío.' },
    { wave: 17, who: 'clip', text: 'Ese caballero necesita terapia. O un abrazo.' },
  ],
  c3: [
    { wave: 1, who: 'clip', text: 'El humo violeta es de la Corona. No lo respires. Ni lo compres.' },
    { wave: 8, who: 'lino', text: 'Quien sea que esté ahí dentro… aguanta.' },
    { wave: 15, who: 'corona', text: 'Mis ecos tienen su cara. ¿Te gustan?' },
  ],
  c4: [
    { wave: 1, who: 'pluma', text: 'El ruido despierta al Kraken. Y tú eres el ruido.' },
    { wave: 7, who: 'clip', text: 'Pluma, ¿tienes un plan?' },
    { wave: 8, who: 'pluma', text: 'Plan A: no morir. Plan B: también.' },
    { wave: 15, who: 'corona', text: 'Yo mandé a esa bestia. Lo volvería a hacer.' },
  ],
  c5: [
    { wave: 1, who: 'pluma', text: 'No toques los libros. Algunos muerden.' },
    { wave: 8, who: 'clip', text: '"Silencio en la biblioteca", dijo nadie nunca.' },
    { wave: 15, who: 'corona', text: 'Cada página que rompes, la vuelvo a escribir.' },
  ],
  c6: [
    { wave: 1, who: 'pluma', text: 'Última escalera, Lino. Todo o nada.' },
    { wave: 7, who: 'clip', text: 'Si ganas, te hago descuento. Del 5 %. No te emociones.' },
    { wave: 14, who: 'corona', text: 'Él es MÍO. Su Trazo. Su nombre. Su hermano.' },
    { wave: 19, who: 'lino', text: 'Aguanta, Dante. Ya casi llego.' },
  ],
  abismo: [
    { wave: 3, who: 'clip', text: 'El Abismo no tiene fondo. Como mi bolsillo.' },
    { wave: 15, who: 'pluma', text: 'Aquí ya no hay mapa. Solo tinta.' },
    { wave: 25, who: 'corona', text: 'Aquí abajo, todo vuelve a mí.' },
  ],
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
