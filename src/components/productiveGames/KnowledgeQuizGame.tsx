import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, Globe2, CheckCircle2, XCircle, Award, Compass, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

interface Question {
  prompt: string;
  category: string;
  options: string[];
  correct: number;
  explanation: string;
}

const KID_QUESTIONS: Question[] = [
  {
    prompt: 'Which planet in our solar system is known as the Red Planet?',
    category: 'Astronomy',
    options: ['Mars', 'Venus', 'Jupiter', 'Mercury'],
    correct: 0,
    explanation: 'Mars appears red because its surface is rich in iron oxide (rust).'
  },
  {
    prompt: 'What gas do plants absorb from the air to perform photosynthesis?',
    category: 'Biology',
    options: ['Carbon Dioxide', 'Oxygen', 'Helium', 'Nitrogen'],
    correct: 0,
    explanation: 'Plants absorb carbon dioxide (CO₂) and release oxygen into the atmosphere.'
  },
  {
    prompt: 'How many continents are there on planet Earth?',
    category: 'Geography',
    options: ['5', '6', '7', '8'],
    correct: 2,
    explanation: 'There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia.'
  },
  {
    prompt: 'What is the freezing point of water in degrees Celsius?',
    category: 'Physics',
    options: ['0°C', '10°C', '32°C', '100°C'],
    correct: 0,
    explanation: 'Pure water freezes into solid ice at 0°C (32°F).'
  },
  {
    prompt: 'Which is the largest animal currently living on Earth?',
    category: 'Zoology',
    options: ['Blue Whale', 'African Elephant', 'Giraffe', 'Colossal Squid'],
    correct: 0,
    explanation: 'The blue whale can grow up to 100 feet long and weigh nearly 200 tons!'
  },
  {
    prompt: 'What organ pumps blood through the human body?',
    category: 'Human Body',
    options: ['Heart', 'Lungs', 'Stomach', 'Liver'],
    correct: 0,
    explanation: 'The heart beats roughly 100,000 times each day to circulate blood.'
  }
];

const TEEN_QUESTIONS: Question[] = [
  {
    prompt: 'What is the powerhouse organelle of eukaryotic cells responsible for producing ATP?',
    category: 'Cell Biology',
    options: ['Mitochondria', 'Ribosome', 'Endoplasmic Reticulum', 'Golgi Apparatus'],
    correct: 0,
    explanation: 'Mitochondria generate most of the chemical energy needed to power biochemical reactions via ATP.'
  },
  {
    prompt: 'Who formulated the three fundamental laws of motion and universal gravitation?',
    category: 'Physics',
    options: ['Sir Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Niels Bohr'],
    correct: 0,
    explanation: 'Sir Isaac Newton published the laws of motion in Principia Mathematica in 1687.'
  },
  {
    prompt: 'What is the atomic chemical symbol for Gold on the periodic table?',
    category: 'Chemistry',
    options: ['Au', 'Ag', 'Fe', 'Gd'],
    correct: 0,
    explanation: 'Au comes from the Latin word "Aurum", meaning shining dawn.'
  },
  {
    prompt: 'Which atmospheric layer contains the ozone layer that shields Earth from harmful UV rays?',
    category: 'Earth Science',
    options: ['Stratosphere', 'Troposphere', 'Mesosphere', 'Thermosphere'],
    correct: 0,
    explanation: 'The ozone layer is concentrated within the lower portion of the stratosphere.'
  },
  {
    prompt: 'What is the speed of light in a vacuum (approximate)?',
    category: 'Physics',
    options: ['300,000 km/s', '150,000 km/s', '3,000 km/s', '1,000,000 km/s'],
    correct: 0,
    explanation: 'Light travels at approximately 299,792 kilometers per second in a vacuum.'
  },
  {
    prompt: 'What is the largest desert on Earth by geographic area?',
    category: 'Geography',
    options: ['Antarctic Polar Desert', 'Sahara Desert', 'Arabian Desert', 'Gobi Desert'],
    correct: 0,
    explanation: 'Antarctica is classified as a polar desert covering 14.2 million square kilometers.'
  }
];

const ADULT_QUESTIONS: Question[] = [
  {
    prompt: 'Which principle states that you cannot simultaneously know both the exact position and momentum of a subatomic particle?',
    category: 'Quantum Mechanics',
    options: ['Heisenberg Uncertainty Principle', 'Pauli Exclusion Principle', 'Schrödinger Wave Equation', 'Fermat Principle'],
    correct: 0,
    explanation: 'Formulated by Werner Heisenberg in 1927, it reveals fundamental limits on precision in quantum measurements.'
  },
  {
    prompt: 'What economic law states that bad money drives out good money from circulation?',
    category: 'Economics',
    options: ["Gresham's Law", "Say's Law", 'Okun Law', 'Pareto Principle'],
    correct: 0,
    explanation: "Gresham's Law posits that if two forms of commodity money have equal face value, people hoard the more intrinsically valuable one."
  },
  {
    prompt: 'What is the primary neurochemical mechanism targeted by SSRI antidepressants?',
    category: 'Neuroscience',
    options: ['Inhibiting serotonin reuptake transporters', 'Stimulating dopamine production', 'Blocking GABA receptors', 'Enhancing acetylcholine breakdown'],
    correct: 0,
    explanation: 'Selective Serotonin Reuptake Inhibitors (SSRIs) increase extracellular serotonin by preventing its reabsorption.'
  },
  {
    prompt: 'Which landmark 1953 paper by Watson and Crick revealed the double-helix molecular structure of DNA?',
    category: 'Biochemistry',
    options: ['Molecular Structure of Nucleic Acids', 'On the Origin of Species', 'The Selfish Gene', 'Cellular Dynamics'],
    correct: 0,
    explanation: 'Published in Nature in April 1953, assisted fundamentally by Rosalind Franklin\'s X-ray crystallography Photo 51.'
  },
  {
    prompt: 'What is the name of the cosmological boundary beyond which events cannot affect an outside observer in general relativity?',
    category: 'Astrophysics',
    options: ['Event Horizon', 'Ergosphere', 'Roche Limit', 'Schwarzschild Density'],
    correct: 0,
    explanation: 'The event horizon is the boundary surrounding a black hole where escape velocity exceeds the speed of light.'
  },
  {
    prompt: 'What cognitive bias causes people with low competence in a domain to overestimate their ability?',
    category: 'Psychology',
    options: ['Dunning-Kruger Effect', 'Confirmation Bias', 'Availability Heuristic', 'Anchoring Bias'],
    correct: 0,
    explanation: 'Identified by David Dunning and Justin Kruger in 1999, examining metacognitive blindness.'
  }
];

