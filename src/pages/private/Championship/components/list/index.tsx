import { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';

import useChampionshipData from '@/hooks/useChampionshipData';
import { ChampionshipCard } from '../ChampionshipCard';

const ListChampionship = () => {
  const {
    ListPaginated,
    championshipsPages,
    page,
    limit,
    setPage,
    isLoading,
  } = useChampionshipData();

  useEffect(() => {
    ListPaginated();
  }, [ListPaginated]);

  const total = championshipsPages.count ?? 0;
  const results = championshipsPages.results ?? [];
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const showPagination = total > limit;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  const gridClass =
    results.length <= 2
      ? 'mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2'
      : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <>
      <div className={gridClass}>
        {results.map((championship) => (
          <ChampionshipCard key={championship.id} championship={championship} />
        ))}
      </div>

      {showPagination ? (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-600">
          <button
            type="button"
            disabled={!championshipsPages.previous || isLoading}
            onClick={() => setPage(page - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-control transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} aria-hidden />
          </button>

          <span>
            {rangeStart}–{rangeEnd} de {total}
            <span className="text-gray-400">
              {' '}
              · pág. {page}/{pageCount}
            </span>
          </span>

          <button
            type="button"
            disabled={!championshipsPages.next || isLoading}
            onClick={() => setPage(page + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-control transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Próxima página"
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  );
};

export default ListChampionship;
