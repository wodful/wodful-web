import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart2, HelpCircle } from 'react-feather';

import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { Loader } from '@/components/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tooltip } from '@/components/ui/Tooltip';
import type {
  ChampionshipAnalytics,
  ChampionshipAnalyticsTicketFill,
} from '@/data/interfaces/analytics';
import { ChampionshipService } from '@/services/Championship';

const axios = new AxiosAdapter();
const championshipService = new ChampionshipService(axios);

const REVENUE_HELP =
  'Recebido: pagamentos confirmados no Mercado Pago. Por fora: inscritos aprovados manualmente (PIX/pagamento externo ou link regenerado), com valor estimado pelo preço do ticket menos cupom.';

const OUTSIDE_HELP =
  'Inscrições aprovadas sem pagamento PAID no Mercado Pago — inclusão manual, PIX fora da plataforma ou novo link após vencimento.';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDay(date: string) {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

function ticketPct(ticket: ChampionshipAnalyticsTicketFill) {
  if (ticket.quantity <= 0) return 0;
  return Math.min(100, Math.round((ticket.sold / ticket.quantity) * 100));
}

function KpiCard({
  label,
  value,
  hint,
  accent,
  labelExtra,
  className = '',
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  labelExtra?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'rounded-surface border p-4 shadow-sm',
        accent
          ? 'border-primary/25 bg-primary/[0.04]'
          : 'border-slate-200 bg-white',
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-1.5">
        <p
          className={[
            'text-xs font-semibold uppercase tracking-wide',
            accent ? 'text-primary' : 'text-slate-500',
          ].join(' ')}
        >
          {label}
        </p>
        {labelExtra}
      </div>
      <p
        className={[
          'mt-2 font-bold tracking-tight text-slate-900',
          accent ? 'text-3xl' : 'text-2xl',
        ].join(' ')}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  empty,
  className = '',
}: {
  title: string;
  description?: string;
  children: ReactNode;
  empty?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`rounded-surface border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </header>
      {empty ? (
        <p className="py-8 text-center text-sm text-slate-500">Sem dados ainda.</p>
      ) : (
        children
      )}
    </section>
  );
}

function TicketFillList({ tickets }: { tickets: ChampionshipAnalyticsTicketFill[] }) {
  const [showEmpty, setShowEmpty] = useState(false);

  const { withSales, withoutSales } = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => {
      const pctDiff = ticketPct(b) - ticketPct(a);
      if (pctDiff !== 0) return pctDiff;
      if (b.sold !== a.sold) return b.sold - a.sold;
      return a.name.localeCompare(b.name);
    });
    return {
      withSales: sorted.filter((t) => t.sold > 0),
      withoutSales: sorted.filter((t) => t.sold === 0),
    };
  }, [tickets]);

  const visible = showEmpty ? [...withSales, ...withoutSales] : withSales;

  if (tickets.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">Sem dados ainda.</p>;
  }

  return (
    <div className="space-y-3">
      {visible.length === 0 && !showEmpty ? (
        <p className="py-4 text-center text-sm text-slate-500">Nenhum ticket com vendas ainda.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((ticket) => {
            const pct = ticketPct(ticket);
            const soldOut = ticket.quantity > 0 && ticket.sold >= ticket.quantity;
            return (
              <li key={ticket.ticketId}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {ticket.name}
                      {soldOut ? (
                        <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                          Esgotado
                        </span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-slate-500">{ticket.categoryName}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-slate-600">
                    {ticket.sold}/{ticket.quantity} ({pct}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${soldOut ? 'bg-amber-500' : 'bg-primary'
                      }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {withoutSales.length > 0 ? (
        <button
          type="button"
          onClick={() => setShowEmpty((open) => !open)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {showEmpty
            ? 'Ocultar tickets sem vendas'
            : `Ver ${withoutSales.length} ticket${withoutSales.length === 1 ? '' : 's'} sem vendas`}
        </button>
      ) : null}
    </div>
  );
}

const Analytics = () => {
  const { id } = useParams();
  const [data, setData] = useState<ChampionshipAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    championshipService
      .getAnalytics(id)
      .then((analytics) => {
        if (!cancelled) setData(analytics);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const timeline = useMemo(
    () =>
      (data?.registrationsOverTime ?? []).map((point) => ({
        ...point,
        label: formatDay(point.date),
      })),
    [data],
  );

  const categoryChart = useMemo(
    () =>
      (data?.byCategory ?? []).filter(
        (item) => item.athletes > 0 || item.subscriptions > 0,
      ),
    [data],
  );

  const boxChart = useMemo(() => data?.byBox ?? [], [data]);
  const cityChart = useMemo(() => data?.byCity ?? [], [data]);
  const shirtChart = useMemo(() => data?.byShirtSize ?? [], [data]);
  const couponRows = useMemo(() => data?.byCoupon ?? [], [data]);
  const ticketFill = useMemo(() => data?.ticketFill ?? [], [data]);

  const kitPct =
    data && data.summary.athletes > 0
      ? Math.round((data.summary.kitsTaken / data.summary.athletes) * 100)
      : 0;
  const medalPct =
    data && data.summary.athletes > 0
      ? Math.round((data.summary.medalsTaken / data.summary.athletes) * 100)
      : 0;

  if (!id) return null;

  if (loading) {
    return <Loader title="Carregando métricas..." />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <EmptyState
          title="Não foi possível carregar as métricas"
          description="Tente novamente em alguns instantes."
        />
      </div>
    );
  }

  const { summary } = data;
  const hasAnyActivity =
    summary.athletes > 0 ||
    summary.subscriptionsApproved +
    summary.subscriptionsWaiting +
    summary.subscriptionsDeclined >
    0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-5 sm:mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Evento</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Métricas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão consolidada de inscritos, tickets, arrecadação e cupons.
        </p>
      </header>

      {!hasAnyActivity ? (
        <EmptyState
          icon={<BarChart2 size={22} aria-hidden />}
          title="Ainda não há movimento"
          description="Quando as inscrições começarem, os números e gráficos aparecem aqui."
        />
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              accent
              label="Recebido (Mercado Pago)"
              value={formatCurrency(summary.revenuePaid)}
              hint={`Total aproximado ${formatCurrency(summary.revenueApproximate)}`}
              labelExtra={
                <Tooltip label={REVENUE_HELP}>
                  <HelpCircle size={14} className="text-primary/70" aria-hidden />
                </Tooltip>
              }
            />
            <KpiCard
              label="Por fora"
              value={String(summary.subscriptionsOutside)}
              hint={`${formatCurrency(summary.revenueEstimated)} estimados · ${summary.subscriptionsOnline} via MP`}
              labelExtra={
                <Tooltip label={OUTSIDE_HELP}>
                  <HelpCircle size={14} className="text-slate-400" aria-hidden />
                </Tooltip>
              }
            />
            <KpiCard
              label="Atletas"
              value={String(summary.athletes)}
              hint="Total de atletas cadastrados"
            />
            <KpiCard
              label="Inscrições aprovadas"
              value={String(summary.subscriptionsApproved)}
              hint={`${summary.subscriptionsWaiting} aguardando · ${summary.subscriptionsDeclined} recusados`}
            />
            <KpiCard
              label="Tickets vendidos"
              value={`${summary.ticketsSold}/${summary.ticketsCapacity || '—'}`}
              hint="Aprovados com ticket / capacidade"
            />
            <KpiCard
              label="Cupons"
              value={String(summary.couponsRedeemed)}
              hint={`${formatCurrency(summary.discountTotal)} em descontos`}
            />
            <KpiCard
              label="Kits retirados"
              value={`${summary.kitsTaken}/${summary.athletes}`}
              hint={`${kitPct}% dos atletas`}
            />
            <KpiCard
              label="Medalhas retiradas"
              value={`${summary.medalsTaken}/${summary.athletes}`}
              hint={`${medalPct}% dos atletas`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Atletas por categoria"
              description="Participantes vinculados a cada divisão."
              empty={categoryChart.length === 0}
            >
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={48}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                    <RechartsTooltip />
                    <Bar dataKey="athletes" name="Atletas" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Inscritos por box"
              description="Box informado pelo atleta (top 10)."
              empty={boxChart.length === 0}
            >
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={boxChart}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="affiliation"
                      width={110}
                      tick={{ fontSize: 11 }}
                    />
                    <RechartsTooltip />
                    <Bar dataKey="athletes" name="Atletas" fill="#0D9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Cupons"
              description="Resgates e valor descontado."
              empty={couponRows.length === 0}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-2 py-2 font-semibold">Código</th>
                      <th className="px-2 py-2 font-semibold">Usos</th>
                      <th className="px-2 py-2 font-semibold">Desconto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {couponRows.map((row) => (
                      <tr key={row.couponId}>
                        <td className="px-2 py-2.5 font-medium text-slate-900">{row.code}</td>
                        <td className="px-2 py-2.5 text-slate-700">{row.redemptions}</td>
                        <td className="px-2 py-2.5 text-slate-700">
                          {formatCurrency(row.discountTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>

            <ChartCard
              title="Ocupação por ticket"
              description="Prioriza tickets com vendas; esgotados em destaque."
            >
              <TicketFillList tickets={ticketFill} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Camisetas"
              description="Mix de tamanhos informados no cadastro."
              empty={shirtChart.length === 0}
            >
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shirtChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="size" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                    <RechartsTooltip />
                    <Bar dataKey="athletes" name="Atletas" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Cidades"
              description="Top 10 cidades informadas pelos atletas."
              empty={cityChart.length === 0}
            >
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cityChart}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="city" width={110} tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Bar dataKey="athletes" name="Atletas" fill="#0D9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <ChartCard
            title="Evolução das inscrições"
            description="Inscrições criadas por dia (todas) e aprovadas."
            empty={timeline.length === 0}
          >
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeline} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Criadas"
                    stroke="#64748b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="approvedCount"
                    name="Aprovadas"
                    stroke="#0D9488"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
};

export default Analytics;
