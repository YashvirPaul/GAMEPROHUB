import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Brain, Sparkles, Award } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { AgeGroup } from '../../types/game';

interface GameProps {
  ageGroup: AgeGroup;
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  highScore: number;
}

export const MemoryMatrixGame: React.FC<GameProps> = ({ ageGroup, onScoreUpdate, onGameOver, highScore }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const scoreRef = useRef(0);

  const gridSize = ageGroup === 'kid' ? 3 : ageGroup === 'teenager' ? 4 : 5;
  const totalCells = gridSize * gridSize;

  const getInitialSeqLength = useCallback(() => {
    if (ageGroup === 'kid') return 3;
    if (ageGroup === 'teenager') return 4;
    return 5;
  }, [ageGroup]);

  const getFlashSpeed = useCallback(() => {
    if (ageGroup === 'kid') return 600;
    if (ageGroup === 'teenager') return 450;
    return 340;
  }, [ageGroup]);

  const playSequence = useCallback((seq: number[]) => {
    setIsShowingSequence(true);
    setPlayerInput([]);
    const speed = getFlashSpeed();

    seq.forEach((cellIdx, i) => {
      setTimeout(() => {
        setActiveCell(cellIdx);
        soundFx.playTone(350 + (cellIdx % 8) * 60, 'sine', 0.12, 0.15);
        setTimeout(() => {
          setActiveCell(null);
          if (i === seq.length - 1) {
            setIsShowingSequence(false);
          }
        }, speed * 0.75);
      }, (i + 1) * speed);
    });
  }, [getFlashSpeed]);

  const startNextRound = useCallback((currentRound: number) => {
    const seqLength = getInitialSeqLength() + Math.floor((currentRound - 1) / 2);
    const newSeq: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      newSeq.push(Math.floor(Math.random() * totalCells));
    }
    setSequence(newSeq);
    playSequence(newSeq);
  }, [getInitialSeqLength, playSequence, totalCells]);

  const startGame = () => {
    setScore(0);
    setRound(1);
    scoreRef.current = 0;
    setGameOver(false);
    setIsPlaying(true);
    onScoreUpdate(0);
    soundFx.playClick();
    startNextRound(1);
  };

  const handleCellClick = (idx: number) => {
    if (!isPlaying || isShowingSequence || gameOver) return;

    soundFx.playTone(350 + (idx % 8) * 60, 'triangle', 0.08, 0.1);
    setActiveCell(idx);
    setTimeout(() => setActiveCell(null), 180);

    const nextInput = [...playerInput, idx];
    setPlayerInput(nextInput);

    const stepIndex = nextInput.length - 1;

    // Check if correct so far
    if (sequence[stepIndex] !== idx) {
      // Mistake!
      soundFx.playGameOver();
      setGameOver(true);
      setIsPlaying(false);
      onGameOver(scoreRef.current);
      return;
    }

    // Finished whole sequence correctly!
    if (nextInput.length === sequence.length) {
      soundFx.playVictory();
      const pointsEarned = sequence.length * 50 + (ageGroup === 'adult' ? 100 : ageGroup === 'teenager' ? 60 : 30);
      scoreRef.current += pointsEarned;
      setScore(scoreRef.current);
      onScoreUpdate(scoreRef.current);

      const nextRoundNum = round + 1;
      setRound(nextRoundNum);

      setTimeout(() => {
        startNextRound(nextRoundNum);
      }, 700);
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-sm mx-auto">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Score <strong className="text-purple-400 font-mono text-base tabular-nums">{score}</strong></span>
          <span className="text-zinc-400">Round <strong className="text-emerald-400 font-mono text-base tabular-nums">{round}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-bold uppercase text-[10px] border border-zinc-700">
            {ageGroup} ({gridSize}x{gridSize})
          </span>
        </div>
      </div>

      {/* Main Board Container */}
      <div className="relative w-full min-h-[340px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-5 flex flex-col items-center justify-center overflow-hidden">
        {!isPlaying && !gameOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-3 shadow-md">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Working Memory Matrix</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
              Configured for <strong className="text-purple-400 uppercase">{ageGroup}</strong> ({gridSize}x{gridSize} grid). Memorize the sequence of flashing tiles, then tap them in order!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer text-xs"
            >
              Start Recall
            </button>
          </div>
        )}

        {isPlaying && (
          <>
            {/* Status ticker */}
            <div className="mb-3 text-xs font-bold text-center">
              {isShowingSequence ? (
                <span className="text-amber-400 animate-pulse">👀 Watch and Memorize Sequence...</span>
              ) : (
                <span className="text-emerald-400">
                  🎯 Repeat Pattern ({playerInput.length}/{sequence.length})
                </span>
              )}
            </div>

            {/* Matrix Grid */}
            <div
              className="grid gap-2 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: gridSize === 5 ? '280px' : '260px',
                height: gridSize === 5 ? '280px' : '260px',
              }}
            >
              {Array.from({ length: totalCells }).map((_, idx) => {
                const isActive = activeCell === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(idx)}
                    disabled={isShowingSequence}
                    className={`rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-500 shadow-lg shadow-purple-500/50 scale-105 border-2 border-white'
                        : 'bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 active:scale-95'
                    }`}
                  />
                );
              })}
            </div>
          </>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <Award className="w-12 h-12 text-purple-400 mb-2 animate-bounce" />
            <div className="text-xs text-rose-400 uppercase tracking-widest font-bold mb-1">Memory Limit Reached</div>
            <div className="text-4xl font-black text-white mb-1 font-mono">{score}</div>
            <p className="text-xs text-zinc-400 mb-4">
              Reached <strong className="text-white">Round {round}</strong> ({sequence.length} steps span)!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Train Again</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-[11px] text-zinc-500 text-center font-medium">
        Level: {ageGroup.toUpperCase()} · Trains working memory span, spatial encoding, and neuro-cognitive retention
      </div>
    </div>
  );
};
