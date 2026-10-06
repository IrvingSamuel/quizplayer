export interface Messages {
  play: string;
  pause: string;
  mute: string;
  unmute: string;
  fullscreen: string;
  exitFullscreen: string;
  progress: string;
  questionOf: string;
  confirm: string;
  continue: string;
  correct: string;
  incorrect: string;
  incorrectHint: string;
  recorded: string;
  checking: string;
  error: string;
  autoContinue: string;
  alreadyAnsweredTitle: string;
  alreadyAnsweredText: string;
  answerAgain: string;
  keepWatching: string;
  toastTimer: string;
  seekBlocked: string;
}

export type Locale = 'en' | 'pt-BR' | 'pt' | 'es' | 'fr' | 'de' | 'zh-CN' | 'ja';

const en: Messages = {
  play: 'Play',
  pause: 'Pause',
  mute: 'Mute',
  unmute: 'Unmute',
  fullscreen: 'Fullscreen',
  exitFullscreen: 'Exit fullscreen',
  progress: 'Video progress',
  questionOf: 'Question {n} of {total}',
  confirm: 'Confirm answer',
  continue: 'Continue video',
  correct: 'Correct answer! Well done!',
  incorrect: 'Not quite.',
  incorrectHint: 'The correct answer is highlighted.',
  recorded: 'Answer recorded. Thank you!',
  checking: 'Checking…',
  error: 'Could not send your answer. You can continue watching.',
  autoContinue: 'Continuing in {s}s…',
  alreadyAnsweredTitle: 'Quiz already answered',
  alreadyAnsweredText: 'You already answered this question. Do you want to answer again?',
  answerAgain: 'Answer again',
  keepWatching: 'Keep watching',
  toastTimer: 'Continuing in {s}s',
  seekBlocked: 'Answer the pending question before skipping ahead.',
};

const ptBR: Messages = {
  play: 'Reproduzir',
  pause: 'Pausar',
  mute: 'Silenciar',
  unmute: 'Ativar som',
  fullscreen: 'Tela cheia',
  exitFullscreen: 'Sair da tela cheia',
  progress: 'Progresso do vídeo',
  questionOf: 'Pergunta {n} de {total}',
  confirm: 'Confirmar resposta',
  continue: 'Continuar vídeo',
  correct: 'Resposta correta! Excelente!',
  incorrect: 'Resposta incorreta.',
  incorrectHint: 'A alternativa correta está destacada.',
  recorded: 'Resposta registrada. Obrigado!',
  checking: 'Verificando…',
  error: 'Não foi possível enviar sua resposta. Você pode continuar assistindo.',
  autoContinue: 'Continuando em {s}s…',
  alreadyAnsweredTitle: 'Quiz já respondido',
  alreadyAnsweredText: 'Você já respondeu esta pergunta. Deseja responder novamente?',
  answerAgain: 'Responder novamente',
  keepWatching: 'Continuar assistindo',
  toastTimer: 'Continuando em {s}s',
  seekBlocked: 'Responda a pergunta pendente antes de avançar.',
};

const es: Messages = {
  play: 'Reproducir',
  pause: 'Pausar',
  mute: 'Silenciar',
  unmute: 'Activar sonido',
  fullscreen: 'Pantalla completa',
  exitFullscreen: 'Salir de pantalla completa',
  progress: 'Progreso del video',
  questionOf: 'Pregunta {n} de {total}',
  confirm: 'Confirmar respuesta',
  continue: 'Continuar video',
  correct: '¡Respuesta correcta! ¡Excelente!',
  incorrect: 'Respuesta incorrecta.',
  incorrectHint: 'La opción correcta está resaltada.',
  recorded: 'Respuesta registrada. ¡Gracias!',
  checking: 'Verificando…',
  error: 'No se pudo enviar tu respuesta. Puedes seguir viendo.',
  autoContinue: 'Continuando en {s}s…',
  alreadyAnsweredTitle: 'Pregunta ya respondida',
  alreadyAnsweredText: 'Ya respondiste esta pregunta. ¿Quieres responder de nuevo?',
  answerAgain: 'Responder de nuevo',
  keepWatching: 'Seguir viendo',
  toastTimer: 'Continuando en {s}s',
  seekBlocked: 'Responde la pregunta pendiente antes de avanzar.',
};

