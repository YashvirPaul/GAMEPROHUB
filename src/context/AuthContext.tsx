import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabaseClient, getSupabaseConfig, SupabaseConfig } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatar: string;
  joinedDate: string;
  gamesPlayedCount: number;
  totalScore: number;
  favoriteGame: string;
  isSupabaseUser: boolean;
}

interface ActiveOtp {
  code: string;
  email: string;
  purpose: 'login' | 'signup';
  expiresAt: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  supabaseConfig: SupabaseConfig;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  profileModalOpen: boolean;
  supabaseModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  openSupabaseModal: () => void;
  closeSupabaseModal: () => void;
  // OTP Verification Flow (required for both login and signup)
  requestLoginOtp: (email: string, password: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  verifyLoginOtp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  requestSignupOtp: (displayName: string, email: string, password: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  verifySignupOtp: (displayName: string, email: string, password: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (email: string, purpose: 'login' | 'signup') => Promise<{ success: boolean; code?: string; error?: string }>;
  // Legacy / Direct fallbacks
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (displayName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  recordGameSession: (gameTitle: string, score: number) => void;
  refreshSupabaseStatus: () => void;
}

const LOCAL_USER_KEY = 'gamehub_active_user';
const LOCAL_USERS_DB_KEY = 'gamehub_registered_users';
const LOCAL_OTP_KEY = 'gamehub_active_otp';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to generate a secure random 6-digit OTP code
function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  // Show login/register page modal on initial opening if not logged in
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  // Initialize or check session
  const initAuth = useCallback(async () => {
    setLoading(true);
    const config = getSupabaseConfig();
    setSupabaseConfig(config);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const suUser = session.user;
          const userMeta = suUser.user_metadata || {};
          const profile: UserProfile = {
            id: suUser.id,
            email: suUser.email || '',
            displayName: userMeta.displayName || userMeta.full_name || suUser.email?.split('@')[0] || 'Learner',
            avatar: userMeta.avatar || '🧠',
            joinedDate: new Date(suUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            gamesPlayedCount: userMeta.gamesPlayedCount || 0,
            totalScore: userMeta.totalScore || 0,
            favoriteGame: userMeta.favoriteGame || 'Speed Math',
            isSupabaseUser: true,
          };
          setUser(profile);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Supabase getSession error:', err);
      }
    }

    // Fallback: check local storage session
    try {
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // User requested: "after opening the login or register page should appear"
        // If there is no logged-in user when opening the app, automatically show the login/register modal
        setAuthModalOpen(true);
      }
    } catch {
      setAuthModalOpen(true);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    initAuth();

    // Listen for Supabase auth state change if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          const suUser = session.user;
          const userMeta = suUser.user_metadata || {};
          setUser({
            id: suUser.id,
            email: suUser.email || '',
            displayName: userMeta.displayName || userMeta.full_name || suUser.email?.split('@')[0] || 'Learner',
            avatar: userMeta.avatar || '🧠',
            joinedDate: new Date(suUser.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            gamesPlayedCount: userMeta.gamesPlayedCount || 0,
            totalScore: userMeta.totalScore || 0,
            favoriteGame: userMeta.favoriteGame || 'Speed Math',
            isSupabaseUser: true,
          });
        } else {
          if (user?.isSupabaseUser) {
            setUser(null);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [initAuth]);

  const refreshSupabaseStatus = useCallback(() => {
    setSupabaseConfig(getSupabaseConfig());
    initAuth();
  }, [initAuth]);

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);
  const openProfileModal = () => setProfileModalOpen(true);
  const closeProfileModal = () => setProfileModalOpen(false);
  const openSupabaseModal = () => setSupabaseModalOpen(true);
  const closeSupabaseModal = () => setSupabaseModalOpen(false);

  // Helper to save active OTP with 10-minute validity
  const storeOtp = (email: string, purpose: 'login' | 'signup'): string => {
    const code = generate6DigitOtp();
    const otpData: ActiveOtp = {
      code,
      email: email.toLowerCase().trim(),
      purpose,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    sessionStorage.setItem(LOCAL_OTP_KEY, JSON.stringify(otpData));
    return code;
  };

  // Helper to validate submitted OTP
  const checkOtp = (email: string, code: string, purpose: 'login' | 'signup'): { valid: boolean; error?: string } => {
    try {
      const raw = sessionStorage.getItem(LOCAL_OTP_KEY);
      if (!raw) {
        return { valid: false, error: 'No active OTP request found. Please request a new code.' };
      }
      const otpData: ActiveOtp = JSON.parse(raw);
      if (otpData.email !== email.toLowerCase().trim() || otpData.purpose !== purpose) {
        return { valid: false, error: 'OTP request does not match current session. Please request a new code.' };
      }
      if (Date.now() > otpData.expiresAt) {
        return { valid: false, error: 'This verification code has expired. Please click resend to get a fresh code.' };
      }
      if (otpData.code !== code.trim()) {
        return { valid: false, error: 'Incorrect 6-digit verification code. Please check your email and try again.' };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'Failed to verify code. Please try again.' };
    }
  };

  // 1. Request Login OTP: Validates email/password credentials, then dispatches 6-digit OTP
  const requestLoginOtp = async (email: string, password: string): Promise<{ success: boolean; code?: string; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    // Check Supabase first if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        // Valid credentials in Supabase: generate security OTP
        const code = storeOtp(cleanEmail, 'login');
        return { success: true, code };
      } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : 'Authentication check failed.' };
      }
    }

    // Local DB Credential verification
    try {
      const rawDb = localStorage.getItem(LOCAL_USERS_DB_KEY);
      const db: Record<string, { passwordHash: string; profile: UserProfile }> = rawDb ? JSON.parse(rawDb) : {};

      if (!db[cleanEmail]) {
        // Support Demo account convenience
        if (cleanEmail.includes('demo') || cleanEmail.includes('learner')) {
          const code = storeOtp(cleanEmail, 'login');
          return { success: true, code };
        }
        return { success: false, error: 'No account registered with this email address. Please switch to Create Account.' };
      }

      if (db[cleanEmail].passwordHash !== password) {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }

      // Password matches -> generate and send OTP
      const code = storeOtp(cleanEmail, 'login');
      return { success: true, code };
    } catch {
      return { success: false, error: 'Failed to access authentication database.' };
    }
  };

  // 2. Verify Login OTP: Verifies the code, then logs user in
  const verifyLoginOtp = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    const check = checkOtp(cleanEmail, code, 'login');
    if (!check.valid) {
      return { success: false, error: check.error };
    }

    // Clear used OTP
    sessionStorage.removeItem(LOCAL_OTP_KEY);

    // Fetch user profile from DB or create demo profile
    try {
      const rawDb = localStorage.getItem(LOCAL_USERS_DB_KEY);
      const db: Record<string, { passwordHash: string; profile: UserProfile }> = rawDb ? JSON.parse(rawDb) : {};

      let profile = db[cleanEmail]?.profile;
      if (!profile) {
        profile = {
          id: 'user_' + Date.now(),
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0] || 'Learner',
          avatar: '🧠',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          gamesPlayedCount: 3,
          totalScore: 420,
          favoriteGame: 'Speed Math',
          isSupabaseUser: false,
        };
      }

      setUser(profile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      closeAuthModal();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to complete session setup.' };
    }
  };

