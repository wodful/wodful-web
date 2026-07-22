import type { ReactNode } from 'react';

/** Lightweight tooltip via native title + accessible label. */
export function Tooltip({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex ${className}`} title={label} aria-label={label}>
      {children}
    </span>
  );
}
