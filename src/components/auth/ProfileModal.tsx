import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Trophy, LogOut, Edit2, Check, Shield, Calendar, Brain } from 'lucide-react';
import { Button } from '../ui/Button';

const AVATAR_OPTIONS = ['🧠', '⚡', '🎯', '💡', '🚀', '👑', '🏆', '💎', '📚', '🔬'];

export const ProfileModal: React.FC = () => {
  const {
    user,
    profileModalOpen,
    closeProfileModal,
    logout,
    updateProfile,
  } = useAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (profileModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [profileModalOpen]);

  if (!profileModalOpen || !user) return null;

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      await updateProfile({ displayName: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  const handleSelectAvatar = async (av: string) => {
    await updateProfile({ avatar: av });
    setShowAvatarPicker(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-850 flex items-center justify-between">
          <div>
            <h2 id="profile-modal-title" className="text-base font-bold text-white tracking-tight">
              Learner Dashboard
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Personal cognitive records and account credentials
            </p>
          </div>

          <button
            onClick={closeProfileModal}
            type="button"
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* User Card */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl hover:border-zinc-700 transition-colors cursor-pointer"
                title="Click to change avatar icon"
              >
                {user.avatar || '🧠'}
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      placeholder={user.displayName}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white w-36 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="p-1 bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 cursor-pointer font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-white truncate">
                      {user.displayName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(user.displayName);
                        setIsEditingName(true);
                      }}
                      className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded cursor-pointer"
                      title="Edit display name"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>

              <div className="text-xs text-zinc-400 truncate mt-0.5">
                {user.email}
              </div>

              <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  <span>Member since {user.joinedDate}</span>
                </span>
                <span aria-hidden="true" className="text-zinc-600">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-400">
                  <Shield className="w-3 h-3" />
                  <span>Verified Safe</span>
                </span>
              </div>
            </div>
          </div>

          {/* Avatar Drawer */}
          {showAvatarPicker && (
            <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl animate-in fade-in duration-150">
              <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
                Choose your avatar symbol:
              </span>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map(av => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => handleSelectAvatar(av)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-sm transition-transform cursor-pointer"
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
              Cognitive Training Statistics
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 text-center">
                <Brain className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {user.gamesPlayedCount || 0}
                </div>
                <div className="text-[11px] text-zinc-400">Sessions</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 text-center">
                <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-base font-bold text-white font-mono tabular-nums">
                  {user.totalScore || 0}
                </div>
                <div className="text-[11px] text-zinc-400">Points</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 text-center">
                <div className="text-sm font-bold text-white truncate mt-1">
                  {user.favoriteGame || 'Speed Math'}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">Top Track</div>
              </div>
            </div>
          </div>

          {/* Action footer */}
          <div className="pt-2 border-t border-zinc-850 flex items-center justify-between">
            <Button
              variant="danger"
              size="sm"
              onClick={logout}
              icon={<LogOut className="w-3.5 h-3.5" />}
            >
              Log Out
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={closeProfileModal}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
