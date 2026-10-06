# @quizplayer/vue

Vue 3 component for [QuizPlayer](https://github.com/IrvingSamuel/quizplayer), an interactive video player with embedded quizzes.

```bash
npm i @quizplayer/vue
```

```vue
<script setup>
import { QuizPlayer } from '@quizplayer/vue';
</script>

<template>
  <QuizPlayer src="/lesson.mp4" :quizzes="quizzes" endpoint="/api/quizplayer" video-id="lesson-1" prevent-skip
              @answer="onAnswer" @complete="onComplete" />
</template>
```

Events: `ready`, `quizshow`, `answer`, `continue`, `complete`, `seekblocked`, `error`. Register globally with `app.use(QuizPlayerPlugin)`.

📖 Docs: https://github.com/IrvingSamuel/quizplayer
