import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, Target, CheckCircle2, XCircle, Award, Sparkles, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

type TaskCategory = 'HIGH_PRIORITY' | 'DISTRACTION';

interface TaskItem {
  text: string;
  category: TaskCategory;
  insight: string;
}

const KID_TASKS: TaskItem[] = [
  {
    text: 'Finish math homework before dinner',
    category: 'HIGH_PRIORITY',
    insight: 'Completing homework early frees your mind and builds academic confidence.'
  },
  {
    text: 'Watching random short videos on phone for hours',
    category: 'DISTRACTION',
    insight: 'Endless short videos tire your brain and steal playtime with real friends.'
  },
  {
    text: 'Pack school bag and books for tomorrow',
    category: 'HIGH_PRIORITY',
    insight: 'Preparing ahead eliminates morning stress and forgotten books.'
  },
  {
    text: 'Complaining instead of trying difficult problems',
    category: 'DISTRACTION',
    insight: 'Complaining wastes energy; asking for help builds your problem-solving muscle.'
  },
  {
    text: 'Read a story book for 20 minutes',
    category: 'HIGH_PRIORITY',
    insight: 'Daily reading expands vocabulary and sparks your imagination.'
  },
  {
    text: 'Clicking recommended gaming streams when supposed to sleep',
    category: 'DISTRACTION',
    insight: 'Late screens ruin healthy deep sleep and morning focus.'
  }
];

const TEEN_TASKS: TaskItem[] = [
  {
    text: 'Study for upcoming physics exam using practice problems',
    category: 'HIGH_PRIORITY',
    insight: 'Active problem solving is 3x more effective than passive re-reading.'
  },
  {
    text: 'Doomscrolling social media feeds to see what peers posted',
    category: 'DISTRACTION',
    insight: 'Endless feed scrolling triggers dopamine crashes and fuels social anxiety.'
  },
  {
    text: 'Practice coding or build a tangible side portfolio project',
    category: 'HIGH_PRIORITY',
    insight: 'Building real things teaches more than 100 tutorials.'
  },
  {
    text: 'Arguing with anonymous strangers in comments sections',
    category: 'DISTRACTION',
    insight: 'Online arguments provide zero intellectual return and drain emotional calm.'
  },
  {
    text: 'Exercise for 30 minutes to boost neuroplasticity',
    category: 'HIGH_PRIORITY',
    insight: 'Cardio exercise releases BDNF, stimulating memory and brain health.'
  },
  {
    text: 'Leaving study desk cluttered with uncharged devices & snacks',
    category: 'DISTRACTION',
    insight: 'Physical clutter creates background cognitive load and micro-distractions.'
  }
];

const ADULT_TASKS: TaskItem[] = [
  {
    text: 'Dedicate 90 minutes of uninterrupted deep work to the core mission',
    category: 'HIGH_PRIORITY',
    insight: 'Deep uninterrupted focus moves careers and breakthrough dreams forward.'
  },
  {
    text: 'Constantly checking notification badges and refresh feeds',
    category: 'DISTRACTION',
    insight: 'Context-switching incurs a 23-minute cognitive penalty to refocus.'
  },
  {
    text: 'Write and finalize the strategic proposal for leadership review',
    category: 'HIGH_PRIORITY',
    insight: 'High-leverage deliverables produce outsized long-term outcomes.'
  },
  {
    text: 'Attending unproductive status meetings without an agenda',
    category: 'DISTRACTION',
    insight: 'Agendaless meetings are a primary destroyer of creative flow and focus.'
  },
  {
    text: 'Review household budget & automate long-term investments',
    category: 'HIGH_PRIORITY',
    insight: 'Financial clarity eliminates chronic stress and creates compound freedom.'
  },
  {
    text: 'Compulsive news-refreshing during working prime hours',
    category: 'DISTRACTION',
    insight: 'Sensational headlines consume mental bandwidth without offering agency.'
  }
];

