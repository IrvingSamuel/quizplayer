# QuizPlayer · Laravel

```bash
composer require quizplayer/quizplayer
php artisan vendor:publish --tag=quizplayer   # config/quizplayer.php + migration
php artisan migrate
```

## 1. Tell the package where your quizzes live

```php
// app/QuizPlayer/LessonQuizzes.php
namespace App\QuizPlayer;

use App\Models\Lesson;
use QuizPlayer\Laravel\QuizProvider;

class LessonQuizzes implements QuizProvider
{
    public function quizzes(string $videoId): array
    {
        // A JSON column works great: [{ id, time, question, options: [{id, text}], correct }]
        return Lesson::findOrFail($videoId)->quizzes ?? [];
    }
}
```

```php
// config/quizplayer.php
'quizzes' => App\QuizPlayer\LessonQuizzes::class,
'require_auth' => true,
```

## 2. Drop the component in any Blade view

```blade
<x-quizplayer
    :src="$lesson->video_url"
    :quizzes="$lesson->quizzes"
    :video-id="$lesson->id"
    prevent-skip
    class="rounded-xl shadow"
/>
```

That's it:

- Right answers are stripped from the page automatically.
- `POST /quizplayer/answer` validates on the server and stores the answer in `quizplayer_answers`.
- The `web` middleware applies, so the CSRF token from `<meta name="csrf-token">` is sent automatically.
- `GET /quizplayer/results?videoId=…` returns the score of the logged-in user.

## Optional

- **React to answers**, for example to mark a lesson as complete: bind your own `QuizPlayer\Server` in a service provider with an `onAnswer` callback.
- **Use your own storage:** implement `QuizPlayer\Store\AnswerStore` and set `'store' => App\MyStore::class`.
- **Validate on the client only:** use `<x-quizplayer :endpoint="false" … />`.
- **Self-host the JS** instead of using the CDN: copy `node_modules/@quizplayer/core/dist/quizplayer.min.js` to `public/` and set `script_url`.
