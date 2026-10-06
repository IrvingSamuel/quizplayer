<?php

declare(strict_types=1);

namespace QuizPlayer\Store;

/**
 * Persistence contract. An answer is an array with the keys:
 * videoId, userId (nullable), quizId, optionId, correct (bool|null), videoTime, answeredAt (ISO 8601).
 * Implementations keep only the latest answer per (videoId, userId, quizId).
 */
interface AnswerStore
{
    /** @param array<string, mixed> $answer */
    public function save(array $answer): void;

    /** @return list<array<string, mixed>> */
    public function list(string $videoId, ?string $userId): array;
}
