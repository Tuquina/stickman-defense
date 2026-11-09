/**
 * Procedural audio: every sound effect and music track is synthesized with WebAudio,
 * so the game ships with zero audio files and no licensing concerns.
 */
import { Save } from './save';

export type SfxName =
  | 'click' | 'arrow' | 'bullet' | 'orb' | 'pellet' | 'star' | 'hit' | 'crit' | 'death'
  | 'coin' | 'xp' | 'levelup' | 'legend' | 'skill' | 'boom' | 'zap' | 'freeze' | 'heal'
  | 'barricade' | 'heart' | 'roar' | 'fury' | 'victory' | 'defeat' | 'wave' | 'buy' | 'error' | 'whoosh' | 'thud' | 'type';

export type TrackId = 'menu' | 'story' | 'sad' | 'c1' | 'c2' | 'c3' | 'boss' | 'abismo';

interface Track {
  bpm: number;
  chords: [number, 'M' | 'm'][]; // root midi, quality — one per bar
  bass: string; // 16 chars: x = root, o = octave up, - = rest
  arp: string; // 16 chars: digit = chord tone index, - = rest
  kick: string;
  snare: string;
  hat: string;
  lead: boolean;
  wave: OscillatorType;
  pad: number;
}

const TRACKS: Record<TrackId, Track> = {
  menu: { bpm: 84, chords: [[57, 'm'], [53, 'M'], [48, 'M'], [55, 'M']], bass: 'x-------x-------', arp: '0-1-2-1-0-1-2-3-', kick: 'x---------------', snare: '----------------', hat: '----x-------x---', lead: false, wave: 'triangle', pad: 0.035 },
  story: { bpm: 70, chords: [[57, 'm'], [53, 'M'], [48, 'M'], [52, 'M']], bass: 'x---------------', arp: '0---2---1---2---', kick: '----------------', snare: '----------------', hat: '----------------', lead: true, wave: 'sine', pad: 0.04 },
  sad: { bpm: 62, chords: [[57, 'm'], [52, 'm'], [53, 'M'], [55, 'M']], bass: 'x-------x-------', arp: '0-------2-------', kick: '----------------', snare: '----------------', hat: '----------------', lead: true, wave: 'sine', pad: 0.045 },
  c1: { bpm: 122, chords: [[50, 'm'], [46, 'M'], [53, 'M'], [48, 'M']], bass: 'x-x-o-x-x-x-o-x-', arp: '0120120120120120', kick: 'x---x---x---x---', snare: '----x-------x---', hat: '--x---x---x---x-', lead: true, wave: 'square', pad: 0.02 },
  c2: { bpm: 128, chords: [[52, 'm'], [48, 'M'], [55, 'M'], [50, 'M']], bass: 'x-xo-xx-x-xo-xx-', arp: '0-2-1-2-0-2-1-3-', kick: 'x-----x-x-------', snare: '----x-------x---', hat: 'x-x-x-x-x-x-x-x-', lead: true, wave: 'square', pad: 0.02 },
  c3: { bpm: 134, chords: [[52, 'm'], [53, 'M'], [52, 'm'], [50, 'M']], bass: 'xx-xx-x-xx-xx-o-', arp: '0-1-2-1-0-1-2-1-', kick: 'x--x--x-x--x--x-', snare: '----x-------x---', hat: '-x-x-x-x-x-x-x-x', lead: true, wave: 'sawtooth', pad: 0.02 },
  boss: { bpm: 150, chords: [[48, 'm'], [44, 'M'], [46, 'M'], [43, 'M']], bass: 'xoxoxoxoxoxoxoxo', arp: '0120312001203120', kick: 'x-x-x-x-x-x-x-x-', snare: '----x-------x---', hat: 'xxxxxxxxxxxxxxxx', lead: true, wave: 'sawtooth', pad: 0.02 },
  abismo: { bpm: 140, chords: [[46, 'm'], [42, 'M'], [49, 'M'], [44, 'M']], bass: 'x-xox-xox-xox-xo', arp: '0-1-2-3-2-1-0-1-', kick: 'x---x---x---x-x-', snare: '----x-------x---', hat: '-xx--xx--xx--xx-', lead: true, wave: 'sawtooth', pad: 0.025 },
};

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private noiseBuf!: AudioBuffer;
  private last: Record<string, number> = {};
  private track: TrackId | null = null;
  private wanted: TrackId | null = null;
  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private melody: number[] = [];
  private suspendedByHide = false;

  /** Must be called from a user gesture. Safe to call repeatedly. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.master.connect(comp).connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.musicBus = this.ctx.createGain();
      this.sfxBus.connect(this.master);
      this.musicBus.connect(this.master);
      this.applySettings();
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const ch = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) {
          this.suspendedByHide = true;
          void this.ctx.suspend();
        } else if (this.suspendedByHide) {
          this.suspendedByHide = false;
          void this.ctx.resume();
        }
      });
    }
    if (this.ctx.state === 'suspended' && !document.hidden) void this.ctx.resume();
    if (this.wanted && this.track !== this.wanted) this.startTrack(this.wanted);
  }

  applySettings(): void {
    if (!this.ctx) return;
    const s = Save.d.settings;
    this.sfxBus.gain.value = s.sfx ? 0.9 : 0;
    this.musicBus.gain.value = s.music ? 0.55 : 0;
  }

  vibrate(ms: number | number[]): void {
    if (Save.d.settings.vibrate && 'vibrate' in navigator) {
      try { navigator.vibrate(ms); } catch { /* ignore */ }
    }
  }

  // ---------------------------------------------------------------- primitives
  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0, bus?: AudioNode, attack = 0.005): void {
    const c = this.ctx!;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus ?? this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol: number, type: BiquadFilterType, f0: number, f1 = f0, delay = 0, bus?: AudioNode): void {
    const c = this.ctx!;
    const t = c.currentTime + delay;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(bus ?? this.sfxBus);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }

  // ---------------------------------------------------------------- sfx
  play(name: SfxName, throttleMs = 45): void {
    const c = this.ctx;
    if (!c || c.state !== 'running' || !Save.d.settings.sfx) return;
    const now = performance.now();
    if (now - (this.last[name] ?? 0) < throttleMs) return;
    this.last[name] = now;
    const r = 1 + (Math.random() - 0.5) * 0.12;
    switch (name) {
      case 'click': this.tone('square', 660, 880, 0.06, 0.08); break;
      case 'type': this.tone('square', 900 * r, 900 * r, 0.025, 0.025); break;
      case 'arrow': this.noise(0.09, 0.12, 'bandpass', 3000 * r, 900); this.tone('triangle', 500 * r, 260, 0.08, 0.05); break;
      case 'bullet': this.noise(0.05, 0.16, 'highpass', 2200); this.tone('square', 240 * r, 90, 0.06, 0.07); break;
      case 'orb': this.tone('sine', 700 * r, 1300, 0.14, 0.08); this.tone('triangle', 350 * r, 650, 0.14, 0.04); break;
      case 'pellet': this.noise(0.12, 0.25, 'lowpass', 2400, 400); this.tone('square', 140, 50, 0.1, 0.1); break;
      case 'star': this.noise(0.08, 0.1, 'bandpass', 5000 * r, 2000); break;
      case 'hit': this.tone('square', 220 * r, 110, 0.05, 0.05); break;
      case 'crit': this.tone('square', 520 * r, 260, 0.08, 0.07); this.noise(0.05, 0.08, 'highpass', 4000); break;
      case 'death': this.noise(0.12, 0.12, 'lowpass', 1500 * r, 200); this.tone('sine', 300 * r, 80, 0.12, 0.06); break;
      case 'coin': this.tone('square', 988, 988, 0.06, 0.06); this.tone('square', 1319, 1319, 0.12, 0.06, 0.06); break;
      case 'xp': this.tone('sine', 1200 * r, 1600, 0.05, 0.03); break;
      case 'levelup': [523, 659, 784, 1047].forEach((f, i) => this.tone('square', f, f, 0.14, 0.07, i * 0.07)); break;
      case 'legend': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.tone('triangle', f, f, 0.3, 0.09, i * 0.08)); this.noise(0.6, 0.05, 'highpass', 6000, 9000, 0.3); break;
      case 'skill': this.tone('sawtooth', 300, 900, 0.18, 0.06); this.noise(0.18, 0.06, 'bandpass', 1500, 5000); break;
      case 'boom': this.noise(0.5, 0.45, 'lowpass', 1800, 60); this.tone('sine', 120, 35, 0.45, 0.35); break;
      case 'zap': this.tone('sawtooth', 1800 * r, 300, 0.12, 0.06); this.noise(0.1, 0.08, 'highpass', 5000); break;
      case 'freeze': this.tone('sine', 2000, 3000, 0.4, 0.05); this.noise(0.5, 0.08, 'highpass', 6000, 9000); break;
      case 'heal': [392, 523, 659].forEach((f, i) => this.tone('sine', f, f * 1.01, 0.3, 0.07, i * 0.06)); break;
      case 'barricade': this.noise(0.1, 0.18, 'lowpass', 700 * r, 200); this.tone('square', 90, 60, 0.08, 0.06); break;
      case 'heart': this.tone('sine', 70, 50, 0.12, 0.3); this.tone('sine', 70, 50, 0.12, 0.22, 0.16); break;
      case 'thud': this.tone('sine', 90, 40, 0.25, 0.3); this.noise(0.15, 0.15, 'lowpass', 500, 100); break;
      case 'roar': this.tone('sawtooth', 110, 55, 0.9, 0.18); this.tone('sawtooth', 116, 50, 0.9, 0.14); this.noise(0.9, 0.12, 'lowpass', 900, 200); break;
      case 'fury': this.tone('sawtooth', 200, 1200, 0.5, 0.1); [523, 784, 1047].forEach((f, i) => this.tone('square', f, f, 0.2, 0.06, 0.1 + i * 0.07)); break;
      case 'victory': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone('square', f, f, i === 5 ? 0.6 : 0.16, 0.08, i * 0.12)); break;
      case 'defeat': [392, 370, 349, 262].forEach((f, i) => this.tone('triangle', f, f * 0.98, i === 3 ? 0.8 : 0.25, 0.1, i * 0.25)); break;
      case 'wave': this.tone('triangle', 440, 440, 0.12, 0.06); this.tone('triangle', 660, 660, 0.2, 0.06, 0.1); break;
      case 'buy': this.tone('square', 784, 784, 0.07, 0.07); this.tone('square', 1175, 1175, 0.14, 0.07, 0.07); break;
      case 'error': this.tone('square', 180, 140, 0.15, 0.07); break;
      case 'whoosh': this.noise(0.3, 0.12, 'bandpass', 600, 3000); break;
    }
  }

  // ---------------------------------------------------------------- music
  music(id: TrackId | null): void {
    this.wanted = id;
    if (!this.ctx) return; // will start on unlock
    if (this.track === id) return;
    this.startTrack(id);
  }

  private startTrack(id: TrackId | null): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.track = id;
    if (!id || !this.ctx) return;
    const tr = TRACKS[id];
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.melody = makeMelody(tr, id);
    this.timer = window.setInterval(() => this.schedule(tr), 25);
  }

  private schedule(tr: Track): void {
    const c = this.ctx!;
    if (c.state !== 'running') {
      this.nextTime = c.currentTime + 0.05;
      return;
    }
    const stepDur = 60 / tr.bpm / 4;
    while (this.nextTime < c.currentTime + 0.15) {
      this.playStep(tr, this.step, this.nextTime - c.currentTime, stepDur);
      this.nextTime += stepDur;
      this.step = (this.step + 1) % (16 * tr.chords.length);
    }
  }

  private playStep(tr: Track, step: number, delay: number, sd: number): void {
    const s = step % 16;
    const bar = Math.floor(step / 16);
    const [root, q] = tr.chords[bar];
    const tones = [0, q === 'm' ? 3 : 4, 7, 12];
    const bus = this.musicBus;
    if (s === 0 && tr.pad > 0) {
      for (const t of tones.slice(0, 3)) {
        this.tone('triangle', mtof(root + t + 12), mtof(root + t + 12), sd * 16, tr.pad, delay, bus, 0.25);
      }
    }
    const b = tr.bass[s];
    if (b === 'x' || b === 'o') {
      const f = mtof(root - 12 + (b === 'o' ? 12 : 0));
      this.tone(tr.wave === 'sine' ? 'sine' : 'triangle', f, f, sd * 1.8, 0.16, delay, bus);
    }
    const a = tr.arp[s];
    if (a !== '-') {
      const f = mtof(root + 12 + tones[Number(a)]);
      this.tone(tr.wave, f, f, sd * 0.9, tr.wave === 'sine' ? 0.05 : 0.025, delay, bus);
    }
    if (tr.lead && s % 2 === 0) {
      const n = this.melody[(step / 2) | 0];
      if (n > 0) this.tone(tr.wave === 'sine' ? 'sine' : 'triangle', mtof(n), mtof(n), sd * 2.6, 0.045, delay, bus, 0.01);
    }
    if (tr.kick[s] === 'x') this.tone('sine', 150, 42, 0.16, 0.42, delay, bus);
    if (tr.snare[s] === 'x') this.noise(0.13, 0.16, 'highpass', 1400, 1400, delay, bus);
    if (tr.hat[s] === 'x') this.noise(0.035, 0.05, 'highpass', 7500, 7500, delay, bus);
  }
}

/** Deterministic melody per track: chord tones on strong beats, scale walk between. */
function makeMelody(tr: Track, seedStr: string): number[] {
  let seed = 0;
  for (const ch of seedStr) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const out: number[] = [];
  const slots = 8 * tr.chords.length; // 8 eighth notes per bar
  let prev = 0;
  for (let i = 0; i < slots; i++) {
    const [root, q] = tr.chords[Math.floor(i / 8)];
    const chord = [0, q === 'm' ? 3 : 4, 7, 12];
    const scale = q === 'm' ? [0, 2, 3, 5, 7, 8, 10, 12] : [0, 2, 4, 5, 7, 9, 11, 12];
    if (rnd() < (tr.bpm < 90 ? 0.55 : 0.3)) {
      out.push(0);
      continue;
    }
    const strong = i % 4 === 0;
    let iv = strong ? chord[Math.floor(rnd() * chord.length)] : scale[Math.floor(rnd() * scale.length)];
    if (prev && Math.abs(root + 24 + iv - prev) > 7) iv = chord[Math.floor(rnd() * 3)];
    prev = root + 24 + iv;
    out.push(prev);
  }
  return out;
}

export const Sound = new AudioEngine();
