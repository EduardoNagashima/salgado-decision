import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps): JSX.Element {
  return (
    <div className={`bg-zinc-900/80 border border-zinc-700/50 rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps): JSX.Element {
  return (
    <div className={`px-4 py-3 border-b border-zinc-700/50 bg-zinc-900/95 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }): JSX.Element {
  return (
    <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
      {children}
    </span>
  );
}

export function CardBody({ children, className = '' }: CardProps): JSX.Element {
  return <div className={`p-4 ${className}`}>{children}</div>;
}