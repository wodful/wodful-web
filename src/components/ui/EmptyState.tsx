import type { ReactNode } from 'react';
import { Button } from './Button';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondary?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondary,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-surface border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-surface bg-white text-primary shadow-sm ring-1 ring-slate-200">
          {icon}
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="primary" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
      {secondary ? <div className="mt-3">{secondary}</div> : null}
    </div>
  );
}
