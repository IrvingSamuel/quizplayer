<div align="center">

# ▶ QuizPlayer

**Videos que se pausan, emiten un pitido y preguntan.**
Un reproductor de video HTML5 de código abierto con cuestionarios integrados que funciona con **cualquier frontend** y **cualquier backend**.

[English](../README.md) · [Português](README.pt-BR.md) · **Español** · [Français](README.fr.md) · [Deutsch](README.de.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md)

[![CI](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml/badge.svg)](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Size](https://img.shields.io/badge/core-~14%20kB%20gzip-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)
![PHP](https://img.shields.io/badge/PHP-8.1%2B-777bb4)
![Go](https://img.shields.io/badge/Go-1.21%2B-00add8)
[![GitHub stars](https://img.shields.io/github/stars/IrvingSamuel/quizplayer?style=social)](https://github.com/IrvingSamuel/quizplayer/stargazers)

[**Demo en vivo**](https://irvingsamuel.github.io/quizplayer/) · [Ejemplos](../examples) · [Especificación del protocolo](../spec/protocol.md)

<img src="assets/demo.gif" alt="Demo de QuizPlayer: el video se pausa en un punto marcado, aparece una pregunta, el espectador responde y recibe retroalimentación al instante" width="720">

</div>

---

## ¿Por qué QuizPlayer?

El video interactivo aumenta la atención y la retención, pero la mayoría de las soluciones son productos SaaS de pago, te atan a un solo framework o verifican la respuesta correcta en el navegador, donde cualquiera puede leerla.

QuizPlayer es diferente:

- **Pausa → pitido → pregunta.** El video se detiene en el segundo exacto que elijas, reproduce un breve pitido sintetizado y muestra la pregunta. Sin archivos de audio ni llamadas de red.
- **Cualquier frontend.** Un núcleo sin dependencias (~14 kB gzip) más componentes oficiales para **React** y **Vue**. **Blade, Twig, Django, Rails y las plantillas de Go** funcionan con simples atributos HTML, al igual que cualquier otro framework.
- **Cualquier backend.** Un [protocolo JSON](../spec/protocol.md) minúsculo con SDK oficiales para **PHP/Laravel**, **Go** y **Node.js** (Express, Next.js, Hono, Bun, Deno). Otros lenguajes pueden implementarlo en unas 50 líneas.
- **Resistente a trampas.** Con un `endpoint`, las respuestas correctas nunca llegan a la página: el servidor valida y almacena cada respuesta.
- **Bloqueo de saltos.** Opcionalmente, impide avanzar más allá de una pregunta que aún no se ha respondido.
- **Reanudación.** Las respuestas anteriores se restauran y se le pregunta al espectador si quiere *"¿responder de nuevo?"*.
- **Accesible.** Navegación por teclado, captura del foco, regiones ARIA live y `prefers-reduced-motion`.
- **7 idiomas incluidos** (en, pt-BR, es, fr, de, zh-CN, ja). Todos los textos se pueden personalizar.
- **Personalizable** con propiedades personalizadas de CSS, y **adaptable**: el cuestionario se ajusta a reproductores diminutos en teléfonos.

## Inicio rápido (30 segundos)

```html
<div id="player"></div>

<script src="https://cdn.jsdelivr.net/npm/@quizplayer/core@0/dist/quizplayer.min.js"></script>
<script>
  QuizPlayer.create('#player', {
    src: '/videos/lesson-1.mp4',
    quizzes: [
      {
        id: 'q1',
        time: 42, // segundos
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

## Paquetes

| Paquete | Instalación | Para |
| --- | --- | --- |
| [`@quizplayer/core`](../packages/core) | `npm i @quizplayer/core` o el `<script>` del CDN | Vanilla JS, Svelte, Angular, Alpine, Blade, cualquier HTML |
| [`@quizplayer/react`](../packages/react) | `npm i @quizplayer/react` | React 17+ / Next.js |
| [`@quizplayer/vue`](../packages/vue) | `npm i @quizplayer/vue` | Vue 3 / Nuxt |
| [`@quizplayer/server`](../packages/node) | `npm i @quizplayer/server` | Node.js: Express, Next.js, Hono, Bun, Deno |
| [`quizplayer/quizplayer`](../php) | `composer require quizplayer/quizplayer` | PHP 8.1+, Laravel, Symfony, WordPress |
| [`quizplayer/go`](../go) | `go get github.com/IrvingSamuel/quizplayer/go` | Go `net/http`, chi, gin, echo |

---

## Frontend

### HTML simple / plantillas del lado del servidor (sin escribir JavaScript)

El bundle del CDN inicializa automáticamente cada elemento `[data-quizplayer]`. Funciona igual en Blade, Twig, Jinja/Django, ERB, Go `html/template`, Thymeleaf…

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

Atributos compatibles: `data-src`, `data-poster`, `data-video-id`, `data-endpoint`, `data-locale`, `data-prevent-skip`, `data-replay-on-rewind`, `data-auto-continue` (ms), `data-sounds`, `data-fill`, `data-muted`, `data-autoplay`, `data-quizzes` (JSON o el `#id` de un `<script>` JSON) y `data-options` (JSON con cualquier otra opción).

También puedes envolver un `<video>` existente: `QuizPlayer.create(document.querySelector('video'), { quizzes })`.

### Módulos ES / bundlers

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

La `ref` expone la instancia de `QuizPlayer`, y también hay un hook `useQuizPlayer(options)`. Consulta [examples/react-vite](../examples/react-vite).

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

Eventos: `ready`, `quizshow`, `answer`, `continue`, `complete`, `seekblocked`, `error`. Puedes registrarlo globalmente con `app.use(QuizPlayerPlugin)`. Consulta [examples/vue-vite](../examples/vue-vite).

### Laravel Blade

```blade
<x-quizplayer :src="$lesson->video_url" :quizzes="$lesson->quizzes" :video-id="$lesson->id" prevent-skip />
```

Consulta [Backend de Laravel](#php--laravel) más abajo. El componente elimina las respuestas y configura el endpoint por ti.

### Svelte, Angular, Solid, Alpine, htmx…

Usa el núcleo directamente: `QuizPlayer.create(element, options)` al montar y `player.destroy()` al desmontar.

---

## Backend

El reproductor se comunica con tu servidor mediante un [protocolo JSON minúsculo](../spec/protocol.md):

| Método | Ruta | Propósito |
| --- | --- | --- |
| `POST` | `{endpoint}/answer` | Valida una respuesta, la almacena y devuelve `{ correct, correctOptionId, explanation }` |
| `GET` | `{endpoint}/answers?videoId=` | Respuestas anteriores del usuario actual (reanudación) |
| `GET` | `{endpoint}/quizzes?videoId=` | Cuestionarios **sin** respuestas (opcional) |
| `GET` | `{endpoint}/results?videoId=` | Resumen de puntuación (opcional) |

La identidad del usuario proviene de tu propia sesión o token, por lo que el protocolo nunca se ocupa de la autenticación.

### Node.js (Express, Next.js, Hono, Bun, Deno)

```js
import express from 'express';
import { createNodeHandler } from '@quizplayer/server';

app.use('/api/quizplayer', express.json(), createNodeHandler({
  getQuizzes: (videoId) => db.lessons.quizzes(videoId), // con las respuestas correctas
  getUserId: (req) => req.session.userId,
  store: myAnswerStore, // { save(answer), list(videoId, userId) }; por defecto, en memoria
}));
```

Entornos de ejecución con Fetch API (route handlers de Next.js, Hono, Bun, Deno, Cloudflare Workers):

```ts
// app/api/quizplayer/[...path]/route.ts
import { createFetchHandler } from '@quizplayer/server';
const handler = createFetchHandler({ getQuizzes, getUserId }, '/api/quizplayer');
export { handler as GET, handler as POST };
```

### PHP / Laravel

**Laravel.** El paquete se descubre automáticamente y registra las rutas, el componente Blade, la configuración y la migración:

```bash
composer require quizplayer/quizplayer
php artisan vendor:publish --tag=quizplayer && php artisan migrate
```

```php
// config/quizplayer.php
'quizzes' => App\QuizPlayer\LessonQuizzes::class, // implementa QuizPlayer\Laravel\QuizProvider
```

Guía completa: [examples/laravel](../examples/laravel).

**PHP puro, Symfony, Slim, WordPress…**

```php
use QuizPlayer\Server;
use QuizPlayer\Store\PdoStore;

$server = new Server(
    getQuizzes: fn (string $videoId) => $repo->quizzesFor($videoId),
    store: new PdoStore($pdo),             // MySQL, PostgreSQL, SQLite, SQL Server
    getUserId: fn () => $_SESSION['user_id'] ?? null,
);
$server->respond('/api/quizplayer');       // o $server->handle($method, $path, $query, $body)

echo QuizPlayer\Html::render(['src' => '/lesson.mp4', 'quizzes' => $quizzes, 'endpoint' => '/api/quizplayer']);
```

### Go

```go
import quizplayer "github.com/IrvingSamuel/quizplayer/go"

h := quizplayer.NewHandler(quizplayer.Config{
    Quizzes: func(r *http.Request, videoID string) ([]quizplayer.Quiz, error) { return repo.Quizzes(videoID) },
    Store:   myStore, // implementa quizplayer.Store; por defecto, NewMemoryStore()
    UserID:  func(r *http.Request) string { return session.UserID(r) },
})
http.Handle("/api/quizplayer/", http.StripPrefix("/api/quizplayer", h))
```

### Python, Ruby, Java, .NET, Rust…

Implementa `POST /answer` siguiendo [spec/protocol.md](../spec/protocol.md); `GET /answers` es opcional. Las contribuciones de SDK oficiales son muy bienvenidas.

---

## Formato del cuestionario

```jsonc
{
  "id": "q1",                 // id estable: las respuestas se almacenan con él
  "time": 42.5,               // segundos (también se acepta "1:30")
  "question": "…",
  "options": [{ "id": "a", "text": "…" }, { "id": "b", "text": "…" }],
  "correct": "b",             // omítelo en encuestas o cuando el servidor valida
  "explanation": "…",         // opcional, se muestra después de responder
  "audioUrl": "…/narration.mp3" // opcional, se reproduce mientras el cuestionario está abierto
}
```

`normalizeQuizzes()` (JS), `Quizzes::normalize()` (PHP) y `quizplayer.Normalize()` (Go) también aceptan formatos abreviados: `options: ["A", "B"]` con `correct: 1`, tuplas heredadas `[text, isCorrect]` y las claves `point` / `title` / `answers`. JSON Schema: [spec/quiz.schema.json](../spec/quiz.schema.json).

## Opciones

| Opción | Valor por defecto | Descripción |
| --- | --- | --- |
| `src` | — | URL del video o lista `[{ src, type }]` |
| `quizzes` | `[]` | Cuestionarios (array o cadena JSON) |
| `videoId` | — | Se envía a tu backend con cada respuesta |
| `endpoint` | — | URL base de un backend que implementa el protocolo (validación en el servidor) |
| `locale` | `<html lang>` | `en`, `pt-BR`, `es`, `fr`, `de`, `zh-CN`, `ja` |
| `messages` | — | Personaliza cualquier texto de la interfaz |
| `preventSkip` | `false` | Impide avanzar más allá del primer cuestionario sin responder |
| `autoContinueMs` | `3000` | Reanuda automáticamente después de responder (`0` = esperar un clic) |
| `replayOnRewind` | `false` | Vuelve a mostrar los cuestionarios al retroceder antes de ellos |
| `askAgainSeconds` | `5` | Cuenta regresiva del aviso "ya respondido" |
| `previousAnswers` | — | Respuestas a restaurar (en lugar de `GET /answers`) |
| `sounds` | `true` | `false`, o `{ cue, correct, wrong, volume }` con URLs para reemplazar los sonidos sintetizados |
| `headers` | — | Encabezados adicionales de la solicitud (objeto o función), p. ej. `Authorization` |
| `csrfMeta` | `'csrf-token'` | `<meta>` que se lee para el encabezado `X-CSRF-TOKEN` (`false` para desactivarlo) |
| `validateAnswer` | — | Validador asíncrono personalizado (GraphQL, Firebase…) |
| `loadAnswers` | — | Cargador asíncrono personalizado de respuestas anteriores |
| `poster`, `autoplay`, `muted`, `crossOrigin` | — | Atributos nativos del video |
| `fill` | `false` | Ocupa toda la altura del contenedor padre en lugar de 16:9 |
| `markers` | `true` | Muestra marcadores de los cuestionarios en la barra de progreso |
| `injectStyles` | `true` | Inyecta el CSS predeterminado (o importa `@quizplayer/core/style.css`) |

## Eventos y métodos

```js
const off = player.on('answer', ({ quiz, record, result }) => {});
// eventos: ready · quizshow · answer · continue · complete · seekblocked · error
// o callbacks: onReady, onQuizShow, onAnswer, onContinue, onComplete, onSeekBlocked, onError

player.play(); player.pause(); player.seek(30);
player.getResults();   // { total, answered, correct, score, answers }
player.getAnswers(); player.getQuizzes(); player.setQuizzes(list);
player.showQuiz('q1'); player.reset(); player.destroy();
player.video;          // el elemento <video> subyacente
```

## Temas

```css
.qp-root {
  --qp-primary: #7c3aed;      /* botones, progreso, resaltados */
  --qp-surface: #111827;      /* tarjeta del cuestionario */
  --qp-radius: 16px;
  --qp-font: "Inter", sans-serif;
}
```

Otras variables: `--qp-primary-contrast`, `--qp-bg`, `--qp-surface-2`, `--qp-border`, `--qp-text`, `--qp-muted`, `--qp-success`, `--qp-danger`.

## Teclado

| Tecla | Acción |
| --- | --- |
| `Space` / `K` | Reproducir / pausar |
| `←` / `→` | Retroceder −5 s / avanzar +5 s (`Shift` = 10 s en la barra de progreso) |
| `F` / `M` | Pantalla completa / silenciar |
| `↑` `↓` | Moverse entre las respuestas (dentro de un cuestionario) |
| `Tab` | El foco permanece dentro del cuestionario hasta que se responde |

## Notas de seguridad

- Cuando se define un `endpoint`, **no pongas `correct` en la página**. Usa `stripAnswers()`, `Quizzes::strip()` o `quizplayer.Strip()`; `Html::render()` y `<x-quizplayer>` lo hacen automáticamente.
- Los servidores deben ignorar cualquier campo `correct` enviado por el cliente. Todos los SDK oficiales lo hacen.
- El bloqueo de saltos y las verificaciones del lado del cliente mejoran la experiencia de visualización, pero no son DRM. Todo lo que se ejecuta en el navegador puede eludirse.

## Compatibilidad con navegadores

Chrome / Edge 111+, Firefox 113+ y Safari 16.2+ (escritorio, iOS y Android). Funciona cualquier formato que el navegador pueda reproducir: MP4/H.264, WebM, HLS en Safari, o HLS/DASH en otros navegadores conectando hls.js o dash.js a `player.video`.

## Hoja de ruta

- [ ] Adaptadores para YouTube y Vimeo
- [ ] Preguntas de respuesta múltiple y de texto libre
- [ ] Wrappers para Svelte y Angular
- [ ] SDK para Python (Django/FastAPI) y Ruby (Rails)
- [ ] Plugin para WordPress
- [ ] Editor visual de cuestionarios (línea de tiempo)
- [ ] Sentencias xAPI / SCORM

¿Tienes una idea? [Abre una discusión](https://github.com/IrvingSamuel/quizplayer/discussions) o [un issue](https://github.com/IrvingSamuel/quizplayer/issues).

## Desarrollo

```bash
git clone https://github.com/IrvingSamuel/quizplayer && cd quizplayer
npm install && npm run build && npm test     # paquetes JS/TS
composer install && vendor/bin/phpunit       # PHP + Laravel
cd go && go test ./...                       # Go
npm run demo                                 # demo en http://localhost:3000
```

Consulta [CONTRIBUTING.md](../CONTRIBUTING.md).

## Apoya el proyecto

Si QuizPlayer te ahorra tiempo, **dale una ⭐ en GitHub**. Las estrellas ayudan a otros desarrolladores a encontrar el proyecto.

[![Star History Chart](https://api.star-history.com/svg?repos=IrvingSamuel/quizplayer&type=Date)](https://star-history.com/#IrvingSamuel/quizplayer&Date)

## Licencia

[MIT](../LICENSE) © Irving Samuel
