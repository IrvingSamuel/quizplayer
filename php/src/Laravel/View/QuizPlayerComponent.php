<?php

declare(strict_types=1);

namespace QuizPlayer\Laravel\View;

use Illuminate\Support\HtmlString;
use Illuminate\View\Component;
use Illuminate\View\ComponentAttributeBag;
use QuizPlayer\Html;

/**
 * <x-quizplayer src="/videos/lesson.mp4" :quizzes="$lesson->quizzes" :video-id="$lesson->id" />
 *
 * By default the component points to the package routes, so answers are validated
 * and stored server-side, and right answers are never sent to the browser.
 * Pass `:endpoint="false"` for client-side validation only.
 */
final class QuizPlayerComponent extends Component
{
    public function __construct(
        public string $src,
        public array|string $quizzes = [],
        public string|int|null $videoId = null,
        public string|bool|null $endpoint = null,
        public ?string $locale = null,
        public ?string $poster = null,
        public ?bool $preventSkip = null,
        public ?int $autoContinueMs = null,
        public array $options = [],
    ) {
    }

    public function render(): HtmlString
    {
        return $this->toHtml([]);
    }

    /**
     * Resolved lazily so HTML attributes (class, id, style…) are available, and returns
     * an Htmlable so Laravel never compiles quiz text as Blade.
     */
    public function resolveView()
    {
        return function (array $data = []): HtmlString {
            $bag = $data['attributes'] ?? null;

            return $this->toHtml($bag instanceof ComponentAttributeBag ? $bag->getAttributes() : []);
        };
    }

    /** @param array<string, mixed> $attributes */
    private function toHtml(array $attributes): HtmlString
    {
        $endpoint = $this->endpoint;
        if ($endpoint === null || $endpoint === true) {
            $endpoint = config('quizplayer.routes.enabled', true)
                ? url(config('quizplayer.routes.prefix', 'quizplayer'))
                : null;
        }

        return new HtmlString(Html::render([
            'src' => $this->src,
            'quizzes' => $this->quizzes,
            'videoId' => $this->videoId,
            'endpoint' => $endpoint ?: null,
            'locale' => $this->locale ?? str_replace('_', '-', app()->getLocale()),
            'poster' => $this->poster,
            'preventSkip' => $this->preventSkip,
            'autoContinueMs' => $this->autoContinueMs,
            'options' => $this->options,
            'attributes' => $attributes,
            'script' => config('quizplayer.script_url', Html::DEFAULT_SCRIPT),
        ]));
    }
}
