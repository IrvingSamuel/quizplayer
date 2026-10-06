<?php

declare(strict_types=1);

namespace QuizPlayer\Tests;

use InvalidArgumentException;
use PHPUnit\Framework\TestCase;
use QuizPlayer\Quizzes;

final class QuizzesTest extends TestCase
{
    public function testNormalizesCanonicalAndSortsByTime(): void
    {
        $out = Quizzes::normalize([
            ['id' => 'b', 'time' => 20, 'question' => 'B?', 'options' => [['id' => 'x', 'text' => 'X'], ['id' => 'y', 'text' => 'Y']], 'correct' => 'y'],
            ['id' => 'a', 'time' => 5, 'question' => 'A?', 'options' => ['One', 'Two'], 'correct' => 0],
        ]);
        self::assertSame(['a', 'b'], array_column($out, 'id'));
        self::assertSame([['id' => 'a', 'text' => 'One'], ['id' => 'b', 'text' => 'Two']], $out[0]['options']);
        self::assertSame('a', $out[0]['correct']);
        self::assertSame('y', $out[1]['correct']);
    }

    public function testAcceptsLegacyFormatAndJson(): void
    {
        $json = json_encode([['point' => 30, 'title' => 'Legacy?', 'awsers' => [['Opção A', 0], ['Opção B', 1]], 'audio_url' => 'x.mp3']]);
        $q = Quizzes::normalize($json)[0];
        self::assertSame('q1', $q['id']);
        self::assertSame(30.0, $q['time']);
        self::assertSame('b', $q['correct']);
        self::assertSame('x.mp3', $q['audioUrl']);
    }

    public function testKeepsSecondZeroAndDropsInvalid(): void
    {
        $out = Quizzes::normalize([
            ['time' => 0, 'question' => 'Zero', 'options' => ['a', 'b']],
            ['time' => '1:30', 'question' => 'Ninety', 'options' => ['a', 'b']],
            ['time' => 3, 'question' => 'One option', 'options' => ['a']],
            ['time' => -1, 'question' => 'Negative', 'options' => ['a', 'b']],
            'garbage',
        ]);
        self::assertSame([0.0, 90.0], array_column($out, 'time'));
        self::assertSame([], Quizzes::normalize('not json'));
    }

    public function testValidateStripSummarize(): void
    {
        $quizzes = Quizzes::normalize([
            ['id' => 'q1', 'time' => 1, 'question' => 'Q1', 'options' => ['a', 'b'], 'correct' => 1, 'explanation' => 'Because'],
            ['id' => 'q2', 'time' => 2, 'question' => 'Survey', 'options' => ['a', 'b']],
        ]);
        self::assertSame(['correct' => true, 'correctOptionId' => 'b', 'explanation' => 'Because'], Quizzes::validate($quizzes[0], 'b'));
        self::assertFalse(Quizzes::validate($quizzes[0], 'a')['correct']);
        self::assertSame(['correct' => null], Quizzes::validate($quizzes[1], 'a'));

        $stripped = Quizzes::strip($quizzes);
        self::assertArrayNotHasKey('correct', $stripped[0]);
        self::assertArrayNotHasKey('explanation', $stripped[0]);

        $summary = Quizzes::summarize($quizzes, [
            ['quizId' => 'q1', 'optionId' => 'b', 'correct' => true],
            ['quizId' => 'q2', 'optionId' => 'a', 'correct' => null],
        ]);
        self::assertSame(['total' => 2, 'answered' => 2, 'correct' => 1, 'score' => 100], array_diff_key($summary, ['answers' => 0]));

        $this->expectException(InvalidArgumentException::class);
        Quizzes::validate($quizzes[0], 'zzz');
    }
}