const fr: Messages = {
  play: 'Lecture',
  pause: 'Pause',
  mute: 'Couper le son',
  unmute: 'Activer le son',
  fullscreen: 'Plein écran',
  exitFullscreen: 'Quitter le plein écran',
  progress: 'Progression de la vidéo',
  questionOf: 'Question {n} sur {total}',
  confirm: 'Valider la réponse',
  continue: 'Reprendre la vidéo',
  correct: 'Bonne réponse ! Bravo !',
  incorrect: 'Mauvaise réponse.',
  incorrectHint: 'La bonne réponse est mise en évidence.',
  recorded: 'Réponse enregistrée. Merci !',
  checking: 'Vérification…',
  error: "Impossible d'envoyer votre réponse. Vous pouvez continuer à regarder.",
  autoContinue: 'Reprise dans {s} s…',
  alreadyAnsweredTitle: 'Question déjà répondue',
  alreadyAnsweredText: 'Vous avez déjà répondu à cette question. Voulez-vous répondre à nouveau ?',
  answerAgain: 'Répondre à nouveau',
  keepWatching: 'Continuer à regarder',
  toastTimer: 'Reprise dans {s} s',
  seekBlocked: 'Répondez à la question en attente avant d’avancer.',
};

const de: Messages = {
  play: 'Abspielen',
  pause: 'Pause',
  mute: 'Stummschalten',
  unmute: 'Ton an',
  fullscreen: 'Vollbild',
  exitFullscreen: 'Vollbild beenden',
  progress: 'Videofortschritt',
  questionOf: 'Frage {n} von {total}',
  confirm: 'Antwort bestätigen',
  continue: 'Video fortsetzen',
  correct: 'Richtig! Sehr gut!',
  incorrect: 'Leider falsch.',
  incorrectHint: 'Die richtige Antwort ist markiert.',
  recorded: 'Antwort gespeichert. Danke!',
  checking: 'Wird geprüft…',
  error: 'Deine Antwort konnte nicht gesendet werden. Du kannst weiterschauen.',
  autoContinue: 'Weiter in {s} s…',
  alreadyAnsweredTitle: 'Frage bereits beantwortet',
  alreadyAnsweredText: 'Du hast diese Frage bereits beantwortet. Möchtest du erneut antworten?',
  answerAgain: 'Erneut antworten',
  keepWatching: 'Weiterschauen',
  toastTimer: 'Weiter in {s} s',
  seekBlocked: 'Beantworte zuerst die offene Frage.',
};

const zhCN: Messages = {
  play: '播放',
  pause: '暂停',
  mute: '静音',
  unmute: '取消静音',
  fullscreen: '全屏',
  exitFullscreen: '退出全屏',
  progress: '视频进度',
  questionOf: '第 {n} 题，共 {total} 题',
  confirm: '确认答案',
  continue: '继续播放',
  correct: '回答正确！太棒了！',
  incorrect: '回答错误。',
  incorrectHint: '正确答案已高亮显示。',
  recorded: '答案已记录，谢谢！',
  checking: '正在检查…',
  error: '无法提交你的答案，你可以继续观看。',
  autoContinue: '{s} 秒后继续…',
  alreadyAnsweredTitle: '已回答过此题',
  alreadyAnsweredText: '你已经回答过这道题，要重新作答吗？',
  answerAgain: '重新作答',
  keepWatching: '继续观看',
  toastTimer: '{s} 秒后继续',
  seekBlocked: '请先回答当前问题再快进。',
};

const ja: Messages = {
  play: '再生',
  pause: '一時停止',
  mute: 'ミュート',
  unmute: 'ミュート解除',
  fullscreen: '全画面',
  exitFullscreen: '全画面を終了',
  progress: '動画の進行状況',
  questionOf: '問題 {n} / {total}',
  confirm: '回答を確定',
  continue: '動画を再開',
  correct: '正解です！すばらしい！',
  incorrect: '不正解です。',
  incorrectHint: '正しい答えを強調表示しています。',
  recorded: '回答を記録しました。ありがとうございます！',
  checking: '確認中…',
  error: '回答を送信できませんでした。そのまま視聴を続けられます。',
  autoContinue: '{s} 秒後に再開…',
  alreadyAnsweredTitle: '回答済みのクイズ',
  alreadyAnsweredText: 'この問題にはすでに回答しています。もう一度回答しますか？',
  answerAgain: 'もう一度回答',
  keepWatching: '視聴を続ける',
  toastTimer: '{s} 秒後に再開',
  seekBlocked: '先に進む前に未回答の問題に答えてください。',
};

export const locales: Record<Locale, Messages> = {
  en,
  'pt-BR': ptBR,
  pt: ptBR,
  es,
  fr,
  de,
  'zh-CN': zhCN,
  ja,
};

/** Resolves a locale code (e.g. "pt-PT", "es-MX", "zh") to a message dictionary. */
export function resolveMessages(locale?: string, overrides?: Partial<Messages>): Messages {
  let base = en;
  if (locale) {
    const exact = (locales as Record<string, Messages>)[locale];
    const lang = locale.toLowerCase().split('-')[0];
    const byLang = Object.entries(locales).find(([k]) => k.toLowerCase().split('-')[0] === lang)?.[1];
    base = exact ?? byLang ?? en;
  }
  return { ...base, ...(overrides ?? {}) };
}

export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}
