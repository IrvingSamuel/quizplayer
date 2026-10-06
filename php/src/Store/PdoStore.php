<?php

declare(strict_types=1);

namespace QuizPlayer\Store;

use PDO;

/**
 * Stores answers in any PDO database (MySQL/MariaDB, PostgreSQL, SQLite, SQL Server).
 * Call {@see PdoStore::createTable()} once, or use the SQL in the README.
 */
final class PdoStore implements AnswerStore
{
    public function __construct(private readonly PDO $pdo, private readonly string $table = 'quizplayer_answers')
    {
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function createTable(): void
    {
        $t = $this->table;
        $this->pdo->exec(
            "CREATE TABLE IF NOT EXISTS {$t} (
                video_id VARCHAR(191) NOT NULL,
                user_id VARCHAR(191) NOT NULL DEFAULT '',
                quiz_id VARCHAR(191) NOT NULL,
                option_id VARCHAR(191) NOT NULL,
                is_correct SMALLINT NULL,
                video_time DECIMAL(10,2) NOT NULL DEFAULT 0,
                answered_at VARCHAR(40) NOT NULL,
                PRIMARY KEY (video_id, user_id, quiz_id)
            )"
        );
    }

    public function save(array $answer): void
    {
        $key = [
            ':video_id' => (string) $answer['videoId'],
            ':user_id' => (string) ($answer['userId'] ?? ''),
            ':quiz_id' => (string) $answer['quizId'],
        ];
        $this->pdo->beginTransaction();
        try {
            $this->pdo->prepare("DELETE FROM {$this->table} WHERE video_id = :video_id AND user_id = :user_id AND quiz_id = :quiz_id")
                ->execute($key);
            $this->pdo->prepare(
                "INSERT INTO {$this->table} (video_id, user_id, quiz_id, option_id, is_correct, video_time, answered_at)
                 VALUES (:video_id, :user_id, :quiz_id, :option_id, :is_correct, :video_time, :answered_at)"
            )->execute($key + [
                ':option_id' => (string) $answer['optionId'],
                ':is_correct' => $answer['correct'] === null ? null : (int) $answer['correct'],
                ':video_time' => (float) ($answer['videoTime'] ?? 0),
                ':answered_at' => (string) $answer['answeredAt'],
            ]);
            $this->pdo->commit();
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function list(string $videoId, ?string $userId): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE video_id = :video_id AND user_id = :user_id ORDER BY video_time");
        $stmt->execute([':video_id' => $videoId, ':user_id' => (string) ($userId ?? '')]);

        return array_map(static fn (array $r): array => [
            'videoId' => (string) $r['video_id'],
            'userId' => $r['user_id'] === '' ? null : (string) $r['user_id'],
            'quizId' => (string) $r['quiz_id'],
            'optionId' => (string) $r['option_id'],
            'correct' => $r['is_correct'] === null ? null : (bool) $r['is_correct'],
            'videoTime' => (float) $r['video_time'],
            'answeredAt' => (string) $r['answered_at'],
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}
