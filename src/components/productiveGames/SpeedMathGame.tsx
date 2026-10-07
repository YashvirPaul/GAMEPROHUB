import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, Zap, CheckCircle2, XCircle, Award } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

interface Question {
  text: string;
  options: number[];
  correct: number;
}

export const SpeedMathGame: React.FC<GameProps> = ({ ageGroup, onScoreUpdate, onGameOver, highScore }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [totalSolved, setTotalSolved] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const getTimerDuration = useCallback(() => {
    if (ageGroup === 'kid') return 14;
    if (ageGroup === 'teenager') return 9;
    return 6;
  }, [ageGroup]);

  const generateQuestion = useCallback((): Question => {
    let a = 0;
    let b = 0;
    let op = '+';
    let ans = 0;

    if (ageGroup === 'kid') {
      const ops = ['+', '-'];
      op = ops[Math.floor(Math.random() * ops.length)];
      if (op === '+') {
        a = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * 9) + 1;
        ans = a + b;
      } else {
        a = Math.floor(Math.random() * 12) + 6;
        b = Math.floor(Math.random() * a) + 1;
        ans = a - b;
      }
    } else if (ageGroup === 'teenager') {
      const ops = ['+', '-', '×', '÷'];
      op = ops[Math.floor(Math.random() * ops.length)];
      if (op === '+') {
        a = Math.floor(Math.random() * 45) + 10;
        b = Math.floor(Math.random() * 45) + 10;
        ans = a + b;
      } else if (op === '-') {
        a = Math.floor(Math.random() * 60) + 20;
        b = Math.floor(Math.random() * (a - 5)) + 5;
        ans = a - b;
      } else if (op === '×') {
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        ans = a * b;
      } else {
        b = Math.floor(Math.random() * 10) + 2;
        ans = Math.floor(Math.random() * 12) + 2;
        a = b * ans;
      }
    } else {
      // Adult
      const ops = ['+', '-', '×', '÷', 'MIX'];
      op = ops[Math.floor(Math.random() * ops.length)];
      if (op === 'MIX') {
        const x = Math.floor(Math.random() * 8) + 2;
        const y = Math.floor(Math.random() * 6) + 2;
        const z = Math.floor(Math.random() * 15) + 3;
        ans = x * y + z;
        return {
          text: `${x} × ${y} + ${z} = ?`,
          options: generateOptions(ans),
          correct: ans,
        };
      } else if (op === '×') {
        a = Math.floor(Math.random() * 20) + 11;
        b = Math.floor(Math.random() * 9) + 3;
        ans = a * b;
      } else if (op === '÷') {
        b = Math.floor(Math.random() * 15) + 4;
        ans = Math.floor(Math.random() * 16) + 4;
        a = b * ans;
      } else if (op === '+') {
        a = Math.floor(Math.random() * 150) + 45;
        b = Math.floor(Math.random() * 150) + 45;
        ans = a + b;
      } else {
        a = Math.floor(Math.random() * 200) + 80;
        b = Math.floor(Math.random() * (a - 20)) + 20;
        ans = a - b;
      }
    }

    return {
      text: `${a} ${op} ${b} = ?`,
      options: generateOptions(ans),
      correct: ans,
    };
  }, [ageGroup]);

  function generateOptions(correctAnswer: number): number[] {
    const opts = new Set<number>([correctAnswer]);
    while (opts.size < 4) {
      const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() < 0.5 ? 1 : -1);
      const fake = correctAnswer + delta;
      if (fake >= 0 && fake !== correctAnswer) {
        opts.add(fake);
      }
    }
    const arr = Array.from(opts);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    soundFx.playGameOver();
    onGameOver(scoreRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [onGameOver]);

  const nextQuestion = useCallback(() => {
    setSelectedIdx(null);
    setIsAnswered(false);
    const q = generateQuestion();
    setCurrentQ(q);
    setTimeLeft(getTimerDuration());
  }, [generateQuestion, getTimerDuration]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTotalSolved(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
    onScoreUpdate(0);
    soundFx.playClick();
    nextQuestion();
  };

  // Timer countdown
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

  const handleSelect = (idx: number, optValue: number) => {
    if (isAnswered || !isPlaying || gameOver || !currentQ) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedIdx(idx);
    setIsAnswered(true);

    if (optValue === currentQ.correct) {
      soundFx.playScore();
      const streakBonus = streak * 10;
      const speedBonus = timeLeft * 5;
      const earned = 50 + streakBonus + speedBonus;
      scoreRef.current += earned;
      setScore(scoreRef.current);
      setStreak(s => s + 1);
      setTotalSolved(t => t + 1);
      onScoreUpdate(scoreRef.current);

      setTimeout(() => {
        nextQuestion();
      }, 400);
    } else {
      soundFx.playTone(200, 'sawtooth', 0.1, 0.1);
      setTimeout(() => {
        handleEnd();
      }, 700);
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Score <strong className="text-emerald-400 font-mono text-base tabular-nums">{score}</strong></span>
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

      {/* Main Game Screen */}
      <div className="relative w-full min-h-[320px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
        {!isPlaying && !gameOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-3 shadow-md">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Speed Mental Math</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
              Toughness configured for <strong className="text-emerald-400 uppercase">{ageGroup}</strong>. Calculate accurately before the countdown ends to build consecutive streak points!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer text-xs"
            >
              Start Sprint
            </button>
          </div>
        )}

        {isPlaying && currentQ && (
          <>
            {/* Question display */}
            <div className="my-auto text-center py-4">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold block mb-2">
                Calculate Mentally
              </span>
              <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight drop-shadow-md">
                {currentQ.text}
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-100 hover:border-emerald-500/40';

                if (isAnswered) {
                  if (opt === currentQ.correct) {
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
                    onClick={() => handleSelect(idx, opt)}
                    disabled={isAnswered}
                    className={`py-3.5 px-4 text-center font-mono text-xl font-black rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <Award className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <div className="text-xs text-rose-400 uppercase tracking-widest font-bold mb-1">Time Elapsed or Incorrect</div>
            <div className="text-4xl font-black text-white mb-1 font-mono">{score}</div>
            <p className="text-xs text-zinc-400 mb-4">
              Solved <strong className="text-white">{totalSolved}</strong> math questions accurately!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Train Again</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-zinc-500 text-center font-medium">
        Level: {ageGroup.toUpperCase()} · Builds mental agility, numerical reflex, and working concentration
      </div>
    </div>
  );
};
