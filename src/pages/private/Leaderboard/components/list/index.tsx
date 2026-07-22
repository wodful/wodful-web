import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginationBar } from '@/components/ui/PaginationBar';
import type { ILeaderboard } from '@/data/interfaces/leaderboard';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import { Fragment, useEffect, useId, useMemo, useState } from 'react';
import { ChevronDown, EyeOff } from 'react-feather';

interface IListLeaderboard {
  champ: string;
  category: string;
  categoryName?: string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (a + b).toUpperCase() || '?';
}

function rankTone(ranking: number) {
  if (ranking === 1) return 'bg-amber-100 text-amber-800 ring-amber-200';
  if (ranking === 2) return 'bg-slate-200 text-slate-700 ring-slate-300';
  if (ranking === 3) return 'bg-orange-100 text-orange-800 ring-orange-200';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

function isTimeResult(value: string) {
  return value.includes(':');
}

const ListLeaderboard = ({ champ, category, categoryName }: IListLeaderboard) => {
  const [currentTotal, setCurrentTotal] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { ListPaginated, leaderboardPages, page, limit, setLimit, setPage, isLoading } =
    useLeaderboardData();

  useEffect(() => {
    if (champ && category) {
      ListPaginated(champ, category);
      setExpanded({});
    }
  }, [ListPaginated, category, champ]);

  useEffect(() => {
    setCurrentTotal(leaderboardPages.results?.length ?? 0);
  }, [leaderboardPages.results?.length]);

  const tiedRanks = useMemo(() => {
    const counts = new Map<number, number>();
    for (const row of leaderboardPages.results ?? []) {
      if (row.ranking > 0) {
        counts.set(row.ranking, (counts.get(row.ranking) ?? 0) + 1);
      }
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([rank]) => rank));
  }, [leaderboardPages.results]);

  const toggleRow = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (leaderboardPages.results && leaderboardPages.results.length === 0) {
    return (
      <EmptyState
        title="Sem participantes nesta categoria"
        description={
          categoryName
            ? `Ainda não há inscritos em ${categoryName} para montar o ranking.`
            : 'Quando houver participantes, o ranking aparece aqui.'
        }
      />
    );
  }

  if (!leaderboardPages.results) {
    return (
      <EmptyState title="Carregando ranking…" description="Aguarde um instante." />
    );
  }

  const hasScores = leaderboardPages.results.some((row) => row.generalScore > 0);
  const totalCount = leaderboardPages.count ?? 0;
  const showPagination = totalCount > limit;

  return (
    <>
      {!hasScores ? (
        <p className="mb-3 rounded-surface border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-600">
          Participantes listados, mas ainda sem pontuação nesta categoria.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-surface border border-slate-200 bg-white">
        <DataTable containerClassName="rounded-none border-0">
          <DataTableHead>
            <DataTableRow>
              <DataTableHeaderCell className="w-24">#</DataTableHeaderCell>
              <DataTableHeaderCell>Participante</DataTableHeaderCell>
              <DataTableHeaderCell className="w-36 text-right sm:w-44">
                Pontuação
              </DataTableHeaderCell>
              <DataTableHeaderCell className="w-10">
                <span className="sr-only">Detalhes</span>
              </DataTableHeaderCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {leaderboardPages.results.map((leaderboard, index) => {
              const rank = leaderboard.ranking;
              const isTie = tiedRanks.has(rank);
              const rowKey = `${leaderboard.nickname}-${rank}-${index}`;
              const isOpen = !!expanded[rowKey];

              return (
                <LeaderboardDetailRows
                  key={rowKey}
                  rowKey={rowKey}
                  leaderboard={leaderboard}
                  isTie={isTie}
                  isOpen={isOpen}
                  onToggle={() => toggleRow(rowKey)}
                />
              );
            })}
          </DataTableBody>
        </DataTable>

        {showPagination ? (
          <PaginationBar
            page={page}
            limit={limit}
            count={totalCount}
            currentTotal={currentTotal}
            hasPrevious={!!leaderboardPages.previous}
            hasNext={!!leaderboardPages.next}
            isLoading={isLoading}
            limitOptions={[10, 20, 50]}
            onLimitChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
            onPrevious={() => setPage(page - 1)}
            onNext={() => setPage(page + 1)}
          />
        ) : null}
      </div>
    </>
  );
};

function LeaderboardDetailRows({
  rowKey,
  leaderboard,
  isTie,
  isOpen,
  onToggle,
}: {
  rowKey: string;
  leaderboard: ILeaderboard;
  isTie: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const detailsId = useId();
  const rank = leaderboard.ranking;
  const results = leaderboard.results ?? [];

  return (
    <Fragment>
      <DataTableRow className={isOpen ? 'bg-slate-50/80' : ''}>
        <DataTableCell className="py-3">
          {rank === 0 ? (
            <span className="text-slate-400">—</span>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-1 ${rankTone(
                  rank,
                )}`}
              >
                {rank}º
              </span>
              {isTie ? (
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Empate
                </span>
              ) : null}
            </div>
          )}
        </DataTableCell>
        <DataTableCell className="py-3">
          <button
            type="button"
            className="flex min-w-0 items-center gap-2.5 text-left"
            aria-expanded={isOpen}
            aria-controls={detailsId}
            onClick={onToggle}
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-white">
              {initials(leaderboard.nickname)}
            </span>
            <span className="truncate font-medium capitalize text-slate-900">
              {leaderboard.nickname}
            </span>
          </button>
        </DataTableCell>
        <DataTableCell className="py-3 text-right text-base tabular-nums font-semibold text-slate-900">
          {leaderboard.generalScore === 0
            ? '—'
            : `${leaderboard.generalScore} ${
                leaderboard.generalScore === 1 ? 'pt' : 'pts'
              }`}
        </DataTableCell>
        <DataTableCell className="py-3">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-control text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-expanded={isOpen}
            aria-controls={detailsId}
            aria-label={
              isOpen
                ? `Ocultar detalhes de ${leaderboard.nickname}`
                : `Ver detalhes de ${leaderboard.nickname}`
            }
            onClick={onToggle}
          >
            <ChevronDown
              size={16}
              className={`transition ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        </DataTableCell>
      </DataTableRow>

      {isOpen ? (
        <DataTableRow className="hover:bg-transparent">
          <DataTableCell colSpan={4} className="!bg-slate-50/90 px-4 py-3">
            <div id={detailsId}>
              {!results.length ? (
                <p className="text-sm text-slate-500">Sem resultados nesta categoria.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[22rem] border-collapse text-left text-xs">
                    <thead>
                      <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        <th className="pb-2 pr-3 font-semibold">Prova</th>
                        <th className="pb-2 pr-3 font-semibold">Col.</th>
                        <th className="pb-2 pr-3 font-semibold">Resultado</th>
                        <th className="pb-2 pr-3 font-semibold">Pts</th>
                        <th className="pb-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                      {results.map((content, resultIndex) => (
                        <tr key={`${rowKey}-${content.workout.name}-${resultIndex}`}>
                          <td className="max-w-[10rem] truncate py-2 pr-3 font-semibold text-slate-800">
                            {content.workout.name}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-slate-600">
                            {content.classification}º
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-slate-600">
                            {content.result}
                            {isTimeResult(String(content.result)) ? ' min' : ' reps'}
                          </td>
                          <td className="whitespace-nowrap py-2 pr-3 font-semibold tabular-nums text-slate-700">
                            {content.points}
                          </td>
                          <td className="whitespace-nowrap py-2">
                            {content.isReleased === false ? (
                              <span className="inline-flex items-center gap-1 rounded-chip bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
                                <EyeOff size={11} aria-hidden />
                                Oculto
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-500">
                                Público
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DataTableCell>
        </DataTableRow>
      ) : null}
    </Fragment>
  );
}

export default ListLeaderboard;
