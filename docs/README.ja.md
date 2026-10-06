<div align="center">

# ▶ QuizPlayer

**一時停止して、ビープ音を鳴らして、問いかける動画。**
クイズを埋め込めるオープンソースの HTML5 動画プレーヤーです。**あらゆるフロントエンド**と**あらゆるバックエンド**で動作します。

[English](../README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [中文](README.zh-CN.md) · **日本語**

[![CI](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml/badge.svg)](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Size](https://img.shields.io/badge/core-~14%20kB%20gzip-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)
![PHP](https://img.shields.io/badge/PHP-8.1%2B-777bb4)
![Go](https://img.shields.io/badge/Go-1.21%2B-00add8)
[![GitHub stars](https://img.shields.io/github/stars/IrvingSamuel/quizplayer?style=social)](https://github.com/IrvingSamuel/quizplayer/stargazers)

[**ライブデモ**](https://irvingsamuel.github.io/quizplayer/) · [サンプル](../examples) · [プロトコル仕様](../spec/protocol.md)

<img src="assets/demo.gif" alt="QuizPlayer のデモ：動画がキューポイントで一時停止して問題が表示され、視聴者が回答するとすぐにフィードバックが返ります" width="720">

</div>

---

## なぜ QuizPlayer なのか？

インタラクティブな動画は視聴者の集中力と記憶の定着を高めます。しかし、既存のソリューションの多くは有料の SaaS だったり、特定のフレームワークに縛られていたり、正解の判定をブラウザ側で行うため誰でも答えを覗けてしまったりします。

QuizPlayer はそこが違います。

- **一時停止 → ビープ音 → 出題。** 指定した秒数ぴったりで動画が止まり、短い合成ビープ音を鳴らして問題を表示します。音声ファイルもネットワーク通信も不要です。
- **あらゆるフロントエンドに対応。** 依存ゼロのコア（gzip 後 約 14 kB）に加え、公式の **React** / **Vue** コンポーネントを提供しています。**Blade、Twig、Django、Rails、Go テンプレート**では素の HTML 属性だけで動作し、その他のフレームワークでも同様に使えます。
- **あらゆるバックエンドに対応。** 小さな [JSON プロトコル](../spec/protocol.md)と、**PHP/Laravel**、**Go**、**Node.js**（Express、Next.js、Hono、Bun、Deno）向けの公式 SDK を用意しています。その他の言語でも 50 行ほどで実装できます。
- **不正に強い設計。** `endpoint` を指定すると、正解がページに渡ることは一切ありません。すべての回答はサーバーが検証・保存します。
- **スキップ防止。** 未回答の問題より先へのシークをブロックすることもできます（任意）。
- **続きから再開。** 以前の回答が復元され、視聴者には *「もう一度回答しますか？」* と確認します。
- **アクセシビリティ対応。** キーボード操作、フォーカストラップ、ARIA ライブリージョン、`prefers-reduced-motion` に対応しています。
- **7 言語を標準搭載**（en、pt-BR、es、fr、de、zh-CN、ja）。すべてのテキストは上書きできます。
- CSS カスタムプロパティで**テーマを変更可能**、さらに**レスポンシブ**対応。スマートフォンの小さなプレーヤーにもクイズが適応します。

## クイックスタート（30 秒）

```html
<div id="player"></div>

<script src="https://cdn.jsdelivr.net/npm/@quizplayer/core@0/dist/quizplayer.min.js"></script>
<script>
  QuizPlayer.create('#player', {
    src: '/videos/lesson-1.mp4',
    quizzes: [
      {
        id: 'q1',
        time: 42, // 秒
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

## パッケージ

| パッケージ | インストール | 対象 |
| --- | --- | --- |
| [`@quizplayer/core`](../packages/core) | `npm i @quizplayer/core` または CDN の `<script>` | Vanilla JS、Svelte、Angular、Alpine、Blade、あらゆる HTML |
| [`@quizplayer/react`](../packages/react) | `npm i @quizplayer/react` | React 17+ / Next.js |
| [`@quizplayer/vue`](../packages/vue) | `npm i @quizplayer/vue` | Vue 3 / Nuxt |
| [`@quizplayer/server`](../packages/node) | `npm i @quizplayer/server` | Node.js：Express、Next.js、Hono、Bun、Deno |
| [`quizplayer/quizplayer`](../php) | `composer require quizplayer/quizplayer` | PHP 8.1+、Laravel、Symfony、WordPress |
| [`quizplayer/go`](../go) | `go get github.com/IrvingSamuel/quizplayer/go` | Go `net/http`、chi、gin、echo |

---

## フロントエンド

### 素の HTML / サーバーサイドテンプレート（JavaScript を書く必要なし）

CDN バンドルは、すべての `[data-quizplayer]` 要素を自動的に初期化します。Blade、Twig、Jinja/Django、ERB、Go の `html/template`、Thymeleaf などでも同じように動作します。

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

対応している属性：`data-src`、`data-poster`、`data-video-id`、`data-endpoint`、`data-locale`、`data-prevent-skip`、`data-replay-on-rewind`、`data-auto-continue`（ミリ秒）、`data-sounds`、`data-fill`、`data-muted`、`data-autoplay`、`data-quizzes`（JSON、または JSON を含む `<script>` の `#id`）、`data-options`（その他のオプションを含む JSON）。

既存の `<video>` をラップすることもできます：`QuizPlayer.create(document.querySelector('video'), { quizzes })`。

### ES モジュール / バンドラー

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

`ref` から `QuizPlayer` インスタンスにアクセスできます。また、`useQuizPlayer(options)` フックも用意しています。[examples/react-vite](../examples/react-vite) を参照してください。

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

イベント：`ready`、`quizshow`、`answer`、`continue`、`complete`、`seekblocked`、`error`。`app.use(QuizPlayerPlugin)` でグローバルに登録することもできます。[examples/vue-vite](../examples/vue-vite) を参照してください。

### Laravel Blade

```blade
<x-quizplayer :src="$lesson->video_url" :quizzes="$lesson->quizzes" :video-id="$lesson->id" prevent-skip />
```

後述の [Laravel バックエンド](#php--laravel)を参照してください。このコンポーネントが正解を取り除き、エンドポイントの接続も自動で行います。

### Svelte、Angular、Solid、Alpine、htmx など

コアを直接使用してください。マウント時に `QuizPlayer.create(element, options)`、アンマウント時に `player.destroy()` を呼び出します。

---

## バックエンド

プレーヤーは[小さな JSON プロトコル](../spec/protocol.md)を通じてサーバーと通信します。

| メソッド | パス | 用途 |
| --- | --- | --- |
| `POST` | `{endpoint}/answer` | 回答を検証・保存し、`{ correct, correctOptionId, explanation }` を返す |
| `GET` | `{endpoint}/answers?videoId=` | 現在のユーザーの過去の回答（再開用） |
| `GET` | `{endpoint}/quizzes?videoId=` | 正解を**含まない**クイズ（任意） |
| `GET` | `{endpoint}/results?videoId=` | スコアの集計（任意） |

ユーザーの識別には既存のセッションやトークンを使うため、プロトコル自体が認証を扱うことはありません。

### Node.js (Express, Next.js, Hono, Bun, Deno)

```js
import express from 'express';
import { createNodeHandler } from '@quizplayer/server';

app.use('/api/quizplayer', express.json(), createNodeHandler({
  getQuizzes: (videoId) => db.lessons.quizzes(videoId), // 正解を含む
  getUserId: (req) => req.session.userId,
  store: myAnswerStore, // { save(answer), list(videoId, userId) }。デフォルトはインメモリ
}));
```

Fetch API ベースのランタイム（Next.js の Route Handlers、Hono、Bun、Deno、Cloudflare Workers）の場合：

```ts
// app/api/quizplayer/[...path]/route.ts
import { createFetchHandler } from '@quizplayer/server';
const handler = createFetchHandler({ getQuizzes, getUserId }, '/api/quizplayer');
export { handler as GET, handler as POST };
```

### PHP / Laravel

**Laravel。** パッケージは自動検出され、ルート、Blade コンポーネント、設定ファイル、マイグレーションが登録されます。

```bash
composer require quizplayer/quizplayer
php artisan vendor:publish --tag=quizplayer && php artisan migrate
```

```php
// config/quizplayer.php
'quizzes' => App\QuizPlayer\LessonQuizzes::class, // QuizPlayer\Laravel\QuizProvider を実装
```

詳しいガイド：[examples/laravel](../examples/laravel)。

**素の PHP、Symfony、Slim、WordPress など**

```php
use QuizPlayer\Server;
use QuizPlayer\Store\PdoStore;

$server = new Server(
    getQuizzes: fn (string $videoId) => $repo->quizzesFor($videoId),
    store: new PdoStore($pdo),             // MySQL、PostgreSQL、SQLite、SQL Server
    getUserId: fn () => $_SESSION['user_id'] ?? null,
);
$server->respond('/api/quizplayer');       // または $server->handle($method, $path, $query, $body)

echo QuizPlayer\Html::render(['src' => '/lesson.mp4', 'quizzes' => $quizzes, 'endpoint' => '/api/quizplayer']);
```

### Go

```go
import quizplayer "github.com/IrvingSamuel/quizplayer/go"

h := quizplayer.NewHandler(quizplayer.Config{
    Quizzes: func(r *http.Request, videoID string) ([]quizplayer.Quiz, error) { return repo.Quizzes(videoID) },
    Store:   myStore, // quizplayer.Store を実装。デフォルトは NewMemoryStore()
    UserID:  func(r *http.Request) string { return session.UserID(r) },
})
http.Handle("/api/quizplayer/", http.StripPrefix("/api/quizplayer", h))
```

### Python、Ruby、Java、.NET、Rust など

[spec/protocol.md](../spec/protocol.md) に従って `POST /answer` を実装してください。`GET /answers` は任意です。公式 SDK のコントリビューションも大歓迎です。

---

## クイズのフォーマット

```jsonc
{
  "id": "q1",                 // 安定した ID：回答はこの ID で保存されます
  "time": 42.5,               // 秒（"1:30" 形式も可）
  "question": "…",
  "options": [{ "id": "a", "text": "…" }, { "id": "b", "text": "…" }],
  "correct": "b",             // アンケートの場合やサーバー側で検証する場合は省略
  "explanation": "…",         // 任意。回答後に表示されます
  "audioUrl": "…/narration.mp3" // 任意。クイズの表示中に再生されます
}
```

`normalizeQuizzes()`（JS）、`Quizzes::normalize()`（PHP）、`quizplayer.Normalize()`（Go）は省略形式にも対応しています：`options: ["A", "B"]` と `correct: 1` の組み合わせ、旧形式の `[text, isCorrect]` タプル、`point` / `title` / `answers` キーなど。JSON Schema：[spec/quiz.schema.json](../spec/quiz.schema.json)。

## オプション

| オプション | デフォルト | 説明 |
| --- | --- | --- |
| `src` | — | 動画の URL、または `[{ src, type }]` のリスト |
| `quizzes` | `[]` | クイズ（配列または JSON 文字列） |
| `videoId` | — | 各回答とともにバックエンドへ送信されます |
| `endpoint` | — | プロトコルを実装したバックエンドのベース URL（サーバー側検証） |
| `locale` | `<html lang>` | `en`、`pt-BR`、`es`、`fr`、`de`、`zh-CN`、`ja` |
| `messages` | — | UI の任意のテキストを上書き |
| `preventSkip` | `false` | 最初の未回答クイズより先へのシークをブロック |
| `autoContinueMs` | `3000` | 回答後に自動で再生を再開（`0` = クリックを待つ） |
| `replayOnRewind` | `false` | クイズより前に巻き戻したとき、再度クイズを表示 |
| `askAgainSeconds` | `5` | 「回答済み」確認のカウントダウン秒数 |
| `previousAnswers` | — | 復元する回答（`GET /answers` の代わりに使用） |
| `sounds` | `true` | `false`、または合成音を置き換える URL を指定した `{ cue, correct, wrong, volume }` |
| `headers` | — | 追加のリクエストヘッダー（オブジェクトまたは関数）。例：`Authorization` |
| `csrfMeta` | `'csrf-token'` | `X-CSRF-TOKEN` ヘッダー用に読み取る `<meta>`（`false` で無効化） |
| `validateAnswer` | — | カスタムの非同期バリデーター（GraphQL、Firebase など） |
| `loadAnswers` | — | 過去の回答を読み込むカスタムの非同期ローダー |
| `poster`, `autoplay`, `muted`, `crossOrigin` | — | ネイティブの video 属性 |
| `fill` | `false` | 16:9 ではなく親要素の高さいっぱいに表示 |
| `markers` | `true` | プログレスバーにクイズのマーカーを表示 |
| `injectStyles` | `true` | デフォルトの CSS を挿入（または `@quizplayer/core/style.css` をインポート） |

## イベントとメソッド

```js
const off = player.on('answer', ({ quiz, record, result }) => {});
// イベント: ready · quizshow · answer · continue · complete · seekblocked · error
// またはコールバック: onReady, onQuizShow, onAnswer, onContinue, onComplete, onSeekBlocked, onError

player.play(); player.pause(); player.seek(30);
player.getResults();   // { total, answered, correct, score, answers }
player.getAnswers(); player.getQuizzes(); player.setQuizzes(list);
player.showQuiz('q1'); player.reset(); player.destroy();
player.video;          // 内部の <video> 要素
```

## テーマ

```css
.qp-root {
  --qp-primary: #7c3aed;      /* ボタン、プログレス、ハイライト */
  --qp-surface: #111827;      /* クイズカード */
  --qp-radius: 16px;
  --qp-font: "Inter", sans-serif;
}
```

その他の変数：`--qp-primary-contrast`、`--qp-bg`、`--qp-surface-2`、`--qp-border`、`--qp-text`、`--qp-muted`、`--qp-success`、`--qp-danger`。

## キーボード操作

| キー | 動作 |
| --- | --- |
| `Space` / `K` | 再生 / 一時停止 |
| `←` / `→` | −5 秒 / +5 秒シーク（プログレスバー上では `Shift` で 10 秒） |
| `F` / `M` | フルスクリーン / ミュート |
| `↑` `↓` | 選択肢間の移動（クイズ表示中） |
| `Tab` | 回答するまでフォーカスはクイズ内にとどまります |

## セキュリティに関する注意

- `endpoint` を設定している場合は、**ページに `correct` を含めないでください**。`stripAnswers()`、`Quizzes::strip()`、`quizplayer.Strip()` を使用してください。`Html::render()` と `<x-quizplayer>` はこれを自動で行います。
- サーバーはクライアントから送られてくる `correct` フィールドを必ず無視する必要があります。公式 SDK はすべてそのように実装されています。
- スキップ防止やクライアント側のチェックは視聴体験を向上させるためのものであり、DRM ではありません。ブラウザで動作するものはすべて回避される可能性があります。

## 対応ブラウザ

Chrome / Edge 111+、Firefox 113+、Safari 16.2+（デスクトップ、iOS、Android）。ブラウザが再生できる形式であれば何でも動作します：MP4/H.264、WebM、Safari での HLS、またはその他のブラウザでは hls.js や dash.js を `player.video` にアタッチすることで HLS/DASH も利用できます。

## ロードマップ

- [ ] YouTube および Vimeo アダプター
- [ ] 複数回答および自由記述の問題
- [ ] Svelte および Angular ラッパー
- [ ] Python（Django/FastAPI）および Ruby（Rails）SDK
- [ ] WordPress プラグイン
- [ ] ビジュアルクイズエディター（タイムライン）
- [ ] xAPI / SCORM ステートメント

アイデアがありますか？ [ディスカッションを開始する](https://github.com/IrvingSamuel/quizplayer/discussions)か、[Issue を作成](https://github.com/IrvingSamuel/quizplayer/issues)してください。

## 開発

```bash
git clone https://github.com/IrvingSamuel/quizplayer && cd quizplayer
npm install && npm run build && npm test     # JS/TS パッケージ
composer install && vendor/bin/phpunit       # PHP + Laravel
cd go && go test ./...                       # Go
npm run demo                                 # http://localhost:3000 でデモを起動
```

[CONTRIBUTING.md](../CONTRIBUTING.md) を参照してください。

## プロジェクトを応援する

QuizPlayer が役に立ったら、**ぜひ GitHub で ⭐ をお願いします**。スターは他の開発者がこのプロジェクトを見つける助けになります。

[![Star History Chart](https://api.star-history.com/svg?repos=IrvingSamuel/quizplayer&type=Date)](https://star-history.com/#IrvingSamuel/quizplayer&Date)

## ライセンス

[MIT](../LICENSE) © Irving Samuel
