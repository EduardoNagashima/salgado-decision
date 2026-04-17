import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps): JSX.Element {
  const baseStyles = 'font-mono font-semibold rounded transition-all duration-150 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 hover:border-green-500/70',
    secondary: 'bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30',
    ghost: 'bg-transparent border border-zinc-600/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}