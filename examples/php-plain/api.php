<?php
// Plain PHP backend. Point your web server so /api.php/* reaches this file,
// or run: php -S localhost:8000 (then the endpoint is /api.php).
declare(strict_types=1);

require __DIR__ . '/../../vendor/autoload.php'; // in your project: require 'vendor/autoload.php';

use QuizPlayer\Server;
use QuizPlayer\Store\PdoStore;

session_start();

$store = new PdoStore(new PDO('sqlite:' . sys_get_temp_dir() . '/quizplayer-example.sqlite'));
$store->createTable();

$server = new Server(
    getQuizzes: fn (string $videoId) => require __DIR__ . '/quizzes.php',
    store: $store,
    getUserId: fn () => $_SESSION['user_id'] ?? session_id(),
);

$server->respond('/api.php');
