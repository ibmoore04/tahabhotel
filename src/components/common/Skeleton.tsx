// ==============================================================================
// TAHAB HOTEL & SUITES LTD — SKELETONS, EMPTY STATES & HEADINGS
// ==============================================================================

import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-stone-200 dark:bg-emerald-900/40 rounded-sm',
        className
      )}
    />
  );
};

export const RoomCardSkeleton: React.FC = () => {
  return (
    <div className="border border-stone-200 dark:border-stone-800 bg-white dark:bg-charcoal-900 overflow-hidden rounded-sm">
      <Skeleton className="w-full h-64" />
      <div className="p-6 space-y-4">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-3/4 h-7" />
        <Skeleton className="w-full h-12" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
          <Skeleton className="w-28 h-6" />
          <Skeleton className="w-24 h-9" />
        </div>
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="border-b border-stone-200 dark:border-stone-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-5 w-full" />
        </td>
      ))}
    </tr>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center border border-dashed border-stone-300 dark:border-stone-700 rounded-sm bg-warm-50/50 dark:bg-charcoal-900/50',
        className
      )}
    >
      {icon && (
        <div className="p-3 mb-4 rounded-full bg-gold-500/10 text-gold-600 dark:text-gold-400">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-lg font-bold text-emerald-950 dark:text-warm-100">
        {title}
      </h3>
      {description && (
        <p className="max-w-md text-sm text-stone-600 dark:text-stone-400 mt-1 mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

interface SectionHeadingProps {
  tagline?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  dark?: boolean;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  tagline,
  title,
  subtitle,
  align = 'center',
  dark = false,
  className,
}) => {
  const isCentered = align === 'center';

  return (
    <div
      className={cn(
        'mb-12 md:mb-16',
        isCentered ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-2xl',
        className
      )}
    >
      {tagline && (
        <span className="section-tagline">
          {tagline}
        </span>
      )}
      <h2
        className={cn(
          dark ? 'section-heading-dark' : 'section-heading',
          'font-serif'
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          'gold-divider',
          isCentered ? 'mx-auto' : 'mr-auto'
        )}
      />
      {subtitle && (
        <p
          className={cn(
            'text-base md:text-lg leading-relaxed mt-2',
            dark ? 'text-stone-300' : 'text-stone-600'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
