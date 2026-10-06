package quizplayer

import (
	"context"
	"sort"
	"sync"
)

// Answer is a stored answer. UserID is empty for anonymous viewers.
type Answer struct {
	VideoID    string  `json:"-"`
	UserID     string  `json:"-"`
	QuizID     string  `json:"quizId"`
	OptionID   string  `json:"optionId"`
	Correct    *bool   `json:"correct"`
	VideoTime  float64 `json:"videoTime"`
	AnsweredAt string  `json:"answeredAt"`
}

// Store persists answers. Implementations keep only the latest answer per
// (video, user, quiz). See README for a database/sql example.
type Store interface {
	Save(ctx context.Context, a Answer) error
	List(ctx context.Context, videoID, userID string) ([]Answer, error)
}

// MemoryStore is a concurrency-safe in-memory Store, handy for demos and tests.
type MemoryStore struct {
	mu   sync.RWMutex
	rows map[[3]string]Answer
}

// NewMemoryStore returns an empty MemoryStore.
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{rows: map[[3]string]Answer{}}
}

// Save implements Store.
func (s *MemoryStore) Save(_ context.Context, a Answer) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.rows[[3]string{a.VideoID, a.UserID, a.QuizID}] = a
	return nil
}

// List implements Store.
func (s *MemoryStore) List(_ context.Context, videoID, userID string) ([]Answer, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := []Answer{}
	for k, a := range s.rows {
		if k[0] == videoID && k[1] == userID {
			out = append(out, a)
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].VideoTime < out[j].VideoTime })
	return out, nil
}
