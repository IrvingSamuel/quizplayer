import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizPlayer } from '../src/player';

/** jsdom has no media pipeline: emulate the parts the player uses. */
function fakeMedia(video: HTMLVideoElement, duration = 100) {
  let time = 0;
  let paused = true;
  Object.defineProperty(video, 'currentTime', { get: () => time, set: (v: number) => (time = v), configurable: true });
  Object.defineProperty(video, 'duration', { get: () => duration, configurable: true });
  Object.defineProperty(video, 'paused', { get: () => paused, configurable: true });
  video.play = vi.fn(async () => {
    paused = false;
    video.dispatchEvent(new Event('play'));
  });
  video.pause = vi.fn(() => {
    if (!paused) {
      paused = true;
      video.dispatchEvent(new Event('pause'));
    }
  });
  return {
    advance(to: number) {
      time = to;
      video.dispatchEvent(new Event('timeupdate'));
    },
  };
}

const quizzes = [
  { id: 'q1', time: 10, question: 'What is 2 + 2?', options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }], correct: 'b' },
  { id: 'q2', time: 50, question: 'Favourite colour?', options: ['Red', 'Blue'] },
];

function setup(opts = {}) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const video = document.createElement('video');
  host.appendChild(video);
  const media = fakeMedia(video);
  const player = QuizPlayer.create(video, { quizzes, sounds: false, autoContinueMs: 0, ...opts });
  return { player, video, media, root: player.el };
}

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('QuizPlayer', () => {
  beforeEach(() => (document.body.innerHTML = ''));
  afterEach(() => vi.restoreAllMocks());

  it('wraps an existing video element and renders controls', () => {
    const { root, video } = setup();
    expect(root.classList.contains('qp-root')).toBe(true);
    expect(video.parentElement).toBe(root);
    expect(root.querySelector('.qp-progress')).not.toBeNull();
    expect(QuizPlayer.get(root)).toBeDefined();
  });

  it('pauses and shows the quiz at its cue point', async () => {
    const { player, media, root, video } = setup();
    const shown = vi.fn();
    player.on('quizshow', shown);
    await player.play();
    media.advance(5);
    expect(shown).not.toHaveBeenCalled();
    media.advance(10.2);
    expect(shown).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
    expect(video.pause).toHaveBeenCalled();
    expect(root.querySelector('.qp-overlay')!.classList.contains('qp-open')).toBe(true);
    expect(root.querySelector('.qp-question')!.textContent).toBe('What is 2 + 2?');
  });

  it('validates on the client, emits answer and resumes on continue', async () => {
    const { player, media, root, video } = setup();
    const onAnswer = vi.fn();
    player.on('answer', onAnswer);
    await player.play();
    media.advance(10);
    const [wrong] = root.querySelectorAll<HTMLButtonElement>('.qp-option');
    wrong.click();
    const submit = root.querySelector<HTMLButtonElement>('.qp-submit')!;
    expect(submit.disabled).toBe(false);
    submit.click();
    await flush();
    expect(onAnswer.mock.calls[0][0].record).toMatchObject({ quizId: 'q1', optionId: 'a', correct: false });
    expect(root.querySelector('.qp-option.qp-correct')!.textContent).toBe('4');
    expect(root.querySelector('.qp-option.qp-incorrect')!.textContent).toBe('3');
    submit.click(); // continue
    expect(root.querySelector('.qp-overlay')!.classList.contains('qp-open')).toBe(false);
    expect(video.play).toHaveBeenCalledTimes(2);
    expect(player.getResults()).toMatchObject({ total: 2, answered: 1, correct: 0 });
  });

  it('uses the server result when an endpoint is configured', async () => {
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
      if (url.includes('/answers')) return new Response(JSON.stringify({ answers: [] }), { status: 200 });
      return new Response(JSON.stringify({ correct: true, correctOptionId: 'b', explanation: 'Math!' }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const safe = quizzes.map(({ correct: _c, ...q }) => q);
    const { player, media, root } = setup({ quizzes: safe, endpoint: '/api/quiz/', videoId: 'v1' });
    await flush();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/quiz/answers?videoId=v1');
    await player.play();
    media.advance(10);
    root.querySelectorAll<HTMLButtonElement>('.qp-option')[1].click();
    root.querySelector<HTMLButtonElement>('.qp-submit')!.click();
    await flush();
    await flush();
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('/api/quiz/answer');
    expect(JSON.parse(String(init?.body))).toEqual({ quizId: 'q1', optionId: 'b', videoTime: 10, videoId: 'v1' });
    expect(root.querySelector('.qp-feedback')!.textContent).toContain('Math!');
    expect(player.getAnswers()[0].correct).toBe(true);
    vi.unstubAllGlobals();
  });

  it('blocks seeking past an unanswered quiz with preventSkip', () => {
    const { player } = setup({ preventSkip: true });
    const blocked = vi.fn();
    player.on('seekblocked', blocked);
    expect(player.seek(80)).toBe(10);
    expect(blocked).toHaveBeenCalledWith(expect.objectContaining({ requested: 80, allowed: 10 }));
    expect(player.seek(8)).toBe(8);
  });

  it('allows free seeking by default and still catches skipped quizzes on rewind', async () => {
    const { player, media } = setup();
    const shown = vi.fn();
    player.on('quizshow', shown);
    expect(player.seek(80)).toBe(80);
    media.advance(80.2);
    expect(shown).not.toHaveBeenCalled();
    player.seek(9.5);
    media.advance(9.8);
    media.advance(10.05);
    expect(shown).toHaveBeenCalledTimes(1);
  });

  it('asks before re-opening a previously answered quiz', async () => {
    const { player, media, root } = setup({
      previousAnswers: [{ quiz_id: 'q1', option_id: 'b', is_correct: 1 }],
      askAgainSeconds: 0,
    });
    await flush();
    const shown = vi.fn();
    player.on('quizshow', shown);
    await player.play();
    media.advance(10);
    expect(root.querySelector('.qp-toast')!.classList.contains('qp-open')).toBe(true);
    expect(shown).not.toHaveBeenCalled();
    root.querySelector<HTMLButtonElement>('.qp-yes')!.click();
    expect(shown).toHaveBeenCalled();
  });

  it('auto-continues after the configured delay', async () => {
    vi.useFakeTimers();
    const { player, media, root } = setup({ autoContinueMs: 1000 });
    const cont = vi.fn();
    player.on('continue', cont);
    await player.play();
    media.advance(10);
    root.querySelectorAll<HTMLButtonElement>('.qp-option')[1].click();
    root.querySelector<HTMLButtonElement>('.qp-submit')!.click();
    await vi.advanceTimersByTimeAsync(1100);
    expect(cont).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('keeps playing when a user callback throws', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { player, media, root, video } = setup({ onContinue: () => { throw new Error('boom'); } });
    await player.play();
    media.advance(10);
    root.querySelectorAll<HTMLButtonElement>('.qp-option')[1].click();
    root.querySelector<HTMLButtonElement>('.qp-submit')!.click();
    await flush();
    root.querySelector<HTMLButtonElement>('.qp-submit')!.click();
    expect(video.play).toHaveBeenCalledTimes(2);
    expect(err).toHaveBeenCalled();
  });

  it('emits complete with results when the video ends', async () => {
    const { player, video } = setup();
    const done = vi.fn();
    player.on('complete', done);
    video.dispatchEvent(new Event('ended'));
    expect(done).toHaveBeenCalledWith(expect.objectContaining({ total: 2, answered: 0 }));
  });

  it('localizes the UI', async () => {
    const { player, media, root } = setup({ locale: 'pt-BR' });
    await player.play();
    media.advance(10);
    expect(root.querySelector('.qp-kicker')!.textContent).toBe('Pergunta 1 de 2');
    expect(root.querySelector('.qp-submit')!.textContent).toBe('Confirmar resposta');
  });

  it('auto-initializes from data attributes and destroys cleanly', () => {
    document.body.innerHTML = `<div data-quizplayer data-src="v.mp4" data-video-id="42" data-prevent-skip="true">
      <script type="application/json">[{"time":3,"question":"Q?","options":["a","b"]}]</script></div>`;
    const [p] = QuizPlayer.autoInit();
    expect(p.options).toMatchObject({ src: 'v.mp4', videoId: '42', preventSkip: true });
    expect(p.getQuizzes()).toHaveLength(1);
    expect(QuizPlayer.autoInit()).toHaveLength(0); // idempotent
    p.destroy();
    expect(document.querySelector('.qp-root')).toBeNull();
  });
});
