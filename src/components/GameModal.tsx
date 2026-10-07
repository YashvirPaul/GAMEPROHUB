import React, { useState, useEffect } from 'react';
import { GameInfo, AgeGroup } from '../types/game';
import { X, HelpCircle, Trophy, Volume2, VolumeX, Maximize2, Minimize2, ArrowRight } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { getHighScore, saveHighScore } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

// Productive game components
import { SpeedMathGame } from './productiveGames/SpeedMathGame';
import { EquationBalanceGame } from './productiveGames/EquationBalanceGame';
import { MemoryMatrixGame } from './productiveGames/MemoryMatrixGame';
import { WordPowerGame } from './productiveGames/WordPowerGame';
import { FocusTypistGame } from './productiveGames/FocusTypistGame';
import { NumberGridFocusGame } from './productiveGames/NumberGridFocusGame';
import { FractionPercentGame } from './productiveGames/FractionPercentGame';
import { LogicSequencesGame } from './productiveGames/LogicSequencesGame';
import { KnowledgeQuizGame } from './productiveGames/KnowledgeQuizGame';
import { TaskPrioritizerGame } from './productiveGames/TaskPrioritizerGame';
import { FinancialIqGame } from './productiveGames/FinancialIqGame';
import { SpeedReadingGame } from './productiveGames/SpeedReadingGame';

