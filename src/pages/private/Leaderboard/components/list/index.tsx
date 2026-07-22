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
import useLeaderboardData from '@/hooks/useLeaderboardData';
import { useEffect, useState } from 'react';

interface IListLeaderboard {
  champ: string;
  category: string;
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

const ListLeaderboard = ({ champ, category }: IListLeaderboard) => {
  const [currentTotal, setCurrentTotal] = useState(0);
  const { ListPaginated, leaderboardPages, page, limit, setLimit, setPage, isLoading } =
    useLeaderboardData();

  useEffect(() => {
    if (champ && category) {
      ListPaginated(champ, category);
    }
  }, [ListPaginated, category, champ]);

  useEffect(() => {
    setCurrentTotal(leaderboardPages.results?.length ?? 0);
  }, [leaderboardPages.results?.length]);

  if (leaderboardPages.results && leaderboardPages.results.length === 0) {
    return (
      <EmptyState
        title="Sem inscrições nesta categoria"
        description="Quando houver participantes, o ranking aparece aqui."
      />
    );
  }

  if (!leaderboardPages.results) {
    return (
      <EmptyState
        title="Carregando ranking…"
        description="Aguarde um instante."
      />
    );
  }

  return (
    <>
      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeaderCell className="w-16">#</DataTableHeaderCell>
            <DataTableHeaderCell>Participante</DataTableHeaderCell>
            <DataTableHeaderCell>Categoria</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Pontuação</DataTableHeaderCell>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {leaderboardPages.results.map((leaderboard) => {
            const rank = leaderboard.ranking;
            const podium = rank >= 1 && rank <= 3;
            return (
              <DataTableRow
                key={`${leaderboard.nickname}_${leaderboard.generalScore}`}
                className={podium ? 'bg-primary/[0.03]' : ''}
              >
                <DataTableCell className="py-3.5">
                  {rank === 0 ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-1 ${rankTone(
                        rank,
                      )}`}
                    >
                      {rank}º
                    </span>
                  )}
                </DataTableCell>
                <DataTableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
                      {initials(leaderboard.nickname)}
                    </span>
                    <span
                      className={`capitalize ${
                        podium ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'
                      }`}
                    >
                      {leaderboard.nickname}
                    </span>
                  </div>
                </DataTableCell>
                <DataTableCell className="py-3.5 capitalize text-slate-600">
                  {leaderboard.category.name}
                </DataTableCell>
                <DataTableCell className="py-3.5 text-right tabular-nums font-semibold text-slate-900">
                  {leaderboard.generalScore === 0
                    ? '—'
                    : `${leaderboard.generalScore} ${
                        leaderboard.generalScore === 1 ? 'pt' : 'pts'
                      }`}
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>

      {leaderboardPages.results.length ? (
        <PaginationBar
          page={page}
          limit={limit}
          count={leaderboardPages.count ?? 0}
          currentTotal={currentTotal}
          hasPrevious={!!leaderboardPages.previous}
          hasNext={!!leaderboardPages.next}
          isLoading={isLoading}
          onLimitChange={(next) => {
            setLimit(next);
            setPage(1);
          }}
          onPrevious={() => setPage(page - 1)}
          onNext={() => setPage(page + 1)}
        />
      ) : null}
    </>
  );
};

export default ListLeaderboard;
