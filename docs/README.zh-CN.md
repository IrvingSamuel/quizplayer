<div align="center">

# ▶ QuizPlayer

**会暂停、会提示、会提问的视频。**
一款开源的 HTML5 视频播放器，内置测验功能，适配**任意前端**与**任意后端**。

[English](../README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · **中文** · [日本語](README.ja.md)

[![CI](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml/badge.svg)](https://github.com/IrvingSamuel/quizplayer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Size](https://img.shields.io/badge/core-~14%20kB%20gzip-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6)
![PHP](https://img.shields.io/badge/PHP-8.1%2B-777bb4)
![Go](https://img.shields.io/badge/Go-1.21%2B-00add8)
[![GitHub stars](https://img.shields.io/github/stars/IrvingSamuel/quizplayer?style=social)](https://github.com/IrvingSamuel/quizplayer/stargazers)

[**在线演示**](https://irvingsamuel.github.io/quizplayer/) · [示例](../examples) · [协议规范](../spec/protocol.md)

<img src="assets/demo.gif" alt="QuizPlayer 演示：视频在设定的时间点暂停，弹出一道题目，观看者作答后立即获得反馈" width="720">

</div>

---

## 为什么选择 QuizPlayer？

互动视频能有效提升观众的注意力和记忆效果，但大多数方案要么是付费 SaaS 产品，要么绑定某个特定框架，要么在浏览器端校验正确答案——任何人都能直接看到答案。

QuizPlayer 与众不同：

- **暂停 → 提示音 → 提问。** 视频会在你指定的那一秒精确停下，播放一段简短的合成提示音，然后显示题目。无需音频文件，也不发起任何网络请求。
- **任意前端。** 零依赖的核心库（gzip 后约 14 kB），并提供官方 **React** 和 **Vue** 组件。**Blade、Twig、Django、Rails 和 Go 模板**只需使用普通 HTML 属性即可，其他任何框架同样适用。
- **任意后端。** 一个极简的 [JSON 协议](../spec/protocol.md)，并提供 **PHP/Laravel**、**Go** 和 **Node.js**（Express、Next.js、Hono、Bun、Deno）官方 SDK。其他语言大约 50 行代码即可实现。
- **防作弊。** 配置 `endpoint` 后，正确答案永远不会出现在页面中：由服务器校验并保存每一次作答。
- **防跳过。** 可选择禁止观看者拖动进度条跳过尚未作答的题目。
- **断点续答。** 自动恢复之前的作答记录，并询问观看者是否要*“重新作答？”*。
- **无障碍支持。** 支持键盘导航、焦点陷阱、ARIA live region 以及 `prefers-reduced-motion`。
- **内置 7 种语言**（en、pt-BR、es、fr、de、zh-CN、ja），所有文本均可自定义覆盖。
- **可定制主题**，基于 CSS 自定义属性；同时支持**响应式**布局：即使在手机上的小尺寸播放器中，测验界面也能自动适配。

## 快速上手（30 秒）

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

## 软件包

| 软件包 | 安装方式 | 适用于 |
| --- | --- | --- |
| [`@quizplayer/core`](../packages/core) | `npm i @quizplayer/core` 或 CDN `<script>` | 原生 JS、Svelte、Angular、Alpine、Blade 及任意 HTML |
| [`@quizplayer/react`](../packages/react) | `npm i @quizplayer/react` | React 17+ / Next.js |
| [`@quizplayer/vue`](../packages/vue) | `npm i @quizplayer/vue` | Vue 3 / Nuxt |
| [`@quizplayer/server`](../packages/node) | `npm i @quizplayer/server` | Node.js：Express、Next.js、Hono、Bun、Deno |
| [`quizplayer/quizplayer`](../php) | `composer require quizplayer/quizplayer` | PHP 8.1+、Laravel、Symfony、WordPress |
| [`quizplayer/go`](../go) | `go get github.com/IrvingSamuel/quizplayer/go` | Go `net/http`、chi、gin、echo |

---

## 前端

### 纯 HTML / 服务端模板（无需编写 JavaScript）

CDN 构建包会自动初始化所有 `[data-quizplayer]` 元素。在 Blade、Twig、Jinja/Django、ERB、Go `html/template`、Thymeleaf 等模板中用法完全一致。

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

支持的属性：`data-src`、`data-poster`、`data-video-id`、`data-endpoint`、`data-locale`、`data-prevent-skip`、`data-replay-on-rewind`、`data-auto-continue`（毫秒）、`data-sounds`、`data-fill`、`data-muted`、`data-autoplay`、`data-quizzes`（JSON，或某个 JSON `<script>` 的 `#id`）以及 `data-options`（包含其他任意选项的 JSON）。

你也可以包装一个已有的 `<video>` 元素：`QuizPlayer.create(document.querySelector('video'), { quizzes })`。

### ES 模块 / 打包工具

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

通过 `ref` 可以获取 `QuizPlayer` 实例，另外还提供了 `useQuizPlayer(options)` Hook。参见 [examples/react-vite](../examples/react-vite)。

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

事件：`ready`、`quizshow`、`answer`、`continue`、`complete`、`seekblocked`、`error`。也可以通过 `app.use(QuizPlayerPlugin)` 进行全局注册。参见 [examples/vue-vite](../examples/vue-vite)。

### Laravel Blade

```blade
<x-quizplayer :src="$lesson->video_url" :quizzes="$lesson->quizzes" :video-id="$lesson->id" prevent-skip />
```

参见下文的 [Laravel 后端](#php--laravel)。该组件会自动移除答案并为你配置好 endpoint。

### Svelte、Angular、Solid、Alpine、htmx…

直接使用核心库即可：在挂载时调用 `QuizPlayer.create(element, options)`，在卸载时调用 `player.destroy()`。

---

## 后端

播放器通过一个[极简的 JSON 协议](../spec/protocol.md)与你的服务器通信：

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `POST` | `{endpoint}/answer` | 校验并保存答案，返回 `{ correct, correctOptionId, explanation }` |
| `GET` | `{endpoint}/answers?videoId=` | 当前用户之前的作答记录（断点续答） |
| `GET` | `{endpoint}/quizzes?videoId=` | **不含**答案的题目列表（可选） |
| `GET` | `{endpoint}/results?videoId=` | 得分汇总（可选） |

用户身份来自你自己的 session 或 token，因此协议本身完全不涉及身份认证。

### Node.js（Express、Next.js、Hono、Bun、Deno）

```js
import express from 'express';
import { createNodeHandler } from '@quizplayer/server';

app.use('/api/quizplayer', express.json(), createNodeHandler({
  getQuizzes: (videoId) => db.lessons.quizzes(videoId), // 包含正确答案
  getUserId: (req) => req.session.userId,
  store: myAnswerStore, // { save(answer), list(videoId, userId) }；默认使用内存存储
}));
```

基于 Fetch API 的运行时（Next.js route handlers、Hono、Bun、Deno、Cloudflare Workers）：

```ts
// app/api/quizplayer/[...path]/route.ts
import { createFetchHandler } from '@quizplayer/server';
const handler = createFetchHandler({ getQuizzes, getUserId }, '/api/quizplayer');
export { handler as GET, handler as POST };
```

### PHP / Laravel

**Laravel。** 该包支持自动发现，会自动注册路由、Blade 组件、配置文件和数据库迁移：

```bash
composer require quizplayer/quizplayer
php artisan vendor:publish --tag=quizplayer && php artisan migrate
```

```php
// config/quizplayer.php
'quizzes' => App\QuizPlayer\LessonQuizzes::class, // 实现 QuizPlayer\Laravel\QuizProvider 接口
```

完整指南：[examples/laravel](../examples/laravel)。

**纯 PHP、Symfony、Slim、WordPress…**

```php
use QuizPlayer\Server;
use QuizPlayer\Store\PdoStore;

$server = new Server(
    getQuizzes: fn (string $videoId) => $repo->quizzesFor($videoId),
    store: new PdoStore($pdo),             // MySQL、PostgreSQL、SQLite、SQL Server
    getUserId: fn () => $_SESSION['user_id'] ?? null,
);
$server->respond('/api/quizplayer');       // 或 $server->handle($method, $path, $query, $body)

echo QuizPlayer\Html::render(['src' => '/lesson.mp4', 'quizzes' => $quizzes, 'endpoint' => '/api/quizplayer']);
```

### Go

```go
import quizplayer "github.com/IrvingSamuel/quizplayer/go"

h := quizplayer.NewHandler(quizplayer.Config{
    Quizzes: func(r *http.Request, videoID string) ([]quizplayer.Quiz, error) { return repo.Quizzes(videoID) },
    Store:   myStore, // 实现 quizplayer.Store 接口；默认使用 NewMemoryStore()
    UserID:  func(r *http.Request) string { return session.UserID(r) },
})
http.Handle("/api/quizplayer/", http.StripPrefix("/api/quizplayer", h))
```

### Python、Ruby、Java、.NET、Rust…

按照 [spec/protocol.md](../spec/protocol.md) 实现 `POST /answer` 即可；`GET /answers` 为可选项。非常欢迎贡献官方 SDK。

---

## 题目格式

```jsonc
{
  "id": "q1",                 // 稳定的 id：作答记录以此为键保存
  "time": 42.5,               // 秒（也支持 "1:30" 格式）
  "question": "…",
  "options": [{ "id": "a", "text": "…" }, { "id": "b", "text": "…" }],
  "correct": "b",             // 问卷调查或由服务器校验时可省略
  "explanation": "…",         // 可选，作答后显示
  "audioUrl": "…/narration.mp3" // 可选，在题目显示期间播放
}
```

`normalizeQuizzes()`（JS）、`Quizzes::normalize()`（PHP）和 `quizplayer.Normalize()`（Go）还支持简写格式：`options: ["A", "B"]` 搭配 `correct: 1`、旧版的 `[text, isCorrect]` 元组，以及 `point` / `title` / `answers` 键。JSON Schema：[spec/quiz.schema.json](../spec/quiz.schema.json)。

## 配置选项

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `src` | — | 视频 URL 或 `[{ src, type }]` 列表 |
| `quizzes` | `[]` | 题目（数组或 JSON 字符串） |
| `videoId` | — | 每次作答时一并发送给后端 |
| `endpoint` | — | 实现了该协议的后端的基础 URL（服务端校验） |
| `locale` | `<html lang>` | `en`、`pt-BR`、`es`、`fr`、`de`、`zh-CN`、`ja` |
| `messages` | — | 覆盖任意界面文本 |
| `preventSkip` | `false` | 禁止跳过第一道未作答的题目 |
| `autoContinueMs` | `3000` | 作答后自动继续播放（`0` = 等待点击） |
| `replayOnRewind` | `false` | 回退到题目之前时再次显示题目 |
| `askAgainSeconds` | `5` | “已作答”提示的倒计时 |
| `previousAnswers` | — | 要恢复的作答记录（替代 `GET /answers`） |
| `sounds` | `true` | `false`，或传入 `{ cue, correct, wrong, volume }` 及对应 URL 以替换合成音效 |
| `headers` | — | 额外的请求头（对象或函数），例如 `Authorization` |
| `csrfMeta` | `'csrf-token'` | 用于读取 `X-CSRF-TOKEN` 请求头的 `<meta>`（设为 `false` 可禁用） |
| `validateAnswer` | — | 自定义异步校验器（GraphQL、Firebase…） |
| `loadAnswers` | — | 自定义异步加载历史作答记录 |
| `poster`、`autoplay`、`muted`、`crossOrigin` | — | 原生 video 属性 |
| `fill` | `false` | 填满父元素高度，而非保持 16:9 |
| `markers` | `true` | 在进度条上显示题目标记 |
| `injectStyles` | `true` | 注入默认 CSS（或手动引入 `@quizplayer/core/style.css`） |

## 事件与方法

```js
const off = player.on('answer', ({ quiz, record, result }) => {});
// 事件：ready · quizshow · answer · continue · complete · seekblocked · error
// 或使用回调：onReady、onQuizShow、onAnswer、onContinue、onComplete、onSeekBlocked、onError

player.play(); player.pause(); player.seek(30);
player.getResults();   // { total, answered, correct, score, answers }
player.getAnswers(); player.getQuizzes(); player.setQuizzes(list);
player.showQuiz('q1'); player.reset(); player.destroy();
player.video;          // 底层的 <video> 元素
```

## 主题定制

```css
.qp-root {
  --qp-primary: #7c3aed;      /* 按钮、进度条、高亮 */
  --qp-surface: #111827;      /* 题目卡片 */
  --qp-radius: 16px;
  --qp-font: "Inter", sans-serif;
}
```

其他变量：`--qp-primary-contrast`、`--qp-bg`、`--qp-surface-2`、`--qp-border`、`--qp-text`、`--qp-muted`、`--qp-success`、`--qp-danger`。

## 键盘快捷键

| 按键 | 操作 |
| --- | --- |
| `Space` / `K` | 播放 / 暂停 |
| `←` / `→` | 后退 5 秒 / 前进 5 秒（在进度条上按住 `Shift` = 10 秒） |
| `F` / `M` | 全屏 / 静音 |
| `↑` `↓` | 在选项之间切换（题目内） |
| `Tab` | 作答前焦点始终保持在题目内 |

## 安全须知

- 设置了 `endpoint` 时，**请勿在页面中包含 `correct`**。请使用 `stripAnswers()`、`Quizzes::strip()` 或 `quizplayer.Strip()`；`Html::render()` 和 `<x-quizplayer>` 会自动完成这一步。
- 服务器必须忽略客户端发送的任何 `correct` 字段。所有官方 SDK 均已做到这一点。
- 防跳过和客户端校验能改善观看体验，但它们并不是 DRM。任何在浏览器中运行的东西都可能被绕过。

## 浏览器支持

Chrome / Edge 111+、Firefox 113+ 和 Safari 16.2+（桌面端、iOS 和 Android）。浏览器能播放的任何格式均可使用：MP4/H.264、WebM、Safari 上的 HLS，或在其他浏览器中将 hls.js 或 dash.js 挂载到 `player.video` 上以播放 HLS/DASH。

## 路线图

- [ ] YouTube 和 Vimeo 适配器
- [ ] 多选题和自由文本题
- [ ] Svelte 和 Angular 封装组件
- [ ] Python（Django/FastAPI）和 Ruby（Rails）SDK
- [ ] WordPress 插件
- [ ] 可视化题目编辑器（时间轴）
- [ ] xAPI / SCORM 语句

有好的想法？欢迎[发起讨论](https://github.com/IrvingSamuel/quizplayer/discussions)或[提交 issue](https://github.com/IrvingSamuel/quizplayer/issues)。

## 开发

```bash
git clone https://github.com/IrvingSamuel/quizplayer && cd quizplayer
npm install && npm run build && npm test     # JS/TS 软件包
composer install && vendor/bin/phpunit       # PHP + Laravel
cd go && go test ./...                       # Go
npm run demo                                 # 演示地址 http://localhost:3000
```

参见 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## 支持本项目

如果 QuizPlayer 为你节省了时间，**请在 GitHub 上给它点个 ⭐**。Star 能帮助更多开发者发现这个项目。

[![Star History Chart](https://api.star-history.com/svg?repos=IrvingSamuel/quizplayer&type=Date)](https://star-history.com/#IrvingSamuel/quizplayer&Date)

## 许可证

[MIT](../LICENSE) © Irving Samuel
