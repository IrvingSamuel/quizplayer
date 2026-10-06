/**
 * Sound effects. By default sounds are synthesized with the Web Audio API, so
 * the library ships no audio files and makes no network requests. Each sound
 * can be replaced by a URL or disabled.
 */
export type SoundName = 'cue' | 'correct' | 'wrong';
export type SoundSetting = string | boolean | undefined;
export interface SoundOptions {
  cue?: SoundSetting;
  correct?: SoundSetting;
  wrong?: SoundSetting;
  /** 0..1, default 0.5 */
  volume?: number;
}

type Note = [freq: number, start: number, duration: number, type?: OscillatorType];

const SYNTH: Record<SoundName, Note[]> = {
  // Two-tone "attention" beep.
  cue: [
    [880, 0, 0.14, 'sine'],
    [1320, 0.16, 0.22, 'sine'],
  ],
  // Rising arpeggio.
  correct: [
    [523.25, 0, 0.12, 'triangle'],
    [659.25, 0.1, 0.12, 'triangle'],
    [783.99, 0.2, 0.25, 'triangle'],
  ],
  // Low descending buzz.
  wrong: [
    [220, 0, 0.18, 'sawtooth'],
    [164.81, 0.18, 0.3, 'sawtooth'],
  ],
};

export class SoundPlayer {
  private ctx: AudioContext | null = null;
  private elements = new Map<string, HTMLAudioElement>();
  private settings: SoundOptions | false;

  constructor(settings: SoundOptions | boolean | undefined) {
    this.settings = settings === false ? false : settings === true || settings === undefined ? {} : settings;
  }

  get volume(): number {
    return this.settings === false ? 0 : Math.min(1, Math.max(0, this.settings.volume ?? 0.5));
  }

  /** Should be called from a user gesture (e.g. first play) so browsers allow audio. */
  unlock(): void {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => undefined);
  }

  play(name: SoundName): void {
    if (this.settings === false) return;
    const setting = this.settings[name];
    if (setting === false) return;
    try {
      if (typeof setting === 'string' && setting) {
        this.playUrl(setting);
      } else {
        this.synth(SYNTH[name]);
      }
    } catch {
      /* audio is best effort */
    }
  }

  destroy(): void {
    this.elements.forEach((a) => a.pause());
    this.elements.clear();
    if (this.ctx) this.ctx.close().catch(() => undefined);
    this.ctx = null;
  }

  private getContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor: typeof AudioContext | undefined =
      typeof window !== 'undefined'
        ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        : undefined;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    return this.ctx;
  }

  private playUrl(url: string): void {
    let audio = this.elements.get(url);
    if (!audio) {
      audio = new Audio(url);
      audio.preload = 'auto';
      this.elements.set(url, audio);
    }
    audio.volume = this.volume;
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => undefined);
  }

  private synth(notes: Note[]): void {
    const ctx = this.getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
    const now = ctx.currentTime;
    const peak = this.volume * 0.4;
    for (const [freq, start, duration, type = 'sine'] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(peak, now + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    }
  }
}

/** Plays a narration track and fades it out smoothly when stopped. */
export class NarrationPlayer {
  private audio: HTMLAudioElement | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;

  play(url: string, volume = 0.7): void {
    this.stop(0);
    const audio = new Audio(url);
    audio.volume = volume;
    this.audio = audio;
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => undefined);
  }

  stop(fadeMs = 1500): void {
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    this.fadeTimer = null;
    const audio = this.audio;
    this.audio = null;
    if (!audio) return;
    if (fadeMs <= 0) {
      audio.pause();
      return;
    }
    const steps = 30;
    const dec = audio.volume / steps;
    this.fadeTimer = setInterval(() => {
      if (audio.volume > dec) {
        audio.volume = Math.max(0, audio.volume - dec);
      } else {
        audio.volume = 0;
        audio.pause();
        if (this.fadeTimer) clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, fadeMs / steps);
  }
}
