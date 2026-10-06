# @quizplayer/server

Node.js backend for [QuizPlayer](https://github.com/IrvingSamuel/quizplayer). It validates answers **on the server**, so the right answer never reaches the browser, and stores them through a pluggable store.

```bash
npm i @quizplayer/server
```

```js
// Express / Connect / node:http
import { createNodeHandler } from '@quizplayer/server';
app.use('/api/quizplayer', express.json(), createNodeHandler({ getQuizzes, getUserId, store }));

// Next.js route handlers, Hono, Bun, Deno, Cloudflare Workers
import { createFetchHandler } from '@quizplayer/server';
const handler = createFetchHandler({ getQuizzes, getUserId, store }, '/api/quizplayer');
```

`store` implements `{ save(answer), list(videoId, userId) }`. A `MemoryStore` is included.

📖 Protocol and docs: https://github.com/IrvingSamuel/quizplayer
