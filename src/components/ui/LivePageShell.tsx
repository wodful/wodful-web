import type { ReactNode } from 'react';

import { HelpArticleLink } from '@/components/help/HelpArticleLink';

type LivePageShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  helpArticleId?: string;
  children: ReactNode;
};

/** Shared chrome for Ao vivo pages (Cronograma, Resultados, Leaderboard). */
export function LivePageShell({
  title,
  description,
  actions,
  helpArticleId,
  children,
  className = '',
}: LivePageShellProps & { className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 ${className}`}>
      <header className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ao vivo</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {helpArticleId || actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {helpArticleId ? <HelpArticleLink articleId={helpArticleId} /> : null}
            {actions}
          </div>
        ) : null}
      </header>
      {children}
    </div>
  );
}
