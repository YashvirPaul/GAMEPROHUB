import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, CheckCircle2, AlertCircle, Scale, Sparkles, Trophy } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

interface EquationProblem {
  equation: string;
  variableName: string;
  solution: number;
  options: number[];
  hint: string;
}

export const EquationBalanceGame: React.FC<GameProps> = ({ ageGroup, onScoreUpdate, onGameOver, highScore }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<EquationProblem | null>(null);
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

  const generateProblem = useCallback((): EquationProblem => {
    let eq = '';
    let x = 0;
    let hint = '';

    if (ageGroup === 'kid') {
      const mode = Math.random();
      if (mode < 0.4) {
        x = Math.floor(Math.random() * 9) + 2;
        const b = Math.floor(Math.random() * 8) + 1;
        const c = x + b;
        eq = `x + ${b} = ${c}`;
        hint = `Subtract ${b} from both sides: x = ${c} - ${b}`;
      } else if (mode < 0.7) {
        x = Math.floor(Math.random() * 10) + 4;
        const b = Math.floor(Math.random() * (x - 2)) + 1;
        const c = x - b;
        eq = `x - ${b} = ${c}`;
        hint = `Add ${b} to both sides: x = ${c} + ${b}`;
      } else {
        x = Math.floor(Math.random() * 6) + 2;
        const a = Math.floor(Math.random() * 5) + 2;
        const c = a * x;
        eq = `${a} × x = ${c}`;
        hint = `Divide both sides by ${a}: x = ${c} ÷ ${a}`;
      }
    } else if (ageGroup === 'teenager') {
      const mode = Math.random();
      if (mode < 0.5) {
        x = Math.floor(Math.random() * 8) + 2;
        const a = Math.floor(Math.random() * 4) + 2;
        const b = Math.floor(Math.random() * 12) + 2;
        const c = a * x + b;
        eq = `${a}x + ${b} = ${c}`;
        hint = `Subtract ${b}, then divide by ${a}`;
      } else if (mode < 0.8) {
        x = Math.floor(Math.random() * 8) + 2;
        const a = Math.floor(Math.random() * 4) + 2;
        const b = Math.floor(Math.random() * 12) + 2;
        const c = a * x - b;
        eq = `${a}x - ${b} = ${c}`;
        hint = `Add ${b}, then divide by ${a}`;
      } else {
        x = Math.floor(Math.random() * 6) + 2;
        const div = Math.floor(Math.random() * 3) + 2;
        const b = Math.floor(Math.random() * 6) + 2;
        const c = x + b;
        eq = `x / ${div} + ${b} = ${c + (x * div - x) / div}`; // simplified fraction
        // Let's ensure integer:
        const intX = x * div;
        eq = `x / ${div} + ${b} = ${x + b}`;
        x = intX;
        hint = `Subtract ${b}, then multiply by ${div}`;
      }
    } else {
      // Adult
      const mode = Math.random();
      if (mode < 0.45) {
        // 2(ax + b) = c
        x = Math.floor(Math.random() * 7) + 2;
        const a = Math.floor(Math.random() * 3) + 2;
        const b = Math.floor(Math.random() * 5) + 1;
        const mult = 2;
        const c = mult * (a * x + b);
        eq = `${mult}(${a}x + ${b}) = ${c}`;
        hint = `Divide by ${mult}, subtract ${b}, divide by ${a}`;
      } else if (mode < 0.8) {
        // ax + b = cx + d
        x = Math.floor(Math.random() * 7) + 2;
        const cCoeff = Math.floor(Math.random() * 2) + 2;
        const aCoeff = cCoeff + Math.floor(Math.random() * 3) + 1;
        const bConst = Math.floor(Math.random() * 10) + 1;
        const dConst = (aCoeff - cCoeff) * x + bConst;
        eq = `${aCoeff}x + ${bConst} = ${cCoeff}x + ${dConst}`;
        hint = `Move terms with x to one side, constants to other`;
      } else {
        // (x + a) / b = c
        x = Math.floor(Math.random() * 8) + 3;
        const a = Math.floor(Math.random() * 6) + 2;
        const b = Math.floor(Math.random() * 3) + 2;
        const c = Math.floor((x + a) / b);
        x = c * b - a; // guarantee exact integer
        eq = `(x + ${a}) / ${b} = ${c}`;
        hint = `Multiply both sides by ${b}, then subtract ${a}`;
      }
    }

    const opts = new Set<number>([x]);
    while (opts.size < 4) {
      const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
      const fake = x + delta;
      if (fake > 0 && fake !== x) opts.add(fake);
    }
    const optArray = Array.from(opts);
    for (let i = optArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optArray[i], optArray[j]] = [optArray[j], optArray[i]];
    }

    return {
      equation: eq,
      variableName: 'x',
      solution: x,
      options: optArray,
      hint,
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
    setCurrentProblem(p);
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

  const handleSelect = (val: number) => {
    if (isAnswered || !isPlaying || gameOver || !currentProblem) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOpt(val);
    setIsAnswered(true);

    if (val === currentProblem.solution) {
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
          <span className="text-zinc-400">Score <strong className="text-cyan-400 font-mono text-base tabular-nums">{score}</strong></span>
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

      {/* Main Screen */}
      <div className="relative w-full min-h-[340px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
        {!isPlaying && !gameOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mb-3 shadow-md">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Algebra Equation Balancer</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
              Toughness configured for <strong className="text-cyan-400 uppercase">{ageGroup}</strong>. Isolate the variable X and balance the equation before time runs out!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer text-xs"
            >
              Start Solving
            </button>
          </div>
        )}

        {isPlaying && currentProblem && (
          <>
            <div className="my-auto text-center py-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold mb-3">
                <Sparkles className="w-3 h-3" />
                <span>Find value of X</span>
              </div>

              {/* Equation Box */}
              <div className="p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-3xl sm:text-4xl font-black text-white font-mono tracking-wide shadow-inner">
                {currentProblem.equation}
              </div>

              <div className="mt-2 text-[11px] text-zinc-500 font-medium">
                Tip: {currentProblem.hint}
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {currentProblem.options.map((opt, idx) => {
                let btnStyle = 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-100 hover:border-cyan-500/40';

                if (isAnswered) {
                  if (opt === currentProblem.solution) {
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
                    className={`py-3 px-4 text-center font-mono text-xl font-black rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5 ${btnStyle}`}
                  >
                    <span className="text-xs text-zinc-500 font-sans">x =</span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <Trophy className="w-12 h-12 text-cyan-400 mb-2 animate-bounce" />
            <div className="text-xs text-rose-400 uppercase tracking-widest font-bold mb-1">Equation Unbalanced</div>
            <div className="text-4xl font-black text-white mb-1 font-mono">{score}</div>
            <p className="text-xs text-zinc-400 mb-4">
              Balanced <strong className="text-white">{totalSolved}</strong> algebraic equations!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Solve Again</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-zinc-500 text-center font-medium">
        Level: {ageGroup.toUpperCase()} · Trains deductive reasoning, variable manipulation & algebraic balance
      </div>
    </div>
  );
};
