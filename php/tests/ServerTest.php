<?php

declare(strict_types=1);

namespace QuizPlayer\Tests;

use PDO;
use PHPUnit\Framework\TestCase;
use QuizPlayer\Server;
use QuizPlayer\Store\AnswerStore;
use QuizPlayer\Store\MemoryStore;
use QuizPlayer\Store\PdoStore;

final class ServerTest extends TestCase
{
    private const QUIZZES = [
        ['id' => 'q1', 'time' => 10, 'question' => '2+2?', 'options' => [['id' => 'a', 'text' => '3'], ['id' => 'b', 'text' => '4']], 'correct' => 'b', 'explanation' => 'Math'],
    ];

    private function server(?AnswerStore $store = null, ?string $user = 'u1', bool $requireUser = false): Server
    {
        return new Server(fn (string $videoId) => self::QUIZZES, $store ?? new MemoryStore(), fn () => $user, $requireUser);
    }

    public function testValidatesStoresAndLists(): void
    {
        $server = $this->server();
        $res = $server->handle('POST', '/answer', [], ['videoId' => 'v', 'quizId' => 'q1', 'optionId' => 'a', 'correct' => true]);
        self::assertSame(200, $res['status']);
        self::assertSame(['correct' => false, 'correctOptionId' => 'b', 'explanation' => 'Math'], $res['body']);

        $list = $server->handle('GET', '/answers', ['videoId' => 'v']);
        self::assertCount(1, $list['body']['answers']);
        self::assertSame('a', $list['body']['answers'][0]['optionId']);
        self::assertFalse($list['body']['answers'][0]['correct']);
    }

    public function testErrors(): void
    {
        self::assertSame(401, $this->server(null, null, true)->handle('POST', '/answer', [], [])['status']);
        $server = $this->server();
        self::assertSame(422, $server->handle('POST', '/answer', [], [])['status']);
        self::assertSame(404, $server->handle('POST', '/answer', [], ['quizId' => 'nope', 'optionId' => 'a'])['status']);
        self::assertSame(422, $server->handle('POST', '/answer', [], ['quizId' => 'q1', 'optionId' => 'zz'])['status']);
        self::assertSame(404, $server->handle('GET', '/nope')['status']);
    }

    public function testQuizzesAndResults(): void
    {
        $server = $this->server();
        $quizzes = $server->handle('GET', '/api/quizplayer/quizzes', ['videoId' => 'v']);
        self::assertStringNotContainsString('correct', (string) json_encode($quizzes['body']));
        $server->handle('POST', '/api/quizplayer/answer', [], ['videoId' => 'v', 'quizId' => 'q1', 'optionId' => 'b']);
        $results = $server->handle('GET', '/api/quizplayer/results', ['videoId' => 'v']);
        self::assertSame(100, $results['body']['score']);
        self::assertArrayNotHasKey('userId', $results['body']['answers'][0]);
    }

    public function testPdoStoreUpserts(): void
    {
        if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
            self::markTestSkipped('pdo_sqlite not available');
        }
        $store = new PdoStore(new PDO('sqlite::memory:'));
        $store->createTable();
        $server = $this->server($store);
        $server->handle('POST', '/answer', [], ['videoId' => 'v', 'quizId' => 'q1', 'optionId' => 'a']);
        $server->handle('POST', '/answer', [], ['videoId' => 'v', 'quizId' => 'q1', 'optionId' => 'b']);
        $rows = $store->list('v', 'u1');
        self::assertCount(1, $rows);
        self::assertSame('b', $rows[0]['optionId']);
        self::assertTrue($rows[0]['correct']);
        self::assertSame([], $store->list('v', null));
    }
}
