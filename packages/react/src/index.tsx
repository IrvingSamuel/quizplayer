import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type ForwardedRef } from 'react';
import { QuizPlayer, type QuizPlayerOptions } from '@quizplayer/core';

export * from '@quizplayer/core';

export interface QuizPlayerProps extends QuizPlayerOptions {
  className?: string;
  style?: CSSProperties;
}

const CALLBACKS = ['onReady', 'onQuizShow', 'onAnswer', 'onContinue', 'onComplete', 'onSeekBlocked', 'onError'] as const;

/**
 * React component for QuizPlayer.
 *
 * ```tsx
 * <QuizPlayer src="/lesson.mp4" quizzes={quizzes} onAnswer={({ record }) => save(record)} />
 * ```
 * The ref exposes the underlying `QuizPlayer` instance.
 */
export const QuizPlayerView = forwardRef(function QuizPlayerView(
  { className, style, ...options }: QuizPlayerProps,
  ref: ForwardedRef<QuizPlayer | null>,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<QuizPlayer | null>(null);
  // Keep callbacks fresh without recreating the player.
  const latest = useRef(options);
  latest.current = options;

  useImperativeHandle(ref, () => player as QuizPlayer, [player]);

  const srcKey = JSON.stringify(options.src ?? null);
  useEffect(() => {
    if (!hostRef.current) return;
    const opts: QuizPlayerOptions = { ...latest.current };
    for (const name of CALLBACKS) {
      (opts as Record<string, unknown>)[name] = (arg: unknown) => (latest.current[name] as ((a: unknown) => void) | undefined)?.(arg);
    }
    const instance = QuizPlayer.create(hostRef.current, opts);
    setPlayer(instance);
    return () => {
      instance.destroy();
      setPlayer(null);
    };
    // Recreate only when the identity of the video changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcKey, options.videoId, options.endpoint, options.locale]);

  const quizzesKey = typeof options.quizzes === 'string' ? options.quizzes : JSON.stringify(options.quizzes ?? []);
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    player?.setQuizzes(options.quizzes ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizzesKey]);

  return <div ref={hostRef} className={className} style={style} />;
});

export { QuizPlayerView as QuizPlayer, QuizPlayer as QuizPlayerCore };
export default QuizPlayerView;

/**
 * Hook alternative: `const [ref, player] = useQuizPlayer(options)` then `<div ref={ref} />`.
 * Options are read once on mount; use `player.setQuizzes()` to update quizzes.
 */
export function useQuizPlayer(options: QuizPlayerOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<QuizPlayer | null>(null);
  const opts = useRef(options);
  useEffect(() => {
    if (!ref.current) return;
    const p = QuizPlayer.create(ref.current, opts.current);
    setPlayer(p);
    return () => p.destroy();
  }, []);
  return [ref, player] as const;
}
