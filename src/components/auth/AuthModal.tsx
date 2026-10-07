import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    requestLoginOtp,
    verifyLoginOtp,
    requestSignupOtp,
    verifySignupOtp,
    resendOtp,
  } = useAuth();

  // Mode: 'credentials' -> 'otp'
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP state (6 discrete digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const [canResend, setCanResend] = useState(false);

  // Status indicators
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Refs for 6 digit inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isLogin = authModalMode === 'login';

  // Lock background scroll when open
  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset state on close
      setStep('credentials');
      setErrorMsg(null);
      setSuccessMsg(null);
      setOtpDigits(['', '', '', '', '', '']);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [authModalOpen]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && authModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  // Auto focus first OTP input when step changes to OTP
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // 1. Send OTP Request (Credentials Submission)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password.trim()) {
      setErrorMsg('Please provide both your email address and password.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      setErrorMsg('Please provide your name or learner handle.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      if (isLogin) {
        const res = await requestLoginOtp(cleanEmail, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to authenticate credentials.');
        } else {
          setStep('otp');
          setResendCooldown(30);
          setCanResend(false);
          setOtpDigits(['', '', '', '', '', '']);
          setSuccessMsg(`A 6-digit verification code has been sent to ${cleanEmail}`);
        }
      } else {
        const res = await requestSignupOtp(displayName, cleanEmail, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to initialize account creation.');
        } else {
          setStep('otp');
          setResendCooldown(30);
          setCanResend(false);
          setOtpDigits(['', '', '', '', '', '']);
          setSuccessMsg(`A 6-digit verification code has been sent to ${cleanEmail}`);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Handle OTP Digit Inputs with Auto-Advance
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal ? cleanVal.slice(-1) : '';
    setOtpDigits(newDigits);
    setErrorMsg(null);

    // Auto advance focus to next input
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && cleanVal) {
      triggerVerifyOtp(fullCode);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    setErrorMsg(null);

    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6) {
      triggerVerifyOtp(pasted);
    }
  };

  // 3. Verify OTP
  const triggerVerifyOtp = useCallback(
    async (codeToVerify?: string) => {
      const code = codeToVerify || otpDigits.join('');
      if (code.length < 6) {
        setErrorMsg('Please enter all 6 digits of your verification code.');
        return;
      }

      setSubmitting(true);
      setErrorMsg(null);

      try {
        if (isLogin) {
          const res = await verifyLoginOtp(email, code);
          if (!res.success) {
            setErrorMsg(res.error || 'Invalid verification code. Please check your email and try again.');
          } else {
            setSuccessMsg('Email verified successfully! Logging you in...');
          }
        } else {
          const res = await verifySignupOtp(displayName, email, password, code);
          if (!res.success) {
            setErrorMsg(res.error || 'Invalid verification code. Please check your email and try again.');
          } else {
            setSuccessMsg('Email verified! Your learner account has been activated.');
          }
        }
      } finally {
        setSubmitting(false);
      }
    },
    [isLogin, email, password, displayName, otpDigits, verifyLoginOtp, verifySignupOtp]
  );

  // 4. Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await resendOtp(email, authModalMode);
      if (res.success) {
        setResendCooldown(30);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMsg(`A fresh verification code has been dispatched to ${email}`);
        otpInputRefs.current[0]?.focus();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 5. One-Click Demo Account (initiates OTP flow and pre-fills demo digits)
  const handleQuickDemo = async () => {
    const demoEmail = 'learner.demo@gamehub.pro';
    const demoPass = 'focus2026';
    const demoName = 'Focus Learner';
    setEmail(demoEmail);
    setPassword(demoPass);
    setDisplayName(demoName);
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = isLogin
        ? await requestLoginOtp(demoEmail, demoPass)
        : await requestSignupOtp(demoName, demoEmail, demoPass);

      if (res.success && res.code) {
        setStep('otp');
        setResendCooldown(30);
        setCanResend(false);
        // Pre-fill digits for demo testing
        setOtpDigits(res.code.split(''));
        setSuccessMsg(`Demo verification code pre-filled for ${demoEmail}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!authModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 'otp' && (
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setErrorMsg(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Back to credentials"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold text-white tracking-tight">
                {step === 'credentials'
                  ? isLogin
                    ? 'Sign In to Your Account'
                    : 'Create Free Learner Account'
                  : isLogin
                  ? 'Two-Factor Email Verification'
                  : 'Verify Your Email Address'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {step === 'credentials'
                  ? isLogin
                    ? 'Access your private scores & cognitive records'
                    : 'Track cognitive fluency & build focus stamina'
                  : `Enter the 6-digit verification code sent to ${email}`}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            type="button"
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Tab Switcher (Visible in Step 1) */}
        {step === 'credentials' && (
          <div className="px-6 pt-3 flex border-b border-zinc-850 bg-zinc-950">
            <button
              type="button"
              onClick={() => {
                openAuthModal('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-3 text-xs font-semibold transition-all relative cursor-pointer ${
                isLogin ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign In
              {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => {
                openAuthModal('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-3 text-xs font-semibold transition-all relative cursor-pointer ${
                !isLogin ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Create Account
              {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
            </button>
          </div>
        )}

        {/* Notification Banners */}
        <div className="px-6 pt-4 space-y-2">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* STEP 1: CREDENTIALS INPUT FORM                           */}
        {/* ======================================================== */}
        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="p-6 pt-3 space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. MasterLearner"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-pwd" className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-pwd"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* OTP Notice Banner */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center gap-2.5 text-xs text-zinc-400">
              <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Email OTP required:</strong> A 6-digit one-time verification code will be sent to your email to confirm your identity.
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Remember this session</span>
              </label>

              <span className="text-zinc-500 text-[11px]">
                Safe & Encrypted
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={submitting}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {isLogin ? 'Continue to Email OTP' : 'Send Verification OTP'}
            </Button>

            {/* One-Click Test Demo Account */}
            <div className="pt-1">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={handleQuickDemo}
                disabled={submitting}
                icon={<Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
              >
                One-Click Demo Account (with OTP)
              </Button>
            </div>

            {/* Security Guarantee */}
            <div className="pt-2 border-t border-zinc-850 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Two-factor email protection · Zero telemetry</span>
            </div>
          </form>
        ) : (
          /* ======================================================== */
          /* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION SCREEN            */
          /* ======================================================== */
          <div className="p-6 pt-3 space-y-6 animate-in fade-in duration-200">
            {/* Clean, authentic email sent confirmation header */}
            <div className="text-center space-y-1.5 pt-2">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-2.5">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Check Your Email</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                We have sent a 6-digit verification code to <strong className="text-zinc-200 font-semibold">{email}</strong>. It will expire in 10 minutes.
              </p>
            </div>

            {/* 6 Digit Input Boxes */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-zinc-300 text-center">
                Enter 6-Digit Code
              </label>

              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleDigitKeyDown(idx, e)}
                    onPaste={handleDigitPaste}
                    aria-label={`Digit ${idx + 1}`}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all select-all"
                  />
                ))}
              </div>
            </div>

            {/* Verify CTA */}
            <Button
              type="button"
              variant="primary"
              size="md"
              fullWidth
              isLoading={submitting}
              onClick={() => triggerVerifyOtp()}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isLogin ? 'Verify Code & Sign In' : 'Verify Code & Activate Account'}
            </Button>

            {/* Resend & Cooldown */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>Didn't receive the email?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={submitting}
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              ) : (
                <span className="text-zinc-500 font-mono">
                  Resend in 0:{resendCooldown < 10 ? `0${resendCooldown}` : resendCooldown}
                </span>
              )}
            </div>

            {/* Change Email Option */}
            <div className="pt-2 border-t border-zinc-850 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setErrorMsg(null);
                }}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Wrong email address? <span className="text-emerald-400 font-semibold underline">Edit email or password</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
