import { normalizeQuizzes, validateAnswer, summarize } from './data';
import type { AnswerPayload, AnswerRecord, Quiz, QuizInput, Results, ValidationResult } from './types';
import { format, resolveMessages, type Messages } from './i18n';
import { NarrationPlayer, SoundPlayer, type SoundOptions } from './sounds';
import { injectStyles } from './styles';

export type VideoSource = string | Array<{ src: string; type?: string }>;

export interface QuizPlayerOptions {
  /** Video URL (or list of `<source>` entries). Omit when wrapping an existing `<video>`. */
  src?: VideoSource;
  poster?: string;
  /** Quizzes in canonical or legacy shape (array or JSON string). */
  quizzes?: Array<Quiz | QuizInput> | string;
  /** Identifier of this video, sent to your backend with every answer. */
  videoId?: string;
  /** UI language: en, pt-BR, es, fr, de, zh-CN, ja. Defaults to `<html lang>` or "en". */
  locale?: string;
  /** Override any UI text. */
  messages?: Partial<Messages>;
  /** `false` disables every sound. URLs replace the synthesized defaults. */
  sounds?: SoundOptions | boolean;
  /** Prevents seeking past the first unanswered quiz. Default `false`. */
  preventSkip?: boolean;
  /** Milliseconds before the video resumes automatically after answering. `0` disables. Default `3000`. */
  autoContinueMs?: number;
  /** Shows quizzes again when the viewer rewinds before them. Default `false`. */
  replayOnRewind?: boolean;
  /** Countdown (seconds) of the "already answered — answer again?" prompt. Default `5`. */
  askAgainSeconds?: number;
  /** Answers saved in a previous session. */
  previousAnswers?: Array<Partial<AnswerRecord> & Record<string, unknown>>;
  /**
   * Base URL of a backend that implements the QuizPlayer protocol
   * (`POST {endpoint}/answer`, `GET {endpoint}/answers`).
   * When set, the server validates answers and stores results.
   */
  endpoint?: string;
  /** Extra request headers (auth tokens, etc.). */
  headers?: Record<string, string> | (() => Record<string, string>);
  /** `fetch` credentials mode. Default `"same-origin"`. */
  credentials?: RequestCredentials;
  /** Name of a `<meta>` tag holding a CSRF token sent as `X-CSRF-TOKEN`. Default `"csrf-token"` (Laravel). */
  csrfMeta?: string | false;
  /** Custom validation (e.g. GraphQL, Firebase…). Takes precedence over `endpoint`. */
  validateAnswer?: (payload: AnswerPayload, quiz: Quiz) => Promise<ValidationResult> | ValidationResult;
  /** Custom loader for previous answers. Takes precedence over `endpoint`. */
  loadAnswers?: () => Promise<Array<Partial<AnswerRecord>>>;
  autoplay?: boolean;
  muted?: boolean;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  /** Fill the parent height instead of keeping a 16:9 ratio. */
  fill?: boolean;
  /** Inject the default stylesheet. Default `true`. */
  injectStyles?: boolean;
  /** Show quiz markers on the progress bar. Default `true`. */
  markers?: boolean;

  onReady?: (player: QuizPlayer) => void;
  onQuizShow?: (detail: QuizShowDetail) => void;
  onAnswer?: (detail: AnswerDetail) => void;
  onContinue?: (detail: { quiz: Quiz }) => void;
  onComplete?: (results: Results) => void;
  onSeekBlocked?: (detail: SeekBlockedDetail) => void;
  onError?: (detail: { error: unknown }) => void;
}

export interface QuizShowDetail {
  quiz: Quiz;
  index: number;
}
export interface AnswerDetail {
  quiz: Quiz;
  record: AnswerRecord;
  result: ValidationResult;
}
export interface SeekBlockedDetail {
  requested: number;
  allowed: number;
  quiz: Quiz;
}

export interface QuizPlayerEventMap {
  ready: { player: QuizPlayer };
  quizshow: QuizShowDetail;
  answer: AnswerDetail;
  continue: { quiz: Quiz };
  complete: Results;
  seekblocked: SeekBlockedDetail;
  error: { error: unknown };
}

const ICONS = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3.5L12 5v14l-4.5-4H4z"/><path d="M15 8.5a4.5 4.5 0 0 1 0 7M17.5 5.5a8.5 8.5 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  muted: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3.5L12 5v14l-4.5-4H4z"/><path d="M15.5 9.5l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  shrink: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

type CallbackName = 'onReady' | 'onQuizShow' | 'onAnswer' | 'onContinue' | 'onComplete' | 'onSeekBlocked' | 'onError';

const instances = new WeakMap<Element, QuizPlayer>();
let uid = 0;

function fmtTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return (h ? `${h}:` : '') + `${mm}:${String(s).padStart(2, '0')}`;
}

