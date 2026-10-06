<div align="center">

# ▶ QuizPlayer

**Vídeos que pausam, apitam e perguntam.**
Um player de vídeo HTML5 open source com quizzes embutidos que funciona com **qualquer frontend** e **qualquer backend**.

[English](../README.md) · **Português** · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md)

[![CI](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml/badge.svg)](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
![Zero dependências](https://img.shields.io/badge/dependencies-0-brightgreen)
![Tamanho](https://img.shields.io/badge/core-~14%20kB%20gzip-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)
![PHP](https://img.shields.io/badge/PHP-8.1%2B-777bb4)
![Go](https://img.shields.io/badge/Go-1.21%2B-00add8)
[![Estrelas no GitHub](https://img.shields.io/github/stars/IrvingSamuel/quizplayer?style=social)](https://github.com/IrvingSamuel/quizplayer/stargazers)

[**Demo ao vivo**](https://irvingsamuel.github.io/quizplayer/) · [Exemplos](../examples) · [Especificação do protocolo](../spec/protocol.md)

<img src="assets/demo.gif" alt="Demonstração do QuizPlayer: o vídeo pausa em um ponto marcado, uma pergunta aparece, o espectador responde e recebe feedback instantâneo" width="720">

</div>

---

## Por que o QuizPlayer?

Vídeos interativos aumentam a atenção e a retenção, mas a maioria das soluções são produtos SaaS pagos, prendem você a um único framework ou verificam a resposta certa no navegador, onde qualquer pessoa pode lê-la.

O QuizPlayer é diferente:

- **Pausa → bipe → pergunta.** O vídeo para exatamente no segundo que você escolher, toca um bipe curto sintetizado e mostra a pergunta. Sem arquivos de áudio, sem chamadas de rede.
- **Qualquer frontend.** Um core sem dependências (~14 kB gzip) mais componentes oficiais para **React** e **Vue**. **Blade, Twig, Django, Rails e templates Go** funcionam com atributos HTML simples, assim como qualquer outro framework.
- **Qualquer backend.** Um [protocolo JSON](../spec/protocol.md) minúsculo com SDKs oficiais para **PHP/Laravel**, **Go** e **Node.js** (Express, Next.js, Hono, Bun, Deno). Outras linguagens podem implementá-lo em cerca de 50 linhas.
- **Resistente a trapaças.** Com um `endpoint`, as respostas certas nunca chegam à página: o servidor valida e armazena cada resposta.
- **Bloqueio de avanço.** Opcionalmente, impede avançar o vídeo além de uma pergunta que ainda não foi respondida.
- **Retomada.** As respostas anteriores são restauradas, e o espectador é perguntado se deseja *"responder novamente?"*.
- **Acessível.** Navegação por teclado, focus trap, regiões ARIA live e `prefers-reduced-motion`.
- **7 idiomas integrados** (en, pt-BR, es, fr, de, zh-CN, ja). Todos os textos podem ser sobrescritos.
- **Personalizável** com CSS custom properties e **responsivo**: o quiz se adapta a players pequenos em celulares.

## Início rápido (30 segundos)

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

## Pacotes

| Pacote | Instalação | Para |
| --- | --- | --- |
| [`@quizplayer/core`](../packages/core) | `npm i @quizplayer/core` ou o `<script>` da CDN | Vanilla JS, Svelte, Angular, Alpine, Blade, qualquer HTML |
| [`@quizplayer/react`](../packages/react) | `npm i @quizplayer/react` | React 17+ / Next.js |
| [`@quizplayer/vue`](../packages/vue) | `npm i @quizplayer/vue` | Vue 3 / Nuxt |
| [`@quizplayer/server`](../packages/node) | `npm i @quizplayer/server` | Node.js: Express, Next.js, Hono, Bun, Deno |
| [`quizplayer/quizplayer`](../php) | `composer require quizplayer/quizplayer` | PHP 8.1+, Laravel, Symfony, WordPress |
| [`quizplayer/go`](../go) | `go get github.com/IrvingSamuel/quizplayer/go` | Go `net/http`, chi, gin, echo |

---

## Frontend

### HTML puro / templates server-side (sem escrever JavaScript)

Todo elemento `[data-quizplayer]` é inicializado automaticamente pelo bundle da CDN. Isso funciona da mesma forma em Blade, Twig, Jinja/Django, ERB, Go `html/template`, Thymeleaf…

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

Atributos suportados: `data-src`, `data-poster`, `data-video-id`, `data-endpoint`, `data-locale`, `data-prevent-skip`, `data-replay-on-rewind`, `data-auto-continue` (ms), `data-sounds`, `data-fill`, `data-muted`, `data-autoplay`, `data-quizzes` (JSON ou o `#id` de um `<script>` JSON) e `data-options` (JSON com qualquer outra opção).

Você também pode envolver um `<video>` existente: `QuizPlayer.create(document.querySelector('video'), { quizzes })`.

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

A `ref` expõe a instância de `QuizPlayer`, e também há um hook `useQuizPlayer(options)`. Veja [examples/react-vite](../examples/react-vite).

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

Eventos: `ready`, `quizshow`, `answer`, `continue`, `complete`, `seekblocked`, `error`. Você pode registrá-lo globalmente com `app.use(QuizPlayerPlugin)`. Veja [examples/vue-vite](../examples/vue-vite).

### Laravel Blade

```blade
<x-quizplayer :src="$lesson->video_url" :quizzes="$lesson->quizzes" :video-id="$lesson->id" prevent-skip />
```

Veja o [backend Laravel](#php--laravel) abaixo. O componente remove as respostas e configura o endpoint para você.

### Svelte, Angular, Solid, Alpine, htmx…

Use o core diretamente: `QuizPlayer.create(element, options)` na montagem e `player.destroy()` na desmontagem.

---

## Backend

O player se comunica com o seu servidor por meio de um [protocolo JSON minúsculo](../spec/protocol.md):

| Método | Caminho | Finalidade |
| --- | --- | --- |
| `POST` | `{endpoint}/answer` | Valida uma resposta, armazena-a e retorna `{ correct, correctOptionId, explanation }` |
| `GET` | `{endpoint}/answers?videoId=` | Respostas anteriores do usuário atual (retomada) |
| `GET` | `{endpoint}/quizzes?videoId=` | Quizzes **sem** as respostas (opcional) |
| `GET` | `{endpoint}/results?videoId=` | Resumo da pontuação (opcional) |

A identidade do usuário vem da sua própria sessão ou token, então o protocolo nunca lida com autenticação.

### Node.js (Express, Next.js, Hono, Bun, Deno)

```js
import express from 'express';
import { createNodeHandler } from '@quizplayer/server';

app.use('/api/quizplayer', express.json(), createNodeHandler({
  getQuizzes: (videoId) => db.lessons.quizzes(videoId), // com as respostas certas
  getUserId: (req) => req.session.userId,
  store: myAnswerStore, // { save(answer), list(videoId, userId) }; padrão: em memória
}));
```

Runtimes com Fetch API (route handlers do Next.js, Hono, Bun, Deno, Cloudflare Workers):

```ts
// app/api/quizplayer/[...path]/route.ts
import { createFetchHandler } from '@quizplayer/server';
const handler = createFetchHandler({ getQuizzes, getUserId }, '/api/quizplayer');
export { handler as GET, handler as POST };
```

### PHP / Laravel

**Laravel.** O pacote é descoberto automaticamente e registra as rotas, o componente Blade, a configuração e a migration:

```bash
composer require quizplayer/quizplayer
php artisan vendor:publish --tag=quizplayer && php artisan migrate
```

```php
// config/quizplayer.php
'quizzes' => App\QuizPlayer\LessonQuizzes::class, // implementa QuizPlayer\Laravel\QuizProvider
```

Guia completo: [examples/laravel](../examples/laravel).

**PHP puro, Symfony, Slim, WordPress…**

```php
use QuizPlayer\Server;
use QuizPlayer\Store\PdoStore;

$server = new Server(
    getQuizzes: fn (string $videoId) => $repo->quizzesFor($videoId),
    store: new PdoStore($pdo),             // MySQL, PostgreSQL, SQLite, SQL Server
    getUserId: fn () => $_SESSION['user_id'] ?? null,
);
$server->respond('/api/quizplayer');       // ou $server->handle($method, $path, $query, $body)

echo QuizPlayer\Html::render(['src' => '/lesson.mp4', 'quizzes' => $quizzes, 'endpoint' => '/api/quizplayer']);
```

### Go

```go
import quizplayer "github.com/IrvingSamuel/quizplayer/go"

h := quizplayer.NewHandler(quizplayer.Config{
    Quizzes: func(r *http.Request, videoID string) ([]quizplayer.Quiz, error) { return repo.Quizzes(videoID) },
    Store:   myStore, // implementa quizplayer.Store; padrão: NewMemoryStore()
    UserID:  func(r *http.Request) string { return session.UserID(r) },
})
http.Handle("/api/quizplayer/", http.StripPrefix("/api/quizplayer", h))
```

### Python, Ruby, Java, .NET, Rust…

Implemente `POST /answer` seguindo [spec/protocol.md](../spec/protocol.md); `GET /answers` é opcional. Contribuições de SDKs oficiais são muito bem-vindas.

---

## Formato do quiz

```jsonc
{
  "id": "q1",                 // id estável: as respostas são armazenadas por ele
  "time": 42.5,               // segundos ("1:30" também é aceito)
  "question": "…",
  "options": [{ "id": "a", "text": "…" }, { "id": "b", "text": "…" }],
  "correct": "b",             // omita em pesquisas ou quando o servidor faz a validação
  "explanation": "…",         // opcional, exibida após a resposta
  "audioUrl": "…/narration.mp3" // opcional, tocado enquanto o quiz está aberto
}
```

`normalizeQuizzes()` (JS), `Quizzes::normalize()` (PHP) e `quizplayer.Normalize()` (Go) também aceitam formatos abreviados: `options: ["A", "B"]` com `correct: 1`, tuplas legadas `[text, isCorrect]` e as chaves `point` / `title` / `answers`. JSON Schema: [spec/quiz.schema.json](../spec/quiz.schema.json).

## Opções

| Opção | Padrão | Descrição |
| --- | --- | --- |
| `src` | — | URL do vídeo ou lista `[{ src, type }]` |
| `quizzes` | `[]` | Quizzes (array ou string JSON) |
| `videoId` | — | Enviado ao seu backend junto com cada resposta |
| `endpoint` | — | URL base de um backend que implementa o protocolo (validação no servidor) |
| `locale` | `<html lang>` | `en`, `pt-BR`, `es`, `fr`, `de`, `zh-CN`, `ja` |
| `messages` | — | Sobrescreve qualquer texto da interface |
| `preventSkip` | `false` | Impede avançar além do primeiro quiz não respondido |
| `autoContinueMs` | `3000` | Retoma automaticamente após a resposta (`0` = aguarda o clique) |
| `replayOnRewind` | `false` | Mostra os quizzes novamente ao voltar para antes deles |
| `askAgainSeconds` | `5` | Contagem regressiva do aviso "já respondido" |
| `previousAnswers` | — | Respostas a restaurar (em vez de `GET /answers`) |
| `sounds` | `true` | `false`, ou `{ cue, correct, wrong, volume }` com URLs para substituir os sons sintetizados |
| `headers` | — | Cabeçalhos extras da requisição (objeto ou função), por exemplo `Authorization` |
| `csrfMeta` | `'csrf-token'` | `<meta>` lido para o cabeçalho `X-CSRF-TOKEN` (`false` para desativar) |
| `validateAnswer` | — | Validador assíncrono personalizado (GraphQL, Firebase…) |
| `loadAnswers` | — | Carregador assíncrono personalizado das respostas anteriores |
| `poster`, `autoplay`, `muted`, `crossOrigin` | — | Atributos nativos de vídeo |
| `fill` | `false` | Preenche a altura do elemento pai em vez de usar 16:9 |
| `markers` | `true` | Mostra marcadores dos quizzes na barra de progresso |
| `injectStyles` | `true` | Injeta o CSS padrão (ou importe `@quizplayer/core/style.css`) |

## Eventos e métodos

```js
const off = player.on('answer', ({ quiz, record, result }) => {});
// eventos: ready · quizshow · answer · continue · complete · seekblocked · error
// ou callbacks: onReady, onQuizShow, onAnswer, onContinue, onComplete, onSeekBlocked, onError

player.play(); player.pause(); player.seek(30);
player.getResults();   // { total, answered, correct, score, answers }
player.getAnswers(); player.getQuizzes(); player.setQuizzes(list);
player.showQuiz('q1'); player.reset(); player.destroy();
player.video;          // o elemento <video> subjacente
```

## Temas

```css
.qp-root {
  --qp-primary: #7c3aed;      /* botões, progresso, destaques */
  --qp-surface: #111827;      /* card do quiz */
  --qp-radius: 16px;
  --qp-font: "Inter", sans-serif;
}
```

Outras variáveis: `--qp-primary-contrast`, `--qp-bg`, `--qp-surface-2`, `--qp-border`, `--qp-text`, `--qp-muted`, `--qp-success`, `--qp-danger`.

## Teclado

| Tecla | Ação |
| --- | --- |
| `Space` / `K` | Reproduzir / pausar |
| `←` / `→` | Voltar 5 s / avançar 5 s (`Shift` = 10 s na barra de progresso) |
| `F` / `M` | Tela cheia / silenciar |
| `↑` `↓` | Navegar entre as respostas (dentro de um quiz) |
| `Tab` | O foco permanece dentro do quiz até que ele seja respondido |

## Notas de segurança

- Quando um `endpoint` estiver definido, **não coloque `correct` na página**. Use `stripAnswers()`, `Quizzes::strip()` ou `quizplayer.Strip()`; `Html::render()` e `<x-quizplayer>` fazem isso automaticamente.
- Os servidores devem ignorar qualquer campo `correct` enviado pelo cliente. Todos os SDKs oficiais fazem isso.
- O bloqueio de avanço e as verificações no lado do cliente melhoram a experiência de visualização, mas não são DRM. Qualquer coisa que roda no navegador pode ser contornada.

## Suporte a navegadores

Chrome / Edge 111+, Firefox 113+ e Safari 16.2+ (desktop, iOS e Android). Qualquer formato que o navegador consiga reproduzir funciona: MP4/H.264, WebM, HLS no Safari, ou HLS/DASH nos demais navegadores anexando hls.js ou dash.js a `player.video`.

## Roadmap

- [ ] Adaptadores para YouTube e Vimeo
- [ ] Perguntas de múltipla resposta e de texto livre
- [ ] Wrappers para Svelte e Angular
- [ ] SDKs para Python (Django/FastAPI) e Ruby (Rails)
- [ ] Plugin para WordPress
- [ ] Editor visual de quizzes (linha do tempo)
- [ ] Statements xAPI / SCORM

Tem uma ideia? [Abra uma discussão](https://github.com/IrvingSamuel/quizplayer/discussions) ou [uma issue](https://github.com/IrvingSamuel/quizplayer/issues).

## Desenvolvimento

```bash
git clone https://github.com/IrvingSamuel/quizplayer && cd quizplayer
npm install && npm run build && npm test     # pacotes JS/TS
composer install && vendor/bin/phpunit       # PHP + Laravel
cd go && go test ./...                       # Go
npm run demo                                 # demo em http://localhost:3000
```

Veja [CONTRIBUTING.md](../CONTRIBUTING.md).

## Apoie o projeto

Se o QuizPlayer economiza o seu tempo, **deixe uma ⭐ no GitHub**. As estrelas ajudam outros desenvolvedores a encontrar o projeto.

[![Gráfico do histórico de estrelas](https://api.star-history.com/svg?repos=IrvingSamuel/quizplayer&type=Date)](https://star-history.com/#IrvingSamuel/quizplayer&Date)

## Licença

[MIT](../LICENSE) © Irving Samuel
