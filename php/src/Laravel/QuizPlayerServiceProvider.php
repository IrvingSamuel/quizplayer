<?php

declare(strict_types=1);

namespace QuizPlayer\Laravel;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use QuizPlayer\Laravel\Http\QuizPlayerController;
use QuizPlayer\Laravel\View\QuizPlayerComponent;
use QuizPlayer\Server;
use QuizPlayer\Store\AnswerStore;

/**
 * Auto-discovered Laravel integration:
 *  - routes: POST {prefix}/answer, GET {prefix}/answers|quizzes|results
 *  - Blade component: <x-quizplayer src="..." :quizzes="$quizzes" video-id="1" />
 *  - publishable config + migration: php artisan vendor:publish --tag=quizplayer
 */
final class QuizPlayerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../../laravel/config/quizplayer.php', 'quizplayer');

        $this->app->singleton(AnswerStore::class, function ($app) {
            $class = $app['config']->get('quizplayer.store', DatabaseStore::class);

            return $app->make($class);
        });

        $this->app->singleton(Server::class, function ($app) {
            $provider = $app['config']->get('quizplayer.quizzes');

            return new Server(
                getQuizzes: function (string $videoId) use ($app, $provider) {
                    if (is_string($provider) && class_exists($provider)) {
                        $provider = $app->make($provider);
                    }
                    if ($provider instanceof QuizProvider) {
                        return $provider->quizzes($videoId);
                    }
                    if (is_callable($provider)) {
                        return $provider($videoId);
                    }

                    return [];
                },
                store: $app->make(AnswerStore::class),
                getUserId: fn () => $app['auth']->id(),
                requireUser: (bool) $app['config']->get('quizplayer.require_auth', false),
            );
        });
    }

    public function boot(): void
    {
        Blade::component('quizplayer', QuizPlayerComponent::class);

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__ . '/../../laravel/config/quizplayer.php' => config_path('quizplayer.php'),
            ], ['quizplayer', 'quizplayer-config']);
            $this->publishes([
                __DIR__ . '/../../laravel/database/migrations/create_quizplayer_answers_table.php' => database_path('migrations/' . date('Y_m_d_His') . '_create_quizplayer_answers_table.php'),
            ], ['quizplayer', 'quizplayer-migrations']);
        }

        if ($this->app['config']->get('quizplayer.routes.enabled', true)) {
            Route::middleware($this->app['config']->get('quizplayer.routes.middleware', ['web']))
                ->prefix($this->app['config']->get('quizplayer.routes.prefix', 'quizplayer'))
                ->name('quizplayer.')
                ->group(function () {
                    Route::post('answer', [QuizPlayerController::class, 'handle'])->name('answer');
                    Route::get('answers', [QuizPlayerController::class, 'handle'])->name('answers');
                    Route::get('quizzes', [QuizPlayerController::class, 'handle'])->name('quizzes');
                    Route::get('results', [QuizPlayerController::class, 'handle'])->name('results');
                });
        }
    }
}
