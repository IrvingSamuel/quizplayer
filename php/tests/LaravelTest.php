<?php

declare(strict_types=1);

namespace QuizPlayer\Tests;

use Illuminate\Support\Facades\Blade;
use Orchestra\Testbench\TestCase;
use QuizPlayer\Laravel\QuizPlayerServiceProvider;
use QuizPlayer\Laravel\QuizProvider;

final class FakeProvider implements QuizProvider
{
    public function quizzes(string $videoId): array
    {
        return [['id' => 'q1', 'time' => 5, 'question' => "Hi {{ \$x }} @php echo 1; @endphp", 'options' => ['no', 'yes'], 'correct' => 1]];
    }
}

final class LaravelTest extends TestCase
{
    protected function getPackageProviders($app): array
    {
        return [QuizPlayerServiceProvider::class];
    }

    protected function defineEnvironment($app): void
    {
        $app['config']->set('database.default', 'testing');
        $app['config']->set('quizplayer.quizzes', FakeProvider::class);
        $app['config']->set('quizplayer.routes.middleware', []);
    }

    protected function defineDatabaseMigrations(): void
    {
        $migration = include __DIR__ . '/../laravel/database/migrations/create_quizplayer_answers_table.php';
        $migration->up();
    }

    public function testRoutesValidateAndPersist(): void
    {
        $this->postJson('/quizplayer/answer', ['videoId' => '1', 'quizId' => 'q1', 'optionId' => 'a', 'correct' => true])
            ->assertOk()
            ->assertExactJson(['correct' => false, 'correctOptionId' => 'b']);
        $this->postJson('/quizplayer/answer', ['videoId' => '1', 'quizId' => 'q1', 'optionId' => 'b'])->assertOk();

        $this->getJson('/quizplayer/answers?videoId=1')
            ->assertOk()
            ->assertJsonCount(1, 'answers')
            ->assertJsonPath('answers.0.optionId', 'b')
            ->assertJsonPath('answers.0.correct', true);

        $this->getJson('/quizplayer/results?videoId=1')->assertJsonPath('score', 100);
        $this->assertDatabaseCount('quizplayer_answers', 1);
    }

    public function testBladeComponentRendersSafely(): void
    {
        $html = Blade::render('<x-quizplayer src="/lesson.mp4" :quizzes="$q" video-id="1" class="my-player" />', [
            'q' => (new FakeProvider())->quizzes('1'),
        ]);
        self::assertStringContainsString('data-quizplayer', $html);
        self::assertStringContainsString('data-endpoint="http://localhost/quizplayer"', $html);
        self::assertStringContainsString('class="my-player"', $html);
        self::assertStringContainsString('{{ $x }} @php echo 1; @endphp', $html, 'quiz text must not be compiled as Blade');
        self::assertStringNotContainsString('"correct"', $html, 'answers must be stripped when the server validates');
    }
}
