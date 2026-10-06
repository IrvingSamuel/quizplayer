export { QuizPlayer, optionsFromDataset } from './player';
export type {
  QuizPlayerOptions,
  QuizPlayerEventMap,
  QuizShowDetail,
  AnswerDetail,
  SeekBlockedDetail,
  VideoSource,
} from './player';
export { normalizeQuizzes, stripAnswers, validateAnswer, summarize, parseTime } from './data';
export type { Quiz, QuizOption, QuizInput, ValidationResult, AnswerRecord, AnswerPayload, Results } from './types';
export { locales, resolveMessages } from './i18n';
export type { Messages, Locale } from './i18n';
export type { SoundOptions } from './sounds';
export { css, injectStyles } from './styles';
export { QuizPlayer as default } from './player';
