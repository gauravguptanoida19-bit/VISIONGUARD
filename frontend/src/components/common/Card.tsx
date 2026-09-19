import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'crimson' | 'emerald' | 'none';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = 'none', onClick }) => {
  const glowStyles = {
    cyan: 'border-cyan-500/30 shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)]',
    crimson: 'border-rose-500/30 shadow-[0_0_20px_-5px_rgba(244,63,94,0.15)]',
    emerald: 'border-emerald-500/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]',
    none: 'border-white/[0.07] hover:border-white/[0.12]',
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl bg-[#0B111E]/80 backdrop-blur-md border ${glowStyles[glow]} transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
