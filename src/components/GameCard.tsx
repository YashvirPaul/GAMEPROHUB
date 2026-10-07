import React from 'react';
import { GameInfo } from '../types/game';
import { Play, Star, Trophy, ArrowRight } from 'lucide-react';
import { getHighScore } from '../utils/storage';

interface GameCardProps {
  game: GameInfo;
  onPlay: (game: GameInfo) => void;
  isPopularSection?: boolean;
}

const GAME_SYMBOLS: Record<string, string> = {
  'speed-math': '∑',
  'equation-balancer': 'x',
  'memory-matrix': '◫',
  'word-power': 'Aa',
  'focus-typist': '⌨',
  'number-grid-focus': '1-9',
  'fraction-percent': '%',
  'logic-sequences': '→',
  'knowledge-quiz': '⌬',
  'task-prioritizer': '⚡',
  'financial-iq': '$',
  'speed-reading': '¶',
};

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const symbol = GAME_SYMBOLS[game.id] || '✦';
  const highScore = getHighScore(game.id);

  return (
    <div
      onClick={() => onPlay(game)}
      className="group relative bg-zinc-900/50 hover:bg-zinc-900/90 border border-zinc-850 hover:border-zinc-750 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5"
    >
      {/* Top Visual Area */}
      <div className="h-32 w-full bg-zinc-950/70 border-b border-zinc-850/80 relative flex items-center justify-center overflow-hidden">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        {/* Minimalist Graphic Symbol */}
        <div className="relative w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-mono font-bold text-xl group-hover:scale-105 group-hover:border-zinc-700 transition-all duration-200">
          {symbol}
        </div>

        {/* High score badge (if recorded) */}
        {highScore > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono tabular-nums text-amber-400">
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>{highScore}</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <span className="font-medium text-zinc-300">{game.category}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 text-zinc-300 font-medium">
              <Star className="w-3 h-3 text-amber-400 fill-current" />
              <span className="font-mono tabular-nums">{game.rating}</span>
            </span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-zinc-400 font-mono tabular-nums">{game.usersTrained}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors duration-150 mb-1.5 line-clamp-1">
            {game.title}
          </h3>

          {/* Tagline / Description */}
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 font-normal">
            {game.description}
          </p>
        </div>

        {/* Card Footer: Toughness Badges & Action */}
        <div className="pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
          {/* Unboxed Toughness Indicators */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
            <span className="hover:text-zinc-200">Kid</span>
            <span className="text-zinc-600">/</span>
            <span className="hover:text-zinc-200">Teen</span>
            <span className="text-zinc-600">/</span>
            <span className="hover:text-zinc-200">Adult</span>
          </div>

          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onPlay(game);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer group-hover:bg-emerald-500 group-hover:text-zinc-950"
          >
            <span>Train</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
