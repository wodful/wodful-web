import { useEffect, useState } from 'react';
import { ExternalLink } from 'react-feather';
import { Link, useParams } from 'react-router-dom';

import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import useApp from '@/hooks/useApp';
import type { ChampionshipAnalyticsSummary } from '@/data/interfaces/analytics';
import { ChampionshipService } from '@/services/Championship';
import { EventShortcutGrid } from './components/EventShortcutGrid';

const axios = new AxiosAdapter();
const championshipService = new ChampionshipService(axios);

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function MiniKpi({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-surface border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

const EventHome = () => {
  const { id } = useParams();
  const { currentChampionship } = useApp();
  const [summary, setSummary] = useState<ChampionshipAnalyticsSummary | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    championshipService
      .getAnalytics(id)
      .then((analytics) => {
        if (!cancelled) setSummary(analytics.summary);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;

  const accessCode = currentChampionship?.accessCode;
  const publicUrl = accessCode
    ? `${import.meta.env.VITE_BASE_WODFUL_SITE}/event/${accessCode}`
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão geral</h1>
          <p className="mt-1 text-sm text-slate-500">
            Escolha uma área para gerenciar o campeonato.
          </p>
        </div>

        {publicUrl ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline hover:underline"
          >
            Ver página pública
            <ExternalLink size={14} aria-hidden />
          </a>
        ) : null}
      </header>

      {summary ? (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Resumo rápido</h2>
            <Link
              to={`/championships/${id}/analytics`}
              className="text-sm font-semibold text-primary no-underline hover:underline"
            >
              Ver métricas
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniKpi label="Atletas" value={String(summary.athletes)} />
            <MiniKpi
              label="Inscrições aprovadas"
              value={String(summary.subscriptionsApproved)}
            />
            <MiniKpi
              label="Recebido (MP)"
              value={formatCurrency(summary.revenuePaid)}
            />
          </div>
        </section>
      ) : null}

      <EventShortcutGrid championshipId={id} />
    </div>
  );
};

export default EventHome;
