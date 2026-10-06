import { defineComponent, h, onBeforeUnmount, onMounted, ref, shallowRef, watch, type PropType } from 'vue';
import { QuizPlayer, type QuizPlayerOptions } from '@quizplayer/core';

export * from '@quizplayer/core';

/**
 * Vue 3 component for QuizPlayer.
 *
 * ```vue
 * <QuizPlayer src="/lesson.mp4" :quizzes="quizzes" @answer="save" />
 * ```
 * Events: ready, quizshow, answer, continue, complete, seekblocked, error.
 * The component exposes `player` (the QuizPlayer instance) through template refs.
 */
export const QuizPlayerComponent = defineComponent({
  name: 'QuizPlayer',
  props: {
    src: { type: [String, Array] as PropType<QuizPlayerOptions['src']> },
    quizzes: { type: [Array, String] as PropType<QuizPlayerOptions['quizzes']>, default: () => [] },
    options: { type: Object as PropType<QuizPlayerOptions>, default: () => ({}) },
    videoId: String,
    endpoint: String,
    locale: String,
    poster: String,
    preventSkip: { type: Boolean, default: undefined },
    autoContinueMs: Number,
  },
  emits: ['ready', 'quizshow', 'answer', 'continue', 'complete', 'seekblocked', 'error'],
  setup(props, { emit, expose }) {
    const host = ref<HTMLDivElement | null>(null);
    const player = shallowRef<QuizPlayer | null>(null);

    const mount = () => {
      player.value?.destroy();
      if (!host.value) return;
      const opts: QuizPlayerOptions = { ...props.options };
      (['src', 'quizzes', 'videoId', 'endpoint', 'locale', 'poster', 'preventSkip', 'autoContinueMs'] as const).forEach((k) => {
        if (props[k] !== undefined) (opts as Record<string, unknown>)[k] = props[k];
      });
      Object.assign(opts, {
        onReady: () => emit('ready', player.value),
        onQuizShow: (d: unknown) => emit('quizshow', d),
        onAnswer: (d: unknown) => emit('answer', d),
        onContinue: (d: unknown) => emit('continue', d),
        onComplete: (d: unknown) => emit('complete', d),
        onSeekBlocked: (d: unknown) => emit('seekblocked', d),
        onError: (d: unknown) => emit('error', d),
      });
      player.value = QuizPlayer.create(host.value, opts);
    };

    onMounted(mount);
    onBeforeUnmount(() => player.value?.destroy());
    watch(() => [props.src, props.videoId, props.endpoint, props.locale], mount);
    watch(
      () => props.quizzes,
      (q) => player.value?.setQuizzes(q ?? []),
      { deep: true },
    );
    expose({ player });
    return () => h('div', { ref: host });
  },
});

/** Plugin: `app.use(QuizPlayerPlugin)` registers `<QuizPlayer>` globally. */
export const QuizPlayerPlugin = {
  install(app: { component: (name: string, c: unknown) => void }) {
    app.component('QuizPlayer', QuizPlayerComponent);
  },
};

export { QuizPlayerComponent as QuizPlayer, QuizPlayer as QuizPlayerCore };
export default QuizPlayerComponent;
