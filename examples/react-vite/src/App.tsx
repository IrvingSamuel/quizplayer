import { useRef, useState } from 'react';
import { QuizPlayer, type QuizPlayerCore, type Quiz, type Results } from '@quizplayer/react';

const quizzes: Quiz[] = [
  { id: 'q1', time: 6, question: 'What is 2 + 2?', options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }], correct: 'b' },
  { id: 'q2', time: 18, question: 'Pick your favorite stack', options: [{ id: 'a', text: 'React' }, { id: 'b', text: 'Vue' }, { id: 'c', text: 'Svelte' }] },
];

export default function App() {
  const player = useRef<QuizPlayerCore | null>(null);
  const [results, setResults] = useState<Results | null>(null);

  return (
    <main style={{ maxWidth: 860, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui' }}>
      <h1>QuizPlayer · React</h1>
      <QuizPlayer
        ref={player}
        src="https://irvingsamuel.github.io/quizplayer/media/demo.mp4"
        quizzes={quizzes}
        locale="en"
        preventSkip
        onAnswer={({ record }) => console.log('answer', record)}
        onComplete={setResults}
        // endpoint="/api/quizplayer"  ← validate on your server (PHP, Go, Node…)
      />
      <button onClick={() => player.current?.seek(0)}>Restart</button>
      {results && <pre>{JSON.stringify(results, null, 2)}</pre>}
    </main>
  );
}
