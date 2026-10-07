import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Clock, Target, Award, Eye } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

export const NumberGridFocusGame: React.FC<GameProps> = ({ ageGroup, onScoreUpdate, onGameOver, highScore }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gridNumbers, setGridNumbers] = useState<number[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const gridSize = ageGroup === 'kid' ? 3 : ageGroup === 'teenager' ? 4 : 5;
  const maxNumber = gridSize * gridSize;

  const shuffleGrid = useCallback(() => {
    const nums: number[] = Array.from({ length: maxNumber }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    setGridNumbers(nums);
  }, [maxNumber]);

  const startGame = () => {
    shuffleGrid();
    setNextNumber(1);
    setSeconds(0);
    setGameOver(false);
    setIsPlaying(true);
    startTimeRef.current = performance.now();
    soundFx.playClick();
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setSeconds(Math.round(elapsed * 10) / 10);
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, gameOver]);

  const handleCellClick = (num: number) => {
    if (!isPlaying || gameOver) return;

    if (num === nextNumber) {
      soundFx.playScore();
      if (num === maxNumber) {
        // Completed whole grid!
        if (timerRef.current) clearInterval(timerRef.current);
        const finalSecs = (performance.now() - startTimeRef.current) / 1000;
        setSeconds(Math.round(finalSecs * 10) / 10);
        setIsPlaying(false);
        setGameOver(true);
        soundFx.playVictory();

        // Score: faster = higher
        const baseScore = maxNumber * 100;
        const timePenalty = Math.round(finalSecs * 15);
        const earned = Math.max(100, baseScore - timePenalty);
        onScoreUpdate(earned);
        onGameOver(earned);
      } else {
        setNextNumber(n => n + 1);
      }
    } else {
      // Wrong number clicked
      soundFx.playTone(200, 'sawtooth', 0.08, 0.08);
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Next Target: <strong className="text-amber-400 font-mono text-base tabular-nums">#{nextNumber}</strong></span>
          <span className="text-zinc-400">Progress: <strong className="text-emerald-400 font-mono text-base tabular-nums">{nextNumber - 1}/{maxNumber}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-bold uppercase text-[10px] border border-zinc-700">
            {ageGroup} ({gridSize}x{gridSize})
          </span>
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-amber-400 font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{seconds}s</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative w-full min-h-[350px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-5 flex flex-col items-center justify-center overflow-hidden">
        {!isPlaying && !gameOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-3 shadow-md">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Schulte Visual Focus Matrix</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
              Configured for <strong className="text-amber-400 uppercase">{ageGroup}</strong> (1 to {maxNumber}). Tap each number in ascending order from 1 to {maxNumber} as quickly as possible.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer text-xs"
            >
              Start Focus Scan
            </button>
          </div>
        )}

        {isPlaying && (
          <div
            className="grid gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-inner"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: gridSize === 5 ? '290px' : '260px',
              height: gridSize === 5 ? '290px' : '260px',
            }}
          >
            {gridNumbers.map((num) => {
              const isFound = num < nextNumber;
              return (
                <button
                  key={num}
                  onClick={() => handleCellClick(num)}
                  disabled={isFound}
                  className={`rounded-xl font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                    gridSize === 5 ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'
                  } ${
                    isFound
                      ? 'bg-zinc-900/40 text-zinc-700 border border-zinc-850 opacity-40'
                      : num === nextNumber
                      ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400/80 shadow-md'
                      : 'bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 active:scale-95'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <Award className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <div className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-1">Matrix Cleared!</div>
            <div className="text-4xl font-black text-white mb-1 font-mono">{seconds}s</div>
            <p className="text-xs text-zinc-400 mb-4">
              Found all {maxNumber} numbers with laser peripheral vision!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Scan Again</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-zinc-500 text-center font-medium">
        Level: {ageGroup.toUpperCase()} · Trains visual processing speed, peripheral vision & selective focus
      </div>
    </div>
  );
};
