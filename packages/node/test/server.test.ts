import { describe, expect, it } from 'vitest';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createFetchHandler, createNodeHandler, createProtocol, MemoryStore } from '../src/index';

const quizzes = [{ id: 'q1', time: 10, question: '2+2?', options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }], correct: 'b', explanation: 'Basic math' }];
const config = { getQuizzes: () => quizzes, getUserId: () => 'u1' };

describe('protocol', () => {
  it('validates, stores and lists answers', async () => {
    const store = new MemoryStore();
    const handle = createProtocol({ ...config, store });
    const res = await handle({ method: 'POST', path: '/answer', query: {}, body: { videoId: 'v', quizId: 'q1', optionId: 'a', videoTime: 10 } }, {});
    expect(res).toEqual({ status: 200, body: { correct: false, correctOptionId: 'b', explanation: 'Basic math' } });
    const list = await handle({ method: 'GET', path: '/answers', query: { videoId: 'v' } }, {});
    expect((list.body as { answers: unknown[] }).answers).toEqual([expect.objectContaining({ quizId: 'q1', optionId: 'a', correct: false })]);
  });

  it('never trusts the client', async () => {
    const handle = createProtocol(config);
    const res = await handle({ method: 'POST', path: '/answer', query: {}, body: { quizId: 'q1', optionId: 'a', correct: true } }, {});
    expect((res.body as { correct: boolean }).correct).toBe(false);
  });

  it('rejects invalid input', async () => {
    const handle = createProtocol({ ...config, requireUser: true, getUserId: () => null });
    expect((await handle({ method: 'POST', path: '/answer', query: {}, body: {} }, {})).status).toBe(401);
    const h2 = createProtocol(config);
    expect((await h2({ method: 'POST', path: '/answer', query: {}, body: {} }, {})).status).toBe(422);
    expect((await h2({ method: 'POST', path: '/answer', query: {}, body: { quizId: 'zz', optionId: 'a' } }, {})).status).toBe(404);
    expect((await h2({ method: 'POST', path: '/answer', query: {}, body: { quizId: 'q1', optionId: 'zz' } }, {})).status).toBe(422);
  });

  it('serves quizzes without the answers and results', async () => {
    const handle = createProtocol(config);
    const res = await handle({ method: 'GET', path: '/quizzes', query: {} }, {});
    expect(JSON.stringify(res.body)).not.toContain('correct');
    await handle({ method: 'POST', path: '/answer', query: {}, body: { quizId: 'q1', optionId: 'b' } }, {});
    const results = await handle({ method: 'GET', path: '/results', query: {} }, {});
    expect(results.body).toMatchObject({ total: 1, answered: 1, correct: 1, score: 100 });
    expect((results.body as { answers: object[] }).answers[0]).not.toHaveProperty('userId');
  });
});

describe('adapters', () => {
  it('fetch handler', async () => {
    const handler = createFetchHandler(config, '/api/qp');
    const res = await handler(
      new Request('http://x/api/qp/answer', { method: 'POST', body: JSON.stringify({ quizId: 'q1', optionId: 'b' }) }),
    );
    expect(await res.json()).toMatchObject({ correct: true });
  });

  it('node:http handler', async () => {
    const server = createServer(createNodeHandler(config));
    await new Promise<void>((r) => server.listen(0, r));
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}/answer`, { method: 'POST', body: JSON.stringify({ quizId: 'q1', optionId: 'b' }) });
    expect(await res.json()).toMatchObject({ correct: true, correctOptionId: 'b' });
    server.close();
  });
});
