# Contributing to QuizPlayer

Thanks for helping! Bug reports, docs, translations, new SDKs and features are all welcome.

## Repository layout

| Path | What |
| --- | --- |
| `packages/core` | Browser player (TypeScript, zero dependencies) |
| `packages/react`, `packages/vue` | Framework wrappers |
| `packages/node` | Node.js server SDK |
| `php/` (+ root `composer.json`) | PHP SDK and Laravel integration |
| `go/` | Go SDK |
| `spec/` | HTTP protocol and JSON Schemas, the contract every SDK follows |
| `examples/`, `demo/` | Runnable examples and the GitHub Pages demo |
| `docs/` | Translated READMEs |

## Setup

```bash
npm install
npm run build
npm test                     # vitest: core, react, vue, server
npm run typecheck
composer install && vendor/bin/phpunit
(cd go && go vet ./... && go test ./...)
npm run demo                 # http://localhost:3000
```

## Guidelines

- **Keep the core dependency-free** and framework-agnostic.
- **Protocol changes** must update `spec/` and every SDK (Node, PHP, Go) in the same PR, with tests.
- **UI texts** live in `packages/core/src/i18n.ts`. When you add a key, add it to every locale.
- **New language?** Add the dictionary in `i18n.ts`, a `docs/README.<lang>.md` and a link in every README's language bar.
- Add or update tests for every behavior change.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`…).

## Adding a backend SDK (Python, Ruby, Java, .NET, Rust…)

Implement [spec/protocol.md](spec/protocol.md): `POST /answer` is required, and `GET /answers`, `/quizzes` and `/results` are optional. Mirror the tests in `go/quizplayer_test.go`. Open an issue first so we can agree on the layout.

## Releasing (maintainers)

1. Update `CHANGELOG.md` and bump the versions in `packages/*/package.json`.
2. Tag `vX.Y.Z` (npm + Packagist) and `go/vX.Y.Z` (Go module), then push the tags.
3. The `release` workflow publishes the npm packages (requires the `NPM_TOKEN` secret). Packagist updates through its GitHub hook.
