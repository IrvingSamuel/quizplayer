<?php

declare(strict_types=1);

namespace QuizPlayer\Store;

/** Keeps answers in memory. Useful for tests and demos. */
final class MemoryStore implements AnswerStore
{
    /** @var array<string, array<string, mixed>> */
    private array $rows = [];

    public function save(array $answer): void
    {
        $this->rows[$answer['videoId'] . "\0" . ($answer['userId'] ?? '') . "\0" . $answer['quizId']] = $answer;
    }

    public function list(string $videoId, ?string $userId): array
    {
        return array_values(array_filter(
            $this->rows,
            static fn (array $r): bool => $r['videoId'] === $videoId && $r['userId'] === $userId,
        ));
    }
}
