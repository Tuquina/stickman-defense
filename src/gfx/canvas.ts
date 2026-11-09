/**
 * Canvas-2D helpers used to bake higher quality art once (gradients, glows, outlines)
 * into regular textures. Nothing here runs per frame, so it costs no gameplay performance.
 */

export type Ctx = CanvasRenderingContext2D;

export function canvasTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: Ctx, w: number, h: number) => void): void {
  if (scene.textures.exists(key)) return;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx, w, h);
  scene.textures.addCanvas(key, c);
}

/** Seeded pseudo-random so baked art is identical on every device. */
export function rng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function vgrad(ctx: Ctx, x: number, y: number, w: number, h: number, stops: [number, string][]): void {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

export function glow(ctx: Ctx, x: number, y: number, r: number, color: string, alpha = 1): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** Subtle film grain so flat colour areas read as painted instead of digital. */
export function grain(ctx: Ctx, w: number, h: number, amount: number, seed: number): void {
  const r = rng(seed);
  ctx.save();
  for (let i = 0; i < amount; i++) {
    ctx.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(r() * w, r() * h, 2, 2);
  }
  ctx.restore();
}

export function blob(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Gives a baked sprite the "sticker" finish used across the game: a dark outline,
 * a soft top highlight and a bottom shade. Replaces the texture in place, growing it
 * by `pad` pixels per side.
 */
export function stickerize(scene: Phaser.Scene, key: string, opts: { pad?: number; outline?: string; shade?: boolean } = {}): void {
  if (!scene.textures.exists(key)) return;
  const tex = scene.textures.get(key);
  const src = tex.getSourceImage() as HTMLCanvasElement | HTMLImageElement;
  const pad = opts.pad ?? 3;
  const w = src.width + pad * 2;
  const h = src.height + pad * 2;

  // silhouette of the original
  const sil = document.createElement('canvas');
  sil.width = src.width;
  sil.height = src.height;
  const sctx = sil.getContext('2d')!;
  sctx.drawImage(src, 0, 0);
  sctx.globalCompositeOperation = 'source-in';
  sctx.fillStyle = opts.outline ?? '#0b0b0e';
  sctx.fillRect(0, 0, sil.width, sil.height);

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d')!;
  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    ctx.drawImage(sil, pad + Math.cos(a) * pad, pad + Math.sin(a) * pad);
  }
  ctx.drawImage(src, pad, pad);

  if (opts.shade !== false) {
    // light from above-left, shade at the bottom: gives volume to flat shapes
    const art = document.createElement('canvas');
    art.width = w;
    art.height = h;
    const actx = art.getContext('2d')!;
    actx.drawImage(src, pad, pad);
    actx.globalCompositeOperation = 'source-atop';
    const g = actx.createLinearGradient(0, pad, 0, h - pad);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.35, 'rgba(255,255,255,0)');
    g.addColorStop(0.7, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.28)');
    actx.fillStyle = g;
    actx.fillRect(0, 0, w, h);
    ctx.drawImage(art, 0, 0);
  }

  scene.textures.remove(key);
  scene.textures.addCanvas(key, out);
}
