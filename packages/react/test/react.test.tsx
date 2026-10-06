import { describe, expect, it } from 'vitest';
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { QuizPlayer, type QuizPlayerCore } from '../src/index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('@quizplayer/react', () => {
  it('mounts, exposes the instance and cleans up', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const ref = createRef<QuizPlayerCore | null>();
    await act(async () => {
      root.render(<QuizPlayer ref={ref} src="v.mp4" sounds={false} quizzes={[{ id: 'x', time: 1, question: 'Q?', options: ['a', 'b'] }]} />);
    });
    expect(container.querySelector('.qp-root')).not.toBeNull();
    expect(ref.current?.getQuizzes()).toHaveLength(1);
    await act(async () => root.unmount());
    expect(container.querySelector('.qp-root')).toBeNull();
  });
});
