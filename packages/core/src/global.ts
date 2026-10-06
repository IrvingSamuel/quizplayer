/**
 * <script> build: exposes `window.QuizPlayer` and auto-initializes every
 * `[data-quizplayer]` element once the DOM is ready.
 */
import { QuizPlayer } from './player';
import { normalizeQuizzes, stripAnswers, validateAnswer, summarize } from './data';
import { locales } from './i18n';

const Global = Object.assign(QuizPlayer, { normalizeQuizzes, stripAnswers, validateAnswer, summarize, locales, version: '__VERSION__' });
(window as unknown as { QuizPlayer: typeof Global }).QuizPlayer = Global;

const boot = () => QuizPlayer.autoInit();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
