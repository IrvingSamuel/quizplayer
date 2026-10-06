<div align="center">

# ▶ QuizPlayer

**Des vidéos qui se mettent en pause, émettent un bip et posent une question.**
Un lecteur vidéo HTML5 open source avec quiz intégrés, compatible avec **n'importe quel frontend** et **n'importe quel backend**.

[English](../README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · **Français** · [Deutsch](README.de.md) · [中文](README.zh-CN.md) · [日本語](README.ja.md)

[![CI](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml/badge.svg)](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Size](https://img.shields.io/badge/core-~14%20kB%20gzip-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)
![PHP](https://img.shields.io/badge/PHP-8.1%2B-777bb4)
![Go](https://img.shields.io/badge/Go-1.21%2B-00add8)
[![GitHub stars](https://img.shields.io/github/stars/IrvingSamuel/quizplayer?style=social)](https://github.com/IrvingSamuel/quizplayer/stargazers)

[**Démo en ligne**](https://irvingsamuel.github.io/quizplayer/) · [Exemples](../examples) · [Spécification du protocole](../spec/protocol.md)

<img src="assets/demo.gif" alt="Démo de QuizPlayer : la vidéo se met en pause à un point de repère, une question apparaît, le spectateur répond et reçoit un retour immédiat" width="720">

</div>

---

## Pourquoi QuizPlayer ?

La vidéo interactive améliore l'attention et la mémorisation, mais la plupart des solutions sont des SaaS payants, vous enferment dans un seul framework ou vérifient la bonne réponse dans le navigateur, où n'importe qui peut la lire.

QuizPlayer est différent :

- **Pause → bip → question.** La vidéo s'arrête à la seconde exacte que vous choisissez, joue un court bip synthétisé et affiche la question. Aucun fichier audio, aucun appel réseau.
- **N'importe quel frontend.** Un cœur sans dépendance (~14 kB gzip) ainsi que des composants officiels **React** et **Vue**. Les **templates Blade, Twig, Django, Rails et Go** fonctionnent avec de simples attributs HTML, tout comme n'importe quel autre framework.
- **N'importe quel backend.** Un [protocole JSON](../spec/protocol.md) minimaliste avec des SDK officiels pour **PHP/Laravel**, **Go** et **Node.js** (Express, Next.js, Hono, Bun, Deno). Les autres langages peuvent l'implémenter en une cinquantaine de lignes.
- **Résistant à la triche.** Avec un `endpoint`, les bonnes réponses n'atteignent jamais la page : le serveur valide et enregistre chaque réponse.
- **Protection contre le saut.** Empêchez, si vous le souhaitez, d'avancer au-delà d'une question à laquelle on n'a pas encore répondu.
- **Reprise.** Les réponses précédentes sont restaurées et le spectateur se voit demander s'il veut *« répondre à nouveau ? »*.
- **Accessible.** Navigation au clavier, piège de focus, régions ARIA live et `prefers-reduced-motion`.
- **7 langues intégrées** (en, pt-BR, es, fr, de, zh-CN, ja). Chaque texte peut être personnalisé.
- **Personnalisable** grâce aux propriétés CSS personnalisées, et **responsive** : le quiz s'adapte aux petits lecteurs sur mobile.

## Démarrage rapide (30 secondes)

```html
<div id="player"></div>

<script src="https://cdn.jsdelivr.net/npm/@quizplayer/core@0/dist/quizplayer.min.js"></script>
<script>
  QuizPlayer.create('#player', {
    src: '/videos/lesson-1.mp4',
    quizzes: [
      {
        id: 'q1',
        time: 42, // secondes
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

## Paquets

| Paquet | Installation | Pour |
| --- | --- | --- |
| [`@quizplayer/core`](../packages/core) | `npm i @quizplayer/core` ou le `<script>` CDN | Vanilla JS, Svelte, Angular, Alpine, Blade, tout HTML |
| [`@quizplayer/react`](../packages/react) | `npm i @quizplayer/react` | React 17+ / Next.js |
| [`@quizplayer/vue`](../packages/vue) | `npm i @quizplayer/vue` | Vue 3 / Nuxt |
| [`@quizplayer/server`](../packages/node) | `npm i @quizplayer/server` | Node.js : Express, Next.js, Hono, Bun, Deno |
| [`quizplayer/quizplayer`](../php) | `composer require quizplayer/quizplayer` | PHP 8.1+, Laravel, Symfony, WordPress |
| [`quizplayer/go`](../go) | `go get github.com/IrvingSamuel/quizplayer/go` | Go `net/http`, chi, gin, echo |

---

## Frontend

### HTML simple / templates côté serveur (aucun JavaScript à écrire)

Chaque élément `[data-quizplayer]` est initialisé automatiquement par le bundle CDN. Cela fonctionne de la même façon avec Blade, Twig, Jinja/Django, ERB, Go `html/template`, Thymeleaf…

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

Attributs pris en charge : `data-src`, `data-poster`, `data-video-id`, `data-endpoint`, `data-locale`, `data-prevent-skip`, `data-replay-on-rewind`, `data-auto-continue` (ms), `data-sounds`, `data-fill`, `data-muted`, `data-autoplay`, `data-quizzes` (JSON ou `#id` d'un `<script>` JSON) et `data-options` (JSON contenant n'importe quelle autre option).

Vous pouvez aussi envelopper un `<video>` existant : `QuizPlayer.create(document.querySelector('video'), { quizzes })`.

### Modules ES / bundlers

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

La `ref` expose l'instance `QuizPlayer`, et un hook `useQuizPlayer(options)` est également disponible. Voir [examples/react-vite](../examples/react-vite).

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

Événements : `ready`, `quizshow`, `answer`, `continue`, `complete`, `seekblocked`, `error`. Vous pouvez l'enregistrer globalement avec `app.use(QuizPlayerPlugin)`. Voir [examples/vue-vite](../examples/vue-vite).

### Laravel Blade

```blade
<x-quizplayer :src="$lesson->video_url" :quizzes="$lesson->quizzes" :video-id="$lesson->id" prevent-skip />
```

Voir [Backend Laravel](#php--laravel) ci-dessous. Le composant retire les réponses et configure l'endpoint pour vous.

### Svelte, Angular, Solid, Alpine, htmx…

Utilisez directement le cœur : `QuizPlayer.create(element, options)` au montage et `player.destroy()` au démontage.

---

## Backend

Le lecteur communique avec votre serveur via un [protocole JSON minimaliste](../spec/protocol.md) :

| Méthode | Chemin | Rôle |
| --- | --- | --- |
| `POST` | `{endpoint}/answer` | Valide une réponse, l'enregistre et renvoie `{ correct, correctOptionId, explanation }` |
| `GET` | `{endpoint}/answers?videoId=` | Réponses précédentes de l'utilisateur courant (reprise) |
| `GET` | `{endpoint}/quizzes?videoId=` | Quiz **sans** les réponses (facultatif) |
| `GET` | `{endpoint}/results?videoId=` | Résumé du score (facultatif) |

L'identité de l'utilisateur provient de votre propre session ou de votre jeton : le protocole ne gère donc jamais l'authentification.

### Node.js (Express, Next.js, Hono, Bun, Deno)

```js
import express from 'express';
import { createNodeHandler } from '@quizplayer/server';

app.use('/api/quizplayer', express.json(), createNodeHandler({
  getQuizzes: (videoId) => db.lessons.quizzes(videoId), // avec les bonnes réponses
  getUserId: (req) => req.session.userId,
  store: myAnswerStore, // { save(answer), list(videoId, userId) } ; en mémoire par défaut
}));
```

Runtimes basés sur l'API Fetch (route handlers Next.js, Hono, Bun, Deno, Cloudflare Workers) :

```ts
// app/api/quizplayer/[...path]/route.ts
import { createFetchHandler } from '@quizplayer/server';
const handler = createFetchHandler({ getQuizzes, getUserId }, '/api/quizplayer');
export { handler as GET, handler as POST };
```

### PHP / Laravel

**Laravel.** Le paquet est découvert automatiquement et enregistre les routes, le composant Blade, la configuration et la migration :

```bash
composer require quizplayer/quizplayer
php artisan vendor:publish --tag=quizplayer && php artisan migrate
```

```php
// config/quizplayer.php
'quizzes' => App\QuizPlayer\LessonQuizzes::class, // implémente QuizPlayer\Laravel\QuizProvider
```

Guide complet : [examples/laravel](../examples/laravel).

**PHP pur, Symfony, Slim, WordPress…**

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
    Store:   myStore, // implémente quizplayer.Store ; NewMemoryStore() par défaut
    UserID:  func(r *http.Request) string { return session.UserID(r) },
})
http.Handle("/api/quizplayer/", http.StripPrefix("/api/quizplayer", h))
```

### Python, Ruby, Java, .NET, Rust…

Implémentez `POST /answer` en suivant [spec/protocol.md](../spec/protocol.md) ; `GET /answers` est facultatif. Les contributions de SDK officiels sont les bienvenues.

---

## Format des quiz

```jsonc
{
  "id": "q1",                 // identifiant stable : les réponses sont enregistrées selon celui-ci
  "time": 42.5,               // secondes ("1:30" est également accepté)
  "question": "…",
  "options": [{ "id": "a", "text": "…" }, { "id": "b", "text": "…" }],
  "correct": "b",             // à omettre pour les sondages, ou quand le serveur valide
  "explanation": "…",         // facultatif, affiché après la réponse
  "audioUrl": "…/narration.mp3" // facultatif, joué pendant que le quiz est ouvert
}
```

`normalizeQuizzes()` (JS), `Quizzes::normalize()` (PHP) et `quizplayer.Normalize()` (Go) acceptent aussi des formats abrégés : `options: ["A", "B"]` avec `correct: 1`, les anciens tuples `[text, isCorrect]` et les clés `point` / `title` / `answers`. JSON Schema : [spec/quiz.schema.json](../spec/quiz.schema.json).

## Options

| Option | Valeur par défaut | Description |
| --- | --- | --- |
| `src` | — | URL de la vidéo ou liste `[{ src, type }]` |
| `quizzes` | `[]` | Quiz (tableau ou chaîne JSON) |
| `videoId` | — | Envoyé à votre backend avec chaque réponse |
| `endpoint` | — | URL de base d'un backend implémentant le protocole (validation côté serveur) |
| `locale` | `<html lang>` | `en`, `pt-BR`, `es`, `fr`, `de`, `zh-CN`, `ja` |
| `messages` | — | Remplace n'importe quel texte de l'interface |
| `preventSkip` | `false` | Empêche d'avancer au-delà du premier quiz sans réponse |
| `autoContinueMs` | `3000` | Reprend automatiquement la lecture après la réponse (`0` = attendre un clic) |
| `replayOnRewind` | `false` | Réaffiche les quiz lorsqu'on revient avant eux |
| `askAgainSeconds` | `5` | Compte à rebours de l'invite « déjà répondu » |
| `previousAnswers` | — | Réponses à restaurer (au lieu de `GET /answers`) |
| `sounds` | `true` | `false`, ou `{ cue, correct, wrong, volume }` avec des URL pour remplacer les sons synthétisés |
| `headers` | — | En-têtes de requête supplémentaires (objet ou fonction), p. ex. `Authorization` |
| `csrfMeta` | `'csrf-token'` | `<meta>` lue pour l'en-tête `X-CSRF-TOKEN` (`false` pour désactiver) |
| `validateAnswer` | — | Validateur asynchrone personnalisé (GraphQL, Firebase…) |
| `loadAnswers` | — | Chargeur asynchrone personnalisé pour les réponses précédentes |
| `poster`, `autoplay`, `muted`, `crossOrigin` | — | Attributs vidéo natifs |
| `fill` | `false` | Occupe toute la hauteur du parent au lieu du 16:9 |
| `markers` | `true` | Affiche les marqueurs de quiz sur la barre de progression |
| `injectStyles` | `true` | Injecte le CSS par défaut (ou importez `@quizplayer/core/style.css`) |

## Événements et méthodes

```js
const off = player.on('answer', ({ quiz, record, result }) => {});
// événements : ready · quizshow · answer · continue · complete · seekblocked · error
// ou callbacks : onReady, onQuizShow, onAnswer, onContinue, onComplete, onSeekBlocked, onError

player.play(); player.pause(); player.seek(30);
player.getResults();   // { total, answered, correct, score, answers }
player.getAnswers(); player.getQuizzes(); player.setQuizzes(list);
player.showQuiz('q1'); player.reset(); player.destroy();
player.video;          // l'élément <video> sous-jacent
```

## Thèmes

```css
.qp-root {
  --qp-primary: #7c3aed;      /* boutons, progression, mises en évidence */
  --qp-surface: #111827;      /* carte du quiz */
  --qp-radius: 16px;
  --qp-font: "Inter", sans-serif;
}
```

Autres variables : `--qp-primary-contrast`, `--qp-bg`, `--qp-surface-2`, `--qp-border`, `--qp-text`, `--qp-muted`, `--qp-success`, `--qp-danger`.

## Clavier

| Touche | Action |
| --- | --- |
| `Space` / `K` | Lecture / pause |
| `←` / `→` | Reculer de 5 s / avancer de 5 s (`Shift` = 10 s sur la barre de progression) |
| `F` / `M` | Plein écran / couper le son |
| `↑` `↓` | Passer d'une réponse à l'autre (dans un quiz) |
| `Tab` | Le focus reste dans le quiz tant qu'on n'y a pas répondu |

## Notes de sécurité

- Lorsqu'un `endpoint` est défini, **ne mettez pas `correct` dans la page**. Utilisez `stripAnswers()`, `Quizzes::strip()` ou `quizplayer.Strip()` ; `Html::render()` et `<x-quizplayer>` le font automatiquement.
- Les serveurs doivent ignorer tout champ `correct` envoyé par le client. Tous les SDK officiels le font.
- La protection contre le saut et les vérifications côté client améliorent l'expérience de visionnage, mais ce ne sont pas des DRM. Tout ce qui s'exécute dans le navigateur peut être contourné.

## Navigateurs pris en charge

Chrome / Edge 111+, Firefox 113+ et Safari 16.2+ (ordinateur, iOS et Android). Tout format lisible par le navigateur fonctionne : MP4/H.264, WebM, HLS sur Safari, ou HLS/DASH ailleurs en associant hls.js ou dash.js à `player.video`.

## Feuille de route

- [ ] Adaptateurs YouTube et Vimeo
- [ ] Questions à réponses multiples et à texte libre
- [ ] Wrappers Svelte et Angular
- [ ] SDK Python (Django/FastAPI) et Ruby (Rails)
- [ ] Plugin WordPress
- [ ] Éditeur visuel de quiz (timeline)
- [ ] Déclarations xAPI / SCORM

Une idée ? [Ouvrez une discussion](https://github.com/IrvingSamuel/quizplayer/discussions) ou [une issue](https://github.com/IrvingSamuel/quizplayer/issues).

## Développement

```bash
git clone https://github.com/IrvingSamuel/quizplayer && cd quizplayer
npm install && npm run build && npm test     # paquets JS/TS
composer install && vendor/bin/phpunit       # PHP + Laravel
cd go && go test ./...                       # Go
npm run demo                                 # démo sur http://localhost:3000
```

Voir [CONTRIBUTING.md](../CONTRIBUTING.md).

## Soutenir le projet

Si QuizPlayer vous fait gagner du temps, **merci de lui donner une ⭐ sur GitHub**. Les étoiles aident d'autres développeurs à découvrir le projet.

[![Star History Chart](https://api.star-history.com/svg?repos=IrvingSamuel/quizplayer&type=Date)](https://star-history.com/#IrvingSamuel/quizplayer&Date)

## Licence

[MIT](../LICENSE) © Irving Samuel
