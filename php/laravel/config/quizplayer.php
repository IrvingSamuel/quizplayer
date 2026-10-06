<?php

return [
    /*
    | Where quizzes come from. A class implementing QuizPlayer\Laravel\QuizProvider,
    | or a closure: fn (string $videoId) => Lesson::findOrFail($videoId)->quizzes
    | (closures can't be cached with `config:cache`; prefer a class).
    */
    'quizzes' => null,

    // Answer storage (any QuizPlayer\Store\AnswerStore implementation).
    'store' => QuizPlayer\Laravel\DatabaseStore::class,
    'connection' => null,
    'table' => 'quizplayer_answers',

    // Reject anonymous viewers.
    'require_auth' => false,

    'routes' => [
        'enabled' => true,
        'prefix' => 'quizplayer',
        'middleware' => ['web'],
    ],

    // Browser bundle used by <x-quizplayer>. Publish it locally if you prefer self-hosting.
    'script_url' => 'https://cdn.jsdelivr.net/npm/@quizplayer/core@0/dist/quizplayer.min.js',
];
