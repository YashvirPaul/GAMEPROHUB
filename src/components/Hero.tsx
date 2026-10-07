import React from 'react';
import { Search, Play, Target, Sparkles, UserCheck, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GameCategory } from '../types/game';
import { Button } from './ui/Button';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onPlayNow: () => void;
  onRandomGame: () => void;
  onSelectCategory?: (category: GameCategory) => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  onPlayNow,
  onRandomGame,
  onSelectCategory,
}) => {
  const { user, openAuthModal } = useAuth();

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-zinc-850 bg-radial-[at_top_center] from-zinc-900/40 via-zinc-950 to-zinc-950">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

      {/* Subtle Depth Accents (No garish neons) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Quiet Editorial Kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-6 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-zinc-300">Cognitive Training Platform</span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span>Zero Time-Pass</span>
          <span aria-hidden="true" className="text-zinc-600">·</span>
          <span>100% Free</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 text-balance leading-[1.12]">
          Make your life productive.{' '}
          <span className="text-zinc-400 font-normal block sm:inline">
            Stop scrolling and just focus on your dreams.
          </span>
        </h1>

        {/* Subtitle / Philosophy */}
        <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Train your numerical intuition with mental arithmetic, balance algebra equations, expand rich vocabulary, and build laser attention. Calibrated with tailored toughness for kids, teenagers, and adults.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Button
            variant="primary"
            size="lg"
            onClick={onPlayNow}
            icon={<Play className="w-4 h-4 fill-current" />}
          >
            Start Daily Training
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={onRandomGame}
            icon={<Target className="w-4 h-4 text-zinc-400" />}
          >
            Random Skill Challenge
          </Button>

          {!user && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => openAuthModal('signup')}
              icon={<UserCheck className="w-4 h-4 text-zinc-400" />}
            >
              Create Free Profile
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto relative mb-12">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search productive skills (e.g. Mental Math, Equations, Memory, Words...)"
            className="w-full pl-11 pr-10 py-3 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-750 focus:border-emerald-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              type="button"
              aria-label="Clear search query"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Toughness Tracks Card Preview */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-zinc-850 bg-zinc-900/40 p-4 sm:p-5 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850/80 pb-3 mb-4">
            <span className="text-xs font-semibold text-zinc-300">
              Three Toughness Tiers Built Into Every Game:
            </span>
            <span className="text-[11px] text-zinc-400">
              Select who is playing when you launch a module
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🧒</span>
                <span className="text-xs font-bold text-white">Kid Mode</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Single-digit arithmetic, basic balance equations, visual patterns, and generous timers.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🧑</span>
                <span className="text-xs font-bold text-white">Teenager Mode</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Linear equations ($2x + 7 = 19$), percentage discounts, SAT vocabulary, and 10s timer.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">👨</span>
                <span className="text-xs font-bold text-white">Adult Mode</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-normal">
                Multi-step algebra, fast compounding math, GRE lexicon, and tight 6s timer limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
