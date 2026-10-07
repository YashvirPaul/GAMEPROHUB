import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, Sparkles, CheckCircle2, XCircle, Award, Lightbulb } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

interface SequenceProblem {
  sequence: (number | string)[];
  missingIndex: number;
  options: number[];
  correct: number;
  patternExplanation: string;
}

export const LogicSequencesGame: React.FC<GameProps> = ({
  ageGroup,
  onScoreUpdate,
  onGameOver,
  highScore,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<SequenceProblem | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [totalSolved, setTotalSolved] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const getTimeForAge = useCallback(() => {
    if (ageGroup === 'kid') return 18;
    if (ageGroup === 'teenager') return 12;
    return 9;
  }, [ageGroup]);

  const generateProblem = useCallback((): SequenceProblem => {
    let seq: number[] = [];
    let explanation = '';

    if (ageGroup === 'kid') {
      const mode = Math.random();
      if (mode < 0.4) {
        // Simple addition (+2, +3, +5, +10)
        const step = [2, 3, 5, 10][Math.floor(Math.random() * 4)];
        const start = Math.floor(Math.random() * 10) + 1;
        seq = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
        explanation = `Pattern: Adding ${step} to each consecutive number.`;
      } else if (mode < 0.7) {
        // Simple subtraction (-2, -3, -5)
        const step = [2, 3, 5][Math.floor(Math.random() * 3)];
        const start = 30 + Math.floor(Math.random() * 20);
        seq = [start, start - step, start - step * 2, start - step * 3, start - step * 4];
        explanation = `Pattern: Subtracting ${step} each step.`;
      } else {
        // Doubling: 2, 4, 8, 16, 32
        const start = Math.floor(Math.random() * 3) + 1;
        seq = [start, start * 2, start * 4, start * 8, start * 16];
        explanation = `Pattern: Multiplying by 2 each step.`;
      }
    } else if (ageGroup === 'teenager') {
      const mode = Math.random();
      if (mode < 0.35) {
        // Geometric progression (×3, ×4)
        const factor = [3, 4][Math.floor(Math.random() * 2)];
        const start = Math.floor(Math.random() * 4) + 2;
        seq = [start, start * factor, start * factor * factor, start * factor * factor * factor];
        explanation = `Pattern: Multiplying by ${factor} each step.`;
      } else if (mode < 0.7) {
        // Increasing difference: +2, +4, +6, +8
        const start = Math.floor(Math.random() * 10) + 1;
        seq = [start, start + 2, start + 6, start + 12, start + 20];
        explanation = `Pattern: Differences increase by 2 (+2, +4, +6, +8).`;
      } else {
        // Squares: 1, 4, 9, 16, 25 or offset squares
        const offset = Math.floor(Math.random() * 3);
        seq = [1 + offset, 4 + offset, 9 + offset, 16 + offset, 25 + offset];
        explanation = `Pattern: Consecutive square numbers (1², 2², 3², 4², 5²)${offset > 0 ? ` + ${offset}` : ''}.`;
      }
    } else {
      // Adult
      const mode = Math.random();
      if (mode < 0.35) {
        // Fibonacci / Add previous two
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 6) + 2;
        const c = a + b;
        const d = b + c;
        const e = c + d;
        const f = d + e;
        seq = [a, b, c, d, e, f];
        explanation = `Pattern: Fibonacci series (each number is sum of preceding two).`;
      } else if (mode < 0.7) {
        // Alternating operations (e.g. ×2, -1, ×2, -1)
        const start = Math.floor(Math.random() * 5) + 3;
        const mult = 2;
        const sub = Math.floor(Math.random() * 3) + 1;
        const s1 = start;
        const s2 = s1 * mult;
        const s3 = s2 - sub;
        const s4 = s3 * mult;
        const s5 = s4 - sub;
        seq = [s1, s2, s3, s4, s5];
        explanation = `Pattern: Alternating rule (×${mult}, then -${sub}).`;
      } else {
        // Cubes or Triangular numbers: 1, 8, 27, 64 or 1, 3, 6, 10, 15, 21
        const start = Math.floor(Math.random() * 3) + 1;
        seq = [start, start + 3, start + 7, start + 12, start + 18, start + 25];
        explanation = `Pattern: Successive differences increase by 1 (+3, +4, +5, +6, +7).`;
      }
    }

    // Pick missing item: usually last or second to last
    const missingIndex = seq.length - 1;
    const correct = seq[missingIndex];
    const displaySeq: (number | string)[] = [...seq];
    displaySeq[missingIndex] = '?';

    // Generate 4 plausible options
    const optionsSet = new Set<number>();
    optionsSet.add(correct);
    while (optionsSet.size < 4) {
      const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = correct + delta;
      if (fake > 0 && fake !== correct) {
        optionsSet.add(fake);
      }
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return {
      sequence: displaySeq,
      missingIndex,
      options,
      correct,
      patternExplanation: explanation,
    };
  }, [ageGroup]);

  const nextQuestion = useCallback(() => {
    setSelectedOpt(null);
    setIsAnswered(false);
    const prob = generateProblem();
    setCurrentProblem(prob);
    setTimeLeft(getTimeForAge());
  }, [generateProblem, getTimeForAge]);

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    setTotalSolved(0);
    setGameOver(false);
    setIsPlaying(true);
    soundFx.playClick();
    nextQuestion();
  };

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    soundFx.playGameOver();
    onGameOver(scoreRef.current);
  }, [onGameOver]);

  // Timer loop
  useEffect(() => {
    if (!isPlaying || gameOver || isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameOver, isAnswered, handleGameOver]);

  const handleSelectOption = (val: number) => {
    if (isAnswered || !currentProblem) return;

    setSelectedOpt(val);
    setIsAnswered(true);

    if (val === currentProblem.correct) {
      soundFx.playSuccess();
      const streakBonus = Math.min(streak * 20, 100);
      const timeBonus = timeLeft * 10;
      const earned = 100 + streakBonus + timeBonus;

      const newScore = score + earned;
      setScore(newScore);
      scoreRef.current = newScore;
      onScoreUpdate(newScore);

      setStreak(s => s + 1);
      setTotalSolved(t => t + 1);

      setTimeout(() => {
        nextQuestion();
      }, 1400);
    } else {
      soundFx.playError();
      setStreak(0);
      setTimeout(() => {
        handleGameOver();
      }, 1600);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full">
      {/* Top Status Bar */}
      <div className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-5">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${timeLeft <= 3 ? 'text-rose-400 animate-pulse' : 'text-zinc-400'}`} />
          <span className={`font-mono font-bold text-sm ${timeLeft <= 3 ? 'text-rose-400' : 'text-zinc-200'}`}>
            {timeLeft}s
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Streak</span>
            <span className="font-mono font-black text-amber-400 text-sm">🔥 {streak}</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Score</span>
            <span className="font-mono font-black text-emerald-400 text-base">{score}</span>
          </div>
        </div>
      </div>

      {!isPlaying ? (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto shadow-lg">
            <Lightbulb className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Pattern & Logic Sequences</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              Decode the underlying mathematical law governing the sequence. Identify the missing number under time pressure.
            </p>
          </div>

          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850 text-left space-y-1.5 text-xs text-zinc-300">
            <div className="font-bold text-indigo-400 mb-1">
              {ageGroup === 'kid' && '🧒 Kid Mode: Simple addition & subtraction jumps (+2, +5, +10)'}
              {ageGroup === 'teenager' && '🧑 Teenager Mode: Geometric multiples, alternating patterns & square offsets'}
              {ageGroup === 'adult' && '👨 Adult Mode: Fibonacci expansions, compound rules & polynomial series'}
            </div>
            <p className="text-zinc-400">
              High score: <strong className="text-white font-mono">{highScore} pts</strong>
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
          >
            Start Sequence Challenge
          </button>
        </div>
      ) : gameOver ? (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Challenge Completed</h3>
            <p className="text-xs text-zinc-400 mt-1">Excellent deductive reasoning session</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Solved</span>
              <span className="text-xl font-mono font-black text-white">{totalSolved}</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Final Score</span>
              <span className="text-xl font-mono font-black text-emerald-400">{score}</span>
            </div>
          </div>

          {currentProblem && (
            <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-300 text-left">
              <span className="font-bold text-amber-400 block mb-1">Last Pattern Law:</span>
              <p className="text-zinc-400 font-medium">{currentProblem.patternExplanation}</p>
            </div>
          )}

          <button
            onClick={startGame}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      ) : currentProblem ? (
        <div className="w-full space-y-6">
          {/* Problem Display */}
          <div className="p-6 sm:p-8 bg-zinc-900/90 border border-zinc-800 rounded-3xl text-center shadow-xl space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
              Find the Next Logical Number
            </span>

            {/* Sequence Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 my-2">
              {currentProblem.sequence.map((item, idx) => (
                <div
                  key={idx}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-lg sm:text-2xl font-mono font-black shadow-md transition-all ${
                    item === '?'
                      ? 'bg-indigo-950 border-2 border-indigo-500 text-indigo-300 animate-pulse scale-105'
                      : 'bg-zinc-800 border border-zinc-700 text-white'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Feedback / Explanation on Answer */}
            {isAnswered && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold animate-in fade-in ${
                  selectedOpt === currentProblem.correct
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {selectedOpt === currentProblem.correct ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Correct! {currentProblem.patternExplanation}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Incorrect. The answer is {currentProblem.correct}. {currentProblem.patternExplanation}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {currentProblem.options.map((opt, idx) => {
              let btnStyle = 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-850 hover:border-indigo-500/50';

              if (isAnswered) {
                if (opt === currentProblem.correct) {
                  btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50';
                } else if (selectedOpt === opt) {
                  btnStyle = 'bg-rose-950 border-rose-500 text-rose-300';
                } else {
                  btnStyle = 'bg-zinc-900/50 border-zinc-850 text-zinc-500 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 sm:p-5 rounded-2xl border-2 font-mono font-black text-xl transition-all cursor-pointer active:scale-98 ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
