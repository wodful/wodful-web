import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import { PaginationBar } from '@/components/ui/PaginationBar';
import useCategoryData from '@/hooks/useCategoryData';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import { useEffect, useState } from 'react';

interface IListLeaderboard {
  champ: string;
  category: string;
}

const ListLeaderboard = ({ champ, category }: IListLeaderboard) => {
  const [currentTotal, setCurrentTotal] = useState<number>(0);

  const { categories } = useCategoryData();

  const { ListPaginated, leaderboardPages, page, limit, setLimit, setPage, isLoading } =
    useLeaderboardData();

  useEffect(() => {
    if (champ && category) {
      ListPaginated(champ, category);
      setCurrentTotal(leaderboardPages.results?.length);
    }
  }, [ListPaginated, category, champ, leaderboardPages.results?.length]);

  const previousPage = () => {
    setPage(page - 1);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  return (
    <>
      <DataTable className='text-sm text-slate-800'>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeaderCell>PARTICIPANTES</DataTableHeaderCell>
            <DataTableHeaderCell>CATEGORIA</DataTableHeaderCell>
            <DataTableHeaderCell>COLOCAÇÃO</DataTableHeaderCell>
            <DataTableHeaderCell>PONTUAÇÃO GERAL</DataTableHeaderCell>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {categories?.length && !leaderboardPages.results && (
            <DataTableRow>
              <DataTableCell />
              <DataTableCell className='py-6 text-center' colSpan={2}>
                Busque por uma categoria
              </DataTableCell>
              <DataTableCell />
            </DataTableRow>
          )}

          {leaderboardPages.results?.length === 0 && (
            <DataTableRow>
              <DataTableCell />
              <DataTableCell className='py-6 text-right' colSpan={2}>
                Sua categoria não tem inscrições ainda.
              </DataTableCell>
              <DataTableCell />
            </DataTableRow>
          )}

          {leaderboardPages.results?.map((leaderboard) => (
            <DataTableRow key={`${leaderboard.nickname}_${leaderboard.generalScore}`}>
              <DataTableCell className='py-6 capitalize'>{leaderboard.nickname}</DataTableCell>
              <DataTableCell className='py-6 capitalize'>{leaderboard.category.name}</DataTableCell>
              <DataTableCell className='py-6 capitalize'>
                {leaderboard.ranking === 0 ? 'Sem ranking' : `${leaderboard.ranking}° Lugar`}
              </DataTableCell>
              <DataTableCell className='py-6 capitalize'>
                {leaderboard.generalScore === 0
                  ? 'Sem pontuação'
                  : `${leaderboard.generalScore} ${
                      leaderboard.generalScore === 1 ? 'Ponto' : 'Pontos'
                    }`}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>

      {leaderboardPages.results?.length ? (
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
          onPrevious={previousPage}
          onNext={nextPage}
        />
      ) : null}
    </>
  );
};

export default ListLeaderboard;
