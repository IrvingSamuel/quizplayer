/**
 * DOM-free helpers shared by the browser player and the Node server SDK.
 */
import type { Quiz, QuizInput, QuizOption, ValidationResult, AnswerRecord, Results } from './types';

export * from './types';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

function pick<T = unknown>(obj: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k] as T;
  }
  return undefined;
}

function isTruthyFlag(v: unknown): boolean {
  return v === true || v === 1 || v === '1' || v === 'true';
}

/** Parses "90", 90, "1:30" or "01:01:30" into seconds. */
export function parseTime(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.includes(':')) {
      return trimmed.split(':').reduce((acc, part) => acc * 60 + Number(part), 0);
    }
    return Number(trimmed);
  }
  return NaN;
}

/**
 * Normalizes quizzes into the canonical {@link Quiz} shape.
 *
 * Accepted option formats: `"text"`, `{ id?, text, correct? }`, `[text, 0|1]`.
 * Accepted aliases: `point`/`time_point` → `time`, `title` → `question`,
 * `answers`/`awsers` → `options`, `audio_url` → `audioUrl`.
 * `correct` may be an option id or a zero-based index.
 *
 * Quizzes are returned sorted by time. Invalid entries are dropped.
 */
export function normalizeQuizzes(input: unknown): Quiz[] {
  let list: unknown = input;
  if (typeof list === 'string') {
    try {
      list = JSON.parse(list);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];

  const out: Quiz[] = [];
  list.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') return;
    const q = raw as QuizInput;

    const time = parseTime(pick(q, 'time', 'point', 'time_point', 'timePoint', 'at'));
    const question = pick<string>(q, 'question', 'title', 'text');
    const rawOptions = pick<unknown[]>(q, 'options', 'answers', 'awsers', 'choices');
    if (!Number.isFinite(time) || time < 0 || !question || !Array.isArray(rawOptions)) return;

    let correct: string | undefined;
    const options: QuizOption[] = [];
    rawOptions.forEach((opt, i) => {
      const fallbackId = LETTERS[i] ?? String(i);
      let id = fallbackId;
      let text: string | undefined;
      let flagged = false;
      if (typeof opt === 'string' || typeof opt === 'number') {
        text = String(opt);
      } else if (Array.isArray(opt)) {
        text = opt[0] == null ? undefined : String(opt[0]);
        flagged = isTruthyFlag(opt[1]);
      } else if (opt && typeof opt === 'object') {
        const o = opt as Record<string, unknown>;
        text = pick<string>(o, 'text', 'label', 'title');
        if (o.id !== undefined && o.id !== null && o.id !== '') id = String(o.id);
        flagged = isTruthyFlag(pick(o, 'correct', 'isCorrect', 'is_correct'));
      }
      if (text === undefined || text === '') return;
      options.push({ id, text: String(text) });
      if (flagged && correct === undefined) correct = id;
    });
    if (options.length < 2) return;

    const rawCorrect = pick(q, 'correct', 'correctOptionId', 'correct_option_id', 'answer');
    if (typeof rawCorrect === 'number' && options[rawCorrect]) {
      correct = options[rawCorrect].id;
    } else if (typeof rawCorrect === 'string' && options.some((o) => o.id === rawCorrect)) {
      correct = rawCorrect;
    }

    const rawId = pick(q, 'id', 'uuid', 'key');
    const quiz: Quiz = {
      id: rawId !== undefined ? String(rawId) : `q${index + 1}`,
      time,
      question: String(question),
      options,
    };
    if (correct !== undefined) quiz.correct = correct;
    const audioUrl = pick<string>(q, 'audioUrl', 'audio_url', 'audio');
    if (audioUrl) quiz.audioUrl = audioUrl;
    const explanation = pick<string>(q, 'explanation', 'feedback');
    if (explanation) quiz.explanation = explanation;
    out.push(quiz);
  });

  return out.sort((a, b) => a.time - b.time);
}

/** Removes the right answers so quizzes can be safely sent to the browser. */
export function stripAnswers(quizzes: Quiz[]): Quiz[] {
  return quizzes.map(({ correct: _c, explanation: _e, ...rest }) => ({ ...rest, options: rest.options.map((o) => ({ ...o })) }));
}

/** Checks one answer. Throws if the option does not belong to the quiz. */
export function validateAnswer(quiz: Quiz, optionId: string): ValidationResult {
  if (!quiz.options.some((o) => o.id === optionId)) {
    throw new Error(`Unknown option "${optionId}" for quiz "${quiz.id}"`);
  }
  if (quiz.correct === undefined) {
    return quiz.explanation ? { correct: null, explanation: quiz.explanation } : { correct: null };
  }
  const result: ValidationResult = { correct: quiz.correct === optionId, correctOptionId: quiz.correct };
  if (quiz.explanation) result.explanation = quiz.explanation;
  return result;
}

/** Builds the results summary for a set of quizzes and answers. */
export function summarize(quizzes: Quiz[], answers: AnswerRecord[]): Results {
  const ids = new Set(quizzes.map((q) => q.id));
  const relevant = answers.filter((a) => ids.has(a.quizId));
  const gradable = relevant.filter((a) => a.correct !== null);
  const correct = gradable.filter((a) => a.correct === true).length;
  return {
    total: quizzes.length,
    answered: relevant.length,
    correct,
    score: gradable.length ? Math.round((correct / gradable.length) * 100) : 0,
    answers: relevant,
  };
}
