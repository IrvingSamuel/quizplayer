<?php
declare(strict_types=1);

require __DIR__ . '/../../vendor/autoload.php';

use QuizPlayer\Html;
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QuizPlayer · plain PHP</title>
  <style>body { max-width: 860px; margin: 40px auto; padding: 0 16px; font-family: system-ui, sans-serif; }</style>
</head>
<body>
  <h1>QuizPlayer · plain PHP</h1>
  <?= Html::render([
      'src' => 'https://irvingsamuel.github.io/quizplayer/media/demo.mp4',
      'quizzes' => require __DIR__ . '/quizzes.php', // answers are stripped automatically
      'videoId' => 'lesson-1',
      'endpoint' => '/api.php',
      'preventSkip' => true,
  ]) ?>
</body>
</html>