function normalizeRecord(raw: Partial<AnswerRecord> & Record<string, unknown>): AnswerRecord | null {
  const quizId = raw.quizId ?? raw.quiz_id;
  const optionId = raw.optionId ?? raw.option_id;
  if (quizId === undefined || optionId === undefined) return null;
  const c = raw.correct ?? raw.is_correct;
  return {
    quizId: String(quizId),
    optionId: String(optionId),
    correct: c === null || c === undefined ? null : Boolean(c),
    videoTime: Number(raw.videoTime ?? raw.video_time ?? 0),
    answeredAt: String(raw.answeredAt ?? raw.answered_at ?? new Date().toISOString()),
  };
}

export class QuizPlayer extends EventTarget {
  /** Creates a player inside `target` (element or CSS selector). A `<video>` target is wrapped in place. */
  static create(target: string | Element, options: QuizPlayerOptions = {}): QuizPlayer {
    return new QuizPlayer(target, options);
  }

  /** Returns the player attached to an element, if any. */
  static get(el: Element): QuizPlayer | undefined {
    return instances.get(el);
  }

  /**
   * Creates players for every `[data-quizplayer]` element. Ideal for server-rendered
   * pages (Blade, Twig, Go templates, Rails, Django…). See README for attributes.
   */
  static autoInit(root: ParentNode = document): QuizPlayer[] {
    const out: QuizPlayer[] = [];
    root.querySelectorAll<HTMLElement>('[data-quizplayer]').forEach((el) => {
      if (instances.has(el)) return;
      out.push(new QuizPlayer(el, optionsFromDataset(el)));
    });
    return out;
  }

  readonly el: HTMLElement;
  readonly video: HTMLVideoElement;
  readonly options: QuizPlayerOptions;
  readonly messages: Messages;

  private quizzes: Quiz[] = [];
  private shown = new Set<string>();
  private answers = new Map<string, AnswerRecord>();
  private current: Quiz | null = null;
  private toastQuiz: Quiz | null = null;
  private selected: string | null = null;
  private locked = false;
  private lastTime = 0;
  private completed = false;
  private host: Element;
  private wrappedVideo: { parent: Node; next: Node | null } | null = null;
  private abort = new AbortController();
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private raf = 0;
  private sounds: SoundPlayer;
  private narration = new NarrationPlayer();
  private ui!: {
    bigPlay: HTMLButtonElement;
    controls: HTMLElement;
    progress: HTMLElement;
    played: HTMLElement;
    buffered: HTMLElement;
    limit: HTMLElement;
    markers: HTMLElement;
    play: HTMLButtonElement;
    mute: HTMLButtonElement;
    volume: HTMLInputElement;
    time: HTMLElement;
    count: HTMLElement;
    fs: HTMLButtonElement;
    overlay: HTMLElement;
    card: HTMLElement;
    kicker: HTMLElement;
    question: HTMLElement;
    optionsList: HTMLElement;
    feedback: HTMLElement;
    submit: HTMLButtonElement;
    sub: HTMLElement;
    toast: HTMLElement;
    toastTitle: HTMLElement;
    toastText: HTMLElement;
    toastTimer: HTMLElement;
    yes: HTMLButtonElement;
    no: HTMLButtonElement;
    notice: HTMLElement;
    live: HTMLElement;
  };

  constructor(target: string | Element, options: QuizPlayerOptions = {}) {
    super();
    const host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) throw new Error(`QuizPlayer: target "${String(target)}" not found`);
    this.host = host;
    this.options = options;
    const docLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
    this.messages = resolveMessages(options.locale || docLang || 'en', options.messages);
    this.sounds = new SoundPlayer(options.sounds);
    if (options.injectStyles !== false) injectStyles();

    this.el = document.createElement('div');
    this.el.className = 'qp-root qp-paused' + (options.fill ? ' qp-fill' : '');
    this.el.tabIndex = -1;
    this.el.setAttribute('data-qp-id', String(++uid));

    if (host instanceof HTMLVideoElement) {
      this.video = host;
      this.wrappedVideo = { parent: host.parentNode as Node, next: host.nextSibling };
      host.parentNode?.insertBefore(this.el, host);
      this.el.appendChild(host);
    } else {
      this.video = document.createElement('video');
      host.appendChild(this.el);
      this.el.appendChild(this.video);
    }
    instances.set(host, this);
    instances.set(this.el, this);

