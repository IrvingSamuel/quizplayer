package quizplayer

import (
	"encoding/json"
	"errors"
	"math"
	"net/http"
	"strings"
	"time"
)

// Config configures the HTTP handler.
type Config struct {
	// Quizzes returns the quizzes (with right answers) of a video. Required.
	Quizzes func(r *http.Request, videoID string) ([]Quiz, error)
	// Store persists answers. Defaults to a MemoryStore.
	Store Store
	// UserID resolves the current viewer ("" = anonymous).
	UserID func(r *http.Request) string
	// RequireUser rejects anonymous viewers with 401.
	RequireUser bool
	// OnAnswer is called after an answer is stored (analytics, LMS progress…).
	OnAnswer func(r *http.Request, a Answer)
}

// Results summarizes a viewer's answers.
type Results struct {
	Total    int      `json:"total"`
	Answered int      `json:"answered"`
	Correct  int      `json:"correct"`
	Score    int      `json:"score"`
	Answers  []Answer `json:"answers"`
}

type answerRequest struct {
	VideoID   json.RawMessage `json:"videoId"`
	QuizID    json.RawMessage `json:"quizId"`
	OptionID  json.RawMessage `json:"optionId"`
	VideoTime *float64        `json:"videoTime"`
}

// NewHandler returns an http.Handler serving the QuizPlayer protocol:
//
//	POST …/answer   GET …/answers   GET …/quizzes   GET …/results
//
// Mount it under any prefix (use http.StripPrefix or a router group).
func NewHandler(cfg Config) http.Handler {
	if cfg.Store == nil {
		cfg.Store = NewMemoryStore()
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := ""
		if cfg.UserID != nil {
			userID = cfg.UserID(r)
		}
		if cfg.RequireUser && userID == "" {
			writeJSON(w, http.StatusUnauthorized, errBody("unauthenticated"))
			return
		}
		path := strings.TrimRight(r.URL.Path, "/")
		videoID := r.URL.Query().Get("videoId")

		switch {
		case r.Method == http.MethodPost && strings.HasSuffix(path, "/answer"):
			var req answerRequest
			if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
				writeJSON(w, http.StatusBadRequest, errBody("invalid JSON"))
				return
			}
			videoID = rawString(req.VideoID)
			quizID, optionID := rawString(req.QuizID), rawString(req.OptionID)
			if quizID == "" || optionID == "" {
				writeJSON(w, http.StatusUnprocessableEntity, errBody("quizId and optionId are required"))
				return
			}
			quizzes, err := cfg.Quizzes(r, videoID)
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, errBody("could not load quizzes"))
				return
			}
			quiz, ok := Find(quizzes, quizID)
			if !ok {
				writeJSON(w, http.StatusNotFound, errBody("quiz not found"))
				return
			}
			res, err := Validate(quiz, optionID)
			if errors.Is(err, ErrUnknownOption) {
				writeJSON(w, http.StatusUnprocessableEntity, errBody("invalid optionId"))
				return
			}
			vt := quiz.Time
			if req.VideoTime != nil && !math.IsNaN(*req.VideoTime) {
				vt = *req.VideoTime
			}
			a := Answer{VideoID: videoID, UserID: userID, QuizID: quizID, OptionID: optionID, Correct: res.Correct, VideoTime: vt, AnsweredAt: time.Now().UTC().Format(time.RFC3339)}
			if err := cfg.Store.Save(r.Context(), a); err != nil {
				writeJSON(w, http.StatusInternalServerError, errBody("could not save answer"))
				return
			}
			if cfg.OnAnswer != nil {
				cfg.OnAnswer(r, a)
			}
			writeJSON(w, http.StatusOK, res)

		case r.Method == http.MethodGet && strings.HasSuffix(path, "/answers"):
			answers, err := cfg.Store.List(r.Context(), videoID, userID)
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, errBody("could not load answers"))
				return
			}
			writeJSON(w, http.StatusOK, map[string]any{"answers": answers})

		case r.Method == http.MethodGet && strings.HasSuffix(path, "/quizzes"):
			quizzes, err := cfg.Quizzes(r, videoID)
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, errBody("could not load quizzes"))
				return
			}
			writeJSON(w, http.StatusOK, map[string]any{"quizzes": Strip(quizzes)})

		case r.Method == http.MethodGet && strings.HasSuffix(path, "/results"):
			quizzes, err := cfg.Quizzes(r, videoID)
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, errBody("could not load quizzes"))
				return
			}
			answers, err := cfg.Store.List(r.Context(), videoID, userID)
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, errBody("could not load answers"))
				return
			}
			writeJSON(w, http.StatusOK, Summarize(quizzes, answers))

		default:
			writeJSON(w, http.StatusNotFound, errBody("not found"))
		}
	})
}

// Summarize computes the results of a set of answers.
func Summarize(quizzes []Quiz, answers []Answer) Results {
	ids := map[string]bool{}
	for _, q := range quizzes {
		ids[q.ID] = true
	}
	res := Results{Total: len(quizzes), Answers: []Answer{}}
	gradable := 0
	for _, a := range answers {
		if !ids[a.QuizID] {
			continue
		}
		res.Answers = append(res.Answers, a)
		if a.Correct != nil {
			gradable++
			if *a.Correct {
				res.Correct++
			}
		}
	}
	res.Answered = len(res.Answers)
	if gradable > 0 {
		res.Score = int(math.Round(float64(res.Correct) / float64(gradable) * 100))
	}
	return res
}

// rawString accepts JSON strings and numbers ("1" or 1).
func rawString(raw json.RawMessage) string {
	if len(raw) == 0 || string(raw) == "null" {
		return ""
	}
	var s string
	if json.Unmarshal(raw, &s) == nil {
		return s
	}
	return strings.TrimSpace(string(raw))
}

func errBody(msg string) map[string]string { return map[string]string{"error": msg} }

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
