import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, BookOpen, Sparkles, CheckCircle2, Award } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

interface WordQuestion {
  word: string;
  partOfSpeech: string;
  definition: string;
  options: string[];
  correct: number;
  sentence: string;
}

const KID_WORDS: WordQuestion[] = [
  {
    word: 'Courageous',
    partOfSpeech: 'adjective',
    definition: 'Brave; not afraid of danger or pain',
    options: ['Brave and fearless', 'Very sleepy', 'Angry and loud', 'Small and weak'],
    correct: 0,
    sentence: 'The courageous girl rescued the puppy from the icy stream.'
  },
  {
    word: 'Enormous',
    partOfSpeech: 'adjective',
    definition: 'Very large in size, quantity, or extent',
    options: ['Tiny and hidden', 'Extremely huge', 'Cold and wet', 'Fast and speedy'],
    correct: 1,
    sentence: 'An enormous blue whale glided silently through the ocean.'
  },
  {
    word: 'Generous',
    partOfSpeech: 'adjective',
    definition: 'Willing to give and share with others freely',
    options: ['Selfish and greedy', 'Giving and sharing', 'Quiet and shy', 'Fast runner'],
    correct: 1,
    sentence: 'He was generous enough to share his books with his classmates.'
  },
  {
    word: 'Curious',
    partOfSpeech: 'adjective',
    definition: 'Eager to know or learn something new',
    options: ['Bored and tired', 'Eager to learn', 'Angry and upset', 'Full of food'],
    correct: 1,
    sentence: 'The curious scientist wanted to discover how lightning worked.'
  },
  {
    word: 'Persevere',
    partOfSpeech: 'verb',
    definition: 'To keep trying even when something is hard',
    options: ['Give up early', 'Keep trying persistently', 'Fall asleep', 'Run away'],
    correct: 1,
    sentence: 'If you persevere through math problems, you will master them.'
  }
];

const TEEN_WORDS: WordQuestion[] = [
  {
    word: 'Resilient',
    partOfSpeech: 'adjective',
    definition: 'Able to withstand or recover quickly from difficult conditions',
    options: ['Easily broken', 'Quick to bounce back from hardship', 'Extremely stubborn', 'Overly emotional'],
    correct: 1,
    sentence: 'Resilient students view temporary failure as valuable feedback.'
  },
  {
    word: 'Meticulous',
    partOfSpeech: 'adjective',
    definition: 'Showing great attention to detail; very careful and precise',
    options: ['Careless and rushed', 'Extremely precise and thorough', 'Loud and aggressive', 'Uninterested'],
    correct: 1,
    sentence: 'Her meticulous notes helped her achieve top marks in biology.'
  },
  {
    word: 'Pragmatic',
    partOfSpeech: 'adjective',
    definition: 'Dealing with things sensibly and realistically based on practical conditions',
    options: ['Impractical and dreamy', 'Practical and realistic', 'Overly dramatic', 'Frightened'],
    correct: 1,
    sentence: 'He took a pragmatic approach to his study schedule to balance sports and exams.'
  },
  {
    word: 'Eloquent',
    partOfSpeech: 'adjective',
    definition: 'Fluent or persuasive in speaking or writing',
    options: ['Confused and quiet', 'Persuasively fluent in speech', 'Rude and impolite', 'Slow and stammering'],
    correct: 1,
    sentence: 'Her eloquent speech inspired the whole audience to take immediate action.'
  },
  {
    word: 'Tenacious',
    partOfSpeech: 'adjective',
    definition: 'Tending to keep a firm hold of something; clinging or persistent',
    options: ['Persistent and determined', 'Fearful and hesitant', 'Lazy and unfocused', 'Easily distracted'],
    correct: 0,
    sentence: 'His tenacious dedication to daily practice turned him into a national champion.'
  }
];

const ADULT_WORDS: WordQuestion[] = [
  {
    word: 'Ephemeral',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very short time; transitory',
    options: ['Eternal and permanent', 'Fleeting and short-lived', 'Solid and unyielding', 'Complicated'],
    correct: 1,
    sentence: 'Social media hype is ephemeral, but deep skill mastery lasts a lifetime.'
  },
  {
    word: 'Equanimity',
    partOfSpeech: 'noun',
    definition: 'Mental calmness, composure, and evenness of temper, especially in difficult situations',
    options: ['Extreme panic', 'Mental composure under pressure', 'Arrogant pride', 'Complete apathy'],
    correct: 1,
    sentence: 'Great leaders maintain equanimity during turbulent market shifts.'
  },
  {
    word: 'Paradigm',
    partOfSpeech: 'noun',
    definition: 'A typical example or pattern of something; a model or overarching framework',
    options: ['Temporary glitch', 'A comprehensive model or framework', 'A financial debt', 'An empty promise'],
    correct: 1,
    sentence: 'Artificial intelligence has introduced a new paradigm in software engineering.'
  },
  {
    word: 'Obfuscate',
    partOfSpeech: 'verb',
    definition: 'To deliberately make obscure, unclear, or unintelligible',
    options: ['Clarify and explain', 'Deliberately confuse or obscure', 'Calculate accurately', 'Organize neatly'],
    correct: 1,
    sentence: 'Clear writers avoid jargon that serves only to obfuscate simple truths.'
  },
  {
    word: 'Pernicious',
    partOfSpeech: 'adjective',
    definition: 'Having a harmful effect, especially in a gradual or subtle way',
    options: ['Beneficial and healthy', 'Subtly destructive and harmful', 'Extremely bright', 'Trivial and minor'],
    correct: 1,
    sentence: 'Doom-scrolling has a pernicious effect on mental focus and ambition.'
  }
];

