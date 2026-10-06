# @quizplayer/core

Zero-dependency HTML5 video player with embedded quizzes. At each cue point the video **pauses, beeps and asks**. Works with any framework and any backend.

```bash
npm i @quizplayer/core
```

```js
import { QuizPlayer } from '@quizplayer/core';

QuizPlayer.create('#player', {
  src: '/lesson.mp4',
  quizzes: [{ id: 'q1', time: 42, question: 'HTTPS = HTTP over…', options: [{ id: 'a', text: 'FTP' }, { id: 'b', text: 'TLS' }], correct: 'b' }],
  onAnswer: ({ record }) => console.log(record),
});
```

Or with no build step:

```html
<script src="https://cdn.jsdelivr.net/npm/@quizplayer/core@0/dist/quizplayer.min.js"></script>
```

📖 Full documentation, live demo and backend SDKs (PHP/Laravel, Go, Node): **https://github.com/IrvingSamuel/quizplayer**
