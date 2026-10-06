# @quizplayer/react

React component for [QuizPlayer](https://github.com/IrvingSamuel/quizplayer), an interactive video player with embedded quizzes.

```bash
npm i @quizplayer/react
```

```tsx
import { QuizPlayer } from '@quizplayer/react';

<QuizPlayer src="/lesson.mp4" quizzes={quizzes} endpoint="/api/quizplayer" videoId="lesson-1" preventSkip
            onComplete={(r) => console.log(r.score)} />
```

The `ref` gives you the core `QuizPlayer` instance (`seek`, `getResults`…). There is also a `useQuizPlayer(options)` hook.

📖 Docs: https://github.com/IrvingSamuel/quizplayer
