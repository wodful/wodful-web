import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

type SetupPageShellProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
};

/** Shared chrome for Setup pages (Categorias, Provas, Tickets, Cupons). */
export function SetupPageShell({
  title,
  description,
  actionLabel,
  onAction,
  children,
}: SetupPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Setup</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actionLabel && onAction ? (
          <Button variant="primary" className="w-full shrink-0 sm:w-auto" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </header>
      {children}
    </div>
  );
}
