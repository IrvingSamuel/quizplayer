package quizplayer

import (
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// Option is a selectable answer.
type Option struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

// Quiz is the canonical quiz shape shared with the JavaScript player.
type Quiz struct {
	ID          string   `json:"id"`
	Time        float64  `json:"time"`
	Question    string   `json:"question"`
	Options     []Option `json:"options"`
	Correct     string   `json:"correct,omitempty"`
	AudioURL    string   `json:"audioUrl,omitempty"`
	Explanation string   `json:"explanation,omitempty"`
}

// Result is returned to the player after an answer is validated.
// Correct is nil for survey questions (no right answer).
type Result struct {
	Correct         *bool  `json:"correct"`
	CorrectOptionID string `json:"correctOptionId,omitempty"`
	Explanation     string `json:"explanation,omitempty"`
}

// ErrUnknownOption is returned when an option does not belong to the quiz.
var ErrUnknownOption = errors.New("quizplayer: unknown option")

// Validate checks an answer against a quiz.
func Validate(q Quiz, optionID string) (Result, error) {
	found := false
	for _, o := range q.Options {
		if o.ID == optionID {
			found = true
			break
		}
	}
	if !found {
		return Result{}, fmt.Errorf("%w %q for quiz %q", ErrUnknownOption, optionID, q.ID)
	}
	res := Result{Explanation: q.Explanation}
	if q.Correct != "" {
		ok := q.Correct == optionID
		res.Correct = &ok
		res.CorrectOptionID = q.Correct
	}
	return res, nil
}

// Strip removes right answers and explanations so quizzes can be sent to the browser.
func Strip(quizzes []Quiz) []Quiz {
	out := make([]Quiz, len(quizzes))
	for i, q := range quizzes {
		q.Correct = ""
		q.Explanation = ""
		q.Options = append([]Option(nil), q.Options...)
		out[i] = q
	}
	return out
}

// Find returns the quiz with the given id.
func Find(quizzes []Quiz, id string) (Quiz, bool) {
	for _, q := range quizzes {
		if q.ID == id {
			return q, true
		}
	}
	return Quiz{}, false
}

// Parse decodes quizzes from JSON in canonical or legacy shapes
// (point/time_point, title, answers/awsers as [text, 0|1] tuples, audio_url,
// correct as option id or zero-based index). Invalid entries are dropped and
// the result is sorted by time.
func Parse(data []byte) ([]Quiz, error) {
	var raw []map[string]any
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}
	return Normalize(raw), nil
}

const letters = "abcdefghijklmnopqrstuvwxyz"

// Normalize converts generic maps (e.g. decoded JSON) into canonical quizzes.
func Normalize(raw []map[string]any) []Quiz {
	out := make([]Quiz, 0, len(raw))
	for index, m := range raw {
		if m == nil {
			continue
		}
		t, ok := parseTime(pick(m, "time", "point", "time_point", "timePoint", "at"))
		question, _ := pick(m, "question", "title", "text").(string)
		rawOpts, isList := pick(m, "options", "answers", "awsers", "choices").([]any)
		if !ok || t < 0 || question == "" || !isList {
			continue
		}

		q := Quiz{Time: t, Question: question}
		for i, opt := range rawOpts {
			id := strconv.Itoa(i)
			if i < len(letters) {
				id = string(letters[i])
			}
			text, flagged := "", false
			switch v := opt.(type) {
			case string:
				text = v
			case float64:
				text = strconv.FormatFloat(v, 'f', -1, 64)
			case []any:
				if len(v) > 0 && v[0] != nil {
					text = fmt.Sprint(v[0])
				}
				if len(v) > 1 {
					flagged = truthy(v[1])
				}
			case map[string]any:
				if s, ok := pick(v, "text", "label", "title").(string); ok {
					text = s
				}
				if rid := pick(v, "id"); rid != nil && fmt.Sprint(rid) != "" {
					id = stringify(rid)
				}
				flagged = truthy(pick(v, "correct", "isCorrect", "is_correct"))
			}
			if text == "" {
				continue
			}
			q.Options = append(q.Options, Option{ID: id, Text: text})
			if flagged && q.Correct == "" {
				q.Correct = id
			}
		}
		if len(q.Options) < 2 {
			continue
		}
		switch c := pick(m, "correct", "correctOptionId", "correct_option_id", "answer").(type) {
		case float64:
			if i := int(c); float64(i) == c && i >= 0 && i < len(q.Options) {
				q.Correct = q.Options[i].ID
			}
		case string:
			for _, o := range q.Options {
				if o.ID == c {
					q.Correct = c
				}
			}
		}
		if id := pick(m, "id", "uuid", "key"); id != nil {
			q.ID = stringify(id)
		} else {
			q.ID = "q" + strconv.Itoa(index+1)
		}
		q.AudioURL, _ = pick(m, "audioUrl", "audio_url", "audio").(string)
		q.Explanation, _ = pick(m, "explanation", "feedback").(string)
		out = append(out, q)
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Time < out[j].Time })
	return out
}

func pick(m map[string]any, keys ...string) any {
	for _, k := range keys {
		if v, ok := m[k]; ok && v != nil {
			return v
		}
	}
	return nil
}

func truthy(v any) bool {
	switch x := v.(type) {
	case bool:
		return x
	case float64:
		return x == 1
	case string:
		return x == "1" || x == "true"
	}
	return false
}

func stringify(v any) string {
	if f, ok := v.(float64); ok {
		return strconv.FormatFloat(f, 'f', -1, 64)
	}
	return fmt.Sprint(v)
}

// parseTime accepts 90, "90", "1:30" or "01:01:30".
func parseTime(v any) (float64, bool) {
	switch x := v.(type) {
	case float64:
		return x, true
	case string:
		s := strings.TrimSpace(x)
		if s == "" {
			return 0, false
		}
		if strings.Contains(s, ":") {
			total := 0.0
			for _, part := range strings.Split(s, ":") {
				f, err := strconv.ParseFloat(part, 64)
				if err != nil {
					return 0, false
				}
				total = total*60 + f
			}
			return total, true
		}
		f, err := strconv.ParseFloat(s, 64)
		return f, err == nil
	}
	return 0, false
}
