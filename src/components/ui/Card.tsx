import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-zinc-900/60 border border-zinc-850 rounded-2xl p-6 transition-all duration-200 ${
        hoverable
          ? 'hover:border-zinc-700/80 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