export const KnowledgeQuizGame: React.FC<GameProps> = ({
  ageGroup,
  onScoreUpdate,
  onGameOver,
  highScore,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [questionPool, setQuestionPool] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);

  const getTimeForAge = useCallback(() => {
    if (ageGroup === 'kid') return 18;
    if (ageGroup === 'teenager') return 14;
    return 10;
  }, [ageGroup]);

  const loadQuestions = useCallback(() => {
    let pool = KID_QUESTIONS;
    if (ageGroup === 'teenager') pool = TEEN_QUESTIONS;
    if (ageGroup === 'adult') pool = ADULT_QUESTIONS;

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuestionPool(shuffled);
    setQIndex(0);
  }, [ageGroup]);

  const currentQ = questionPool[qIndex];

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setStreak(0);
    setGameOver(false);
    setSelectedOpt(null);
    setIsAnswered(false);
    loadQuestions();
    setIsPlaying(true);
    setTimeLeft(getTimeForAge());
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

  const handleAnswer = (idx: number) => {
    if (isAnswered || !currentQ) return;

    setSelectedOpt(idx);
    setIsAnswered(true);

    if (idx === currentQ.correct) {
      soundFx.playSuccess();
      const streakBonus = streak * 25;
      const timeBonus = timeLeft * 10;
      const earned = 100 + streakBonus + timeBonus;

      const newScore = score + earned;
      setScore(newScore);
      scoreRef.current = newScore;
      onScoreUpdate(newScore);

      setStreak(s => s + 1);

      setTimeout(() => {
        if (qIndex + 1 < questionPool.length) {
          setQIndex(i => i + 1);
          setSelectedOpt(null);
          setIsAnswered(false);
          setTimeLeft(getTimeForAge());
        } else {
          // Completed all questions in set
          soundFx.playGameWin();
          handleGameOver();
        }
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
            <span className="font-mono font-black text-sky-400 text-base">{score}</span>
          </div>
        </div>
      </div>

      {!isPlaying ? (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-sky-950/80 border border-sky-500/40 text-sky-400 flex items-center justify-center mx-auto shadow-lg">
            <Globe2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Science & World Knowledge</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              Expand your foundational knowledge of science, biology, physics, universe, and civilization milestones.
            </p>
          </div>

          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850 text-left space-y-1.5 text-xs text-zinc-300">
            <div className="font-bold text-sky-400 mb-1">
              {ageGroup === 'kid' && '🧒 Kid Mode: Solar system, living world, animal kingdom, body organs'}
              {ageGroup === 'teenager' && '🧑 Teenager Mode: Cellular biology, physics laws, periodic chemistry & geography'}
              {ageGroup === 'adult' && '👨 Adult Mode: Quantum principles, neurochemistry, history & scientific paradigms'}
            </div>
            <p className="text-zinc-400">
              Personal record: <strong className="text-white font-mono">{highScore} pts</strong>
            </p>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-95"
          >
            Start Knowledge Explorer
          </button>
        </div>
      ) : gameOver ? (
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Knowledge Session Complete</h3>
            <p className="text-xs text-zinc-400 mt-1">Every question builds real-world mental horsepower</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Answered</span>
              <span className="text-xl font-mono font-black text-white">{qIndex + (streak > 0 ? 1 : 0)}</span>
            </div>
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Final Score</span>
              <span className="text-xl font-mono font-black text-sky-400">{score}</span>
            </div>
          </div>

          {currentQ && (
            <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-300 text-left">
              <span className="font-bold text-sky-400 block mb-1">Key Scientific Takeaway:</span>
              <p className="text-zinc-400 font-medium">{currentQ.explanation}</p>
            </div>
          )}

          <button
            onClick={startGame}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Next Set</span>
          </button>
        </div>
      ) : currentQ ? (
        <div className="w-full space-y-5">
          {/* Question Box */}
          <div className="p-6 sm:p-7 bg-zinc-900/90 border border-zinc-800 rounded-3xl text-left shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 font-bold text-[11px]">
                {currentQ.category}
              </span>
              <span className="text-zinc-500 font-mono text-xs">
                Question {qIndex + 1} / {questionPool.length}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQ.prompt}
            </h4>

            {isAnswered && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold animate-in fade-in ${
                  selectedOpt === currentQ.correct
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                {selectedOpt === currentQ.correct ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Correct! {currentQ.explanation}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Incorrect. The answer is: {currentQ.options[currentQ.correct]}. {currentQ.explanation}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              let btnStyle = 'bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-850 hover:border-sky-500/50';

              if (isAnswered) {
                if (idx === currentQ.correct) {
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
                  <span className="font-mono text-zinc-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
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
