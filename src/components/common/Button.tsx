// ==============================================================================
// TAHAB HOTEL & SUITES LTD — REUSABLE BUTTON COMPONENT
// Mobile-optimized with better touch targets
// ==============================================================================

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'emerald' | 'outline-gold' | 'outline-white' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'gold',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium tracking-wide uppercase transition-all duration-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[44px]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 gap-1.5 font-semibold',
    md: 'text-xs md:text-sm px-4 md:px-5 py-2.5 md:py-3 gap-2 font-semibold',
    lg: 'text-sm md:text-base px-5 md:px-7 py-3 md:py-3.5 gap-2.5 font-bold',
  };

  const variantStyles = {
    gold: 'bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-emerald-950 shadow-gold-sm hover:shadow-gold-md hover:brightness-105 active:scale-[0.98]',
    emerald:
      'bg-emerald-900 text-warm-50 border border-emerald-700/60 hover:bg-emerald-850 hover:border-gold-500/50 shadow-sm active:scale-[0.98]',
    'outline-gold':
      'bg-transparent text-gold-500 border border-gold-500/80 hover:bg-gold-500/10 hover:border-gold-500 active:scale-[0.98]',
    'outline-white':
      'bg-transparent text-warm-50 border border-warm-200/40 hover:bg-white/10 hover:border-white active:scale-[0.98]',
    ghost:
      'bg-transparent text-stone-600 hover:text-emerald-950 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-warm-50 dark:hover:bg-emerald-900/40',
    danger:
      'bg-rose-700 text-white hover:bg-rose-800 border border-rose-800 shadow-sm active:scale-[0.98]',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
