# QuizPlayer for PHP & Laravel

```bash
composer require quizplayer/quizplayer
```

- `QuizPlayer\Server` — framework-agnostic protocol handler (`handle()` / `respond()`)
- `QuizPlayer\Store\PdoStore` — MySQL, PostgreSQL, SQLite, SQL Server
- `QuizPlayer\Html::render()` — markup for any PHP template (answers stripped automatically)
- `QuizPlayer\Quizzes` — `normalize`, `strip`, `validate`, `summarize`
- **Laravel** (auto-discovered): routes, `<x-quizplayer>` Blade component, config and migration

📖 Docs: https://github.com/IrvingSamuel/quizplayer · Laravel guide: [examples/laravel](../examples/laravel) · Plain PHP: [examples/php-plain](../examples/php-plain)