    this.setupVideo();
    this.buildUi();
    this.bindEvents();
    this.setQuizzes(options.quizzes ?? []);
    this.restoreAnswers().finally(() => {
      this.emit('ready', { player: this });
      this.call('onReady', this);
    });
  }

  // ---------------------------------------------------------------- public API

  play(): Promise<void> {
    this.sounds.unlock();
    const p = this.video.play();
    return p && typeof p.then === 'function' ? p.catch(() => undefined) : Promise.resolve();
  }

  pause(): void {
    this.video.pause();
  }

  /** Seeks to `time` seconds (respecting `preventSkip`). Returns the time actually applied. */
  seek(time: number): number {
    const duration = Number.isFinite(this.video.duration) ? this.video.duration : Infinity;
    let t = Math.max(0, Math.min(time, duration));
    if (this.options.preventSkip) {
      const pending = this.firstPending();
      if (pending && t > pending.time) {
        this.emit('seekblocked', { requested: t, allowed: pending.time, quiz: pending });
        this.call('onSeekBlocked', { requested: t, allowed: pending.time, quiz: pending });
        this.notice(this.messages.seekBlocked);
        t = pending.time;
      }
    }
    if (this.options.replayOnRewind && t < this.video.currentTime) {
      this.quizzes.forEach((q) => {
        if (q.time >= t) this.shown.delete(q.id);
      });
    }
    this.lastTime = t;
    this.video.currentTime = t;
    this.renderProgress();
    return t;
  }

  getQuizzes(): Quiz[] {
    return this.quizzes.map((q) => ({ ...q, options: q.options.map((o) => ({ ...o })) }));
  }

  /** Replaces the quizzes (accepts the same formats as the `quizzes` option). */
  setQuizzes(input: Array<Quiz | QuizInput> | string): void {
    this.quizzes = normalizeQuizzes(input);
    const ids = new Set(this.quizzes.map((q) => q.id));
    this.shown.forEach((id) => {
      if (!ids.has(id)) this.shown.delete(id);
    });
    this.renderMarkers();
    this.renderCount();
  }

  getAnswers(): AnswerRecord[] {
    return Array.from(this.answers.values());
  }

  getResults(): Results {
    return summarize(this.quizzes, this.getAnswers());
  }

  /** Clears answers and shows every quiz again. */
  reset(): void {
    this.answers.clear();
    this.shown.clear();
    this.completed = false;
    this.renderMarkers();
    this.renderCount();
  }

  /** Opens a quiz immediately (pauses the video). */
  showQuiz(id: string): void {
    const quiz = this.quizzes.find((q) => q.id === id);
    if (quiz) this.openQuiz(quiz);
  }

  /** Typed event subscription. Returns an unsubscribe function. */
  on<K extends keyof QuizPlayerEventMap>(type: K, handler: (detail: QuizPlayerEventMap[K]) => void): () => void {
    const listener = (e: Event) => handler((e as CustomEvent<QuizPlayerEventMap[K]>).detail);
    this.addEventListener(type, listener);
    return () => this.removeEventListener(type, listener);
  }

  destroy(): void {
    this.abort.abort();
    this.clearTimers();
    if (this.raf) cancelAnimationFrame(this.raf);
    this.sounds.destroy();
    this.narration.stop(0);
    this.current = null;
    this.toastQuiz = null;
    instances.delete(this.host);
    instances.delete(this.el);
    if (this.wrappedVideo) {
      this.video.pause();
      this.wrappedVideo.parent.insertBefore(this.video, this.wrappedVideo.next);
    }
    this.el.remove();
  }

  // ---------------------------------------------------------------- setup

  private setupVideo(): void {
    const v = this.video;
    const o = this.options;
    v.classList.add('qp-video');
    v.controls = false;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.preload = v.preload || 'metadata';
    if (o.poster) v.poster = o.poster;
    if (o.crossOrigin !== undefined) v.crossOrigin = o.crossOrigin;
    if (o.muted) v.muted = true;
    if (o.autoplay) v.autoplay = true;
    if (typeof o.src === 'string') {
      v.src = o.src;
    } else if (Array.isArray(o.src)) {
      o.src.forEach((s) => {
        const source = document.createElement('source');
        source.src = s.src;
        if (s.type) source.type = s.type;
        v.appendChild(source);
      });
    }
  }

  private buildUi(): void {
    const m = this.messages;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
<button type="button" class="qp-bigplay" aria-label="${m.play}">${ICONS.play}</button>
<div class="qp-controls">
  <div class="qp-progress" role="slider" tabindex="0" aria-label="${m.progress}" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0">
    <div class="qp-buffered"></div><div class="qp-played"></div><div class="qp-limit" hidden></div><div class="qp-markers"></div>
  </div>
  <div class="qp-bar">
    <button type="button" class="qp-btn qp-play" aria-label="${m.play}">${ICONS.play}</button>
    <button type="button" class="qp-btn qp-mute" aria-label="${m.mute}">${ICONS.volume}</button>
    <input class="qp-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume">
    <span class="qp-time">0:00 / 0:00</span>
    <span class="qp-spacer"></span>
    <span class="qp-count" hidden></span>
    <button type="button" class="qp-btn qp-fs" aria-label="${m.fullscreen}">${ICONS.expand}</button>
  </div>
</div>
<div class="qp-overlay" aria-hidden="true">
  <div class="qp-card" role="dialog" aria-modal="true" tabindex="-1">
    <p class="qp-kicker"></p>
    <p class="qp-question"></p>
    <div class="qp-options" role="radiogroup"></div>
    <div class="qp-feedback" role="status" aria-live="polite"></div>
    <button type="button" class="qp-submit" disabled></button>
    <div class="qp-sub" aria-live="polite"></div>
  </div>
</div>
<div class="qp-toast" role="alertdialog" aria-hidden="true">
  <h3></h3><p></p>
  <div class="qp-toast-actions"><button type="button" class="qp-yes"></button><button type="button" class="qp-no"></button></div>
  <div class="qp-sub qp-toast-timer"></div>
</div>
<div class="qp-notice" role="status" aria-live="polite"></div>
<div class="qp-sr" aria-live="assertive"></div>`;
    while (wrap.firstChild) this.el.appendChild(wrap.firstChild);

    const $ = <T extends HTMLElement>(sel: string) => this.el.querySelector(sel) as T;
    this.ui = {
      bigPlay: $('.qp-bigplay'),
      controls: $('.qp-controls'),
      progress: $('.qp-progress'),
      played: $('.qp-played'),
      buffered: $('.qp-buffered'),
      limit: $('.qp-limit'),
      markers: $('.qp-markers'),
      play: $('.qp-play'),
      mute: $('.qp-mute'),
      volume: $('.qp-volume'),
      time: $('.qp-time'),
      count: $('.qp-count'),
      fs: $('.qp-fs'),
      overlay: $('.qp-overlay'),
      card: $('.qp-card'),
      kicker: $('.qp-kicker'),
      question: $('.qp-question'),
      optionsList: $('.qp-options'),
      feedback: $('.qp-feedback'),
      submit: $('.qp-submit'),
      sub: $('.qp-card .qp-sub'),
      toast: $('.qp-toast'),
      toastTitle: $('.qp-toast h3'),
      toastText: $('.qp-toast p'),
      toastTimer: $('.qp-toast-timer'),
      yes: $('.qp-yes'),
      no: $('.qp-no'),
      notice: $('.qp-notice'),
      live: $('.qp-sr'),
    };
    const qid = `qp-q-${this.el.getAttribute('data-qp-id')}`;
    this.ui.question.id = qid;
    this.ui.card.setAttribute('aria-labelledby', qid);
    this.ui.optionsList.setAttribute('aria-labelledby', qid);
    if (!document.fullscreenEnabled && !(this.el as unknown as { webkitRequestFullscreen?: unknown }).webkitRequestFullscreen) {
      this.ui.fs.hidden = true;
    }
  }

  private bindEvents(): void {
    const signal = this.abort.signal;
    const v = this.video;
    const on = (el: EventTarget, type: string, fn: (e: any) => void) => el.addEventListener(type, fn, { signal });

    on(v, 'timeupdate', () => this.tick());
    on(v, 'play', () => {
      this.el.classList.add('qp-started');
      this.el.classList.remove('qp-paused');
      this.updatePlayButton();
      this.loop();
    });
    on(v, 'pause', () => {
      this.el.classList.add('qp-paused');
      this.updatePlayButton();
    });
    on(v, 'ended', () => this.onEnded());
    on(v, 'loadedmetadata', () => {
      this.renderMarkers();
      this.renderProgress();
    });
    on(v, 'durationchange', () => this.renderMarkers());
    on(v, 'progress', () => this.renderBuffered());
    on(v, 'volumechange', () => this.updateVolume());
    on(v, 'seeking', () => {
      if (!this.options.preventSkip) return;
      const pending = this.firstPending();
      if (pending && v.currentTime > pending.time + 0.25) this.seek(v.currentTime);
    });
    on(v, 'click', () => this.toggle());

    on(this.ui.bigPlay, 'click', () => this.play());
    on(this.ui.play, 'click', () => this.toggle());
    on(this.ui.mute, 'click', () => {
      v.muted = !v.muted;
      if (!v.muted && v.volume === 0) v.volume = 0.5;
    });
    on(this.ui.volume, 'input', () => {
      v.volume = Number(this.ui.volume.value);
      v.muted = v.volume === 0;
    });
    on(this.ui.fs, 'click', () => this.toggleFullscreen());
    on(document, 'fullscreenchange', () => this.updateFullscreenButton());

    // Progress bar: click / drag / keyboard.
    let dragging = false;
    const seekFromPointer = (e: PointerEvent) => {
      const rect = this.ui.progress.getBoundingClientRect();
      if (!rect.width || !Number.isFinite(v.duration)) return;
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      this.seek(ratio * v.duration);
    };
    on(this.ui.progress, 'pointerdown', (e: PointerEvent) => {
      if (this.current) return;
      dragging = true;
      this.ui.progress.setPointerCapture?.(e.pointerId);
      seekFromPointer(e);
    });
    on(this.ui.progress, 'pointermove', (e: PointerEvent) => dragging && seekFromPointer(e));
    on(this.ui.progress, 'pointerup', () => (dragging = false));
    on(this.ui.progress, 'pointercancel', () => (dragging = false));
    on(this.ui.progress, 'keydown', (e: KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 5;
      if (e.key === 'ArrowRight') this.seek(v.currentTime + step);
      else if (e.key === 'ArrowLeft') this.seek(v.currentTime - step);
      else if (e.key === 'Home') this.seek(0);
      else if (e.key === 'End') this.seek(v.duration);
      else return;
      e.preventDefault();
    });

    // Global player shortcuts (only when focus is inside the player, outside the quiz).
    on(this.el, 'keydown', (e: KeyboardEvent) => {
      if (this.current || this.toastQuiz) return this.onQuizKeydown(e);
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'BUTTON' || (e.target as HTMLElement).classList.contains('qp-progress')) return;
      if (e.key === ' ' || e.key === 'k') this.toggle();
      else if (e.key === 'f') this.toggleFullscreen();
      else if (e.key === 'm') v.muted = !v.muted;
      else if (e.key === 'ArrowRight') this.seek(v.currentTime + 5);
      else if (e.key === 'ArrowLeft') this.seek(v.currentTime - 5);
      else return;
      e.preventDefault();
    });
    on(this.el, 'touchstart', () => this.el.classList.add('qp-touch'));

    // Quiz.
    on(this.ui.optionsList, 'click', (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.qp-option');
      if (btn && !btn.disabled) this.select(btn.dataset.id as string);
    });
    on(this.ui.submit, 'click', () => {
      if (this.locked && this.answers.has(this.current?.id ?? '')) this.continue();
      else this.submit();
    });
    on(this.ui.yes, 'click', () => {
      const quiz = this.toastQuiz;
      this.closeToast();
      if (quiz) this.openQuiz(quiz);
    });
    on(this.ui.no, 'click', () => {
      this.closeToast();
      this.play();
    });
  }

  // ---------------------------------------------------------------- playback

  private toggle(): void {
    if (this.current || this.toastQuiz) return;
    if (this.video.paused) this.play();
    else this.pause();
  }

  private loop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    if (this.raf) cancelAnimationFrame(this.raf);
    const step = () => {
      this.raf = 0;
      if (this.video.paused || this.abort.signal.aborted) return;
      this.tick();
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  /** Checks cue points. Called on `timeupdate` and every animation frame while playing. */
  private tick(): void {
    const t = this.video.currentTime;
    const prev = this.lastTime;
    const delta = t - prev;
    this.lastTime = t;
    this.renderProgress();
    if (this.current || this.toastQuiz) return;
    const quiz = this.quizzes.find(
      (q) => !this.shown.has(q.id) && ((t >= q.time && t < q.time + 1) || (prev < q.time && q.time <= t && delta < 2)),
    );
    if (quiz) this.trigger(quiz);
  }

  private trigger(quiz: Quiz): void {
    this.shown.add(quiz.id);
    if (this.answers.has(quiz.id)) this.openToast(quiz);
    else this.openQuiz(quiz);
  }

  private onEnded(): void {
    this.updatePlayButton();
    if (this.completed) return;
    this.completed = true;
    const results = this.getResults();
    this.emit('complete', results);
    this.call('onComplete', results);
  }

  private firstPending(): Quiz | undefined {
    return this.quizzes.find((q) => !this.answers.has(q.id));
  }

  // ---------------------------------------------------------------- quiz flow

  private openQuiz(quiz: Quiz): void {
    this.clearTimers();
    this.shown.add(quiz.id);
    this.current = quiz;
    this.selected = null;
    this.locked = false;
    this.video.pause();
    this.sounds.play('cue');
    if (quiz.audioUrl) this.narration.play(quiz.audioUrl);

    const m = this.messages;
    const index = this.quizzes.indexOf(quiz);
    this.ui.kicker.textContent = format(m.questionOf, { n: index + 1, total: this.quizzes.length });
    this.ui.question.textContent = quiz.question;
    this.ui.optionsList.textContent = '';
    quiz.options.forEach((opt) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'qp-option';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', 'false');
      b.tabIndex = -1;
      b.dataset.id = opt.id;
      b.textContent = opt.text;
      this.ui.optionsList.appendChild(b);
    });
    const first = this.ui.optionsList.firstElementChild as HTMLButtonElement | null;
    if (first) first.tabIndex = 0;
    this.ui.feedback.className = 'qp-feedback';
    this.ui.feedback.textContent = '';
    this.ui.submit.textContent = m.confirm;
    this.ui.submit.disabled = true;
    this.ui.sub.textContent = '';
    this.ui.overlay.classList.add('qp-open');
    this.ui.overlay.setAttribute('aria-hidden', 'false');
    this.el.classList.add('qp-quiz-open');
    this.fit(this.ui.card);
    this.ui.live.textContent = quiz.question;
    first?.focus({ preventScroll: true });

    this.emit('quizshow', { quiz, index });
    this.call('onQuizShow', { quiz, index });
  }

  private select(optionId: string): void {
    if (this.locked || !this.current) return;
    this.selected = optionId;
    this.optionButtons().forEach((b) => {
      const on = b.dataset.id === optionId;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    this.ui.submit.disabled = false;
  }

  private async submit(): Promise<void> {
    const quiz = this.current;
    const optionId = this.selected;
    if (!quiz || optionId === null || this.locked) return;
    this.locked = true;
    this.optionButtons().forEach((b) => (b.disabled = true));
    this.ui.submit.disabled = true;
    this.ui.submit.textContent = this.messages.checking;

    const payload: AnswerPayload = { quizId: quiz.id, optionId, videoTime: quiz.time };
    if (this.options.videoId !== undefined) payload.videoId = this.options.videoId;

    let result: ValidationResult;
    let failed = false;
    try {
      result = await this.resolveAnswer(payload, quiz);
    } catch (error) {
      failed = true;
      result = quiz.correct !== undefined ? validateAnswer(quiz, optionId) : { correct: null };
      this.emit('error', { error });
      this.call('onError', { error });
    }
    if (this.current !== quiz) return; // destroyed or replaced meanwhile

    const record: AnswerRecord = {
      quizId: quiz.id,
      optionId,
      correct: result.correct,
      videoTime: quiz.time,
      answeredAt: new Date().toISOString(),
    };
    this.answers.set(quiz.id, record);
    this.paintResult(optionId, result, failed);
    this.fit(this.ui.card);
    if (result.correct === true) this.sounds.play('correct');
    else if (result.correct === false) this.sounds.play('wrong');
    this.renderMarkers();
    this.renderCount();
    this.renderProgress();

    this.ui.submit.textContent = this.messages.continue;
    this.ui.submit.disabled = false;
    this.ui.submit.focus({ preventScroll: true });

    this.emit('answer', { quiz, record, result });
    this.call('onAnswer', { quiz, record, result });

    const ms = this.options.autoContinueMs ?? 3000;
    if (ms > 0) this.countdown(ms, this.ui.sub, this.messages.autoContinue, () => this.continue());
  }

  private async resolveAnswer(payload: AnswerPayload, quiz: Quiz): Promise<ValidationResult> {
    if (this.options.validateAnswer) return await this.options.validateAnswer(payload, quiz);
    if (this.options.endpoint) {
      const res = await this.request('POST', '/answer', payload);
      const correct = res.correct === undefined || res.correct === null ? null : Boolean(res.correct);
      const out: ValidationResult = { correct };
      const cid = res.correctOptionId ?? res.correct_option_id;
      if (cid !== undefined && cid !== null) out.correctOptionId = String(cid);
      if (typeof res.explanation === 'string') out.explanation = res.explanation;
      return out;
    }
    return validateAnswer(quiz, payload.optionId);
  }

  private paintResult(optionId: string, result: ValidationResult, failed: boolean): void {
    const m = this.messages;
    const correctId = result.correctOptionId;
    this.optionButtons().forEach((b) => {
      const id = b.dataset.id;
      if (correctId !== undefined && id === correctId) b.classList.add('qp-correct');
      else if (id === optionId && result.correct === false) b.classList.add('qp-incorrect');
      else if (id !== optionId) b.classList.add('qp-dim');
    });
    let text: string;
    let cls: string;
    if (failed && result.correct === null) {
      text = m.error;
      cls = 'qp-neutral';
    } else if (result.correct === true) {
      text = m.correct;
      cls = 'qp-ok';
    } else if (result.correct === false) {
      text = correctId === undefined ? m.incorrect : `${m.incorrect} ${m.incorrectHint}`;
      cls = 'qp-bad';
    } else {
      text = m.recorded;
      cls = 'qp-neutral';
    }
    this.ui.feedback.className = `qp-feedback qp-show ${cls}`;
    this.ui.feedback.textContent = text;
    if (result.explanation) {
      const ex = document.createElement('span');
      ex.className = 'qp-explanation';
      ex.textContent = result.explanation;
      this.ui.feedback.appendChild(ex);
    }
  }

  private continue(): void {
    const quiz = this.current;
    if (!quiz) return;
    this.clearTimers();
    this.narration.stop();
    this.current = null;
    this.ui.overlay.classList.remove('qp-open');
    this.ui.overlay.setAttribute('aria-hidden', 'true');
    this.el.classList.remove('qp-quiz-open', 'qp-grow');
    this.el.focus({ preventScroll: true });
    this.emit('continue', { quiz });
    this.call('onContinue', { quiz });
    this.play();
  }

  private openToast(quiz: Quiz): void {
    const m = this.messages;
    this.toastQuiz = quiz;
    this.video.pause();
    this.ui.toastTitle.textContent = m.alreadyAnsweredTitle;
    this.ui.toastText.textContent = m.alreadyAnsweredText;
    this.ui.yes.textContent = m.answerAgain;
    this.ui.no.textContent = m.keepWatching;
    this.ui.toast.classList.add('qp-open');
    this.ui.toast.setAttribute('aria-hidden', 'false');
    this.fit(this.ui.toast);
    this.ui.no.focus({ preventScroll: true });
    const secs = this.options.askAgainSeconds ?? 5;
    if (secs > 0) {
      this.countdown(secs * 1000, this.ui.toastTimer, m.toastTimer, () => {
        this.closeToast();
        this.play();
      });
    }
  }

  private closeToast(): void {
    this.clearTimers();
    this.toastQuiz = null;
    this.ui.toast.classList.remove('qp-open');
    this.ui.toast.setAttribute('aria-hidden', 'true');
    this.ui.toastTimer.textContent = '';
    this.el.classList.remove('qp-grow');
  }

  /**
   * When the player is too small for the quiz (e.g. a phone in portrait), let it
   * grow vertically while the quiz is open instead of clipping or scrolling.
   */
  private fit(panel: HTMLElement): void {
    if (document.fullscreenElement === this.el) return;
    const avail = this.el.clientHeight;
    if (!avail) return;
    if (!this.el.classList.contains('qp-grow')) this.el.style.setProperty('--qp-h', `${avail}px`);
    if (panel.scrollHeight + 32 > avail) this.el.classList.add('qp-grow');
  }

  private onQuizKeydown(e: KeyboardEvent): void {
    if (this.toastQuiz) {
      if (e.key === 'Escape') {
        this.closeToast();
        this.play();
      }
      return;
    }
    const buttons = this.optionButtons();
    const idx = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key) && idx >= 0 && !this.locked) {
      e.preventDefault();
      const dir = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
      const next = buttons[(idx + dir + buttons.length) % buttons.length];
      next.focus();
      this.select(next.dataset.id as string);
    } else if (e.key === 'Tab') {
      // Focus trap inside the quiz card.
      const focusables = [...buttons.filter((b) => b.tabIndex === 0 && !b.disabled), this.ui.submit].filter((b) => !b.disabled);
      if (!focusables.length) return;
      const pos = focusables.indexOf(document.activeElement as HTMLButtonElement);
      e.preventDefault();
      const next = focusables[(pos + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length];
      next.focus();
    }
  }

  private optionButtons(): HTMLButtonElement[] {
    return Array.from(this.ui.optionsList.querySelectorAll<HTMLButtonElement>('.qp-option'));
  }

  // ---------------------------------------------------------------- backend

  private async restoreAnswers(): Promise<void> {
    type RawRecord = Partial<AnswerRecord> & Record<string, unknown>;
    let list: RawRecord[] | undefined = this.options.previousAnswers;
    try {
      if (!list && this.options.loadAnswers) list = (await this.options.loadAnswers()) as RawRecord[];
      else if (!list && this.options.endpoint) {
        const q = this.options.videoId !== undefined ? `?videoId=${encodeURIComponent(this.options.videoId)}` : '';
        const res = await this.request('GET', `/answers${q}`);
        list = Array.isArray(res.answers) ? res.answers : [];
      }
    } catch (error) {
      this.emit('error', { error });
      this.call('onError', { error });
    }
    (list ?? []).forEach((raw) => {
      const r = normalizeRecord(raw);
      if (r) this.answers.set(r.quizId, r);
    });
    this.renderMarkers();
    this.renderCount();
    this.renderProgress();
  }

  private async request(method: 'GET' | 'POST', path: string, body?: unknown): Promise<Record<string, any>> {
    const base = String(this.options.endpoint).replace(/\/+$/, '');
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const metaName = this.options.csrfMeta === undefined ? 'csrf-token' : this.options.csrfMeta;
    if (metaName) {
      const token = document.querySelector<HTMLMetaElement>(`meta[name="${metaName}"]`)?.content;
      if (token) headers['X-CSRF-TOKEN'] = token;
    }
    const extra = typeof this.options.headers === 'function' ? this.options.headers() : this.options.headers;
    Object.assign(headers, extra ?? {});
    const res = await fetch(base + path, {
      method,
      headers,
      credentials: this.options.credentials ?? 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`QuizPlayer: ${method} ${path} failed with HTTP ${res.status}`);
    return (await res.json()) as Record<string, any>;
  }

  // ---------------------------------------------------------------- rendering

  private renderProgress(): void {
    const v = this.video;
    const d = v.duration;
    const ok = Number.isFinite(d) && d > 0;
    const pct = ok ? (v.currentTime / d) * 100 : 0;
    this.ui.played.style.width = `${pct}%`;
    this.ui.time.textContent = `${fmtTime(v.currentTime)} / ${fmtTime(ok ? d : 0)}`;
    this.ui.progress.setAttribute('aria-valuemax', String(ok ? Math.round(d) : 0));
    this.ui.progress.setAttribute('aria-valuenow', String(Math.round(v.currentTime)));
    this.ui.progress.setAttribute('aria-valuetext', `${fmtTime(v.currentTime)} / ${fmtTime(ok ? d : 0)}`);
    const pending = this.options.preventSkip ? this.firstPending() : undefined;
    if (pending && ok) {
      this.ui.limit.hidden = false;
      this.ui.limit.style.left = `${(pending.time / d) * 100}%`;
    } else {
      this.ui.limit.hidden = true;
    }
  }

  private renderBuffered(): void {
    const v = this.video;
    if (!v.buffered || !v.buffered.length || !Number.isFinite(v.duration)) return;
    this.ui.buffered.style.width = `${(v.buffered.end(v.buffered.length - 1) / v.duration) * 100}%`;
  }

  private renderMarkers(): void {
    if (!this.ui) return;
    this.ui.markers.textContent = '';
    const d = this.video.duration;
    if (this.options.markers === false || !Number.isFinite(d) || d <= 0) return;
    this.quizzes.forEach((q) => {
      const mk = document.createElement('span');
      const a = this.answers.get(q.id);
      mk.className = 'qp-marker' + (a ? (a.correct === false ? ' qp-wrong' : ' qp-done') : '');
      mk.style.left = `${Math.min(100, (q.time / d) * 100)}%`;
      mk.title = fmtTime(q.time);
      this.ui.markers.appendChild(mk);
    });
  }

  private renderCount(): void {
    if (!this.ui) return;
    const total = this.quizzes.length;
    this.ui.count.hidden = total === 0;
    const answered = this.quizzes.filter((q) => this.answers.has(q.id)).length;
    this.ui.count.textContent = `✓ ${answered}/${total}`;
  }

  private updatePlayButton(): void {
    const playing = !this.video.paused && !this.video.ended;
    this.ui.play.innerHTML = playing ? ICONS.pause : ICONS.play;
    this.ui.play.setAttribute('aria-label', playing ? this.messages.pause : this.messages.play);
  }

  private updateVolume(): void {
    const v = this.video;
    const muted = v.muted || v.volume === 0;
    this.ui.mute.innerHTML = muted ? ICONS.muted : ICONS.volume;
    this.ui.mute.setAttribute('aria-label', muted ? this.messages.unmute : this.messages.mute);
    this.ui.volume.value = String(muted ? 0 : v.volume);
  }

  private toggleFullscreen(): void {
    const el = this.el as HTMLElement & { webkitRequestFullscreen?: () => void };
    const doc = document as Document & { webkitExitFullscreen?: () => void; webkitFullscreenElement?: Element };
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => undefined);
      else doc.webkitExitFullscreen?.();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => undefined);
    } else {
      el.webkitRequestFullscreen?.();
    }
  }

  private updateFullscreenButton(): void {
    const active = document.fullscreenElement === this.el;
    this.ui.fs.innerHTML = active ? ICONS.shrink : ICONS.expand;
    this.ui.fs.setAttribute('aria-label', active ? this.messages.exitFullscreen : this.messages.fullscreen);
  }

  private notice(text: string): void {
    this.ui.notice.textContent = text;
    this.ui.notice.classList.add('qp-open');
    const id = setTimeout(() => {
      this.ui.notice.classList.remove('qp-open');
      this.timers.delete(id);
    }, 2200);
  }

  private countdown(ms: number, target: HTMLElement, template: string, done: () => void): void {
    const end = Date.now() + ms;
    const render = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      target.textContent = format(template, { s: left });
    };
    render();
    const interval = setInterval(render, 250);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      this.timers.delete(interval);
      this.timers.delete(timeout);
      target.textContent = '';
      done();
    }, ms);
    this.timers.add(interval);
    this.timers.add(timeout);
  }

  private clearTimers(): void {
    this.timers.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    this.timers.clear();
    if (this.ui) {
      this.ui.sub.textContent = '';
      this.ui.toastTimer.textContent = '';
    }
  }

  private emit<K extends keyof QuizPlayerEventMap>(type: K, detail: QuizPlayerEventMap[K]): void {
    try {
      this.dispatchEvent(new CustomEvent(type, { detail }));
    } catch (error) {
      console.error('[QuizPlayer] listener error', error);
    }
  }

  /** Runs a user callback; an exception in user code must never break playback. */
  private call<K extends CallbackName>(name: K, arg: Parameters<NonNullable<QuizPlayerOptions[K]>>[0]): void {
    try {
      (this.options[name] as ((a: typeof arg) => void) | undefined)?.(arg);
    } catch (error) {
      console.error(`[QuizPlayer] ${name} callback error`, error);
    }
  }
}

/** Reads `data-*` attributes into options (used by `QuizPlayer.autoInit`). */
export function optionsFromDataset(el: HTMLElement): QuizPlayerOptions {
  const d = el.dataset;
  const bool = (v: string | undefined) => (v === undefined ? undefined : v !== 'false' && v !== '0');
  let base: QuizPlayerOptions = {};
  if (d.options) {
    try {
      base = JSON.parse(d.options);
    } catch {
      /* ignore */
    }
  }
  let quizzes: QuizPlayerOptions['quizzes'] = base.quizzes;
  if (d.quizzes) {
    const ref = d.quizzes.trim();
    if (ref.startsWith('#')) quizzes = document.querySelector(ref)?.textContent ?? '[]';
    else quizzes = ref;
  } else {
    const script = el.querySelector('script[type="application/json"]');
    if (script) quizzes = script.textContent ?? '[]';
  }
  const opts: QuizPlayerOptions = { ...base, quizzes };
  if (d.src) opts.src = d.src;
  if (d.poster) opts.poster = d.poster;
  if (d.videoId) opts.videoId = d.videoId;
  if (d.endpoint) opts.endpoint = d.endpoint;
  if (d.locale) opts.locale = d.locale;
  if (d.preventSkip !== undefined) opts.preventSkip = bool(d.preventSkip);
  if (d.replayOnRewind !== undefined) opts.replayOnRewind = bool(d.replayOnRewind);
  if (d.autoContinue !== undefined) opts.autoContinueMs = Number(d.autoContinue);
  if (d.sounds !== undefined) opts.sounds = bool(d.sounds);
  if (d.fill !== undefined) opts.fill = bool(d.fill);
  if (d.muted !== undefined) opts.muted = bool(d.muted);
  if (d.autoplay !== undefined) opts.autoplay = bool(d.autoplay);
  return opts;
}
