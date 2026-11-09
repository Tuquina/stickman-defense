/**
 * Loads the game fonts with the FontFace API and waits for them for real.
 * (Relying on the CSS @font-face + document.fonts.load() can resolve before the stylesheet
 * is applied on mobile, which made iOS start the game with a wide system font.)
 */
import lilita from '@fontsource/lilita-one/files/lilita-one-latin-400-normal.woff2?url';
import lilitaExt from '@fontsource/lilita-one/files/lilita-one-latin-ext-400-normal.woff2?url';
import lucky from '@fontsource/luckiest-guy/files/luckiest-guy-latin-400-normal.woff2?url';

export async function loadFonts(timeoutMs = 8000): Promise<boolean> {
  if (typeof FontFace === 'undefined') return false;
  const faces = [
    new FontFace('Lilita One', `url(${lilita}) format('woff2')`),
    new FontFace('Lilita One', `url(${lilitaExt}) format('woff2')`, { unicodeRange: 'U+0100-024F, U+1E00-1EFF, U+20A0-20CF, U+2C60-2C7F' }),
    new FontFace('Luckiest Guy', `url(${lucky}) format('woff2')`),
  ];
  const load = Promise.all(faces.map(async (f) => {
    const loaded = await f.load();
    document.fonts.add(loaded);
  })).then(() => true);
  const timeout = new Promise<boolean>((r) => setTimeout(() => r(false), timeoutMs));
  try {
    return await Promise.race([load, timeout]);
  } catch {
    return false;
  }
}
