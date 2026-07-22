import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EyeOff } from 'react-feather';

import { Loader } from '@/components/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { LivePageShell } from '@/components/ui/LivePageShell';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { CategoryProvider } from '@/contexts/category';
import { LeaderboardProvider } from '@/contexts/leaderboard';
import useCategoryData from '@/hooks/useCategoryData';
import { readLiveFilters, writeLiveFilters } from '@/utils/liveFilters';

const ListLeaderboard = lazy(() => import('./components/list'));

const PrivateLeaderboardWithProvider = () => (
  <LeaderboardProvider>
    <CategoryProvider>
      <Leaderboard />
    </CategoryProvider>
  </LeaderboardProvider>
);

const Leaderboard = () => {
  const { id } = useParams();
  const { List: CategoryList, categories } = useCategoryData();
  const [categoryId, setCategoryId] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const hasCategories = useMemo(() => categories?.length !== 0, [categories]);
  const selectedName = categories.find((c) => c.id === categoryId)?.name;
  const useChips = categories.length > 1 && categories.length <= 8;

  useEffect(() => {
    if (id) CategoryList(id);
  }, [CategoryList, id]);

  useEffect(() => {
    if (!id || !categories.length || hydrated) return;

    const saved = readLiveFilters(id).categoryId;
    const next =
      categories.length === 1
        ? categories[0].id
        : categories.some((c) => c.id === saved)
          ? saved!
          : '';

    if (next) setCategoryId(next);
    setHydrated(true);
  }, [categories, hydrated, id]);

  const selectCategory = (next: string) => {
    setCategoryId(next);
    if (id) writeLiveFilters(id, { categoryId: next });
  };

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <LivePageShell
        title="Leaderboard"
        description="Ranking da categoria, incluindo resultados ocultos."
        className="!max-w-7xl"
      >
        {!hasCategories ? (
          <EmptyState
            title="Nenhuma categoria ainda"
            description="Crie categorias para gerar o ranking do campeonato."
            secondary={
              <Link
                to={`/championships/${id}/categories`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Ir para categorias
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-700">Categoria</p>
                <Tooltip label="Totais podem diferir do ranking público até a liberação em Resultados.">
                  <span className="inline-flex cursor-help items-center gap-1.5 rounded-chip bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    <EyeOff size={12} aria-hidden />
                    Inclui ocultos
                  </span>
                </Tooltip>
              </div>

              {useChips ? (
                <div
                  className="flex flex-wrap gap-1.5"
                  role="group"
                  aria-label="Categoria do ranking"
                >
                  {categories.map((category) => {
                    const active = category.id === categoryId;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => selectCategory(category.id)}
                        className={[
                          'rounded-chip px-3 py-1.5 text-xs font-semibold transition',
                          active
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                        ].join(' ')}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full sm:max-w-xs">
                  <Select
                    id="lb-category"
                    value={categoryId}
                    onChange={(event) => selectCategory(event.target.value)}
                    aria-label="Categoria"
                  >
                    <option value="">Selecione a categoria</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            {!categoryId ? (
              <EmptyState
                title="Escolha a categoria"
                description="Selecione uma categoria para acompanhar o placar."
              />
            ) : (
              <ListLeaderboard
                category={categoryId}
                categoryName={selectedName}
                champ={id as string}
              />
            )}
          </div>
        )}
      </LivePageShell>
    </Suspense>
  );
};

export default PrivateLeaderboardWithProvider;
