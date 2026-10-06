# QuizPlayer protocol (v1)

The browser player and the server SDKs exchange JSON over HTTP. Any language
can implement it in under 100 lines: the player only needs two endpoints.

All paths are relative to the **endpoint** passed to the player
(`endpoint: "/api/quizplayer"`). Requests send `Accept: application/json`;
`POST` requests send `Content-Type: application/json`. Cookies are sent
(`credentials: "same-origin"` by default) and, if a `<meta name="csrf-token">`
exists, its value goes in the `X-CSRF-TOKEN` header.

User identity is **not** part of the protocol: resolve it from your session,
cookie or `Authorization` header (pass `headers` to the player for tokens).

## Quiz

See [`quiz.schema.json`](./quiz.schema.json).

```json
{
  "id": "intro-1",
  "time": 42.5,
  "question": "Which protocol does HTTPS add on top of HTTP?",
  "options": [
    { "id": "a", "text": "FTP" },
    { "id": "b", "text": "TLS" }
  ],
  "correct": "b",
  "explanation": "HTTPS is HTTP over TLS.",
  "audioUrl": "https://example.com/narration.mp3"
}
```

- `id` must be **stable**: answers are stored by quiz id, so reordering or
  editing quizzes does not corrupt previous results.
- `correct` is optional. Without it the question is a survey (`correct: null`).
- When the server validates, **never send `correct` / `explanation` to the browser**
  (use `stripAnswers()` / `Quizzes::strip()` / `quizplayer.Strip()`).

## Endpoints

### `POST {endpoint}/answer` — required

Request:

```json
{ "videoId": "lesson-7", "quizId": "intro-1", "optionId": "b", "videoTime": 42.5 }
```

Response `200`:

```json
{ "correct": true, "correctOptionId": "b", "explanation": "HTTPS is HTTP over TLS." }
```

| Field             | Type              | Notes                                         |
| ----------------- | ----------------- | --------------------------------------------- |
| `correct`         | `boolean \| null` | `null` for survey questions                   |
| `correctOptionId` | `string`          | optional — highlights the right option        |
| `explanation`     | `string`          | optional — shown under the feedback           |

The server **must** compute `correct` itself. Any `correct` field sent by the
client must be ignored. Only the latest answer per (video, user, quiz) is kept.

Errors: `401` unauthenticated · `404` unknown quiz · `422` missing/invalid ids.
On any error the player falls back to client-side validation (if `correct`
is present on the page) or shows a neutral message, and the viewer can keep watching.

### `GET {endpoint}/answers?videoId=…` — optional (resume)

```json
{ "answers": [{ "quizId": "intro-1", "optionId": "b", "correct": true, "videoTime": 42.5, "answeredAt": "2026-10-06T12:00:00Z" }] }
```

Loaded once when the player starts. Previously answered quizzes show an
"already answered — answer again?" prompt instead of the full quiz.

### `GET {endpoint}/quizzes?videoId=…` — optional

Returns `{ "quizzes": Quiz[] }` **without** `correct`/`explanation`. Useful for
SPAs that fetch quizzes instead of embedding them in the page.

### `GET {endpoint}/results?videoId=…` — optional

```json
{ "total": 3, "answered": 2, "correct": 1, "score": 50, "answers": [] }
```

`score` is the percentage of correct answers among gradable (non-survey) answers.

## Reference storage schema

```sql
CREATE TABLE quizplayer_answers (
  video_id    VARCHAR(191) NOT NULL,
  user_id     VARCHAR(191) NOT NULL DEFAULT '',  -- '' = anonymous
  quiz_id     VARCHAR(191) NOT NULL,
  option_id   VARCHAR(191) NOT NULL,
  is_correct  SMALLINT NULL,                      -- 1, 0 or NULL (survey)
  video_time  DECIMAL(10,2) NOT NULL DEFAULT 0,
  answered_at VARCHAR(40) NOT NULL,               -- ISO 8601
  PRIMARY KEY (video_id, user_id, quiz_id)
);
```
