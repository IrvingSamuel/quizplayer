<script setup lang="ts">
import { ref } from 'vue';
import { QuizPlayer, type AnswerDetail, type Quiz, type Results } from '@quizplayer/vue';

const quizzes = ref<Quiz[]>([
  { id: 'q1', time: 6, question: 'What is 2 + 2?', options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }], correct: 'b' },
  { id: 'q2', time: 18, question: 'Pick your favorite stack', options: [{ id: 'a', text: 'React' }, { id: 'b', text: 'Vue' }, { id: 'c', text: 'Svelte' }] },
]);
const results = ref<Results | null>(null);
const player = ref<InstanceType<typeof QuizPlayer> | null>(null);

function onAnswer({ record }: AnswerDetail) {
  console.log('answer', record);
}
</script>

<template>
  <main style="max-width: 860px; margin: 40px auto; padding: 0 16px; font-family: system-ui">
    <h1>QuizPlayer · Vue</h1>
    <QuizPlayer
      ref="player"
      src="https://irvingsamuel.github.io/quizplayer/media/demo.mp4"
      :quizzes="quizzes"
      locale="en"
      prevent-skip
      @answer="onAnswer"
      @complete="(r) => (results = r)"
    />
    <button @click="player?.player?.seek(0)">Restart</button>
    <pre v-if="results">{{ results }}</pre>
  </main>
</template>
