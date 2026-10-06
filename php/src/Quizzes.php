<?php

declare(strict_types=1);

namespace QuizPlayer;

use InvalidArgumentException;

/**
 * Quiz helpers that mirror the JavaScript `@quizplayer/core/data` module.
 *
 * Canonical quiz shape:
 *   ['id' => 'q1', 'time' => 30.0, 'question' => '...', 'options' => [['id' => 'a', 'text' => '...']],
 *    'correct' => 'a', 'audioUrl' => '...', 'explanation' => '...']
 */
final class Quizzes
{
    private const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

    /**
     * Normalizes canonical, partial or legacy quizzes (array or JSON string).
     * Invalid entries are dropped; the result is sorted by time.
     *
     * @return list<array<string, mixed>>
     */
    public static function normalize(mixed $input): array
    {
        if (is_string($input)) {
            $input = json_decode($input, true);
        }
        if (!is_array($input)) {
            return [];
        }

        $out = [];
        foreach (array_values($input) as $index => $raw) {
            if (is_object($raw)) {
                $raw = json_decode((string) json_encode($raw), true);
            }
            if (!is_array($raw)) {
                continue;
            }

            $time = self::parseTime(self::pick($raw, 'time', 'point', 'time_point', 'timePoint', 'at'));
            $question = self::pick($raw, 'question', 'title', 'text');
            $rawOptions = self::pick($raw, 'options', 'answers', 'awsers', 'choices');
            if ($time === null || $time < 0 || !is_string($question) || $question === '' || !is_array($rawOptions)) {
                continue;
            }

            $options = [];
            $correct = null;
            foreach (array_values($rawOptions) as $i => $opt) {
                $id = self::LETTERS[$i] ?? (string) $i;
                $text = null;
                $flagged = false;
                if (is_string($opt) || is_int($opt) || is_float($opt)) {
                    $text = (string) $opt;
                } elseif (is_array($opt) && array_is_list($opt)) {
                    $text = isset($opt[0]) ? (string) $opt[0] : null;
                    $flagged = self::truthy($opt[1] ?? null);
                } elseif (is_array($opt)) {
                    $t = self::pick($opt, 'text', 'label', 'title');
                    $text = $t === null ? null : (string) $t;
                    if (isset($opt['id']) && $opt['id'] !== '') {
                        $id = (string) $opt['id'];
                    }
                    $flagged = self::truthy(self::pick($opt, 'correct', 'isCorrect', 'is_correct'));
                }
                if ($text === null || $text === '') {
                    continue;
                }
                $options[] = ['id' => $id, 'text' => $text];
                if ($flagged && $correct === null) {
                    $correct = $id;
                }
            }
            if (count($options) < 2) {
                continue;
            }

            $rawCorrect = self::pick($raw, 'correct', 'correctOptionId', 'correct_option_id', 'answer');
            $ids = array_column($options, 'id');
            if (is_int($rawCorrect) && isset($options[$rawCorrect])) {
                $correct = $options[$rawCorrect]['id'];
            } elseif (is_string($rawCorrect) && in_array($rawCorrect, $ids, true)) {
                $correct = $rawCorrect;
            }

            $rawId = self::pick($raw, 'id', 'uuid', 'key');
            $quiz = [
                'id' => $rawId !== null ? (string) $rawId : 'q' . ($index + 1),
                'time' => $time,
                'question' => $question,
                'options' => $options,
            ];
            if ($correct !== null) {
                $quiz['correct'] = $correct;
            }
            $audio = self::pick($raw, 'audioUrl', 'audio_url', 'audio');
            if (is_string($audio) && $audio !== '') {
                $quiz['audioUrl'] = $audio;
            }
            $explanation = self::pick($raw, 'explanation', 'feedback');
            if (is_string($explanation) && $explanation !== '') {
                $quiz['explanation'] = $explanation;
            }
            $out[] = $quiz;
        }

        usort($out, static fn (array $a, array $b): int => $a['time'] <=> $b['time']);

        return $out;
    }

    /**
     * Removes right answers and explanations, so quizzes can be sent to the browser.
     *
     * @param list<array<string, mixed>> $quizzes
     * @return list<array<string, mixed>>
     */
    public static function strip(array $quizzes): array
    {
        return array_map(static function (array $q): array {
            unset($q['correct'], $q['explanation']);

            return $q;
        }, $quizzes);
    }

    /**
     * @param list<array<string, mixed>> $quizzes
     */
    public static function find(array $quizzes, string $id): ?array
    {
        foreach ($quizzes as $quiz) {
            if ($quiz['id'] === $id) {
                return $quiz;
            }
        }

        return null;
    }

    /**
     * Validates one answer.
     *
     * @return array{correct: bool|null, correctOptionId?: string, explanation?: string}
     *
     * @throws InvalidArgumentException when the option does not belong to the quiz
     */
    public static function validate(array $quiz, string $optionId): array
    {
        if (!in_array($optionId, array_column($quiz['options'], 'id'), true)) {
            throw new InvalidArgumentException(sprintf('Unknown option "%s" for quiz "%s"', $optionId, $quiz['id']));
        }
        $result = ['correct' => null];
        if (isset($quiz['correct'])) {
            $result = ['correct' => $quiz['correct'] === $optionId, 'correctOptionId' => $quiz['correct']];
        }
        if (!empty($quiz['explanation'])) {
            $result['explanation'] = $quiz['explanation'];
        }

        return $result;
    }

    /**
     * @param list<array<string, mixed>> $quizzes
     * @param list<array<string, mixed>> $answers
     * @return array{total: int, answered: int, correct: int, score: int, answers: list<array<string, mixed>>}
     */
    public static function summarize(array $quizzes, array $answers): array
    {
        $ids = array_column($quizzes, 'id');
        $relevant = array_values(array_filter($answers, static fn (array $a): bool => in_array($a['quizId'], $ids, true)));
        $gradable = array_filter($relevant, static fn (array $a): bool => $a['correct'] !== null);
        $correct = count(array_filter($gradable, static fn (array $a): bool => $a['correct'] === true));

        return [
            'total' => count($quizzes),
            'answered' => count($relevant),
            'correct' => $correct,
            'score' => $gradable ? (int) round($correct / count($gradable) * 100) : 0,
            'answers' => $relevant,
        ];
    }

    /** Parses 90, "90", "1:30" or "01:01:30" into seconds. */
    public static function parseTime(mixed $value): ?float
    {
        if (is_int($value) || is_float($value)) {
            return (float) $value;
        }
        if (!is_string($value) || trim($value) === '') {
            return null;
        }
        $value = trim($value);
        if (str_contains($value, ':')) {
            $total = 0.0;
            foreach (explode(':', $value) as $part) {
                if (!is_numeric($part)) {
                    return null;
                }
                $total = $total * 60 + (float) $part;
            }

            return $total;
        }

        return is_numeric($value) ? (float) $value : null;
    }

    private static function pick(array $data, string ...$keys): mixed
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $data) && $data[$key] !== null) {
                return $data[$key];
            }
        }

        return null;
    }

    private static function truthy(mixed $v): bool
    {
        return $v === true || $v === 1 || $v === '1' || $v === 'true';
    }
}
