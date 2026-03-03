'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** A labeled row in a toolbar panel */
export function PanelRow({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4 rounded px-1 py-0.5 transition-colors hover:bg-zinc-900/50', className)}>
      <span className="text-[10px] text-zinc-500 shrink-0">{label}</span>
      <span className="text-xs text-zinc-300 text-right truncate">{children}</span>
    </div>
  );
}

/** Section divider within a panel */
export function PanelSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      {title && (
        <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-600 pt-2 pb-0.5">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/** A small badge/tag for panel content */
export function PanelBadge({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium transition-opacity',
        {
          default: 'bg-zinc-800 text-zinc-400',
          success: 'bg-emerald-950 text-emerald-400',
          warning: 'bg-amber-950 text-amber-400',
          danger: 'bg-red-950 text-red-400',
        }[variant]
      )}
    >
      {children}
    </span>
  );
}
