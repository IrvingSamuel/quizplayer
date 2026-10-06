<div align="center">

# ▶ QuizPlayer

**Videos that pause, beep and ask.**
An open-source HTML5 video player with embedded quizzes that works with **any frontend** and **any backend**.

**English** · [Português](docs/README.pt-BR.md) · [Español](docs/README.es.md) · [Français](docs/README.fr.md) · [Deutsch](docs/README.de.md) · [中文](docs/README.zh-CN.md) · [日本語](docs/README.ja.md)

[![CI](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml/badge.svg)](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Size](https://img.shields.io/badge/core-~14%20kB%20gzip-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)
![PHP](https://img.shields.io/badge/PHP-8.1%2B-777bb4)
![Go](https://img.shields.io/badge/Go-1.21%2B-00add8)
[![GitHub stars](https://img.shields.io/github/stars/IrvingSamuel/quizplayer?style=social)](https://github.com/IrvingSamuel/quizplayer/stargazers)

[**Live demo**](https://irvingsamuel.github.io/quizplayer/) · [Examples](examples) · [Protocol spec](spec/protocol.md)

<img src="docs/assets/demo.gif" alt="QuizPlayer demo: the video pauses at a cue point, a question appears, the viewer answers and gets instant feedback" width="720">

</div>

---

## Why QuizPlayer?

Interactive video increases attention and retention, but most solutions are paid SaaS products, lock you into one framework, or check the right answer in the browser, where anyone can read it.

QuizPlayer is different:

- **Pause → beep → ask.** The video stops at the exact second you choose, plays a short synthesized beep and shows the question. No audio files, no network calls.
- **Any frontend.** A zero-dependency core (~14 kB gzip) plus official **React** and **Vue** components. **Blade, Twig, Django, Rails and Go templates** work with plain HTML attributes, and so does every other framework.
- **Any backend.** A tiny [JSON protocol](spec/protocol.md) with official SDKs for **PHP/Laravel**, **Go** and **Node.js** (Express, Next.js, Hono, Bun, Deno). Other languages can implement it in about 50 lines.
- **Cheat-resistant.** With an `endpoint`, the right answers never reach the page: the server validates and stores every answer.
- **Skip guard.** Optionally block seeking past a question that hasn't been answered yet.
- **Resume.** Previous answers are restored, and the viewer is asked whether to *"answer again?"*.
- **Accessible.** Keyboard navigation, focus trap, ARIA live regions and `prefers-reduced-motion`.
- **7 languages built in** (en, pt-BR, es, fr, de, zh-CN, ja). Every text can be overridden.
- **Themeable** with CSS custom properties, and **responsive**: the quiz adapts to tiny players on phones.

## Quick start (30 seconds)

```html
<div id="player"></div>

<script src="https://cdn.jsdelivr.net/npm/@quizplayer/core@0/dist/quizplayer.min.js"></script>
<script>
  QuizPlayer.create('#player', {
    src: '/videos/lesson-1.mp4',
    quizzes: [
      {
        id: 'q1',
        time: 42, // seconds
        question: 'Which protocol does HTTPS add on top of HTTP?',
        options: [
          { id: 'a', text: 'FTP' },
          { id: 'b', text: 'TLS' },
        ],
        correct: 'b',
        explanation: 'HTTPS is HTTP over TLS.',
      },
    ],
    onAnswer: ({ record }) => console.log(record),
  });
</script>
```

## Packages

| Package | Install | For |
| --- | --- | --- |
| [`@quizplayer/core`](packages/core) | `npm i @quizplayer/core` or the CDN `<script>` | Vanilla JS, Svelte, Angular, Alpine, Blade, any HTML |
| [`@quizplayer/react`](packages/react) | `npm i @quizplayer/react` | React 17+ / Next.js |
| [`@quizplayer/vue`](packages/vue) | `npm i @quizplayer/vue` | Vue 3 / Nuxt |
| [`@quizplayer/server`](packages/node) | `npm i @quizplayer/server` | Node.js: Express, Next.js, Hono, Bun, Deno |
| [`quizplayer/quizplayer`](php) | `composer require quizplayer/quizplayer` | PHP 8.1+, Laravel, Symfony, WordPress |
| [`quizplayer/go`](go) | `go get github.com/IrvingSamuel/quizplayer/go` | Go `net/http`, chi, gin, echo |

---

## Frontend

### Plain HTML / server-side templates (no JavaScript to write)

Every `[data-quizplayer]` element is initialized automatically by the CDN bundle. This works the same in Blade, Twig, Jinja/Django, ERB, Go `html/template`, Thymeleaf…

```html
<div data-quizplayer
     data-src="/videos/lesson-1.mp4"
     data-video-id="lesson-1"
     data-endpoint="/api/quizplayer"
     data-locale="pt-BR"
     data-prevent-skip="true">
  <script type="application/json">
    [{ "id": "q1", "time": 42, "question": "…", "options": [{ "id": "a", "text": "…" }, { "id": "b", "text": "…" }] }]
  </script>
</div>
<script src="https://cdn.jsdelivr.net/npm/@quizplayer/core@0/dist/quizplayer.min.js" defer></script>
```

Supported attributes: `data-src`, `data-poster`, `data-video-id`, `data-endpoint`, `data-locale`, `data-prevent-skip`, `data-replay-on-rewind`, `data-auto-continue` (ms), `data-sounds`, `data-fill`, `data-muted`, `data-autoplay`, `data-quizzes` (JSON or `#id` of a JSON `<script>`) and `data-options` (JSON with any other option).

You can also wrap an existing `<video>`: `QuizPlayer.create(document.querySelector('video'), { quizzes })`.

### ES modules / bundlers

```js
import { QuizPlayer } from '@quizplayer/core';

const player = QuizPlayer.create('#player', { src, quizzes, locale: 'es' });
player.on('answer', ({ quiz, record, result }) => { /* … */ });
```

### React

```tsx
import { QuizPlayer } from '@quizplayer/react';

export function Lesson({ lesson }) {
  return (
    <QuizPlayer
      src={lesson.videoUrl}
      quizzes={lesson.quizzes}
      videoId={lesson.id}
      endpoint="/api/quizplayer"
      preventSkip
      onComplete={(results) => console.log(results.score)}
    />
  );
}
```

The `ref` exposes the `QuizPlayer` instance, and there is also a `useQuizPlayer(options)` hook. See [examples/react-vite](examples/react-vite).

### Vue 3

```vue
<script setup>
import { QuizPlayer } from '@quizplayer/vue';
</script>

<template>
  <QuizPlayer :src="lesson.videoUrl" :quizzes="lesson.quizzes" :video-id="lesson.id"
              endpoint="/api/quizplayer" prevent-skip @complete="onComplete" />
</template>
```

Events: `ready`, `quizshow`, `answer`, `continue`, `complete`, `seekblocked`, `error`. You can register it globally with `app.use(QuizPlayerPlugin)`. See [examples/vue-vite](examples/vue-vite).

### Laravel Blade

```blade
<x-quizplayer :src="$lesson->video_url" :quizzes="$lesson->quizzes" :video-id="$lesson->id" prevent-skip />
```

See [Laravel backend](#php--laravel) below. The component strips the answers and wires the endpoint for you.

### Svelte, Angular, Solid, Alpine, htmx…

Use the core directly: `QuizPlayer.create(element, options)` on mount and `player.destroy()` on unmount.

---

## Backend

The player talks to your server through a [tiny JSON protocol](spec/protocol.md):

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `{endpoint}/answer` | Validate an answer, store it and return `{ correct, correctOptionId, explanation }` |
| `GET` | `{endpoint}/answers?videoId=` | Previous answers of the current user (resume) |
| `GET` | `{endpoint}/quizzes?videoId=` | Quizzes **without** answers (optional) |
| `GET` | `{endpoint}/results?videoId=` | Score summary (optional) |

The user's identity comes from your own session or token, so the protocol never deals with authentication.

### Node.js (Express, Next.js, Hono, Bun, Deno)

```js
import express from 'express';
import { createNodeHandler } from '@quizplayer/server';

app.use('/api/quizplayer', express.json(), createNodeHandler({
  getQuizzes: (videoId) => db.lessons.quizzes(videoId), // with right answers
  getUserId: (req) => req.session.userId,
  store: myAnswerStore, // { save(answer), list(videoId, userId) }; defaults to in-memory
}));
```

Fetch-API runtimes (Next.js route handlers, Hono, Bun, Deno, Cloudflare Workers):

```ts
// app/api/quizplayer/[...path]/route.ts
import { createFetchHandler } from '@quizplayer/server';
const handler = createFetchHandler({ getQuizzes, getUserId }, '/api/quizplayer');
export { handler as GET, handler as POST };
```

### PHP / Laravel

**Laravel.** The package is auto-discovered and registers routes, the Blade component, config and migration:

```bash
composer require quizplayer/quizplayer
php artisan vendor:publish --tag=quizplayer && php artisan migrate
```

```php
// config/quizplayer.php
'quizzes' => App\QuizPlayer\LessonQuizzes::class, // implements QuizPlayer\Laravel\QuizProvider
```

Full guide: [examples/laravel](examples/laravel).

**Plain PHP, Symfony, Slim, WordPress…**

```php
use QuizPlayer\Server;
use QuizPlayer\Store\PdoStore;

$server = new Server(
    getQuizzes: fn (string $videoId) => $repo->quizzesFor($videoId),
    store: new PdoStore($pdo),             // MySQL, PostgreSQL, SQLite, SQL Server
    getUserId: fn () => $_SESSION['user_id'] ?? null,
);
$server->respond('/api/quizplayer');       // or $server->handle($method, $path, $query, $body)

echo QuizPlayer\Html::render(['src' => '/lesson.mp4', 'quizzes' => $quizzes, 'endpoint' => '/api/quizplayer']);
```

### Go

```go
import quizplayer "github.com/IrvingSamuel/quizplayer/go"

h := quizplayer.NewHandler(quizplayer.Config{
    Quizzes: func(r *http.Request, videoID string) ([]quizplayer.Quiz, error) { return repo.Quizzes(videoID) },
    Store:   myStore, // implements quizplayer.Store; defaults to NewMemoryStore()
    UserID:  func(r *http.Request) string { return session.UserID(r) },
})
http.Handle("/api/quizplayer/", http.StripPrefix("/api/quizplayer", h))
```

### Python, Ruby, Java, .NET, Rust…

Implement `POST /answer` following [spec/protocol.md](spec/protocol.md); `GET /answers` is optional. Contributions of official SDKs are very welcome.

---

## Quiz format

```jsonc
{
  "id": "q1",                 // stable id: answers are stored by it
  "time": 42.5,               // seconds ("1:30" also accepted)
  "question": "…",
  "options": [{ "id": "a", "text": "…" }, { "id": "b", "text": "…" }],
  "correct": "b",             // omit for surveys, or when the server validates
  "explanation": "…",         // optional, shown after answering
  "audioUrl": "…/narration.mp3" // optional, played while the quiz is open
}
```

`normalizeQuizzes()` (JS), `Quizzes::normalize()` (PHP) and `quizplayer.Normalize()` (Go) also accept shorthand formats: `options: ["A", "B"]` with `correct: 1`, legacy `[text, isCorrect]` tuples, and `point` / `title` / `answers` keys. JSON Schema: [spec/quiz.schema.json](spec/quiz.schema.json).

## Options

| Option | Default | Description |
| --- | --- | --- |
| `src` | — | Video URL or `[{ src, type }]` list |
| `quizzes` | `[]` | Quizzes (array or JSON string) |
| `videoId` | — | Sent to your backend with every answer |
| `endpoint` | — | Base URL of a backend implementing the protocol (server validation) |
| `locale` | `<html lang>` | `en`, `pt-BR`, `es`, `fr`, `de`, `zh-CN`, `ja` |
| `messages` | — | Override any UI text |
| `preventSkip` | `false` | Block seeking past the first unanswered quiz |
| `autoContinueMs` | `3000` | Resume automatically after answering (`0` = wait for click) |
| `replayOnRewind` | `false` | Show quizzes again when rewinding before them |
| `askAgainSeconds` | `5` | Countdown of the "already answered" prompt |
| `previousAnswers` | — | Answers to restore (instead of `GET /answers`) |
| `sounds` | `true` | `false`, or `{ cue, correct, wrong, volume }` with URLs to replace the synthesized sounds |
| `headers` | — | Extra request headers (object or function), e.g. `Authorization` |
| `csrfMeta` | `'csrf-token'` | `<meta>` read for the `X-CSRF-TOKEN` header (`false` to disable) |
| `validateAnswer` | — | Custom async validator (GraphQL, Firebase…) |
| `loadAnswers` | — | Custom async loader for previous answers |
| `poster`, `autoplay`, `muted`, `crossOrigin` | — | Native video attributes |
| `fill` | `false` | Fill the parent height instead of 16:9 |
| `markers` | `true` | Show quiz markers on the progress bar |
| `injectStyles` | `true` | Inject the default CSS (or import `@quizplayer/core/style.css`) |

## Events & methods

```js
const off = player.on('answer', ({ quiz, record, result }) => {});
// events: ready · quizshow · answer · continue · complete · seekblocked · error
// or callbacks: onReady, onQuizShow, onAnswer, onContinue, onComplete, onSeekBlocked, onError

player.play(); player.pause(); player.seek(30);
player.getResults();   // { total, answered, correct, score, answers }
player.getAnswers(); player.getQuizzes(); player.setQuizzes(list);
player.showQuiz('q1'); player.reset(); player.destroy();
player.video;          // the underlying <video> element
```

## Theming

```css
.qp-root {
  --qp-primary: #7c3aed;      /* buttons, progress, highlights */
  --qp-surface: #111827;      /* quiz card */
  --qp-radius: 16px;
  --qp-font: "Inter", sans-serif;
}
```

Other variables: `--qp-primary-contrast`, `--qp-bg`, `--qp-surface-2`, `--qp-border`, `--qp-text`, `--qp-muted`, `--qp-success`, `--qp-danger`.

## Keyboard

| Key | Action |
| --- | --- |
| `Space` / `K` | Play / pause |
| `←` / `→` | Seek −5 s / +5 s (`Shift` = 10 s on the progress bar) |
| `F` / `M` | Fullscreen / mute |
| `↑` `↓` | Move between answers (inside a quiz) |
| `Tab` | Focus stays inside the quiz until it is answered |

## Security notes

- When an `endpoint` is set, **do not put `correct` in the page**. Use `stripAnswers()`, `Quizzes::strip()` or `quizplayer.Strip()`; `Html::render()` and `<x-quizplayer>` do this automatically.
- Servers must ignore any `correct` field sent by the client. All official SDKs do.
- The skip guard and the client-side checks improve the viewing experience, but they are not DRM. Anything that runs in the browser can be bypassed.

## Browser support

Chrome / Edge 111+, Firefox 113+ and Safari 16.2+ (desktop, iOS and Android). Any format the browser can play works: MP4/H.264, WebM, HLS on Safari, or HLS/DASH elsewhere by attaching hls.js or dash.js to `player.video`.

## Roadmap

- [ ] YouTube and Vimeo adapters
- [ ] Multiple-answer and free-text questions
- [ ] Svelte and Angular wrappers
- [ ] Python (Django/FastAPI) and Ruby (Rails) SDKs
- [ ] WordPress plugin
- [ ] Visual quiz editor (timeline)
- [ ] xAPI / SCORM statements

Have an idea? [Open a discussion](https://github.com/IrvingSamuel/quizplayer/discussions) or [an issue](https://github.com/IrvingSamuel/quizplayer/issues).

## Development

```bash
git clone https://github.com/IrvingSamuel/quizplayer && cd quizplayer
npm install && npm run build && npm test     # JS/TS packages
composer install && vendor/bin/phpunit       # PHP + Laravel
cd go && go test ./...                       # Go
npm run demo                                 # demo on http://localhost:3000
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Support the project

If QuizPlayer saves you time, **please give it a ⭐ on GitHub**. Stars help other developers find the project.

[![Star History Chart](https://api.star-history.com/svg?repos=IrvingSamuel/quizplayer&type=Date)](https://star-history.com/#IrvingSamuel/quizplayer&Date)

## License

[MIT](LICENSE) © Irving Samuel
