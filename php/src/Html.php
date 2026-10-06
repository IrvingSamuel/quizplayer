<?php

declare(strict_types=1);

namespace QuizPlayer;

/**
 * Renders the markup picked up by the browser bundle (`QuizPlayer.autoInit()`).
 * Works in any PHP template engine: plain PHP, Twig (`|raw`), WordPress, Symfony…
 */
final class Html
{
    public const DEFAULT_SCRIPT = 'https://cdn.jsdelivr.net/npm/@quizplayer/core@0/dist/quizplayer.min.js';

    private static bool $scriptPrinted = false;

    /**
     * @param array{
     *   src: string, quizzes?: array|string, videoId?: string|int, endpoint?: string, locale?: string,
     *   poster?: string, preventSkip?: bool, autoContinueMs?: int, fill?: bool, sounds?: bool,
     *   options?: array<string, mixed>, attributes?: array<string, scalar|null>, class?: string, script?: string|false
     * } $config
     *
     * `attributes` adds extra HTML attributes (id, class, style, aria-*…) to the container.
     *
     * When `endpoint` is set, right answers are stripped from the page automatically
     * (the server validates them).
     */
    public static function render(array $config): string
    {
        $quizzes = Quizzes::normalize($config['quizzes'] ?? []);
        if (!empty($config['endpoint'])) {
            $quizzes = Quizzes::strip($quizzes);
        }

        $attrs = ['data-quizplayer' => '', 'data-src' => $config['src']];
        $map = [
            'videoId' => 'data-video-id',
            'endpoint' => 'data-endpoint',
            'locale' => 'data-locale',
            'poster' => 'data-poster',
            'preventSkip' => 'data-prevent-skip',
            'autoContinueMs' => 'data-auto-continue',
            'fill' => 'data-fill',
            'sounds' => 'data-sounds',
        ];
        foreach ($map as $key => $attr) {
            if (!array_key_exists($key, $config) || $config[$key] === null) {
                continue;
            }
            $v = $config[$key];
            $attrs[$attr] = is_bool($v) ? ($v ? 'true' : 'false') : (string) $v;
        }
        if (!empty($config['options'])) {
            $attrs['data-options'] = (string) json_encode($config['options'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        foreach ($config['attributes'] ?? [] as $name => $value) {
            if ($value === null || $value === false || !preg_match('/^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/', (string) $name)) {
                continue;
            }
            $attrs[(string) $name] = $value === true ? '' : (string) $value;
        }
        if (!empty($config['class'])) {
            $attrs['class'] = trim(($attrs['class'] ?? '') . ' ' . $config['class']);
        }

        $html = '<div';
        foreach ($attrs as $name => $value) {
            $html .= ' ' . $name . ($value === '' ? '' : '="' . htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '"');
        }
        $json = json_encode($quizzes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP);
        $html .= '><script type="application/json">' . $json . '</script></div>';

        $script = $config['script'] ?? self::DEFAULT_SCRIPT;
        if ($script !== false && !self::$scriptPrinted) {
            self::$scriptPrinted = true;
            $html .= "\n" . self::script($script);
        }

        return $html;
    }

    public static function script(string $src = self::DEFAULT_SCRIPT): string
    {
        return '<script src="' . htmlspecialchars($src, ENT_QUOTES, 'UTF-8') . '" defer></script>';
    }

    /** @internal for tests */
    public static function resetScriptFlag(): void
    {
        self::$scriptPrinted = false;
    }
}
