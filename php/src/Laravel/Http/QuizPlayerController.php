<?php

declare(strict_types=1);

namespace QuizPlayer\Laravel\Http;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use QuizPlayer\Server;

final class QuizPlayerController
{
    public function handle(Request $request, Server $server): JsonResponse
    {
        $res = $server->handle(
            $request->method(),
            '/' . $request->path(),
            $request->query(),
            $request->isMethod('post') ? $request->json()->all() : null,
            $request,
        );

        return new JsonResponse($res['body'], $res['status']);
    }
}
