// Package quizplayer is the Go backend for QuizPlayer, an interactive HTML5
// video player that pauses at cue points and asks embedded quiz questions.
//
// It implements the QuizPlayer HTTP protocol (spec/protocol.md): answers are
// validated on the server — the browser never decides what is correct — and
// stored through a pluggable [Store].
//
//	h := quizplayer.NewHandler(quizplayer.Config{
//		Quizzes: func(r *http.Request, videoID string) ([]quizplayer.Quiz, error) { return repo.Quizzes(videoID) },
//		Store:   quizplayer.NewMemoryStore(),
//		UserID:  func(r *http.Request) string { return session.UserID(r) },
//	})
//	http.Handle("/api/quizplayer/", http.StripPrefix("/api/quizplayer", h))
package quizplayer
