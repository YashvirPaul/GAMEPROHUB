import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, BookOpen, CheckCircle2, XCircle, Award, Eye, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

interface PassageQuiz {
  title: string;
  passage: string;
  question: string;
  options: string[];
  correct: number;
  insight: string;
}

const KID_PASSAGES: PassageQuiz[] = [
  {
    title: 'The Great Honeybee Dance',
    passage: 'When honeybees locate a field of colorful wildflowers, they return to their hive and perform a special "waggle dance". This rhythmic circle tells other bees the exact direction and distance of the nectar flowers relative to the sun.',
    question: 'How do honeybees communicate the location of flowers to other hive members?',
    options: ['By performing a waggle dance', 'By buzzing in loud musical patterns', 'By tapping their antennae together', 'By shining ultraviolet light'],
    correct: 0,
    insight: 'Honeybees communicate complex trigonometric angles through dance steps!'
  },
  {
    title: 'The Power of Consistency',
    passage: 'A single drop of water falling on a stone seems completely harmless. But when millions of drops fall on the exact same spot day after day for years, they carve deep canyons into the hardest granite rock.',
    question: 'What message does the drop of water on stone convey?',
    options: ['Persistent small actions create enormous results over time', 'Water is softer than stone so it gives up', 'Large sudden storms are best', 'Never touch stone with water'],
    correct: 0,
    insight: 'Consistency out-performs raw intensity in building your dreams.'
  }
];

const TEEN_PASSAGES: PassageQuiz[] = [
  {
    title: 'The Neuroscience of Deep Focus',
    passage: 'Whenever you repeatedly resist the temptation to check your smartphone and remain immersed in difficult study for 45 minutes, your brain wraps nerve fibers in a protective fatty tissue called myelin. Myelin insulates neural circuits, enabling electrical impulses to travel up to 100 times faster.',
    question: 'What physiological change occurs in the brain during prolonged deep concentration?',
    options: ['Myelin coats neural circuits, drastically increasing signaling speed', 'The brain shrinks its frontal cortex to conserve energy', 'Dopamine receptors shut down permanently', 'Blood stops circulating through the hippocampus'],
    correct: 0,
    insight: 'Focused practice literally upgrades the physical wiring of your brain.'
  },
  {
    title: 'The Fallacy of Multitasking',
    passage: 'Cognitive scientists at Stanford University demonstrated that humans do not actually multitask cognitive operations. Instead, the brain rapidly switches attention back and forth. Each shift leaves "attention residue" in working memory, degrading problem-solving accuracy by up to 40%.',
    question: 'Why does attempting to multitask reduce academic performance?',
    options: ['It causes rapid task-switching and leaves attention residue', 'It causes the brain to overheat physically', 'It uses up all the body\'s glucose in 5 minutes', 'It permanently damages eyesight'],
    correct: 0,
    insight: 'Single-tasking with zero tabs open is the ultimate superpower.'
  }
];

const ADULT_PASSAGES: PassageQuiz[] = [
  {
    title: 'The Asymmetry of High-Leverage Craft',
    passage: 'In intellectual and technological economies, outputs are fundamentally non-linear. An engineer who produces code with zero architectural debt generates 1,000x more lasting enterprise value than one generating superficial quick fixes. High leverage demands ruthless elimination of shallow commitments in order to preserve unbroken blocks of deep contemplation.',
    question: 'According to this analysis, what is the prerequisite for achieving high-leverage value?',
    options: ['Ruthlessly eliminating shallow commitments to preserve deep focus', 'Working 80 hours per week answering incoming emails', 'Switching rapidly between simultaneous projects', 'Minimizing contemplation time to produce immediate drafts'],
    correct: 0,
    insight: 'Your output quality is directly governed by uninterrupted deep work.'
  },
  {
    title: 'First-Principles Thinking vs Analogy',
    passage: 'First-principles reasoning boils things down to their most fundamental truths and reasons upwards from there, rather than reasoning by analogy—which mimics what others are doing with slight variations. Building transformative ideas requires questioning standard assumptions until only undeniable axioms remain.',
    question: 'How does first-principles reasoning differ from reasoning by analogy?',
    options: ['It breaks problems down to fundamental truths rather than copying others', 'It relies exclusively on crowd consensus and tradition', 'It avoids testing foundational axioms', 'It prioritizes speed over logical validity'],
    correct: 0,
    insight: 'First-principles thinking frees you from conventional herd limitations.'
  }
];

