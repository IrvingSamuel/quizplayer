# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.1.0] — 2026-10-06

### Added

- `@quizplayer/core`: a zero-dependency HTML5 player with cue-point quizzes.
  - Synthesized cue, correct and wrong sounds.
  - Optional per-quiz narration.
  - Skip guard, resume with "answer again?", and auto-continue.
  - Progress-bar markers.
  - 7 locales.
  - Keyboard navigation and accessibility support.
  - Theming through CSS variables.
  - Auto-initialization from `data-*` attributes.
- `@quizplayer/react` and `@quizplayer/vue` components.
- `@quizplayer/server`: a Node.js SDK with handlers for `node:http`/Express and the Fetch API.
- `quizplayer/quizplayer`: a PHP SDK with `Server`, `PdoStore` and `Html::render()`.
  - Laravel integration: routes, `<x-quizplayer>`, config and migration.
- `github.com/IrvingSamuel/quizplayer/go`: a Go SDK with `NewHandler`, `Validate` and `Parse`.
- HTTP protocol specification and JSON Schemas.
- A live demo, plus examples for vanilla HTML, React, Vue, Express, Next.js, Go, plain PHP and Laravel.

[0.1.0]: https://github.com/IrvingSamuel/quizplayer/releases/tag/v0.1.0
