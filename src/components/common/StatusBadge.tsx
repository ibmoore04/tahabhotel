import React from 'react';
import { getStatusConfig } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border shadow-sm',
        config.bg,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'emerald' | 'stone';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  className,
}) => {
  const variants = {
    gold: 'bg-gold-500/10 text-gold-600 border-gold-500/30 dark:text-gold-400',
    emerald: 'bg-emerald-900/10 text-emerald-900 border-emerald-900/20 dark:bg-emerald-900/50 dark:text-emerald-300',
    stone: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase rounded-sm border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