export const WordPowerGame: React.FC<GameProps> = ({ ageGroup, onScoreUpdate, onGameOver, highScore }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const wordPool = ageGroup === 'kid' ? KID_WORDS : ageGroup === 'teenager' ? TEEN_WORDS : ADULT_WORDS;

  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    soundFx.playGameOver();
    onGameOver(scoreRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [onGameOver]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setCurrentIdx(0);
    scoreRef.current = 0;
    setSelectedIdx(null);
    setIsAnswered(false);
    setTimeLeft(15);
    setGameOver(false);
    setIsPlaying(true);
    onScoreUpdate(0);
    soundFx.playClick();
  };

  useEffect(() => {
    if (!isPlaying || isAnswered || gameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isAnswered, gameOver, handleEnd]);

  const handleSelect = (idx: number) => {
    if (isAnswered || !isPlaying || gameOver) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedIdx(idx);
    setIsAnswered(true);

    const q = wordPool[currentIdx % wordPool.length];
    if (idx === q.correct) {
      soundFx.playScore();
      const earned = 80 + streak * 20 + timeLeft * 5;
      scoreRef.current += earned;
      setScore(scoreRef.current);
      setStreak(s => s + 1);
      onScoreUpdate(scoreRef.current);
    } else {
      soundFx.playTone(200, 'sawtooth', 0.1, 0.1);
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    setSelectedIdx(null);
    setIsAnswered(false);
    setTimeLeft(15);
    setCurrentIdx(i => (i + 1) % wordPool.length);
  };

  const q = wordPool[currentIdx % wordPool.length];

  return (
    <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Score <strong className="text-rose-400 font-mono text-base tabular-nums">{score}</strong></span>
          <span className="text-zinc-400">Streak <strong className="text-amber-400 font-mono text-base tabular-nums">{streak}🔥</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-bold uppercase text-[10px] border border-zinc-700">
            {ageGroup}
          </span>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-amber-400 font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative w-full min-h-[360px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
        {!isPlaying && !gameOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mb-3 shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Vocabulary & Word Power</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
              Targeted for <strong className="text-rose-400 uppercase">{ageGroup}</strong>. Expand vocabulary, master precise synonyms, and elevate verbal intelligence!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer text-xs"
            >
              Build Word Power
            </button>
          </div>
        )}

        {isPlaying && q && (
          <>
            <div>
              <div className="text-center mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  {q.partOfSpeech}
                </span>
                <h4 className="text-3xl font-black text-white tracking-tight">
                  {q.word}
                </h4>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5 mb-3">
                {q.options.map((opt, idx) => {
                  let btnStyle = 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-200';

                  if (isAnswered) {
                    if (idx === q.correct) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                    } else if (idx === selectedIdx) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                    } else {
                      btnStyle = 'bg-zinc-900/40 border-zinc-900 text-zinc-600';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all cursor-pointer ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 animate-in fade-in">
                  <div className="font-bold text-white mb-0.5">Example in action:</div>
                  <div className="italic text-zinc-400 font-serif">"{q.sentence}"</div>
                </div>
              )}
            </div>

            {isAnswered && (
              <button
                onClick={nextQuestion}
                className="mt-3 w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-transform active:scale-95"
              >
                Next Word →
              </button>
            )}
          </>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <Award className="w-12 h-12 text-rose-400 mb-2 animate-bounce" />
            <div className="text-xs text-rose-400 uppercase tracking-widest font-bold mb-1">Session Complete</div>
            <div className="text-4xl font-black text-white mb-1 font-mono">{score}</div>
            <p className="text-xs text-zinc-400 mb-4">
              Strengthened verbal precision and comprehension!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Learn More Words</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-zinc-500 text-center font-medium">
        Level: {ageGroup.toUpperCase()} · Builds active vocabulary, expressive clarity & reading comprehension
      </div>
    </div>
  );
};
