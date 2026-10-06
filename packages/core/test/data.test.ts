import { describe, expect, it } from 'vitest';
import { normalizeQuizzes, parseTime, stripAnswers, summarize, validateAnswer } from '../src/data';

describe('normalizeQuizzes', () => {
  it('keeps canonical quizzes and sorts by time', () => {
    const out = normalizeQuizzes([
      { id: 'b', time: 20, question: 'B?', options: [{ id: 'x', text: 'X' }, { id: 'y', text: 'Y' }], correct: 'y' },
      { id: 'a', time: 5, question: 'A?', options: ['One', 'Two'], correct: 0 },
    ]);
    expect(out.map((q) => q.id)).toEqual(['a', 'b']);
    expect(out[0].options).toEqual([{ id: 'a', text: 'One' }, { id: 'b', text: 'Two' }]);
    expect(out[0].correct).toBe('a');
    expect(out[1].correct).toBe('y');
  });

  it('accepts the legacy tuple format', () => {
    const [q] = normalizeQuizzes([{ point: 30, title: 'Legacy?', awsers: [['Opção A', 0], ['Opção B', 1]], audio_url: 'x.mp3' }]);
    expect(q).toMatchObject({ id: 'q1', time: 30, question: 'Legacy?', correct: 'b', audioUrl: 'x.mp3' });
  });

  it('keeps quizzes at second 0 and parses mm:ss', () => {
    const out = normalizeQuizzes([
      { time: 0, question: 'Zero?', options: ['a', 'b'] },
      { time: '1:30', question: 'Ninety?', options: ['a', 'b'] },
    ]);
    expect(out.map((q) => q.time)).toEqual([0, 90]);
  });

  it('drops invalid entries and accepts JSON strings', () => {
    expect(normalizeQuizzes('not json')).toEqual([]);
    expect(normalizeQuizzes(JSON.stringify([{ time: 1, question: 'Q', options: ['only one'] }, null, { time: -1, question: 'Q', options: ['a', 'b'] }]))).toEqual([]);
  });

  it('reads correct flags from option objects', () => {
    const [q] = normalizeQuizzes([{ time: 1, question: 'Q', options: [{ text: 'a' }, { text: 'b', correct: true }] }]);
    expect(q.correct).toBe('b');
  });
});

describe('validateAnswer / stripAnswers / summarize', () => {
  const quizzes = normalizeQuizzes([
    { id: 'q1', time: 1, question: 'Q1', options: ['a', 'b'], correct: 1, explanation: 'Because' },
    { id: 'q2', time: 2, question: 'Survey', options: ['a', 'b'] },
  ]);

  it('validates', () => {
    expect(validateAnswer(quizzes[0], 'b')).toEqual({ correct: true, correctOptionId: 'b', explanation: 'Because' });
    expect(validateAnswer(quizzes[0], 'a').correct).toBe(false);
    expect(validateAnswer(quizzes[1], 'a')).toEqual({ correct: null });
    expect(() => validateAnswer(quizzes[0], 'zzz')).toThrow();
  });

  it('strips answers', () => {
    const safe = stripAnswers(quizzes);
    expect(safe[0]).not.toHaveProperty('correct');
    expect(safe[0]).not.toHaveProperty('explanation');
    expect(quizzes[0].correct).toBe('b');
  });

  it('summarizes', () => {
    const r = summarize(quizzes, [
      { quizId: 'q1', optionId: 'b', correct: true, videoTime: 1, answeredAt: '' },
      { quizId: 'q2', optionId: 'a', correct: null, videoTime: 2, answeredAt: '' },
      { quizId: 'other', optionId: 'a', correct: false, videoTime: 2, answeredAt: '' },
    ]);
    expect(r).toMatchObject({ total: 2, answered: 2, correct: 1, score: 100 });
  });

  it('parses time', () => {
    expect(parseTime('01:01:01')).toBe(3661);
    expect(parseTime(12.5)).toBe(12.5);
  });
});
