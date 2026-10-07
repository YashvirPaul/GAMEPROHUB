import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, DollarSign, CheckCircle2, XCircle, Award, TrendingUp, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

interface FinanceProblem {
  scenario: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const FinancialIqGame: React.FC<GameProps> = ({
  ageGroup,
  onScoreUpdate,
  onGameOver,
  highScore,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<FinanceProblem | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(16);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [totalSolved, setTotalSolved] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const getTimeForAge = useCallback(() => {
    if (ageGroup === 'kid') return 18;
    if (ageGroup === 'teenager') return 14;
    return 10;
  }, [ageGroup]);

  const generateProblem = useCallback((): FinanceProblem => {
    if (ageGroup === 'kid') {
      const mode = Math.random();
      if (mode < 0.5) {
        // Piggy bank savings
        const daily = Math.floor(Math.random() * 5) + 2;
        const days = [5, 7, 10][Math.floor(Math.random() * 3)];
        const total = daily * days;
        return {
          scenario: `You save $${daily} in your savings jar every day for ${days} days.`,
          question: `How much total money will you have saved?`,
          options: [`$${total}`, `$${total + daily}`, `$${Math.max(1, total - daily)}`, `$${total + 5}`].sort(() => Math.random() - 0.5),
          correctAnswer: `$${total}`,
          explanation: `$${daily} × ${days} days = $${total}. Consistent small daily savings add up quickly!`,
        };
      } else {
        // Change from purchase
        const cost = (Math.floor(Math.random() * 8) + 2) * 5;
        const bill = cost <= 20 ? 20 : 50;
        const change = bill - cost;
        return {
          scenario: `You buy a book for $${cost} and pay with a $${bill} note.`,
          question: `How much change should the cashier give back?`,
          options: [`$${change}`, `$${change + 5}`, `$${Math.max(1, change - 5)}`, `$${change + 10}`].sort(() => Math.random() - 0.5),
          correctAnswer: `$${change}`,
          explanation: `$${bill} - $${cost} = $${change} in change. Always verify your change!`,
        };
      }
    } else if (ageGroup === 'teenager') {
      const mode = Math.random();
      if (mode < 0.5) {
        // Percentage discount
        const original = (Math.floor(Math.random() * 8) + 2) * 20; // 40, 60, 80, 100, 120...
        const pct = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
        const discount = (original * pct) / 100;
        const finalPrice = original - discount;
        return {
          scenario: `A quality laptop bag priced at $${original} is on a ${pct}% seasonal discount sale.`,
          question: `What is the discounted price you actually pay?`,
          options: [`$${finalPrice}`, `$${finalPrice + 10}`, `$${original - 10}`, `$${finalPrice + discount / 2}`].sort(() => Math.random() - 0.5),
          correctAnswer: `$${finalPrice}`,
          explanation: `${pct}% of $${original} is $${discount}. Final price: $${original} - $${discount} = $${finalPrice}.`,
        };
      } else {
        // Profit margin
        const cost = Math.floor(Math.random() * 6 + 2) * 10; // 20, 30, 40...
        const sell = cost + Math.floor(Math.random() * 4 + 1) * 10;
        const profit = sell - cost;
        return {
          scenario: `You buy materials to make handmade crafts for $${cost} and sell them online for $${sell}.`,
          question: `What is your net profit on this transaction?`,
          options: [`$${profit}`, `$${sell}`, `$${cost}`, `$${profit + 15}`].sort(() => Math.random() - 0.5),
          correctAnswer: `$${profit}`,
          explanation: `Revenue ($${sell}) - Cost ($${cost}) = Net Profit ($${profit}).`,
        };
      }
    } else {
      // Adult: Compound interest, annual returns, investment rule of 72
      const mode = Math.random();
      if (mode < 0.4) {
        // Rule of 72: Doubling time
        const rates = [6, 8, 9, 12];
        const r = rates[Math.floor(Math.random() * rates.length)];
        const years = Math.round(72 / r);
        return {
          scenario: `You invest capital into an index fund averaging ${r}% compounded annual return.`,
          question: `Using the Rule of 72, approximately how many years will it take for your investment to double?`,
          options: [`${years} years`, `${years + 3} years`, `${Math.max(2, years - 3)} years`, `${years * 2} years`].sort(() => Math.random() - 0.5),
          correctAnswer: `${years} years`,
          explanation: `Rule of 72: 72 ÷ ${r} = ~${years} years to double your initial capital.`,
        };
      } else if (mode < 0.7) {
        // Simple Interest annual payout
        const principal = [5000, 10000, 20000][Math.floor(Math.random() * 3)];
        const rate = [5, 6, 7, 8][Math.floor(Math.random() * 4)];
        const payout = (principal * rate) / 100;
        return {
          scenario: `You lock $${principal.toLocaleString()} into a high-yield treasury note offering ${rate}% annual yield.`,
          question: `How much passive interest income will you receive annually?`,
          options: [`$${payout.toLocaleString()}`, `$${(payout * 2).toLocaleString()}`, `$${(payout + 200).toLocaleString()}`, `$${Math.max(100, payout - 200).toLocaleString()}`].sort(() => Math.random() - 0.5),
          correctAnswer: `$${payout.toLocaleString()}`,
          explanation: `$${principal.toLocaleString()} × ${rate}% = $${payout.toLocaleString()} annual passive interest.`,
        };
      } else {
        // 50/30/20 Budgeting Rule
        const income = [3000, 4000, 5000, 6000][Math.floor(Math.random() * 4)];
        const savingsTarget = income * 0.2;
        return {
          scenario: `Following the classical 50/30/20 budget framework with a monthly take-home income of $${income.toLocaleString()}.`,
          question: `How much should be routed into long-term savings & debt elimination (the 20% category)?`,
          options: [`$${savingsTarget.toLocaleString()}`, `$${(income * 0.3).toLocaleString()}`, `$${(income * 0.5).toLocaleString()}`, `$${(savingsTarget + 150).toLocaleString()}`].sort(() => Math.random() - 0.5),
          correctAnswer: `$${savingsTarget.toLocaleString()}`,
          explanation: `20% of $${income.toLocaleString()} is $${savingsTarget.toLocaleString()}. Paying yourself first creates wealth.`,
        };
      }
    }
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

  const handleSelectOption = (opt: string) => {
    if (isAnswered || !currentProblem) return;

    setSelectedOpt(opt);
    setIsAnswered(true);

    if (opt === currentProblem.correctAnswer) {
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
      }, 1600);
    } else {
      soundFx.playError();
      setStreak(0);
      setTimeout(() => {
        handleGameOver();
      }, 2000);
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
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
            <DollarSign className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Financial IQ & Practical Math</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              Master real-world money logic, smart discounts, compound interest, and wealth allocation principles.
            </p>
          </div>

          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850 text-left space-y-1.5 text-xs text-zinc-300">
            <div className="font-bold text-emerald-400 mb-1">
              {ageGroup === 'kid' && '🧒 Kid Mode: Piggy bank daily totals, bill change & shopping coins'}
              {ageGroup === 'teenager' && '🧑 Teenager Mode: Percentage discount bargains, profit margins & earnings'}
              {ageGroup === 'adult' && '👨 Adult Mode: Rule of 72 compounding, bond yields & 50/30/20 wealth frameworks'}
            </div>
            <p className="text-zinc-400">
              Personal record: <strong className="text-white font-mono">{highScore} pts</strong>
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
          >
            Start Financial IQ Challenge
          </button>
        </div>
      ) : gameOver ? (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Financial Session Complete</h3>
            <p className="text-xs text-zinc-400 mt-1">Financial literacy is the foundation of independence</p>
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
              <span className="font-bold text-emerald-400 block mb-1">Financial Takeaway:</span>
              <p className="text-zinc-400 font-medium">{currentProblem.explanation}</p>
            </div>
          )}

          <button
            onClick={startGame}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Another Round</span>
          </button>
        </div>
      ) : currentProblem ? (
        <div className="w-full space-y-5">
          {/* Problem Display */}
          <div className="p-6 sm:p-7 bg-zinc-900/90 border border-zinc-800 rounded-3xl text-left shadow-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real World Scenario</span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              {currentProblem.scenario}
            </p>

            <h4 className="text-base sm:text-lg font-bold text-white pt-1">
              {currentProblem.question}
            </h4>

            {isAnswered && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold animate-in fade-in ${
                  selectedOpt === currentProblem.correctAnswer
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {selectedOpt === currentProblem.correctAnswer ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Correct! {currentProblem.explanation}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Incorrect. The answer is {currentProblem.correctAnswer}. {currentProblem.explanation}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3">
            {currentProblem.options.map((opt, idx) => {
              let btnStyle = 'bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-850 hover:border-emerald-500/50';

              if (isAnswered) {
                if (opt === currentProblem.correctAnswer) {
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
                  className={`p-4 rounded-2xl border-2 text-center font-bold text-sm sm:text-base transition-all cursor-pointer active:scale-98 ${btnStyle}`}
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
