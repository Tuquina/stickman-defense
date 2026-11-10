import type { Eyes } from '../gfx/stickman';

export type CharId = 'linoKid' | 'danteKid' | 'lino' | 'dante' | 'clip' | 'hueco' | 'eco' | 'recuerdo' | 'danteLibre' | 'pluma';
export type PoseId = 'idle' | 'point' | 'fist' | 'laugh' | 'cross' | 'kneel' | 'fallen' | 'hands' | 'sit';

export interface Actor {
  id: CharId;
  power?: string;
  powerColor?: string;
  glow?: boolean;
  eyes?: Eyes;
  mouth?: 'none' | 'grin' | 'open' | 'frown';
  pose?: PoseId;
  alpha?: number;
  /** story-only extras */
  prop?: 'broom' | 'broomBroken';
  tears?: boolean;
  bandage?: boolean;
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
  fx?: ('shake' | 'flash' | 'purple' | 'dark' | 'light' | 'pushL' | 'exitR' | 'pulse' | 'page' | 'zoom' | 'reveal' | 'ink' | 'push')[];
  /** lighting that persists until another beat changes it */
  mood?: 'day' | 'night' | 'fire' | 'dawn' | 'candle';
  /** staged animation: 'horde' monsters running, 'beast' the giant creature (both persist while listed),
   *  'swipe' tentacle strike on the left actor, 'crack' broken broom, 'note' Dante's farewell note */
  cine?: ('horde' | 'beast' | 'swipe' | 'crack' | 'note' | 'bed' | 'wake' | 'look' | 'broom')[];
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
      { who: 'C', text: 'VALTINTA · HACE CINCO AÑOS', left: linoKid({ eyes: 'sad' }), right: danteKid({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'N', text: 'En Valtinta, todo lo vivo está hecho de tinta.', hl: 'A la fuerza de cada uno le dicen Trazo.' },
      { who: 'R', text: 'Hey, hermanito. ¿Otra vez saliste corriendo por una araña?', right: danteKid({ eyes: 'happy', mouth: 'open', pose: 'laugh' }) },
      { who: 'L', text: 'No corrí… Bueno, sí.', hl: 'Pero era una araña muy grande.', left: linoKid({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: '¿Esta? Lino, esta araña', hl: 'cabe en una cuchara.', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'point' }) },
      { who: 'L', text: 'Ya vas a ver. Un día', hl: 'voy a ser más fuerte que tú.', left: linoKid({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Ese día te invito pan dulce. Mientras tanto…', hl: 'mientras yo esté, nadie te toca.', right: danteKid({ eyes: 'determined', mouth: 'grin', pose: 'fist' }) },
      { who: 'L', text: 'Dante… ¿y si un día te vas lejos?', hl: 'Como se fue papá.', left: linoKid({ eyes: 'sad', pose: 'idle' }), right: danteKid({ eyes: 'shock', mouth: 'none', pose: 'idle' }) },
      { who: 'R', text: '¿Irme yo? ¿Y quién te saca', hl: 'las arañas de la cama?', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'cross' }) },
      { who: 'L', text: 'Prométemelo.', hl: 'Que nunca nos vamos a abandonar.', left: linoKid({ eyes: 'determined', pose: 'point' }) },
      { who: 'R', text: 'No importa quién tenga más nivel.', hl: 'Siempre vamos a ser hermanos.', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'point' }) },
      { who: 'R', text: 'Mejor lo escribimos. Lo que se escribe con tinta', hl: 'no se borra nunca.', right: danteKid({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', text: 'Lo firmaron en una hoja de cuaderno, con la huella del pulgar.', hl: 'Lo llamaron el Juramento de Tinta.', left: linoKid({ eyes: 'happy', mouth: 'grin', pose: 'fist' }), right: danteKid({ eyes: 'happy', mouth: 'open', pose: 'fist' }), fx: ['flash', 'page'] },
      // ---- the attack (night village, painted fire, the beast behind the houses)
      { who: 'N', bg: 'bg_village_night', mood: 'night', text: 'Esa noche, la aldea dormía.', hl: 'Hasta que el río empezó a ponerse negro.', left: null, right: null, music: 'sad' },
      { who: 'N', mood: 'fire', cine: ['horde'], text: 'La Mancha se desbordó desde la Marisma.', hl: 'Cientos de monstruos de tinta entraron a la aldea.', left: linoKid({ power: '', eyes: 'shock', pose: 'hands' }), right: danteKid({ power: '', eyes: 'shock', mouth: 'open' }), fx: ['shake'], music: 'boss' },
      { who: 'R', cine: ['horde'], text: '¡Lino, ponte detrás de mí!', hl: '¡Y no te muevas!', right: danteKid({ power: '', eyes: 'angry', mouth: 'open', pose: 'fist', prop: 'broom' }), fx: ['push'] },
      { who: 'L', cine: ['horde'], text: 'Dante… son demasiados…', left: linoKid({ power: '', eyes: 'shock', pose: 'hands', tears: true }), fx: ['push'] },
      { who: 'R', cine: ['horde'], text: '¡Mientras yo esté…', hl: '…nadie te toca!', right: danteKid({ power: '', eyes: 'angry', mouth: 'open', pose: 'point', prop: 'broom' }), fx: ['zoom'] },
      { who: 'N', cine: ['horde', 'beast'], text: 'Entonces, del río salió algo mucho más grande.', hl: 'En la frente le brillaba una marca violeta.', left: linoKid({ power: '', eyes: 'shock', pose: 'hands' }), right: danteKid({ power: '', eyes: 'shock', mouth: 'open', pose: 'hands', prop: 'broom' }), fx: ['purple'] },
      { who: 'R', cine: ['beast', 'swipe'], text: '¡LINO!', left: linoKid({ power: '', eyes: 'closed', pose: 'fallen' }), right: danteKid({ power: '', eyes: 'shock', mouth: 'open', pose: 'hands', prop: 'broom' }), fx: ['pushL'] },
      { who: 'R', cine: ['beast'], text: '¡Déjalo! ¡DÉJALO!', hl: '¡Pelea conmigo, cobarde!', right: danteKid({ power: '', eyes: 'angry', mouth: 'open', pose: 'fist', prop: 'broom', tears: true }), fx: ['shake', 'push'] },
      { who: 'N', cine: ['beast', 'crack'], text: 'Dante le pegó con lo único que tenía: un palo de escoba.', hl: 'El palo se partió en dos.', right: danteKid({ power: '', eyes: 'shock', mouth: 'open', pose: 'point', prop: 'broomBroken', tears: true }) },
      { who: 'N', text: 'La bestia ni siquiera lo miró.', hl: 'Se hundió en el río y se fue, como si nada.', right: danteKid({ power: '', eyes: 'sad', mouth: 'open', pose: 'kneel', prop: 'broomBroken', tears: true }), music: 'sad' },
      // ---- the healer's house
      { who: 'C', bg: 'bg_room', mood: 'candle', cine: ['bed'], text: 'CASA DE LA CURANDERA', left: linoKid({ power: '', eyes: 'closed', pose: 'fallen', bandage: true }), right: danteKid({ power: '', eyes: 'sad', pose: 'kneel', tears: true }) },
      { who: 'N', cine: ['bed'], text: 'Lino estuvo tres días sin despertar.', hl: 'Casi no la cuenta.' },
      { who: 'R', cine: ['bed'], text: 'Perdóname, Lino…', hl: 'No pude hacer nada.', right: danteKid({ power: '', eyes: 'sad', mouth: 'frown', pose: 'kneel', tears: true }), fx: ['push'] },
      { who: 'R', cine: ['bed'], text: 'Tenía un palo de escoba. Nada más.', hl: 'Soy débil… ¡SOY DÉBIL!', right: danteKid({ power: '', eyes: 'angry', mouth: 'open', pose: 'fist', tears: true }), fx: ['shake', 'zoom'] },
      { who: 'N', cine: ['bed'], voice: 'voz', text: '«En las Ruinas del Castillo hay algo que te puede hacer fuerte…', hl: '…si te atreves a ir a buscarlo.»', fx: ['purple'] },
      { who: 'R', cine: ['bed'], text: 'Nunca más.', hl: 'Nunca más voy a ser débil.', right: danteKid({ power: '', eyes: 'determined', mouth: 'none', pose: 'fist', tears: true }), fx: ['purple', 'push'] },
      { who: 'N', mood: 'dawn', cine: ['bed', 'broom'], text: 'Esa madrugada, Dante se fue sin despedirse.', right: danteKid({ power: '', eyes: 'determined', pose: 'idle' }), fx: ['exitR'] },
      { who: 'N', cine: ['bed', 'broom', 'wake'], text: 'Esa misma mañana, Lino por fin abrió los ojos.', left: linoKid({ power: '', eyes: 'shock', pose: 'sit', bandage: true }), right: null },
      { who: 'L', cine: ['bed', 'broom', 'look'], text: '¿Dante…?', left: linoKid({ power: '', eyes: 'sad', pose: 'sit', bandage: true }) },
      { who: 'N', cine: ['bed', 'broom', 'note'], text: 'En la almohada había una nota.', left: linoKid({ power: '', eyes: 'sad', pose: 'sit', bandage: true, tears: true }) },
    ],
  },
  prologo2: {
    id: 'prologo2', title: 'Prólogo II · Cinco años después', bg: 'bg_day', music: 'story',
    beats: [
      { who: 'C', text: 'CINCO AÑOS DESPUÉS', left: lino({ eyes: 'determined' }), right: null },
      { who: 'L', text: 'Quinientos de Trazo.', hl: 'Cinco años partiendo leña para llegar a esto.', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'fist' }) },
      { who: 'N', text: 'Esa tarde, el cielo de la aldea se puso violeta.', hl: 'Dante había vuelto. Con una corona.', left: lino({ eyes: 'shock' }), right: dante({ eyes: 'smug', pose: 'cross' }), fx: ['purple', 'shake'], music: 'boss' },
      { who: 'R', text: 'Hey, hermanito.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'cross' }) },
      { who: 'L', text: '¿Dante? Te busqué por todos lados…', hl: '¿Qué es eso que tienes en la cabeza?', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Me hice fuerte, como dije.', hl: 'Cien mil de Trazo, Lino. ¡CIEN MIL!', right: dante({ eyes: 'glow', mouth: 'open', pose: 'fist' }), fx: ['shake', 'purple', 'pulse', 'zoom'] },
      { who: 'L', text: '¿Cien mil…?', hl: 'Y yo que estaba orgulloso de mis quinientos.', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'L', text: 'Bueno… ya volviste. Vamos a casa.', hl: '¿Te acuerdas de la hoja que firmamos?', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: '¿La hoja de cuaderno?', hl: 'Eso era un juego de niños, Lino.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'laugh' }) },
      { who: 'R', text: 'Mírate. Quinientos.', hl: 'Eres basura, Lino.', right: dante({ eyes: 'angry', mouth: 'frown', pose: 'point' }), fx: ['zoom'] },
      { who: 'N', text: '¡PUM!', left: lino({ eyes: 'closed', pose: 'fallen' }), fx: ['shake', 'flash', 'pushL'] },
      { who: 'N', voice: 'corona', text: '«Hazlo ahora, Dante. Su Trazo es tuyo.', hl: 'Bórralo y nunca más vas a tener miedo.»', fx: ['purple'] },
      { who: 'R', text: '…No.', hl: 'Ni siquiera vale la pena.', right: dante({ eyes: 'closed', mouth: 'none', pose: 'cross' }) },
      { who: 'N', text: 'Dante se fue caminando.', hl: 'No miró atrás. Ni una vez.', right: dante({ eyes: 'smug', pose: 'idle' }), fx: ['exitR'] },
      { who: 'L', text: '…', left: lino({ eyes: 'sad', pose: 'kneel' }), right: null, music: 'sad' },
      { who: 'L', text: 'Esto…', hl: 'no se va a quedar así.', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'light', 'zoom'], music: 'boss' },
      { who: 'C', text: 'JURAMENTO DE TINTA', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['flash'] },
    ],
  },
  c1_intro: {
    id: 'c1_intro', title: 'Capítulo 1 · El Bosque Sombrío', bg: 'bg_c1', music: 'menu',
    beats: [
      { who: 'N', text: 'Unos días después, las arañas bajaron del Bosque Sombrío.', hl: 'Venían directo a la aldea.', left: lino({ eyes: 'determined' }), right: null },
      { who: 'L', text: 'Arañas.', hl: 'Claro. Tenían que ser arañas.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Oye, tú, el de la bufanda.', hl: '¿De verdad vas a pelear con ese arquito?', right: clip({ eyes: 'cool', mouth: 'grin' }) },
      { who: 'L', text: '¿Y tú quién eres?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Clip. Vendo cosas, arreglo cosas.', hl: 'Todos me dicen Tío Clip.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }) },
      { who: 'L', text: '¿Eres tío de alguien?', left: lino({ eyes: 'determined' }) },
      { who: 'R', text: 'De nadie, que yo sepa.', hl: 'Pero así la gente me compra con más confianza.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'cross' }) },
      { who: 'R', text: 'Vi a tu hermano el otro día, el de la corona.', hl: 'Te dejó tirado y ni se dio vuelta.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'Voy a alcanzarlo.', hl: 'Cueste lo que cueste.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Entonces hagamos negocio: tú paras a esos bichos', hl: 'y yo te vendo mejoras. Precio de amigo.', right: clip({ eyes: 'cool', mouth: 'open', pose: 'hands' }) },
      { who: 'R', text: 'Las arañas tienen que cruzar el puente del bosque.', hl: 'Ahí armamos la barricada.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }) },
      { who: 'N', text: 'Tu héroe dispara solo. TOCA a un enemigo para marcarlo:', hl: 'recibe +30% de daño.' },
      { who: 'N', text: 'Usa las HABILIDADES de abajo y la FURIA cuando se llene.', hl: '¡Toca las monedas: valen el doble!' },
    ],
  },
  c1_outro: {
    id: 'c1_outro', title: 'Capítulo 1 · La marca violeta', bg: 'bg_c1', music: 'story',
    beats: [
      { who: 'R', text: '¡Le ganaste a la Reina!', hl: 'Y casi no gritaste.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }) },
      { who: 'L', text: 'Tenía una marca en la frente.', hl: 'Violeta. Igual que la corona de Dante.', left: lino({ eyes: 'determined', pose: 'point' }) },
      { who: 'R', text: 'Ah.', hl: 'Entonces es cierto lo que se cuenta.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'cross' }) },
      { who: 'L', text: '¿Qué se cuenta?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Que esa es la Corona Hueca. Cada vez que su dueño gana', hl: 'se queda con el Trazo del que perdió.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'point' }), fx: ['purple'] },
      { who: 'R', text: 'Y a las bestias que marca', hl: 'las manda adonde ella quiere.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
      { who: 'L', text: 'Así llegó a cien mil.', hl: 'Quitándoselo a otros.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Mi abuelo decía que la guardaban en las Ruinas del Castillo,', hl: 'con un caballero de guardia día y noche.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'cross' }) },
      { who: 'L', text: 'Ahí jugábamos de chicos.', hl: 'Voy a ir.', left: lino({ eyes: 'determined', pose: 'fist' }) },
      { who: 'R', text: 'Entonces ponte esto: una capucha de vigía.', hl: 'Es usada, pero está lavada. Creo.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', text: '¡Desbloqueaste la CAPUCHA DE VIGÍA, la ESCOPETA', hl: 'y el CAPÍTULO 2!', fx: ['flash'] },
    ],
  },
  c2_intro: {
    id: 'c2_intro', title: 'Capítulo 2 · Las Ruinas del Castillo', bg: 'bg_c2', music: 'story',
    beats: [
      { who: 'L', text: 'Las Ruinas…', hl: 'Aquí jugábamos a los caballeros.', left: lino({ eyes: 'sad' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Ahora juegan esqueletos.', hl: 'Y no se ven muy simpáticos.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'Dante siempre era el caballero.', hl: 'A mí me tocaba ser el dragón. O la princesa.', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'R', text: '¿Y cuál te salía mejor?', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }) },
      { who: 'L', text: '…Siguiente pregunta.', left: lino({ eyes: 'closed', pose: 'cross' }) },
      { who: 'N', voice: 'voz', text: '«Quien viene a buscar la Corona…', hl: '…solo encuentra el vacío.»', fx: ['dark'] },
      { who: 'L', text: 'No vengo por ninguna corona.', hl: 'Vengo por mi hermano.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'N', text: 'Entre las piedras se levanta un caballero con el yelmo vacío:', hl: 'Sir Hueco, el guardián de la Corona.', right: hueco({ pose: 'idle' }), fx: ['shake', 'dark'], music: 'boss' },
    ],
  },
  c2_outro: {
    id: 'c2_outro', title: 'Capítulo 2 · El guardián vacío', bg: 'bg_c2', music: 'sad',
    beats: [
      { who: 'R', text: 'Cuidé esa Corona cuarenta años.', hl: 'Hace cinco, un niño vino a pedírmela.', left: lino({ eyes: 'determined' }), right: hueco({ pose: 'kneel' }) },
      { who: 'L', text: '¿Un niño…?', hl: '¿Con un pañuelo rojo en el cuello?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Sí. Lloraba. Dijo que su hermano casi muere', hl: 'y que nunca más iba a ser débil.', right: hueco({ pose: 'kneel' }), fx: ['push', 'purple'] },
      { who: 'L', text: '…Lo hizo por mí.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Le dije que no. Peleamos y me ganó.', hl: 'Se puso la Corona ahí mismo. Yo fui el primero.', right: hueco({ pose: 'kneel' }), fx: ['purple'] },
      { who: 'R', text: 'Me quitó el Trazo, el nombre…', hl: '…y la cara de mi esposa. Ya no la recuerdo.', right: hueco({ pose: 'kneel' }) },
      { who: 'L', text: '¿Te borró los recuerdos?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'La Corona da poder, pero cobra en recuerdos.', hl: 'Y empieza por lo que más quieres.', right: hueco({ pose: 'kneel' }), fx: ['purple', 'zoom'] },
      { who: 'R', text: 'A los que vence los deja vacíos y los usa de muñecos.', hl: 'Su tinta me movía. Tú la rompiste.', right: hueco({ pose: 'kneel', power: '0', powerColor: '#9aa8b8' }), fx: ['ink'] },
      { who: 'L', text: 'Entonces Dante…', hl: '¿se está olvidando de mí?', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Hace un año lo vi pasar hacia la Ciudadela de Ceniza.', hl: 'Ve rápido, muchacho. Mientras todavía te recuerde.', right: hueco({ pose: 'kneel', alpha: 0.7, power: '0', powerColor: '#9aa8b8' }) },
      { who: 'N', text: 'Sir Hueco se deshace en tinta.', hl: 'Por primera vez en cinco años, descansa.', right: null, fx: ['ink'] },
      { who: 'R', text: 'Dejó esto. Una armadura de caballero.', hl: 'Te queda grande, pero ya vas a crecer.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'hands' }), music: 'menu' },
      { who: 'N', text: '¡Desbloqueaste la ARMADURA DE CABALLERO, el SHURIKEN', hl: 'y el CAPÍTULO 3!', fx: ['flash'] },
    ],
  },
  c3_intro: {
    id: 'c3_intro', title: 'Capítulo 3 · La Ciudadela de Ceniza', bg: 'bg_c3', music: 'story',
    beats: [
      { who: 'L', text: 'La Ciudadela de Ceniza.', hl: 'Sir Hueco dijo que Dante pasó por aquí.', left: lino({ eyes: 'determined' }), right: clip({ eyes: 'cool' }) },
      { who: 'R', text: 'Antes aquí había un mercado. Vendí muchísimo.', hl: 'Ahora no queda ni a quién cobrarle.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'R', text: 'Hey, hermanito…', hl: 'Viniste.', right: eco({ eyes: 'glow', pose: 'cross' }), fx: ['purple', 'shake'], music: 'boss' },
      { who: 'L', text: '¡DANTE!', left: lino({ eyes: 'angry', pose: 'point' }), fx: ['zoom'] },
      { who: 'L', text: 'Espera… no tiene la bufanda.', hl: 'Dante no se la saca ni para dormir.', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Dante está ocupado.', hl: 'Me mandó a mí. Soy su Eco.', right: eco({ eyes: 'glow', pose: 'idle' }) },
      { who: 'R', text: 'Cien mil. Cien mil. Cien mil.', hl: 'Mi poder es de cien mil.', right: eco({ eyes: 'glow', mouth: 'open', pose: 'fist' }), fx: ['shake', 'pulse'] },
      { who: 'R', text: 'Eso no está bien.', hl: 'Habla como si algo se le hubiera trabado.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
      { who: 'R', text: 'Los Ecos son disfraces de tinta de la Corona.', hl: 'Adentro siempre hay alguien atrapado.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'point' }) },
      { who: 'L', text: '¿Como Sir Hueco?', hl: '¿Alguien a quien Dante le ganó?', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Igual. Solo que a este le puso la cara de tu hermano,', hl: 'para que no te animes a pegarle.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'Entonces lo saco de ahí.', hl: 'Aunque tenga su cara.', left: lino({ eyes: 'angry', pose: 'fist' }) },
    ],
  },
  c3_outro: {
    id: 'c3_outro', title: 'Capítulo 3 · Lo que había dentro', bg: 'bg_c3', music: 'sad',
    beats: [
      { who: 'R', text: 'Hermanito…', hl: '¿por qué peleas tanto?', left: lino({ eyes: 'determined' }), right: eco({ eyes: 'glow', pose: 'kneel', alpha: 0.8 }) },
      { who: 'L', text: 'Porque mi hermano me hizo una promesa.', hl: 'Y tu Corona se la está tragando.', left: lino({ eyes: 'angry', pose: 'point' }) },
      { who: 'R', text: '¿Promesa…?', hl: 'No… recuerdo… ninguna…', right: eco({ eyes: 'closed', pose: 'kneel', alpha: 0.6 }) },
      { who: 'N', text: 'La tinta violeta se escurre como agua sucia…', hl: '…y adentro hay una muchacha.', right: pluma({ eyes: 'closed', pose: 'kneel' }), fx: ['flash', 'ink', 'reveal'] },
      { who: 'R', text: '¿Dónde está mi cuaderno?', hl: '¿Qué día es hoy?', right: pluma({ eyes: 'shock', pose: 'kneel' }) },
      { who: 'L', text: 'Tranquila. ¿Cómo te llamas?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Pluma. Copio mapas en el archivo de la Ciudadela.', hl: 'O copiaba. ¿Por qué está todo quemado?', right: pluma({ eyes: 'sad', pose: 'idle' }) },
      { who: 'L', text: '…Tu Trazo dice uno.', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Ya sé lo que dice, gracias.', hl: 'Me lo quitaron todo. Dame un respiro.', right: pluma({ eyes: 'angry', pose: 'cross' }) },
      { who: 'R', text: 'Dante me ganó hace un año. Desde entonces, la Corona', hl: 'me tuvo adentro de ese disfraz. Con su cara.', right: pluma({ eyes: 'sad', pose: 'hands' }) },
      { who: 'L', text: 'Entonces Dante nunca estuvo aquí.', left: lino({ eyes: 'sad' }) },
      { who: 'R', text: 'No. Pero la Corona conecta a todos los que usa.', hl: 'Desde adentro lo oía a él. Discutían.', right: pluma({ eyes: 'determined', pose: 'point' }), fx: ['light'], music: 'story' },
      { who: 'R', text: 'Esa tarde en tu aldea, la Corona le gritaba que te borrara.', hl: 'No te dejó vivo por desprecio, Lino. No pudo.', right: pluma({ eyes: 'determined', pose: 'hands' }), fx: ['light', 'zoom'] },
      { who: 'L', text: '…Dante.', left: lino({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'R', text: 'Su Trono está sobre La Mancha. Se sube por la Torre del Olvido,', hl: 'y a la Torre se llega cruzando la Marisma.', right: pluma({ eyes: 'determined', pose: 'point' }) },
      { who: 'N', voice: 'corona', text: '«Qué niño tan terco.', hl: 'Ven, entonces. Sube. Te estoy esperando.»', fx: ['purple', 'shake'], music: 'boss' },
      { who: 'R', text: '¿Ustedes también oyeron eso?', hl: 'Díganme que sí, por favor.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }), music: 'menu' },
      { who: 'R', text: 'Voy con ustedes. Esa cosa me debe un año de vida.', hl: 'Y yo conozco el camino.', right: pluma({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Bienvenida. Tú pones los mapas,', hl: 'yo pongo la carreta y la conversación.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'point' }) },
      { who: 'N', text: '¡Pluma se une al equipo! ¡Desbloqueaste el CAPÍTULO 4', hl: 'y EL ABISMO (modo infinito)!', fx: ['flash'] },
    ],
  },

  c4_intro: {
    id: 'c4_intro', title: 'Capítulo 4 · La Marisma de Tinta', bg: 'bg_c4', music: 'story',
    beats: [
      { who: 'L', text: 'La Marisma.', hl: 'De aquí bajaron los monstruos aquella noche.', left: lino({ eyes: 'determined' }), right: pluma({ eyes: 'determined' }) },
      { who: 'R', text: 'Según el mapa, el camino a la Torre cruza justo por el medio.', hl: 'El mapa no decía nada del olor.', right: pluma({ eyes: 'sad', pose: 'cross' }) },
      { who: 'R', text: 'Es el barro. Dicen que es bueno para la piel.', hl: 'Les puedo vender un frasco.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }) },
      { who: 'R', text: 'No.', right: pluma({ eyes: 'angry', pose: 'cross' }) },
      { who: 'L', text: 'La bestia que me hirió esa noche sigue aquí.', hl: 'Todavía me duele la espalda cuando llueve.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'N', text: 'Algo enorme se mueve bajo el agua negra.', hl: 'Las burbujas suben en círculo.', fx: ['dark', 'shake'], music: 'boss' },
      { who: 'R', text: 'Lino… esa cosa tiene la marca de la Corona.', hl: 'Lo de tu aldea no fue mala suerte.', right: pluma({ eyes: 'shock', pose: 'hands' }) },
      { who: 'L', text: 'Esa noche me escondí debajo de la mesa.', hl: 'Hoy no me escondo.', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['light', 'zoom'] },
    ],
  },
  c4_outro: {
    id: 'c4_outro', title: 'Capítulo 4 · El plan de la Corona', bg: 'bg_c4', music: 'sad',
    beats: [
      { who: 'N', text: 'El Kraken se hunde. En la frente', hl: 'todavía le brilla la marca violeta.', left: lino({ eyes: 'shock' }), right: pluma({ eyes: 'determined' }), fx: ['purple'] },
      { who: 'L', text: 'Esa marca es vieja.', hl: 'Ya la tenía hace cinco años.', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Las marcas de la Corona no se borran.', hl: 'Ella lo mandó a tu aldea. A propósito.', right: pluma({ eyes: 'sad', pose: 'point' }) },
      { who: 'L', text: '¿Para qué?', hl: 'Éramos dos niños.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Necesitaba a alguien desesperado por ser fuerte.', hl: 'Alguien que fuera a buscarla solo.', right: pluma({ eyes: 'determined', pose: 'hands' }) },
      { who: 'L', text: 'Usó a Dante.', hl: 'Nos usó a los dos. Desde el principio.', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'zoom'] },
      { who: 'R', text: 'Cinco años preparando una trampa para dos niños.', hl: 'Hay que tener el corazón bien negro.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'L', text: 'Pluma, si la Corona borra recuerdos…', hl: '¿adónde se van?', left: lino({ eyes: 'determined' }) },
      { who: 'R', text: 'A la Torre del Olvido. Allá guarda todo lo que quita,', hl: 'donde nadie lo vuelva a encontrar.', right: pluma({ eyes: 'determined', pose: 'point' }) },
      { who: 'R', text: 'Encontré esto en el barro: una lanza de tinta.', hl: 'La lavé dos veces. Sigue oliendo.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }), music: 'menu' },
      { who: 'N', text: '¡Desbloqueaste la LANZA DE TINTA', hl: 'y el CAPÍTULO 5!', fx: ['flash'] },
    ],
  },
  c5_intro: {
    id: 'c5_intro', title: 'Capítulo 5 · La Torre del Olvido', bg: 'bg_c5', music: 'story',
    beats: [
      { who: 'L', text: 'La Torre del Olvido.', hl: 'Aquí guarda la Corona lo que borra.', left: lino({ eyes: 'determined' }), right: pluma({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'R', text: 'Una biblioteca entera…', hl: 'Si salimos vivos, vuelvo con más cuadernos.', right: pluma({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', text: 'Miles de páginas flotan entre los estantes.', hl: 'Cada una es un recuerdo que alguien perdió.', fx: ['purple'] },
      { who: 'R', text: 'Mira esta: «Lino y Dante pescando en el río».', hl: 'Y esta otra: «Lino llora por una araña».', right: pluma({ eyes: 'happy', mouth: 'grin', pose: 'point' }) },
      { who: 'L', text: '¡Dame eso!', hl: 'Y era muy grande, que conste.', left: lino({ eyes: 'shock', pose: 'hands' }) },
      { who: 'L', text: 'Si los recuerdos de Dante están aquí,', hl: 'me los llevo todos.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: 'Hey, hermanito.', hl: '¿Otra vez corriste por una araña?', right: recuerdo({ eyes: 'glow', mouth: 'grin' }), fx: ['purple', 'shake'], music: 'boss' },
      { who: 'L', text: '¿Dante…?', hl: '¿Eres tú… de chico?', left: lino({ eyes: 'shock' }) },
      { who: 'R', text: 'Soy lo que le borraron.', hl: 'Cada tarde contigo. Cada pan dulce.', right: recuerdo({ eyes: 'glow', pose: 'point' }) },
      { who: 'R', text: 'Y la Corona dice que ya no le sirves.', hl: 'Que eres basura. ¡Vete!', right: recuerdo({ eyes: 'angry', mouth: 'open', pose: 'fist' }), fx: ['shake'] },
      { who: 'R', text: 'La Corona está metida en esos recuerdos, como estuvo en mí.', hl: 'Ese no es Dante. Es lo que ella hace con él.', right: pluma({ eyes: 'determined', pose: 'point' }) },
      { who: 'L', text: 'Entonces te voy a sacar de ahí.', hl: 'Como a Pluma.', left: lino({ eyes: 'determined', pose: 'fist' }), fx: ['light'] },
    ],
  },
  c5_outro: {
    id: 'c5_outro', title: 'Capítulo 5 · La página', bg: 'bg_c5', music: 'sad',
    beats: [
      { who: 'R', text: 'Mientras yo esté…', hl: '…nadie te toca…', left: lino({ eyes: 'sad' }), right: recuerdo({ eyes: 'closed', pose: 'kneel', alpha: 0.6 }), fx: ['push'] },
      { who: 'L', text: 'Ya lo sé.', hl: 'Siempre lo cumpliste.', left: lino({ eyes: 'sad', pose: 'hands' }) },
      { who: 'N', text: 'El recuerdo se deshace en gotas.', hl: 'En el suelo queda una hoja de cuaderno.', right: null, fx: ['ink'] },
      { who: 'N', text: 'Tiene dos huellas de pulgar y una frase:', hl: '«Nunca nos vamos a abandonar.»', fx: ['light', 'page'] },
      { who: 'R', text: 'La Corona no pudo borrarla.', hl: 'Por eso la escondió aquí, donde nadie mira.', right: pluma({ eyes: 'determined', pose: 'point' }) },
      { who: 'L', text: 'Lo que se escribe con tinta no se borra.', hl: 'Se la voy a devolver.', left: lino({ eyes: 'determined', pose: 'fist' }), music: 'story' },
      { who: 'R', text: 'Toma, chico. La hice yo, con lo último que me quedaba:', hl: 'la armadura del Heredero del Juramento.', right: clip({ eyes: 'cool', mouth: 'grin', pose: 'hands' }), music: 'menu' },
      { who: 'R', text: '¿Gratis?', hl: '¿Tú?', right: pluma({ eyes: 'shock', pose: 'hands' }) },
      { who: 'R', text: 'Si se lo cuentas a alguien,', hl: 'te la cobro a ti.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'cross' }) },
      { who: 'R', text: 'La escalera de la Torre sube hasta el Trono.', hl: 'Dante está arriba.', right: pluma({ eyes: 'determined', pose: 'point' }) },
      { who: 'N', text: '¡Desbloqueaste el set HEREDERO DEL JURAMENTO', hl: 'y el CAPÍTULO 6!', fx: ['flash'] },
    ],
  },
  c6_intro: {
    id: 'c6_intro', title: 'Capítulo 6 · El Trono de la Corona', bg: 'bg_c6', music: 'boss',
    beats: [
      { who: 'C', text: 'EL TRONO DE LA CORONA', left: lino({ eyes: 'determined' }), right: dante({ eyes: 'smug', pose: 'cross' }) },
      { who: 'R', text: 'Hey, hermanito.', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'cross' }) },
      { who: 'R', text: 'Mira hasta dónde llegaste.', hl: '¿Cuánto tienes ya? ¿Mil? ¿Diez mil?', right: dante({ eyes: 'smug', mouth: 'grin', pose: 'laugh' }) },
      { who: 'L', text: 'No vine a ver quién tiene más.', hl: 'Vine a devolverte algo.', left: lino({ eyes: 'determined', pose: 'point' }) },
      { who: 'N', voice: 'corona', text: '«¿Te acuerdas de esa noche, Dante? Del miedo.', hl: 'Bórralo a él y no vuelves a sentirlo.»', fx: ['purple', 'shake'] },
      { who: 'R', text: '¡Cállate!', hl: 'Ya sé lo que tengo que hacer.', right: dante({ eyes: 'glow', mouth: 'open', pose: 'hands' }), fx: ['pulse'] },
      { who: 'L', text: 'Pluma me contó que discuten.', hl: 'Que esa tarde no pudiste borrarme.', left: lino({ eyes: 'determined', pose: 'hands' }) },
      { who: 'R', text: '¡Esa chica miente!', hl: 'Te dejé vivo porque no valías nada.', right: dante({ eyes: 'angry', mouth: 'open', pose: 'point' }), fx: ['shake', 'zoom'] },
      { who: 'L', text: 'Entonces demuéstralo.', hl: 'Ven.', left: lino({ eyes: 'angry', pose: 'fist' }) },
      { who: 'R', text: '¡Como quieras!', right: dante({ eyes: 'angry', mouth: 'open', pose: 'fist' }), fx: ['shake', 'purple'] },
    ],
  },
  c6_outro: {
    id: 'c6_outro', title: 'Capítulo 6 · La decisión', bg: 'bg_c6', music: 'sad',
    beats: [
      { who: 'R', text: 'No puede ser…', hl: 'Tengo cien mil…', left: lino({ eyes: 'determined' }), right: dante({ eyes: 'shock', pose: 'kneel' }) },
      { who: 'L', text: 'Y yo tengo esto.', hl: '«Nunca nos vamos a abandonar.»', left: lino({ eyes: 'determined', pose: 'point' }), fx: ['light', 'page'] },
      { who: 'R', text: 'Esa letra…', hl: '…es mía.', right: dante({ eyes: 'sad', pose: 'kneel' }), fx: ['push'] },
      { who: 'R', text: 'La araña… me acuerdo de la araña.', hl: 'Cabía en una cuchara.', right: dante({ eyes: 'sad', mouth: 'grin', pose: 'kneel' }), fx: ['push'] },
      { who: 'L', text: 'Era muy grande.', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'N', voice: 'corona', text: '«¡No! ¡Es mío!', hl: '¡Me costó cinco años!»', fx: ['purple', 'shake', 'zoom'] },
      { who: 'R', text: 'Lino… la Corona no me suelta.', hl: 'Si la rompes, me voy con ella.', right: dante({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'R', text: 'Y si intentas sacármela con las manos…', hl: '…te va a quemar.', right: dante({ eyes: 'sad', pose: 'hands' }) },
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
      { who: 'L', text: 'Me dijiste basura.', hl: 'Me dejaste tirado delante de toda la aldea.', left: lino({ eyes: 'angry', pose: 'point' }), right: dante({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'R', text: 'Lo sé.', hl: 'Hazlo.', right: dante({ eyes: 'closed', pose: 'kneel' }) },
      { who: 'L', text: 'Esto es por esa tarde.', hl: '¡Se terminó, Dante!', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'flash', 'zoom'] },
      { who: 'N', text: 'Lino parte la Corona en dos.', hl: 'Suena como un vidrio. Dante grita.', fx: ['purple', 'shake', 'ink'] },
      { who: 'N', text: 'Cuando la tinta se asienta, Dante ya no está.', hl: 'En el suelo queda su bufanda roja.', right: null, music: 'sad' },
      { who: 'L', text: '…Gané.', left: lino({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'L', text: '¿Entonces por qué…', hl: '…me siento así?', left: lino({ eyes: 'sad', pose: 'kneel' }), fx: ['push'] },
      { who: 'R', text: 'Porque no querías ganarle.', hl: 'Querías que volviera.', right: pluma({ eyes: 'sad', pose: 'hands' }) },
      { who: 'R', text: 'Vamos, chico. Te llevo a casa.', hl: 'Hoy no te cobro el viaje.', right: clip({ eyes: 'cool', mouth: 'none', pose: 'hands' }) },
      { who: 'N', text: 'Lino guarda la bufanda.', hl: 'La tinta todavía se mueve. Muy poco.', fx: ['light'] },
      { who: 'C', text: 'FINAL: VENGANZA', right: null },
    ],
  },
  final_liberacion: {
    id: 'final_liberacion', title: 'Final · Liberación', bg: 'bg_c6', music: 'story',
    beats: [
      { who: 'L', text: 'Firmamos que nunca nos íbamos a abandonar.', left: lino({ eyes: 'determined' }), right: dante({ eyes: 'sad', pose: 'kneel' }) },
      { who: 'L', text: 'Y yo cumplo lo que firmo.', hl: '¡Suéltalo!', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['shake', 'light'], music: 'boss' },
      { who: 'N', text: 'Lino agarra la Corona con las dos manos.', hl: 'Le quema. No la suelta.', fx: ['purple', 'shake'] },
      { who: 'N', voice: 'corona', text: '«¡Suelta! ¡No eres nadie!', hl: '¡Eres un nivel bajo!»', fx: ['purple', 'shake'] },
      { who: 'L', text: 'Seré de nivel bajo…', hl: '¡pero soy su hermano!', left: lino({ eyes: 'angry', pose: 'fist' }), fx: ['light', 'zoom', 'shake'] },
      { who: 'N', text: 'La Corona cruje entre sus dedos y se parte…', hl: '…y Dante cae al suelo. Libre.', fx: ['flash', 'ink', 'reveal'], right: libre({ eyes: 'closed', pose: 'kneel' }), music: 'story' },
      { who: 'C', text: 'DÍAS DESPUÉS · EL PATIO DONDE LO FIRMARON', bg: 'bg_day', left: lino({ eyes: 'determined' }), right: libre({ eyes: 'sad', pose: 'idle' }) },
      { who: 'R', text: 'Lino… lo que te dije esa tarde…', hl: 'Perdóname.', right: libre({ eyes: 'sad', pose: 'hands' }), fx: ['push'] },
      { who: 'L', text: 'Eso lo dijo la Corona.', hl: 'Tú solo llegaste tarde. Cinco años tarde.', left: lino({ eyes: 'happy', mouth: 'grin' }) },
      { who: 'R', text: 'Ahora tengo diez de Trazo.', hl: 'Vas a tener que cuidarme tú.', right: libre({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'L', text: 'Mientras yo esté…', hl: '…nadie te toca.', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'fist' }), fx: ['push', 'light'] },
      { who: 'R', text: '¿Y si aparece una araña?', right: libre({ eyes: 'happy', mouth: 'open', pose: 'point' }) },
      { who: 'L', text: '…Ahí te las arreglas solo.', left: lino({ eyes: 'closed', mouth: 'grin', pose: 'cross' }) },
      { who: 'R', text: 'Ya lo anoté todo.', hl: 'Alguien tiene que contar bien esta historia.', right: pluma({ eyes: 'happy', mouth: 'grin', pose: 'hands' }) },
      { who: 'R', text: 'Yo no estoy llorando.', hl: 'Es el polvo de tinta. Hay mucho.', right: clip({ eyes: 'cool', mouth: 'frown', pose: 'hands' }) },
      { who: 'C', text: 'FINAL: LIBERACIÓN', left: lino({ eyes: 'happy', mouth: 'grin', pose: 'fist' }), right: libre({ eyes: 'happy', mouth: 'grin', pose: 'fist' }) },
    ],
  },
};

export type BattleSpeaker = 'clip' | 'pluma' | 'lino' | 'corona' | 'voz';
/** Short radio lines during battles, keyed by chapter and wave. */
export const BATTLE_LINES: Record<string, { wave: number; who: BattleSpeaker; text: string }[]> = {
  c1: [
    { wave: 1, who: 'clip', text: 'Tú dispara, que yo cuido la carreta.' },
    { wave: 3, who: 'clip', text: 'Con la Tinta que sueltan, construye detrás de la barricada. Los Pinchos frenan a las arañas.' },
    { wave: 6, who: 'clip', text: '¡Las grandes primero, chico! Márcalas y caen más rápido.' },
    { wave: 13, who: 'lino', text: 'Si Dante me viera ahora…' },
    { wave: 17, who: 'voz', text: '…hermanito…' },
  ],
  c2: [
    { wave: 1, who: 'lino', text: 'Por esa escalera subíamos a jugar.' },
    { wave: 3, who: 'clip', text: 'Los arqueros pegan desde lejos. Una Torre en el centro los baja antes.' },
    { wave: 6, who: 'clip', text: 'Esos esqueletos traen armadura. ¡Apunta a las rodillas!' },
    { wave: 14, who: 'voz', text: 'Quien viene a buscar la Corona… solo encuentra el vacío.' },
    { wave: 17, who: 'clip', text: 'Ese caballero suena muy cansado, ¿no?' },
  ],
  c3: [
    { wave: 1, who: 'clip', text: 'No toques los cristales violetas. Te lo digo por experiencia.' },
    { wave: 3, who: 'clip', text: 'Los de la burbuja no sienten tus flechas. Tócalos y se les rompe el escudo.' },
    { wave: 8, who: 'lino', text: 'Quien sea que esté ahí adentro… aguanta un poco.' },
    { wave: 15, who: 'corona', text: '¿Te gusta la cara que le puse? La elegí pensando en ti.' },
  ],
  c4: [
    { wave: 1, who: 'pluma', text: 'Pisa donde hay pasto. Donde no hay, te hundes.' },
    { wave: 3, who: 'pluma', text: 'Las sanguijuelas muerden la barricada. Un Tintero la mantiene en pie.' },
    { wave: 7, who: 'clip', text: 'Pluma, ¿cuánto falta para la Torre?' },
    { wave: 8, who: 'pluma', text: 'Medio día. Si seguimos vivos.' },
    { wave: 15, who: 'corona', text: 'Yo lo mandé esa noche. Y tu hermano vino a mí llorando.' },
  ],
  c5: [
    { wave: 1, who: 'pluma', text: 'Cuidado con los libros que se mueven. No son libros.' },
    { wave: 3, who: 'pluma', text: 'Las Bombitas vuelan la barricada. Tócalas antes y que revienten entre ellas.' },
    { wave: 8, who: 'clip', text: '¿Soy yo, o alguien nos está leyendo?' },
    { wave: 15, who: 'corona', text: 'Todo lo que rompas aquí, lo vuelvo a escribir.' },
  ],
  c6: [
    { wave: 1, who: 'pluma', text: 'Es la última escalera. De aquí no se baja.' },
    { wave: 3, who: 'pluma', text: 'Aquí viene de todo. Reparte la Tinta entre los tres puestos y súbelos al máximo.' },
    { wave: 7, who: 'clip', text: 'Si salimos de esta, te hago precio en todo. Una semana.' },
    { wave: 14, who: 'corona', text: 'Cinco años me costó. No te lo voy a devolver.' },
    { wave: 19, who: 'lino', text: 'Aguanta, Dante. Ya casi llego.' },
  ],
  abismo: [
    { wave: 3, who: 'clip', text: 'Dicen que este pozo no tiene fondo. Yo no pienso averiguarlo.' },
    { wave: 15, who: 'pluma', text: 'Aquí ya no tengo mapas. Vamos a ciegas.' },
    { wave: 25, who: 'corona', text: 'Todo lo que cae aquí termina siendo mío.' },
  ],
};

export const STORY_ORDER = ['prologo1', 'prologo2', 'c1_intro', 'c1_outro', 'c2_intro', 'c2_outro', 'c3_intro', 'c3_outro', 'c4_intro', 'c4_outro', 'c5_intro', 'c5_outro', 'c6_intro', 'c6_outro', 'final_venganza', 'final_liberacion'];

/** Tío Clip after a run (Results screen). */
export const DEFEAT_QUIPS = [
  'La barricada era de madera barata.\nLa vendí yo, así que mejor no digo nada.',
  'Levántate, chico. Las arañas no esperan.',
  'Con un par de mejoras esto sale.\nY qué casualidad: yo vendo mejoras.',
  'Si te consuela, yo hubiera corrido mucho antes.',
  'Dante debe estar riéndose en algún lado.\nNo le des el gusto.',
  'Hasta tu hermano perdía al principio. Creo.',
];

export const VICTORY_QUIPS = [
  '¡Eso! Y ahora, ¿qué me vas a comprar?',
  'Bien hecho. Hasta yo me asusté un poco.',
  'Cada día peleas menos como un niño.\nUn poquito menos.',
];
