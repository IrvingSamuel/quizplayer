/** A selectable answer of a quiz. */
export interface QuizOption {
  /** Stable identifier (unique inside the quiz). */
  id: string;
  /** Text shown to the viewer. */
  text: string;
}

/** Canonical quiz shape used everywhere (front-end, back-end SDKs, JSON schema). */
export interface Quiz {
  /** Stable identifier. Keep it stable across edits so stored answers stay valid. */
  id: string;
  /** Moment (in seconds) at which the video pauses and the quiz appears. */
  time: number;
  /** The question text. */
  question: string;
  /** Possible answers. */
  options: QuizOption[];
  /**
   * Id of the correct option. Omit it on the client when the server validates
   * (`endpoint` / `validateAnswer`) so the answer is not leaked in the page source.
   * Omit it everywhere to create a survey question (no right/wrong).
   */
  correct?: string;
  /** Optional narration / audio played while the quiz is open. */
  audioUrl?: string;
  /** Optional explanation shown after answering. */
  explanation?: string;
}

/** Anything `normalizeQuizzes` accepts (canonical, partial or legacy shapes). */
export type QuizInput = Record<string, unknown>;

export interface ValidationResult {
  /** `true`/`false`, or `null` for survey questions without a right answer. */
  correct: boolean | null;
  correctOptionId?: string;
  explanation?: string;
}

export interface AnswerRecord {
  quizId: string;
  optionId: string;
  correct: boolean | null;
  videoTime: number;
  answeredAt: string;
}

export interface AnswerPayload {
  videoId?: string;
  quizId: string;
  optionId: string;
  videoTime: number;
}

export interface Results {
  total: number;
  answered: number;
  correct: number;
  /** Percentage (0-100) of correct answers among gradable quizzes. */
  score: number;
  answers: AnswerRecord[];
}
