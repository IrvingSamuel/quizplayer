<?php

declare(strict_types=1);

namespace QuizPlayer\Tests;

use PHPUnit\Framework\TestCase;
use QuizPlayer\Html;

final class HtmlTest extends TestCase
{
    protected function setUp(): void
    {
        Html::resetScriptFlag();
    }

    public function testRendersAutoInitMarkupAndEscapes(): void
    {
        $html = Html::render([
            'src' => '/v.mp4?a=1&b="2"',
            'quizzes' => [['id' => 'q1', 'time' => 3, 'question' => '</script><b>x</b>', 'options' => ['a', 'b'], 'correct' => 0]],
            'videoId' => 7,
            'preventSkip' => true,
            'attributes' => ['id' => 'p1', 'onclick"x' => 'evil', 'hidden' => true],
        ]);
        self::assertStringContainsString(' id="p1"', $html);
        self::assertStringContainsString(' hidden', $html);
        self::assertStringNotContainsString('evil', $html);
        self::assertStringContainsString('data-quizplayer', $html);
        self::assertStringContainsString('data-src="/v.mp4?a=1&amp;b=&quot;2&quot;"', $html);
        self::assertStringContainsString('data-video-id="7"', $html);
        self::assertStringContainsString('data-prevent-skip="true"', $html);
        self::assertStringNotContainsString('</script><b>', $html);
        self::assertStringContainsString('"correct":"a"', $html);
        self::assertSame(1, substr_count(Html::render(['src' => 'x']) . $html, 'quizplayer.min.js'));
    }

    public function testStripsAnswersWhenServerValidates(): void
    {
        $html = Html::render([
            'src' => 'v.mp4',
            'endpoint' => '/api/quizplayer',
            'quizzes' => [['id' => 'q1', 'time' => 3, 'question' => 'Q', 'options' => ['a', 'b'], 'correct' => 0, 'explanation' => 'secret']],
            'script' => false,
        ]);
        self::assertStringNotContainsString('"correct"', $html);
        self::assertStringNotContainsString('secret', $html);
        self::assertStringNotContainsString('<script src', $html);
    }
}
