# QuizPlayer for Go

```bash
go get github.com/IrvingSamuel/quizplayer/go
```

```go
h := quizplayer.NewHandler(quizplayer.Config{
    Quizzes: func(r *http.Request, videoID string) ([]quizplayer.Quiz, error) { return repo.Quizzes(videoID) },
    Store:   quizplayer.NewMemoryStore(), // or your own quizplayer.Store
    UserID:  func(r *http.Request) string { return session.UserID(r) },
})
http.Handle("/api/quizplayer/", http.StripPrefix("/api/quizplayer", h))
```

The handler works with `net/http`, chi, gorilla/mux, and with gin/echo through their `WrapH` helpers. It also exposes `Validate`, `Strip`, `Parse`/`Normalize` and `Summarize`.

📖 Docs: https://github.com/IrvingSamuel/quizplayer · Example: [examples/go-nethttp](../examples/go-nethttp)
