import { fileURLToPath } from 'node:url';
import express from 'express';
import { createNodeHandler, MemoryStore, stripAnswers, normalizeQuizzes } from '@quizplayer/server';

// Your quizzes, WITH the right answers. They stay on the server.
const LESSONS = {
  'lesson-1': [
    { id: 'q1', time: 6, question: 'What is 2 + 2?', options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }], correct: 'b', explanation: 'Basic math.' },
    { id: 'q2', time: 18, question: 'HTTPS = HTTP over…', options: [{ id: 'a', text: 'FTP' }, { id: 'b', text: 'TLS' }], correct: 'b' },
  ],
};

const app = express();
app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));

// Inject the quizzes WITHOUT answers into the page (or fetch GET /api/quizplayer/quizzes).
app.get('/lesson-1.json', (_req, res) => res.json(stripAnswers(normalizeQuizzes(LESSONS['lesson-1']))));

app.use(
  '/api/quizplayer',
  express.json(),
  createNodeHandler({
    getQuizzes: (videoId) => LESSONS[videoId] ?? [],
    store: new MemoryStore(), // replace with your DB (see README: AnswerStore)
    getUserId: (req) => req.get('x-demo-user') ?? 'demo-user', // e.g. req.session.userId
  }),
);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`http://localhost:${port}`));
