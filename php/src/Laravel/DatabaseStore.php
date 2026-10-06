<?php

declare(strict_types=1);

namespace QuizPlayer\Laravel;

use Illuminate\Database\ConnectionResolverInterface;
use Illuminate\Contracts\Config\Repository as Config;
use QuizPlayer\Store\AnswerStore;

/** Stores answers in the `quizplayer_answers` table using Laravel's query builder. */
final class DatabaseStore implements AnswerStore
{
    public function __construct(private readonly ConnectionResolverInterface $db, private readonly Config $config)
    {
    }

    public function save(array $answer): void
    {
        $this->table()->updateOrInsert(
            [
                'video_id' => (string) $answer['videoId'],
                'user_id' => (string) ($answer['userId'] ?? ''),
                'quiz_id' => (string) $answer['quizId'],
            ],
            [
                'option_id' => (string) $answer['optionId'],
                'is_correct' => $answer['correct'] === null ? null : (int) $answer['correct'],
                'video_time' => (float) ($answer['videoTime'] ?? 0),
                'answered_at' => (string) $answer['answeredAt'],
            ],
        );
    }

    public function list(string $videoId, ?string $userId): array
    {
        return $this->table()
            ->where('video_id', $videoId)
            ->where('user_id', (string) ($userId ?? ''))
            ->orderBy('video_time')
            ->get()
            ->map(static fn ($r): array => [
                'videoId' => (string) $r->video_id,
                'userId' => $r->user_id === '' ? null : (string) $r->user_id,
                'quizId' => (string) $r->quiz_id,
                'optionId' => (string) $r->option_id,
                'correct' => $r->is_correct === null ? null : (bool) $r->is_correct,
                'videoTime' => (float) $r->video_time,
                'answeredAt' => (string) $r->answered_at,
            ])
            ->values()
            ->all();
    }

    private function table()
    {
        return $this->db
            ->connection($this->config->get('quizplayer.connection'))
            ->table($this->config->get('quizplayer.table', 'quizplayer_answers'));
    }
}
