import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-zinc-900 border rounded-xl text-xs text-white placeholder-zinc-500 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              icon ? 'pl-10 pr-3.5' : 'px-3.5'
            } py-2.5 ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-zinc-800 hover:border-zinc-700'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
        {!error && hint && <p className="text-[11px] text-zinc-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
