import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps): JSX.Element {
  const variants = {
    default: 'bg-zinc-700/50 text-zinc-300 border-zinc-600',
    success: 'bg-green-500/20 text-green-400 border-green-500/50',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    error: 'bg-red-500/20 text-red-400 border-red-500/50',
    info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}