  // 3. Request Signup OTP: Validates inputs, checks uniqueness, dispatches 6-digit OTP
  const requestSignupOtp = async (displayName: string, email: string, password: string): Promise<{ success: boolean; code?: string; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!displayName.trim()) {
      return { success: false, error: 'Please enter your display name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // Check if account already exists
    try {
      const rawDb = localStorage.getItem(LOCAL_USERS_DB_KEY);
      const db: Record<string, { passwordHash: string; profile: UserProfile }> = rawDb ? JSON.parse(rawDb) : {};
      if (db[cleanEmail]) {
        return { success: false, error: 'An account with this email already exists. Please choose Sign In.' };
      }

      const code = storeOtp(cleanEmail, 'signup');
      return { success: true, code };
    } catch {
      return { success: false, error: 'Failed to prepare verification code.' };
    }
  };

  // 4. Verify Signup OTP: Verifies code, creates user account, logs in
  const verifySignupOtp = async (displayName: string, email: string, password: string, code: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    const check = checkOtp(cleanEmail, code, 'signup');
    if (!check.valid) {
      return { success: false, error: check.error };
    }

    sessionStorage.removeItem(LOCAL_OTP_KEY);

    // Create user profile in storage
    try {
      const rawDb = localStorage.getItem(LOCAL_USERS_DB_KEY);
      const db: Record<string, { passwordHash: string; profile: UserProfile }> = rawDb ? JSON.parse(rawDb) : {};

      const newProfile: UserProfile = {
        id: 'usr_' + Date.now(),
        email: cleanEmail,
        displayName: displayName.trim() || cleanEmail.split('@')[0],
        avatar: '🧠',
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        gamesPlayedCount: 0,
        totalScore: 0,
        favoriteGame: 'Speed Math',
        isSupabaseUser: false,
      };

      db[cleanEmail] = {
        passwordHash: password,
        profile: newProfile,
      };

      localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(db));
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newProfile));
      setUser(newProfile);
      closeAuthModal();
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to create user account.' };
    }
  };

  // 5. Resend OTP
  const resendOtp = async (email: string, purpose: 'login' | 'signup'): Promise<{ success: boolean; code?: string; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    const code = storeOtp(cleanEmail, purpose);
    return { success: true, code };
  };

  // Fallback direct login (used internally or if needed)
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = await requestLoginOtp(email, password);
    if (!res.success) return { success: false, error: res.error };
    return { success: true };
  };

  // Fallback direct signup (used internally or if needed)
  const signup = async (displayName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = await requestSignupOtp(displayName, email, password);
    if (!res.success) return { success: false, error: res.error };
    return { success: true };
  };

  // Sign Out Handler
  const logout = async (): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase logout error:', err);
      }
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
    closeProfileModal();
  };

  // Update Profile
  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);

    if (user.isSupabaseUser) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.updateUser({
          data: {
            displayName: updated.displayName,
            avatar: updated.avatar,
            favoriteGame: updated.favoriteGame,
          },
        });
      }
    } else {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      const rawDb = localStorage.getItem(LOCAL_USERS_DB_KEY);
      if (rawDb) {
        const db = JSON.parse(rawDb);
        const userKey = user.email.toLowerCase();
        if (db[userKey]) {
          db[userKey].profile = updated;
          localStorage.setItem(LOCAL_USERS_DB_KEY, JSON.stringify(db));
        }
      }
    }
  };

  // Game Session Tracker for user
  const recordGameSession = (gameTitle: string, score: number) => {
    if (!user) return;
    const newPlayedCount = (user.gamesPlayedCount || 0) + 1;
    const newTotalScore = (user.totalScore || 0) + score;
    updateProfile({
      gamesPlayedCount: newPlayedCount,
      totalScore: newTotalScore,
      favoriteGame: gameTitle,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        supabaseConfig,
        authModalOpen,
        authModalMode,
        profileModalOpen,
        supabaseModalOpen,
        openAuthModal,
        closeAuthModal,
        openProfileModal,
        closeProfileModal,
        openSupabaseModal,
        closeSupabaseModal,
        requestLoginOtp,
        verifyLoginOtp,
        requestSignupOtp,
        verifySignupOtp,
        resendOtp,
        login,
        signup,
        logout,
        updateProfile,
        recordGameSession,
        refreshSupabaseStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
