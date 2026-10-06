<?php

declare(strict_types=1);

namespace QuizPlayer\Laravel;

/**
 * Tells the package where your quizzes live (Eloquent model, JSON column, API…).
 * Register it in config/quizplayer.php under the `quizzes` key.
 */
interface QuizProvider
{
    /** Quizzes (with right answers) for a video, in any format accepted by Quizzes::normalize(). */
    public function quizzes(string $videoId): array;
}
