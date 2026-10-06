import { describe, expect, it } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import { QuizPlayer } from '../src/index';

describe('@quizplayer/vue', () => {
  it('mounts, reacts to quiz changes and unmounts', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const quizzes = ref([{ id: 'x', time: 1, question: 'Q?', options: ['a', 'b'] }]);
    const comp = ref<{ player: { getQuizzes(): unknown[] } } | null>(null);
    const app = createApp({ render: () => h(QuizPlayer, { ref: comp, src: 'v.mp4', quizzes: quizzes.value, options: { sounds: false } }) });
    app.mount(el);
    await nextTick();
    expect(el.querySelector('.qp-root')).not.toBeNull();
    expect(comp.value?.player.getQuizzes()).toHaveLength(1);
    quizzes.value = [...quizzes.value, { id: 'y', time: 2, question: 'Q2?', options: ['a', 'b'] }];
    await nextTick();
    await nextTick();
    expect(comp.value?.player.getQuizzes()).toHaveLength(2);
    app.unmount();
    expect(el.querySelector('.qp-root')).toBeNull();
  });
});
