package quizplayer

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestParseCanonicalAndLegacy(t *testing.T) {
	qs, err := Parse([]byte(`[
		{"id":"b","time":20,"question":"B?","options":[{"id":"x","text":"X"},{"id":"y","text":"Y"}],"correct":"y"},
		{"point":"0:05","title":"Legacy?","awsers":[["Opção A",0],["Opção B",1]],"audio_url":"x.mp3"},
		{"time":0,"question":"Zero","options":["a","b"],"correct":0},
		{"time":3,"question":"bad","options":["only"]},
		{"time":-1,"question":"neg","options":["a","b"]}
	]`))
	if err != nil {
		t.Fatal(err)
	}
	if len(qs) != 3 {
		t.Fatalf("want 3 quizzes, got %d", len(qs))
	}
	if qs[0].Time != 0 || qs[0].Correct != "a" || qs[0].ID != "q3" {
		t.Errorf("zero quiz: %+v", qs[0])
	}
	if qs[1].ID != "q2" || qs[1].Time != 5 || qs[1].Correct != "b" || qs[1].AudioURL != "x.mp3" {
		t.Errorf("legacy quiz: %+v", qs[1])
	}
	if qs[2].ID != "b" || qs[2].Correct != "y" {
		t.Errorf("canonical quiz: %+v", qs[2])
	}
}

func TestValidateAndStrip(t *testing.T) {
	q := Quiz{ID: "q1", Options: []Option{{"a", "3"}, {"b", "4"}}, Correct: "b", Explanation: "math"}
	r, err := Validate(q, "a")
	if err != nil || r.Correct == nil || *r.Correct || r.CorrectOptionID != "b" {
		t.Fatalf("unexpected %+v %v", r, err)
	}
	if _, err := Validate(q, "zz"); err == nil {
		t.Fatal("expected error")
	}
	survey, _ := Validate(Quiz{ID: "s", Options: []Option{{"a", "x"}, {"b", "y"}}}, "a")
	if survey.Correct != nil {
		t.Fatal("survey must have nil Correct")
	}
	s := Strip([]Quiz{q})
	if s[0].Correct != "" || s[0].Explanation != "" || q.Correct != "b" {
		t.Fatal("strip failed or mutated input")
	}
}

func do(h http.Handler, method, url, body string) (*httptest.ResponseRecorder, map[string]any) {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, url, strings.NewReader(body)))
	var out map[string]any
	_ = json.Unmarshal(rec.Body.Bytes(), &out)
	return rec, out
}

func TestHandler(t *testing.T) {
	quizzes := []Quiz{{ID: "q1", Time: 10, Question: "2+2?", Options: []Option{{"a", "3"}, {"b", "4"}}, Correct: "b"}}
	h := NewHandler(Config{
		Quizzes: func(*http.Request, string) ([]Quiz, error) { return quizzes, nil },
		UserID:  func(*http.Request) string { return "u1" },
	})

	rec, body := do(h, "POST", "/answer", `{"videoId":1,"quizId":"q1","optionId":"a","correct":true}`)
	if rec.Code != 200 || body["correct"] != false || body["correctOptionId"] != "b" {
		t.Fatalf("answer: %d %v", rec.Code, body)
	}
	do(h, "POST", "/answer", `{"videoId":"1","quizId":"q1","optionId":"b"}`)

	_, body = do(h, "GET", "/answers?videoId=1", "")
	answers := body["answers"].([]any)
	if len(answers) != 1 || answers[0].(map[string]any)["optionId"] != "b" {
		t.Fatalf("answers: %v", body)
	}

	_, body = do(h, "GET", "/results?videoId=1", "")
	if body["score"].(float64) != 100 {
		t.Fatalf("results: %v", body)
	}

	rec, _ = do(h, "GET", "/quizzes?videoId=1", "")
	if strings.Contains(rec.Body.String(), "correct") {
		t.Fatal("quizzes endpoint leaked answers")
	}

	for _, tc := range []struct {
		body string
		code int
	}{
		{`nope`, 400},
		{`{}`, 422},
		{`{"quizId":"zz","optionId":"a"}`, 404},
		{`{"quizId":"q1","optionId":"zz"}`, 422},
	} {
		if rec, _ := do(h, "POST", "/answer", tc.body); rec.Code != tc.code {
			t.Errorf("%s: want %d got %d", tc.body, tc.code, rec.Code)
		}
	}

	anon := NewHandler(Config{Quizzes: func(*http.Request, string) ([]Quiz, error) { return quizzes, nil }, RequireUser: true})
	if rec, _ := do(anon, "GET", "/answers", ""); rec.Code != 401 {
		t.Errorf("want 401 got %d", rec.Code)
	}
}
