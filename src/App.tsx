import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryFilter } from './components/CategoryFilter';
import { GameCard } from './components/GameCard';
import { GameModal } from './components/GameModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { GAMES_LIST } from './data/gamesList';
import { GameInfo, GameCategory } from './types/game';
import { getRecentlyPlayed, recordGamePlayed } from './utils/storage';
import { soundFx } from './utils/audio';
import { Button } from './components/ui/Button';
import { Brain, Phone, ShieldCheck, Sparkles, MessageCircle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

function GameHubApp() {
  const { openAuthModal, user } = useAuth();
  const [activeGame, setActiveGame] = useState<GameInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('All');
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([]);
  const [soundMuted, setSoundMuted] = useState(soundFx.isMuted());
  const [scoreRefreshTrigger, setScoreRefreshTrigger] = useState(0);

  // Load recently played
  useEffect(() => {
    setRecentlyPlayedIds(getRecentlyPlayed());
  }, [scoreRefreshTrigger]);

  const handleLaunchGame = useCallback((game: GameInfo) => {
    recordGamePlayed(game.id);
    setActiveGame(game);
    setRecentlyPlayedIds(getRecentlyPlayed());
    soundFx.playClick();
  }, []);

  const handleQuickPlay = () => {
    const populars = GAMES_LIST.filter(g => g.popular);
    const chosen = populars[Math.floor(Math.random() * populars.length)] || GAMES_LIST[0];
    handleLaunchGame(chosen);
  };

  const handleRandomGame = () => {
    const random = GAMES_LIST[Math.floor(Math.random() * GAMES_LIST.length)];
    handleLaunchGame(random);
  };

  const handleToggleSound = () => {
    const newMuted = !soundFx.toggleSound();
    setSoundMuted(newMuted);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<GameCategory, number> = {
      All: GAMES_LIST.length,
      'Math & Logic': 0,
      Equations: 0,
      'Memory & Recall': 0,
      Vocabulary: 0,
      'Focus & Speed': 0,
      'Practical Life': 0,
    };
    GAMES_LIST.forEach(g => {
      if (counts[g.category] !== undefined) {
        counts[g.category] += 1;
      }
    });
    return counts;
  }, []);

  // Filtered games
  const filteredGames = useMemo(() => {
    let list = GAMES_LIST;

    if (selectedCategory !== 'All') {
      list = list.filter(g => g.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        g =>
          g.title.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.skillsTrained.some(s => s.toLowerCase().includes(q)) ||
          g.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  // Featured games
  const popularGames = useMemo(() => {
    return GAMES_LIST.filter(g => g.popular);
  }, []);

  // Recently played game objects
  const recentGames = useMemo(() => {
    return recentlyPlayedIds
      .map(id => GAMES_LIST.find(g => g.id === id))
      .filter((g): g is GameInfo => g !== undefined);
  }, [recentlyPlayedIds]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Executive Navbar */}
      <Navbar
        onQuickPlay={handleQuickPlay}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onPlayNow={handleQuickPlay}
          onRandomGame={handleRandomGame}
          onSelectCategory={cat => setSelectedCategory(cat)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-20">
          {/* Recent Training History */}
          {recentGames.length > 0 && !searchQuery && selectedCategory === 'All' && (
            <section id="recent" className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Recent Training History</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Resume where you left off and beat your previous personal record</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recentGames.slice(0, 4).map(game => (
                  <GameCard
                    key={`recent-${game.id}`}
                    game={game}
                    onPlay={handleLaunchGame}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Featured Skill Boosters */}
          {!searchQuery && selectedCategory === 'All' && (
            <section id="popular" className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Top Rated</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                    Featured Cognitive Boosters
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandomGame}
                >
                  Quick Random Skill
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {popularGames.slice(0, 8).map(game => (
                  <GameCard
                    key={`pop-${game.id}`}
                    game={game}
                    onPlay={handleLaunchGame}
                    isPopularSection
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Productive Games Library with Filter */}
          <section id="all-games" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-850 pb-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Curated Curriculum</span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                  {searchQuery ? `Search Results (${filteredGames.length})` : 'Productive Knowledge Library'}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Every game calibrates to Kid, Teenager, or Adult toughness before you begin.
                </p>
              </div>

              {/* Segmented Filter */}
              <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={cat => {
                  setSelectedCategory(cat);
                  setSearchQuery('');
                }}
                counts={categoryCounts}
              />
            </div>

            {/* Grid */}
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={handleLaunchGame}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-zinc-900/30 rounded-2xl border border-zinc-850 p-8">
                <Brain className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-zinc-300">No training modules found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-5">
                  No modules match "{searchQuery}". Try searching for arithmetic, equations, memory, or words.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  Reset Filter
                </Button>
              </div>
            )}
          </section>

          {/* Methodology / About Section */}
          <section id="about" className="rounded-2xl border border-zinc-850 bg-zinc-900/40 p-8 sm:p-12 space-y-8">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">The Science of Focus</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                Why Replace Scrolling With Active Cognitive Friction
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                Passive short-form content triggers rapid dopamine spikes followed by cognitive crashes and reduced working memory. GameHub delivers productive learning designed around three principles:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-850 border border-zinc-750 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  01
                </div>
                <h4 className="text-sm font-bold text-white">Active Recall & Calculation</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Solving mental math and balancing algebraic equations under time constraints forces neural circuits to insulate with myelin, permanently speeding up numerical fluency.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-850 border border-zinc-750 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  02
                </div>
                <h4 className="text-sm font-bold text-white">Calibrated Toughness</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every module dynamically adjusts difficulty to match kids, teenagers, and adults, maintaining optimal cognitive challenge without frustration or boredom.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-zinc-850 border border-zinc-750 flex items-center justify-center text-purple-400 font-bold text-sm">
                  03
                </div>
                <h4 className="text-sm font-bold text-white">Focus Stamina Training</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Schulte matrices and priority sort challenges rebuild attention spans eroded by notifications, giving you the stamina needed for deep work and pursuing your dreams.
                </p>
              </div>
            </div>
          </section>

          {/* Profile CTA Section */}
          <section className="rounded-2xl border border-zinc-850 bg-gradient-to-br from-zinc-900/60 to-zinc-950 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Telemetry · Private Learner Records</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Track Your Cognitive Progress Seamlessly
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Sign in to preserve your scores, unlock custom learner avatars, and track your high-score milestones across sessions safely.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2 p-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                  <span className="text-base">{user.avatar || '🧠'}</span>
                  <span>Active: <strong>{user.displayName}</strong></span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => openAuthModal('signup')}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Create Free Account
                </Button>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Footer & Developer Showcase */}
      <footer className="border-t border-zinc-850 bg-zinc-950/80 py-12 text-zinc-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          {/* Upper Nav Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-850 pb-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-sm">GameHub Pro</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="text-zinc-400">Make your life productive. Stop scrolling and just focus on your dreams.</span>
            </div>

            <div className="flex items-center gap-6 font-medium">
              <a href="#all-games" className="hover:text-white transition-colors">Games</a>
              <a href="#popular" className="hover:text-white transition-colors">Featured</a>
              <a href="#categories" className="hover:text-white transition-colors">Tracks</a>
              <a href="#about" className="hover:text-white transition-colors">Methodology</a>
            </div>
          </div>

          {/* Developer Showcase Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Custom Web Architecture & Engineering</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                The website is developed by YASHVIR PAUL
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300">
                If you want to make this kind of website, contact this number:{' '}
                <strong className="text-emerald-400 font-mono font-bold text-sm bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                  9394389413
                </strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href="tel:9394389413"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>Call: 9394389413</span>
              </a>

              <a
                href="https://wa.me/919394389413"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 text-xs font-semibold transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Message</span>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-400 text-[11px] pt-2">
            <span>© {new Date().getFullYear()} GameHub Pro · All rights reserved.</span>
            <span>Developed by YASHVIR PAUL · Contact: 9394389413</span>
          </div>
        </div>
      </footer>

      {/* Active Game Modal */}
      <GameModal
        game={activeGame}
        onClose={() => setActiveGame(null)}
        onScoreSaved={() => setScoreRefreshTrigger(t => t + 1)}
      />

      {/* Auth & Profile Modals */}
      <AuthModal />
      <ProfileModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameHubApp />
    </AuthProvider>
  );
}
