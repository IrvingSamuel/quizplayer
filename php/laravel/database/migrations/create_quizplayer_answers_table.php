<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create(config('quizplayer.table', 'quizplayer_answers'), function (Blueprint $table) {
            $table->string('video_id', 191);
            $table->string('user_id', 191)->default('');
            $table->string('quiz_id', 191);
            $table->string('option_id', 191);
            $table->boolean('is_correct')->nullable();
            $table->decimal('video_time', 10, 2)->default(0);
            $table->string('answered_at', 40);
            $table->primary(['video_id', 'user_id', 'quiz_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(config('quizplayer.table', 'quizplayer_answers'));
    }
};