export const TaskPrioritizerGame: React.FC<GameProps> = ({
  ageGroup,
  onScoreUpdate,
  onGameOver,
  highScore,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [taskPool, setTaskPool] = useState<TaskItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState<{ correct: boolean; insight: string } | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const getTimeLimit = useCallback(() => {
    if (ageGroup === 'kid') return 12;
    if (ageGroup === 'teenager') return 8;
    return 6;
  }, [ageGroup]);

  const loadTasks = useCallback(() => {
    let pool = KID_TASKS;
    if (ageGroup === 'teenager') pool = TEEN_TASKS;
    if (ageGroup === 'adult') pool = ADULT_TASKS;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setTaskPool(shuffled);
    setCurrentIndex(0);
  }, [ageGroup]);

  const currentTask = taskPool[currentIndex];

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    setFeedback(null);
    setGameOver(false);
    loadTasks();
    setIsPlaying(true);
    setTimeLeft(getTimeLimit());
    soundFx.playClick();
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
    if (!isPlaying || gameOver || feedback !== null) return;

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
  }, [isPlaying, gameOver, feedback, handleGameOver]);

  const handleSort = (choice: TaskCategory) => {
    if (feedback !== null || !currentTask) return;

    const isCorrect = choice === currentTask.category;

    if (isCorrect) {
      soundFx.playSuccess();
      const bonus = streak * 20;
      const timeBonus = timeLeft * 10;
      const earned = 100 + bonus + timeBonus;
      const newScore = score + earned;
      setScore(newScore);
      scoreRef.current = newScore;
      onScoreUpdate(newScore);

      setStreak(s => s + 1);
      setFeedback({ correct: true, insight: currentTask.insight });

      setTimeout(() => {
        if (currentIndex + 1 < taskPool.length) {
          setCurrentIndex(i => i + 1);
          setFeedback(null);
          setTimeLeft(getTimeLimit());
        } else {
          soundFx.playGameWin();
          handleGameOver();
        }
      }, 1500);
    } else {
      soundFx.playError();
      setStreak(0);
      setFeedback({ correct: false, insight: currentTask.insight });
      setTimeout(() => {
        handleGameOver();
      }, 1800);
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
            <span className="font-mono font-black text-rose-400 text-base">{score}</span>
          </div>
        </div>
      </div>

      {!isPlaying ? (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
            <Target className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Focus Priority Matrix</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              Stop scrolling, defeat impulse procrastination, and master ruthless prioritization for your life dreams.
            </p>
          </div>

          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850 text-left space-y-1.5 text-xs text-zinc-300">
            <div className="font-bold text-rose-400 mb-1">
              {ageGroup === 'kid' && '🧒 Kid Mode: Distinguishing essential school/chores from video game traps'}
              {ageGroup === 'teenager' && '🧑 Teenager Mode: Prioritizing study & craft over feed doomscrolling'}
              {ageGroup === 'adult' && '👨 Adult Mode: High-leverage deep work vs shallow distraction & news cycles'}
            </div>
            <p className="text-zinc-400">
              High score: <strong className="text-white font-mono">{highScore} pts</strong>
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
          >
            Train Priority Reflexes
          </button>
        </div>
      ) : gameOver ? (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Focus Session Complete</h3>
            <p className="text-xs text-zinc-400 mt-1">Remember: Every decision you make shapes your destiny</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Sorted</span>
              <span className="text-xl font-mono font-black text-white">{currentIndex + (streak > 0 ? 1 : 0)}</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Final Score</span>
              <span className="text-xl font-mono font-black text-rose-400">{score}</span>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sort More Decisions</span>
          </button>
        </div>
      ) : currentTask ? (
        <div className="w-full space-y-6">
          {/* Card Presentation */}
          <div className="p-7 sm:p-8 bg-zinc-900/90 border-2 border-zinc-800 rounded-3xl text-center shadow-2xl space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Classify This Activity Immediately
            </span>

            <p className="text-lg sm:text-xl font-black text-white leading-relaxed max-w-md mx-auto">
              "{currentTask.text}"
            </p>

            {feedback && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-semibold animate-in fade-in ${
                  feedback.correct
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1 font-bold">
                  {feedback.correct ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Wise Choice!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>False Trap!</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-zinc-300">{feedback.insight}</p>
              </div>
            )}
          </div>

          {/* 2 Big Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleSort('HIGH_PRIORITY')}
              disabled={feedback !== null}
              className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 border-2 border-emerald-500/60 hover:border-emerald-400 hover:from-emerald-900 hover:to-teal-900 text-white font-black text-sm flex flex-col items-center gap-2 transition-all cursor-pointer active:scale-98 shadow-lg shadow-emerald-950/40"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-emerald-300 font-extrabold">HIGH PRIORITY / MUST DO</span>
              <span className="text-[11px] text-zinc-400 font-normal">Builds your dreams & real future</span>
            </button>

            <button
              onClick={() => handleSort('DISTRACTION')}
              disabled={feedback !== null}
              className="p-5 rounded-2xl bg-gradient-to-r from-rose-950 to-red-950 border-2 border-rose-500/60 hover:border-rose-400 hover:from-rose-900 hover:to-red-900 text-white font-black text-sm flex flex-col items-center gap-2 transition-all cursor-pointer active:scale-98 shadow-lg shadow-rose-950/40"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-rose-300 font-extrabold">DISTRACTION / TIME THIEF</span>
              <span className="text-[11px] text-zinc-400 font-normal">Stop scrolling, eliminate time waste</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