interface GameModalProps {
  game: GameInfo | null;
  onClose: () => void;
  onScoreSaved: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({ game, onClose, onScoreSaved }) => {
  const { recordGameSession } = useAuth();
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(soundFx.isMuted());

  useEffect(() => {
    if (game) {
      setHighScore(getHighScore(game.id));
      setShowInstructions(false);
      setSelectedAgeGroup(null);
      // Lock background scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [game]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!game) return null;

  const handleScoreUpdate = (currentScore: number) => {
    if (currentScore > highScore) {
      setHighScore(currentScore);
    }
  };

  const handleGameOver = (finalScore: number) => {
    const isRecord = saveHighScore(game.id, finalScore);
    if (isRecord) {
      setHighScore(finalScore);
      onScoreSaved();
    }
    recordGameSession(game.title, finalScore);
  };

  const handleSelectAgeGroup = (age: AgeGroup) => {
    soundFx.playClick();
    setSelectedAgeGroup(age);
  };

  const renderProductiveGame = () => {
    if (!selectedAgeGroup) return null;

    const props = {
      ageGroup: selectedAgeGroup,
      onScoreUpdate: handleScoreUpdate,
      onGameOver: handleGameOver,
      highScore: highScore,
    };

    switch (game.id) {
      case 'speed-math':
        return <SpeedMathGame {...props} />;
      case 'equation-balancer':
        return <EquationBalanceGame {...props} />;
      case 'memory-matrix':
        return <MemoryMatrixGame {...props} />;
      case 'word-power':
        return <WordPowerGame {...props} />;
      case 'focus-typist':
        return <FocusTypistGame {...props} />;
      case 'number-grid-focus':
        return <NumberGridFocusGame {...props} />;
      case 'fraction-percent':
        return <FractionPercentGame {...props} />;
      case 'logic-sequences':
        return <LogicSequencesGame {...props} />;
      case 'knowledge-quiz':
        return <KnowledgeQuizGame {...props} />;
      case 'task-prioritizer':
        return <TaskPrioritizerGame {...props} />;
      case 'financial-iq':
        return <FinancialIqGame {...props} />;
      case 'speed-reading':
        return <SpeedReadingGame {...props} />;
      default:
        return <div className="text-zinc-400 p-8 text-center text-sm">Loading module...</div>;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className={`bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full max-w-none rounded-none'
            : 'w-full max-w-4xl max-h-[90vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-zinc-850 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {game.title}
                </h2>
                <span className="text-zinc-600 hidden sm:inline">·</span>
                <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                  {game.category}
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls & Real-Time Toughness Switcher */}
          <div className="flex items-center gap-2">
            {/* Age Group Switcher in Header (when game is active) */}
            {selectedAgeGroup && (
              <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleSelectAgeGroup('kid')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedAgeGroup === 'kid'
                      ? 'bg-zinc-800 text-emerald-400 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Switch to Kid toughness"
                >
                  Kid
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAgeGroup('teenager')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedAgeGroup === 'teenager'
                      ? 'bg-zinc-800 text-cyan-400 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Switch to Teenager toughness"
                >
                  Teen
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAgeGroup('adult')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedAgeGroup === 'adult'
                      ? 'bg-zinc-800 text-purple-400 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Switch to Adult toughness"
                >
                  Adult
                </button>
              </div>
            )}

            {/* High Score Badge */}
            {highScore > 0 && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs font-mono tabular-nums text-amber-400 font-medium">
                <Trophy className="w-3.5 h-3.5" />
                <span>Best: {highScore}</span>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => {
                const muted = soundFx.toggleSound();
                setSoundMuted(!muted);
              }}
              type="button"
              aria-label={soundMuted ? 'Unmute game audio' : 'Mute game audio'}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Instructions Drawer */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              type="button"
              aria-label="Toggle instructions"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                showInstructions
                  ? 'bg-zinc-800 text-white border-zinc-700'
                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              type="button"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer hidden sm:block"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              aria-label="Close modal"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Info Drawer */}
        {showInstructions && (
          <div className="bg-zinc-900/95 border-b border-zinc-850 p-5 text-xs text-zinc-300 animate-in slide-in-from-top-2 duration-150">
            <div className="max-w-2xl mx-auto space-y-3">
              <h4 className="font-semibold text-white">How This Game Boosts Productivity</h4>
              <p className="text-zinc-400 leading-relaxed">{game.description}</p>
              <div className="pt-2">
                <span className="font-semibold text-zinc-300 block mb-1">Key Skills Trained:</span>
                <div className="flex flex-wrap gap-2 text-zinc-400">
                  {game.skillsTrained.map((s, i) => (
                    <span key={i} className="text-xs bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Main Stage */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 flex flex-col items-center justify-center min-h-[460px]">
          {!selectedAgeGroup ? (
            /* ========================================================= */
            /* MANDATORY TOUGHNESS SELECTION SCREEN (Kid / Teen / Adult) */
            /* ========================================================= */
            <div className="w-full max-w-2xl mx-auto text-center space-y-8 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <span>Step 1 of 2</span>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span>Toughness Calibration</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Choose Who Is Playing
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                  Question complexity, variables, and timers automatically calibrate to your selected tier.
                </p>
              </div>

              {/* 3 Tier Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {/* Kid */}
                <button
                  type="button"
                  onClick={() => handleSelectAgeGroup('kid')}
                  className="group p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/60 transition-all cursor-pointer flex flex-col justify-between text-left active:scale-[0.98]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl select-none">🧒</span>
                      <span className="text-[11px] font-semibold text-emerald-400">Foundation</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Kid Mode
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {game.difficultyInfo.kid}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <span>Select Tier</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Teenager */}
                <button
                  type="button"
                  onClick={() => handleSelectAgeGroup('teenager')}
                  className="group p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 transition-all cursor-pointer flex flex-col justify-between text-left active:scale-[0.98]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl select-none">🧑</span>
                      <span className="text-[11px] font-semibold text-cyan-400">Intermediate</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        Teenager Mode
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {game.difficultyInfo.teenager}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs font-semibold text-cyan-400">
                    <span>Select Tier</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* Adult */}
                <button
                  type="button"
                  onClick={() => handleSelectAgeGroup('adult')}
                  className="group p-5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-500/60 transition-all cursor-pointer flex flex-col justify-between text-left active:scale-[0.98]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl select-none">👨</span>
                      <span className="text-[11px] font-semibold text-purple-400">Mastery</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                        Adult Mode
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {game.difficultyInfo.adult}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs font-semibold text-purple-400">
                    <span>Select Tier</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                You can switch between tiers anytime using the in-game header controls.
              </p>
            </div>
          ) : (
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              {renderProductiveGame()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
