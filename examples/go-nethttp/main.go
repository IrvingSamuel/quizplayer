package main

import (
	_ "embed"
	"encoding/json"
	"log"
	"net/http"
	"os"

	quizplayer "github.com/IrvingSamuel/quizplayer/go"
)

//go:embed index.html
var page []byte

// Quizzes WITH the right answers — they never leave the server.
var lessons = map[string][]quizplayer.Quiz{
	"lesson-1": {
		{ID: "q1", Time: 6, Question: "What is 2 + 2?", Options: []quizplayer.Option{{ID: "a", Text: "3"}, {ID: "b", Text: "4"}}, Correct: "b", Explanation: "Basic math."},
		{ID: "q2", Time: 18, Question: "HTTPS = HTTP over…", Options: []quizplayer.Option{{ID: "a", Text: "FTP"}, {ID: "b", Text: "TLS"}}, Correct: "b"},
	},
}

func main() {
	api := quizplayer.NewHandler(quizplayer.Config{
		Quizzes: func(r *http.Request, videoID string) ([]quizplayer.Quiz, error) { return lessons[videoID], nil },
		Store:   quizplayer.NewMemoryStore(), // implement quizplayer.Store for your database
		UserID:  func(r *http.Request) string { return "demo-user" }, // e.g. from your session
	})

	mux := http.NewServeMux()
	mux.Handle("/api/quizplayer/", http.StripPrefix("/api/quizplayer", api))
	mux.HandleFunc("/lesson-1.json", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(quizplayer.Strip(lessons["lesson-1"]))
	})
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write(page)
	})

	addr := ":8080"
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}
	log.Printf("http://localhost%s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
