<?php

declare(strict_types=1);

namespace QuizPlayer;

use InvalidArgumentException;
use QuizPlayer\Store\AnswerStore;
use QuizPlayer\Store\MemoryStore;

/**
 * Framework-agnostic implementation of the QuizPlayer HTTP protocol
 * (see spec/protocol.md). Works in plain PHP, Laravel, Symfony, Slim, WordPress…
 *
 *   $server = new Server(
 *       getQuizzes: fn (string $videoId) => $repo->quizzesFor($videoId),
 *       store: new PdoStore($pdo),
 *       getUserId: fn () => $_SESSION['user_id'] ?? null,
 *   );
 *   $server->respond('/api/quizplayer'); // plain PHP front controller
 */
final class Server
{
    private AnswerStore $store;

    /** @var callable(string, mixed): mixed */
    private $getQuizzes;

    /** @var (callable(mixed): (string|int|null))|null */
    private $getUserId;

    /** @var (callable(array, mixed): void)|null */
    private $onAnswer;

    public function __construct(
        callable $getQuizzes,
        ?AnswerStore $store = null,
        ?callable $getUserId = null,
        private readonly bool $requireUser = false,
        ?callable $onAnswer = null,
    ) {
        $this->getQuizzes = $getQuizzes;
        $this->store = $store ?? new MemoryStore();
        $this->getUserId = $getUserId;
        $this->onAnswer = $onAnswer;
    }

    /**
     * @param array<string, mixed> $query
     * @param mixed $request the framework request, passed through to callbacks
     * @return array{status: int, body: array<string, mixed>}
     */
    public function handle(string $method, string $path, array $query = [], mixed $body = null, mixed $request = null): array
    {
        $method = strtoupper($method);
        $path = rtrim($path, '/');
        $userId = $this->getUserId ? ($this->getUserId)($request) : null;
        $userId = $userId === null ? null : (string) $userId;
        if ($this->requireUser && $userId === null) {
            return self::json(401, ['error' => 'unauthenticated']);
        }

        if ($method === 'POST' && str_ends_with($path, '/answer')) {
            $b = is_array($body) ? $body : [];
            $videoId = isset($b['videoId']) ? (string) $b['videoId'] : '';
            $quizId = isset($b['quizId']) ? (string) $b['quizId'] : '';
            $optionId = isset($b['optionId']) ? (string) $b['optionId'] : '';
            if ($quizId === '' || $optionId === '') {
                return self::json(422, ['error' => 'quizId and optionId are required']);
            }
            $quiz = Quizzes::find($this->quizzes($videoId, $request), $quizId);
            if ($quiz === null) {
                return self::json(404, ['error' => 'quiz not found']);
            }
            try {
                $result = Quizzes::validate($quiz, $optionId);
            } catch (InvalidArgumentException) {
                return self::json(422, ['error' => 'invalid optionId']);
            }
            $answer = [
                'videoId' => $videoId,
                'userId' => $userId,
                'quizId' => $quizId,
                'optionId' => $optionId,
                'correct' => $result['correct'],
                'videoTime' => is_numeric($b['videoTime'] ?? null) ? (float) $b['videoTime'] : (float) $quiz['time'],
                'answeredAt' => gmdate('Y-m-d\TH:i:s\Z'),
            ];
            $this->store->save($answer);
            if ($this->onAnswer) {
                ($this->onAnswer)($answer, $request);
            }

            return self::json(200, $result);
        }

        $videoId = isset($query['videoId']) ? (string) $query['videoId'] : '';

        if ($method === 'GET' && str_ends_with($path, '/answers')) {
            return self::json(200, ['answers' => $this->publicAnswers($videoId, $userId)]);
        }

        if ($method === 'GET' && str_ends_with($path, '/quizzes')) {
            return self::json(200, ['quizzes' => Quizzes::strip($this->quizzes($videoId, $request))]);
        }

        if ($method === 'GET' && str_ends_with($path, '/results')) {
            return self::json(200, Quizzes::summarize($this->quizzes($videoId, $request), $this->publicAnswers($videoId, $userId)));
        }

        return self::json(404, ['error' => 'not found']);
    }

    /**
     * Handles the current request using PHP globals and prints the JSON response.
     * `$basePath` is the URL prefix where the endpoint is mounted (e.g. "/api/quizplayer").
     */
    public function respond(string $basePath = ''): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $path = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        if ($basePath !== '' && str_starts_with($path, $basePath)) {
            $path = substr($path, strlen($basePath));
        }
        $body = null;
        if ($method === 'POST') {
            $body = json_decode((string) file_get_contents('php://input'), true);
        }
        $res = $this->handle($method, $path === '' ? '/' : $path, $_GET, $body);
        http_response_code($res['status']);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($res['body'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Answers as exposed over HTTP (without videoId/userId).
     *
     * @return list<array<string, mixed>>
     */
    private function publicAnswers(string $videoId, ?string $userId): array
    {
        return array_map(static fn (array $a): array => [
            'quizId' => $a['quizId'],
            'optionId' => $a['optionId'],
            'correct' => $a['correct'],
            'videoTime' => $a['videoTime'],
            'answeredAt' => $a['answeredAt'],
        ], $this->store->list($videoId, $userId));
    }

    /** @return list<array<string, mixed>> */
    private function quizzes(string $videoId, mixed $request): array
    {
        return Quizzes::normalize(($this->getQuizzes)($videoId, $request));
    }

    /** @return array{status: int, body: array<string, mixed>} */
    private static function json(int $status, array $body): array
    {
        return ['status' => $status, 'body' => $body];
    }
}
