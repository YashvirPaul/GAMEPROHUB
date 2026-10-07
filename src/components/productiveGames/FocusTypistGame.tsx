import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Keyboard, Award, CheckCircle2, Zap } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

const KID_TEXTS = [
  "Believe in yourself. Every big dream begins with a small step.",
  "Stop scrolling and start learning. Practice makes you stronger every day.",
  "Focus on your goals. When you work hard, amazing things happen."
];

const TEEN_TEXTS = [
  "Discipline is choosing between what you want now and what you want most. Focus on your dreams, eliminate endless scrolling, and build your future.",
  "Success is not an accident. It is hard work, perseverance, learning, studying, and most of all, loving what you are doing.",
  "Your time is limited, so do not waste it living someone else's life. Have the courage to follow your heart and genuine curiosity."
];

const ADULT_TEXTS = [
  "The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy. If you cultivate this skill, you will thrive.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit. Eliminate superficial distractions and focus relentlessly on your high-impact priorities.",
  "Action produces clarity where thinking creates hesitation. Measure your days not by the noise consumed, but by the meaningful craft produced."
];

export const FocusTypistGame: React.FC<GameProps> = ({ ageGroup, onScoreUpdate, onGameOver, highScore }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [gameOver, setGameOver] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const getTargetPool = () => {
    if (ageGroup === 'kid') return KID_TEXTS;
    if (ageGroup === 'teenager') return TEEN_TEXTS;
    return ADULT_TEXTS;
  };

  const startGame = () => {
    const pool = getTargetPool();
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setTargetText(chosen);
    setUserInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setGameOver(false);
    setIsPlaying(true);
    soundFx.playClick();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!startTime) {
      setStartTime(performance.now());
    }

    setUserInput(val);
    soundFx.playTone(400, 'sine', 0.02, 0.04);

    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) correctChars++;
    }
    const currentAcc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
    setAccuracy(currentAcc);

    // Calculate WPM
    if (startTime) {
      const elapsedMinutes = (performance.now() - startTime) / 60000;
      if (elapsedMinutes > 0.02) {
        const wordsTyped = correctChars / 5;
        const currentWpm = Math.round(wordsTyped / elapsedMinutes);
        setWpm(currentWpm);
      }
    }

    // Finished entire text!
    if (val === targetText) {
      const elapsedMinutes = Math.max(0.05, (performance.now() - (startTime || performance.now())) / 60000);
      const finalWpm = Math.round((targetText.length / 5) / elapsedMinutes);
      const scoreEarned = Math.round(finalWpm * 15 * (currentAcc / 100));

      setWpm(finalWpm);
      setIsPlaying(false);
      setGameOver(true);
      soundFx.playVictory();
      onScoreUpdate(scoreEarned);
      onGameOver(scoreEarned);
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Speed <strong className="text-teal-400 font-mono text-base tabular-nums">{wpm} WPM</strong></span>
          <span className="text-zinc-400">Accuracy <strong className="text-emerald-400 font-mono text-base tabular-nums">{accuracy}%</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-bold uppercase text-[10px] border border-zinc-700">
            {ageGroup}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative w-full min-h-[360px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-5 flex flex-col justify-between overflow-hidden">
        {!isPlaying && !gameOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-2xl mb-3 shadow-md">
              <Keyboard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Productivity Speed Typist</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
              Targeted for <strong className="text-teal-400 uppercase">{ageGroup}</strong>. Stop scrolling and train high-speed keyboard focus while typing motivational wisdom!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer text-xs"
            >
              Start Typing Sprint
            </button>
          </div>
        )}

        {isPlaying && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Target text with character coloring */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm font-mono leading-relaxed mb-4 max-h-40 overflow-y-auto">
              {targetText.split('').map((char, idx) => {
                let color = 'text-zinc-500';
                if (idx < userInput.length) {
                  color = userInput[idx] === char ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40';
                } else if (idx === userInput.length) {
                  color = 'text-white border-b-2 border-teal-400';
                }
                return (
                  <span key={idx} className={color}>
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Input area */}
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              rows={3}
              placeholder="Type the passage here..."
              className="w-full p-3 bg-zinc-900 border-2 border-zinc-700 focus:border-teal-400 rounded-xl text-xs sm:text-sm text-white font-mono placeholder-zinc-600 focus:outline-hidden transition-all resize-none"
            />
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <Award className="w-12 h-12 text-teal-400 mb-2 animate-bounce" />
            <div className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-1">Passage Completed!</div>
            <div className="text-4xl font-black text-white mb-1 font-mono">{wpm} WPM</div>
            <p className="text-xs text-zinc-400 mb-4">
              Accuracy: <strong className="text-emerald-400">{accuracy}%</strong> · Fast, accurate typing!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Passage</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-zinc-500 text-center font-medium">
        Level: {ageGroup.toUpperCase()} · Builds typing words-per-minute, motor focus, and deep concentration stamina
      </div>
    </div>
  );
};
