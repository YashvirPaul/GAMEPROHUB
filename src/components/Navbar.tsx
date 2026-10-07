import React, { useState } from 'react';
import { Brain, Volume2, VolumeX, LogIn, Sparkles, Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

interface NavbarProps {
  onQuickPlay: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onQuickPlay, soundMuted, onToggleSound }) => {
  const { user, openAuthModal, openProfileModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-850/80 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark / Brand */}
        <a href="#" className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
            <Brain className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold tracking-tight text-white">
              GameHub
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase">
              Pro
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-zinc-400">
          <a
            href="#all-games"
            className="hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:text-white"
          >
            Productive Games
          </a>
          <a
            href="#categories"
            className="hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:text-white"
          >
            Skill Tracks
          </a>
          <a
            href="#popular"
            className="hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:text-white"
          >
            Featured
          </a>
          <a
            href="#about"
            className="hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:text-white"
          >
            Methodology
          </a>
        </nav>

        {/* Zone 3: User Controls & CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={onToggleSound}
            type="button"
            aria-label={soundMuted ? 'Unmute game audio effects' : 'Mute game audio effects'}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Profile or Sign-in */}
          {user ? (
            <button
              onClick={openProfileModal}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span className="text-base select-none">{user.avatar || '🧠'}</span>
              <span className="font-semibold text-zinc-200 max-w-[110px] truncate hidden sm:inline">
                {user.displayName}
              </span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Primary Quick Start CTA */}
          <Button
            variant="primary"
            size="sm"
            onClick={onQuickPlay}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            <span>Train Now</span>
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle mobile navigation menu"
            className="p-2 rounded-xl text-zinc-400 hover:text-white md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-850 bg-zinc-950 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1 text-sm font-medium text-zinc-300">
            <a
              href="#all-games"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-zinc-900 hover:text-white"
            >
              Productive Games
            </a>
            <a
              href="#categories"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-zinc-900 hover:text-white"
            >
              Skill Tracks
            </a>
            <a
              href="#popular"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-zinc-900 hover:text-white"
            >
              Featured
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-zinc-900 hover:text-white"
            >
              Methodology
            </a>
          </nav>

          {!user && (
            <div className="pt-2 border-t border-zinc-850">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                icon={<LogIn className="w-4 h-4" />}
              >
                Sign In to Account
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
