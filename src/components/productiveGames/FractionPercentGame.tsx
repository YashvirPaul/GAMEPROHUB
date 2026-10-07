import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, Percent, Award } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

interface MathProblem {
  question: string;
  context: string;
  options: string[];
  correctAnswer: string;
}

export const FractionPercentGame: React.FC<GameProps> = ({ ageGroup, onScoreUpdate, onGameOver, highScore }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQ, setCurrentQ] = useState<MathProblem | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(14);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [totalSolved, setTotalSolved] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const getTimeForAge = useCallback(() => {
    if (ageGroup === 'kid') return 16;
    if (ageGroup === 'teenager') return 12;
    return 9;
  }, [ageGroup]);

  const generateProblem = useCallback((): MathProblem => {
    let q = '';
    let context = '';
    let correct = '';
    const otherOptions: string[] = [];

    if (ageGroup === 'kid') {
      const mode = Math.random();
      if (mode < 0.35) {
        // Half
        const base = (Math.floor(Math.random() * 8) + 1) * 2;
        const ans = base / 2;
        q = `What is 1/2 of ${base}?`;
        context = `Splitting ${base} into two equal halves.`;
        correct = `${ans}`;
        otherOptions.push(`${ans + 1}`, `${Math.max(1, ans - 1)}`, `${ans + 2}`);
      } else if (mode < 0.7) {
        // 50%
        const base = (Math.floor(Math.random() * 10) + 1) * 10;
        const ans = base * 0.5;
        q = `What is 50% of ${base}?`;
        context = `50% is identical to one half (1/2).`;
        correct = `${ans}`;
        otherOptions.push(`${ans + 5}`, `${ans - 5}`, `${ans + 10}`);
      } else {
        // Quarter
        const base = (Math.floor(Math.random() * 6) + 1) * 4;
        const ans = base / 4;
        q = `What is 1/4 of ${base}?`;
        context = `Dividing ${base} into four equal parts.`;
        correct = `${ans}`;
        otherOptions.push(`${ans + 1}`, `${Math.max(1, ans - 1)}`, `${ans + 2}`);
      }
    } else if (ageGroup === 'teenager') {
      const mode = Math.random();
      if (mode < 0.35) {
        // 20% off
        const price = (Math.floor(Math.random() * 8) + 2) * 10;
        const discount = price * 0.2;
        const finalPrice = price - discount;
        q = `A $${price} jacket is 20% off. What is the sale price?`;
        context = `20% of $${price} is $${discount}. Price = $${price} - $${discount}.`;
        correct = `$${finalPrice}`;
        otherOptions.push(`$${finalPrice + 5}`, `$${finalPrice - 5}`, `$${price - 10}`);
      } else if (mode < 0.7) {
        // Fraction to percent
        const fractions = [
          { f: '3/4', p: '75%' },
          { f: '2/5', p: '40%' },
          { f: '1/8', p: '12.5%' },
          { f: '3/5', p: '60%' },
          { f: '7/10', p: '70%' },
        ];
        const chosen = fractions[Math.floor(Math.random() * fractions.length)];
        q = `What is ${chosen.f} expressed as a percentage?`;
        context = `Multiply the numerator by 100 and divide by denominator.`;
        correct = chosen.p;
        otherOptions.push('50%', '65%', '80%');
      } else {
        // 10% or 15% tip
        const bill = (Math.floor(Math.random() * 6) + 3) * 10;
        const tip = bill * 0.15;
        q = `How much is a 15% tip on a $${bill} dinner bill?`;
        context = `10% is $${bill * 0.1}, 5% is $${bill * 0.05}. Total = $${tip}.`;
        correct = `$${tip}`;
        otherOptions.push(`$${tip + 2}`, `$${tip - 2}`, `$${bill * 0.1}`);
      }
    } else {
      // Adult
      const mode = Math.random();
      if (mode < 0.4) {
        // Mental % like 18% of 250
        const bases = [200, 250, 300, 400, 500];
        const base = bases[Math.floor(Math.random() * bases.length)];
        const percent = Math.floor(Math.random() * 15) + 12; // 12-26%
        const ans = (base * percent) / 100;
        q = `What is ${percent}% of ${base}?`;
        context = `Mentally: 10% is ${base * 0.1}, multiply and add.`;
        correct = `${ans}`;
        otherOptions.push(`${ans + 5}`, `${ans - 5}`, `${ans + 10}`);
      } else if (mode < 0.75) {
        // Fraction addition
        // 1/3 + 1/4 = 7/12, 2/5 + 1/3 = 11/15, 3/4 + 1/6 = 11/12
        const fracs = [
          { q: '1/3 + 1/4', ans: '7/12', opt: ['5/12', '2/7', '8/12'] },
          { q: '2/5 + 1/3', ans: '11/15', opt: ['3/8', '9/15', '13/15'] },
          { q: '3/4 - 1/3', ans: '5/12', opt: ['2/1', '7/12', '4/12'] },
          { q: '5/6 - 1/4', ans: '7/12', opt: ['4/2', '5/12', '9/12'] },
        ];
        const chosen = fracs[Math.floor(Math.random() * fracs.length)];
        q = `Solve: ${chosen.q}`;
        context = `Find common denominator and calculate numerators.`;
        correct = chosen.ans;
        otherOptions.push(...chosen.opt);
      } else {
        // Percentage increase
        const oldPrice = 80;
        const newPrice = 100;
        q = `Price rose from $${oldPrice} to $${newPrice}. What was the percentage increase?`;
        context = `Difference is $20. 20 / 80 = 25%.`;
        correct = `25%`;
        otherOptions.push(`20%`, `15%`, `30%`);
      }
    }

    const allOpts = [correct, ...otherOptions.slice(0, 3)];
    // Shuffle
    for (let i = allOpts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOpts[i], allOpts[j]] = [allOpts[j], allOpts[i]];
    }

    return {
      question: q,
      context,
      options: allOpts,
      correctAnswer: correct,
    };
  }, [ageGroup]);

  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    soundFx.playGameOver();
    onGameOver(scoreRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [onGameOver]);

  const nextProblem = useCallback(() => {
    setSelectedOpt(null);
    setIsAnswered(false);
    const p = generateProblem();
    setCurrentQ(p);
    setTimeLeft(getTimeForAge());
  }, [generateProblem, getTimeForAge]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTotalSolved(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
    onScoreUpdate(0);
    soundFx.playClick();
    nextProblem();
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

  const handleSelect = (val: string) => {
    if (isAnswered || !isPlaying || gameOver || !currentQ) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOpt(val);
    setIsAnswered(true);

    if (val === currentQ.correctAnswer) {
      soundFx.playScore();
      const earned = 60 + streak * 15 + timeLeft * 5;
      scoreRef.current += earned;
      setScore(scoreRef.current);
      setStreak(s => s + 1);
      setTotalSolved(t => t + 1);
      onScoreUpdate(scoreRef.current);

      setTimeout(() => {
        nextProblem();
      }, 450);
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

      {/* Main Container */}
      <div className="relative w-full min-h-[340px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
        {!isPlaying && !gameOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mb-3 shadow-md">
              <Percent className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Fractions & Percentages Pro</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
              Targeted for <strong className="text-emerald-400 uppercase">{ageGroup}</strong>. Master practical discounts, tips, decimal conversions, and everyday fraction mathematics!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer text-xs"
            >
              Start Calculating
            </button>
          </div>
        )}

        {isPlaying && currentQ && (
          <>
            <div className="my-auto text-center py-3">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-lg sm:text-xl font-extrabold text-white leading-snug mb-2">
                {currentQ.question}
              </div>
              <div className="text-[11px] text-zinc-400">
                {currentQ.context}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-100 hover:border-emerald-500/40';

                if (isAnswered) {
                  if (opt === currentQ.correctAnswer) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                  } else if (opt === selectedOpt) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                  } else {
                    btnStyle = 'bg-zinc-900/40 border-zinc-900 text-zinc-600';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(opt)}
                    disabled={isAnswered}
                    className={`py-3 px-4 text-center font-mono text-lg font-black rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 ${btnStyle}`}
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
            <Award className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
            <div className="text-xs text-rose-400 uppercase tracking-widest font-bold mb-1">Time Elapsed</div>
            <div className="text-4xl font-black text-white mb-1 font-mono">{score}</div>
            <p className="text-xs text-zinc-400 mb-4">
              Completed <strong className="text-white">{totalSolved}</strong> real-world math calculations!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-zinc-500 text-center font-medium">
        Level: {ageGroup.toUpperCase()} · Builds financial math sense, rapid percentage discounts & fraction agility
      </div>
    </div>
  );
};
