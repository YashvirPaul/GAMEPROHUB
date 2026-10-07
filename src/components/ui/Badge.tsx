import React from 'react';

export type BadgeVariant = 'neutral' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  neutral: 'text-zinc-400 bg-zinc-900 border-zinc-800',
  emerald: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
  cyan: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
  purple: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
  amber: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
  rose: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  icon,
  className = '',
}) => {
  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border tracking-tight shrink-0 select-none ${BADGE_VARIANTS[variant]} ${sizeStyle} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
