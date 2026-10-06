// Next.js App Router: app/api/quizplayer/[...path]/route.ts
import { createFetchHandler, MemoryStore } from '@quizplayer/server';
import { getQuizzesForVideo } from '@/lib/quizzes'; // your data layer
import { auth } from '@/auth'; // your auth (NextAuth, Clerk, Lucia…)

const handler = createFetchHandler(
  {
    getQuizzes: (videoId) => getQuizzesForVideo(videoId),
    store: new MemoryStore(), // use a DB-backed AnswerStore in production
    getUserId: async () => (await auth())?.user?.id ?? null,
  },
  '/api/quizplayer',
);

export { handler as GET, handler as POST };
