/**
 * @quizplayer/server — reference backend for the QuizPlayer protocol.
 *
 * Works with Express, Fastify, Koa (via adapters), plain `node:http` and any
 * Fetch-API runtime (Next.js route handlers, Hono, Bun, Deno, Cloudflare Workers).
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { normalizeQuizzes, stripAnswers, summarize, validateAnswer } from '@quizplayer/core/data';
import type { AnswerRecord, Quiz } from '@quizplayer/core/data';

export { normalizeQuizzes, stripAnswers, summarize, validateAnswer };
export type { AnswerRecord, Quiz };

export interface StoredAnswer extends AnswerRecord {
  videoId: string;
  userId: string | null;
}

/** Persistence contract. Implement it with your database of choice. */
export interface AnswerStore {
  save(answer: StoredAnswer): Promise<void> | void;
  list(videoId: string, userId: string | null): Promise<StoredAnswer[]> | StoredAnswer[];
}

/** In-memory store (one latest answer per user/video/quiz). Great for demos and tests. */
export class MemoryStore implements AnswerStore {
  private rows = new Map<string, StoredAnswer>();

  save(answer: StoredAnswer): void {
    this.rows.set(`${answer.videoId}\u0000${answer.userId ?? ''}\u0000${answer.quizId}`, answer);
  }

  list(videoId: string, userId: string | null): StoredAnswer[] {
    return [...this.rows.values()].filter((r) => r.videoId === videoId && r.userId === userId);
  }
}

export interface HandlerConfig<Req = unknown> {
  /** Returns the quizzes (with right answers) of a video. Any format accepted by `normalizeQuizzes`. */
  getQuizzes(videoId: string, req: Req): Promise<unknown> | unknown;
  /** Where answers are stored. Defaults to a `MemoryStore`. */
  store?: AnswerStore;
  /** Resolves the current user (session, JWT…). Return `null` for anonymous viewers. */
  getUserId?(req: Req): Promise<string | null> | string | null;
  /** Reject anonymous viewers with 401. Default `false`. */
  requireUser?: boolean;
  /** Called after an answer is stored (analytics, LMS completion…). */
  onAnswer?(answer: StoredAnswer, req: Req): Promise<void> | void;
}

export interface ProtocolRequest {
  method: string;
  /** Path relative to where the handler is mounted, e.g. "/answer". */
  path: string;
  query: Record<string, string | undefined>;
  body?: unknown;
}

export interface ProtocolResponse {
  status: number;
  body: unknown;
}

const json = (status: number, body: unknown): ProtocolResponse => ({ status, body });

/** Framework-agnostic core: maps a protocol request to a JSON response. */
export function createProtocol<Req = unknown>(config: HandlerConfig<Req>) {
  const store = config.store ?? new MemoryStore();

  /** Answers as exposed over HTTP (without videoId/userId). */
  async function publicAnswers(videoId: string, userId: string | null): Promise<AnswerRecord[]> {
    const rows = await store.list(videoId, userId);
    return rows.map(({ quizId, optionId, correct, videoTime, answeredAt }) => ({ quizId, optionId, correct, videoTime, answeredAt }));
  }

  async function loadQuizzes(videoId: string, req: Req): Promise<Quiz[]> {
    return normalizeQuizzes(await config.getQuizzes(videoId, req));
  }

  return async function handle(request: ProtocolRequest, req: Req): Promise<ProtocolResponse> {
    const path = request.path.replace(/\/+$/, '') || '/';
    const userId = (await config.getUserId?.(req)) ?? null;
    if (config.requireUser && userId === null) return json(401, { error: 'unauthenticated' });

    if (request.method === 'POST' && path.endsWith('/answer')) {
      const b = (request.body ?? {}) as Record<string, unknown>;
      const videoId = b.videoId === undefined || b.videoId === null ? '' : String(b.videoId);
      const quizId = b.quizId === undefined ? '' : String(b.quizId);
      const optionId = b.optionId === undefined ? '' : String(b.optionId);
      if (!quizId || !optionId) return json(422, { error: 'quizId and optionId are required' });
      const quiz = (await loadQuizzes(videoId, req)).find((q) => q.id === quizId);
      if (!quiz) return json(404, { error: 'quiz not found' });
      let result;
      try {
        result = validateAnswer(quiz, optionId);
      } catch {
        return json(422, { error: 'invalid optionId' });
      }
      const answer: StoredAnswer = {
        videoId,
        userId,
        quizId,
        optionId,
        correct: result.correct,
        videoTime: Number(b.videoTime ?? quiz.time) || 0,
        answeredAt: new Date().toISOString(),
      };
      await store.save(answer);
      await config.onAnswer?.(answer, req);
      return json(200, result);
    }

    if (request.method === 'GET' && path.endsWith('/answers')) {
      const videoId = request.query.videoId ?? '';
      return json(200, { answers: await publicAnswers(videoId, userId) });
    }

    if (request.method === 'GET' && path.endsWith('/quizzes')) {
      const videoId = request.query.videoId ?? '';
      return json(200, { quizzes: stripAnswers(await loadQuizzes(videoId, req)) });
    }

    if (request.method === 'GET' && path.endsWith('/results')) {
      const videoId = request.query.videoId ?? '';
      const quizzes = await loadQuizzes(videoId, req);
      return json(200, summarize(quizzes, await publicAnswers(videoId, userId)));
    }

    return json(404, { error: 'not found' });
  };
}

/**
 * Fetch-API handler: `(request: Request) => Promise<Response>`.
 * `basePath` is stripped from the URL, e.g. "/api/quizplayer".
 */
export function createFetchHandler(config: HandlerConfig<Request>, basePath = '') {
  const handle = createProtocol(config);
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    let body: unknown;
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        return Response.json({ error: 'invalid JSON' }, { status: 400 });
      }
    }
    const res = await handle(
      { method: request.method, path: url.pathname.slice(basePath.length) || '/', query: Object.fromEntries(url.searchParams), body },
      request,
    );
    return Response.json(res.body, { status: res.status });
  };
}

type NodeReq = IncomingMessage & { body?: unknown; query?: Record<string, unknown>; originalUrl?: string; baseUrl?: string; path?: string };

/**
 * Node-style handler `(req, res, next?)` for Express, Connect, Polka, `node:http`…
 * In Express mount it with `app.use('/api/quizplayer', express.json(), handler)`.
 */
export function createNodeHandler(config: HandlerConfig<NodeReq>) {
  const handle = createProtocol(config);
  return async (req: NodeReq, res: ServerResponse, next?: (err?: unknown) => void) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      let body = req.body;
      if (req.method === 'POST' && body === undefined) body = await readJson(req);
      const out = await handle({ method: req.method ?? 'GET', path: url.pathname, query: Object.fromEntries(url.searchParams), body }, req);
      res.statusCode = out.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(out.body));
    } catch (err) {
      if (next) next(err);
      else {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'internal error' }));
      }
    }
  };
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}
