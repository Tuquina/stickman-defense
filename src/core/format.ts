/** Formats numbers the Spanish way: 100000 -> "100.000", big numbers abbreviated. */
export function fmt(n: number): string {
  n = Math.floor(n);
  if (n >= 10_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`;
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Short format for damage numbers. */
export function fmtShort(n: number): string {
  n = Math.round(n);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace('.', ',')}K`;
  return n.toString();
}

export function pct(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits).replace('.', ',')}%`;
}

export function clamp(v: number, a: number, b: number): number {
  return v < a ? a : v > b ? b : v;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