export const SpeedReadingGame: React.FC<GameProps> = ({
  ageGroup,
  onScoreUpdate,
  onGameOver,
  highScore,
}) => {
  const [stage, setStage] = useState<'intro' | 'reading' | 'quiz' | 'finished'>('intro');
  const [passagePool, setPassagePool] = useState<PassageQuiz[]>([]);
  const [pIndex, setPIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [readSeconds, setReadSeconds] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const loadPassages = useCallback(() => {
    let pool = KID_PASSAGES;
    if (ageGroup === 'teenager') pool = TEEN_PASSAGES;
    if (ageGroup === 'adult') pool = ADULT_PASSAGES;

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setPassagePool(shuffled);
    setPIndex(0);
  }, [ageGroup]);

  const currentPassage = passagePool[pIndex];

  const startReading = () => {
    setScore(0);
    scoreRef.current = 0;
    loadPassages();
    setSelectedOpt(null);
    setIsAnswered(false);
    setStage('reading');
    startTimeRef.current = performance.now();
    soundFx.playClick();
  };

  const handleFinishReading = () => {
    const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
    setReadSeconds(Math.round(elapsedSec * 10) / 10);

    if (currentPassage) {
      const words = currentPassage.passage.split(/\s+/).length;
      const calculatedWpm = Math.round((words / Math.max(1, elapsedSec)) * 60);
      setWpm(calculatedWpm);
    }

    setStage('quiz');
    soundFx.playClick();
  };

  const handleAnswer = (idx: number) => {
    if (isAnswered || !currentPassage) return;

    setSelectedOpt(idx);
    setIsAnswered(true);

    if (idx === currentPassage.correct) {
      soundFx.playSuccess();
      const speedScore = Math.min(wpm * 2, 300);
      const earned = 150 + speedScore;

      const newScore = score + earned;
      setScore(newScore);
      scoreRef.current = newScore;
      onScoreUpdate(newScore);

      setTimeout(() => {
        if (pIndex + 1 < passagePool.length) {
          setPIndex(i => i + 1);
          setSelectedOpt(null);
          setIsAnswered(false);
          setStage('reading');
          startTimeRef.current = performance.now();
        } else {
          soundFx.playGameWin();
          setStage('finished');
          onGameOver(scoreRef.current);
        }
      }, 1800);
    } else {
      soundFx.playError();
      setTimeout(() => {
        setStage('finished');
        onGameOver(scoreRef.current);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full">
      {stage === 'intro' && (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-teal-950/80 border border-teal-500/40 text-teal-400 flex items-center justify-center mx-auto shadow-lg">
            <BookOpen className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Speed Reading & Retention</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              Train rapid visual comprehension. Read inspiring deep passages, measure your reading WPM, and test instant recall.
            </p>
          </div>

          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850 text-left space-y-1.5 text-xs text-zinc-300">
            <div className="font-bold text-teal-400 mb-1">
              {ageGroup === 'kid' && '🧒 Kid Mode: Short engaging stories on nature, animals & daily perseverance'}
              {ageGroup === 'teenager' && '🧑 Teenager Mode: Neuroscience of focus, single-tasking & habit formation'}
              {ageGroup === 'adult' && '👨 Adult Mode: High-leverage output, first-principles thinking & cognitive clarity'}
            </div>
            <p className="text-zinc-400">
              High score: <strong className="text-white font-mono">{highScore} pts</strong>
            </p>
          </div>

          <button
            onClick={startReading}
            className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-500/25 transition-all cursor-pointer active:scale-95"
          >
            Start Reading Challenge
          </button>
        </div>
      )}

      {stage === 'reading' && currentPassage && (
        <div className="w-full space-y-6">
          <div className="p-7 sm:p-8 bg-zinc-900/90 border-2 border-zinc-800 rounded-3xl text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-3">
              <span className="font-bold text-teal-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Passage {pIndex + 1} of {passagePool.length}</span>
              </span>
              <span className="text-zinc-400 font-medium">Read attentively, then tap Done</span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-white">
              {currentPassage.title}
            </h4>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-serif pt-1 select-none">
              {currentPassage.passage}
            </p>
          </div>

          <button
            onClick={handleFinishReading}
            className="w-full py-4 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-zinc-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-zinc-950" />
            <span>I Finished Reading — Take Comprehension Quiz</span>
          </button>
        </div>
      )}

      {stage === 'quiz' && currentPassage && (
        <div className="w-full space-y-6">
          {/* Comprehension Question Card */}
          <div className="p-7 sm:p-8 bg-zinc-900/90 border-2 border-zinc-800 rounded-3xl text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-3">
              <span className="font-bold text-amber-400 font-mono">
                ⚡ Reading Speed: {wpm} Words / Min ({readSeconds}s)
              </span>
              <span className="text-zinc-400 font-semibold text-[11px]">Instant Recall</span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentPassage.question}
            </h4>

            {isAnswered && (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-semibold animate-in fade-in ${
                  selectedOpt === currentPassage.correct
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-bold">
                  {selectedOpt === currentPassage.correct ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Excellent Comprehension! (+{wpm * 2} speed bonus)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Incorrect answer.</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-zinc-300">{currentPassage.insight}</p>
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {currentPassage.options.map((opt, idx) => {
              let btnStyle = 'bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-850 hover:border-teal-500/50';

              if (isAnswered) {
                if (idx === currentPassage.correct) {
                  btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50';
                } else if (selectedOpt === idx) {
                  btnStyle = 'bg-rose-950 border-rose-500 text-rose-300';
                } else {
                  btnStyle = 'bg-zinc-900/50 border-zinc-850 text-zinc-500 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border-2 text-left font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-98 ${btnStyle}`}
                >
                  <span className="font-mono text-zinc-500 mr-2">{idx + 1}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {stage === 'finished' && (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Reading Session Complete</h3>
            <p className="text-xs text-zinc-400 mt-1">Reading fast with high comprehension builds profound knowledge</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Speed</span>
              <span className="text-xl font-mono font-black text-white">{wpm} WPM</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Final Score</span>
              <span className="text-xl font-mono font-black text-teal-400">{score}</span>
            </div>
          </div>

          <button
            onClick={startReading}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Read Another Passage</span>
          </button>
        </div>
      )}
    </div>
  );
};
