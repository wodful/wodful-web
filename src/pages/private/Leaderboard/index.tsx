import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Loader } from '@/components/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField } from '@/components/ui/FormField';
import { LivePageShell } from '@/components/ui/LivePageShell';
import { Select } from '@/components/ui/Select';
import { CategoryProvider } from '@/contexts/category';
import { LeaderboardProvider } from '@/contexts/leaderboard';
import { SubscriptionProvider } from '@/contexts/subscription';
import { WorkoutProvider } from '@/contexts/workout';
import useCategoryData from '@/hooks/useCategoryData';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import { readLiveFilters, writeLiveFilters } from '@/utils/liveFilters';

const ListLeaderboard = lazy(() => import('./components/list'));

const PrivateLeaderboardWithProvider = () => (
  <LeaderboardProvider>
    <CategoryProvider>
      <WorkoutProvider>
        <SubscriptionProvider>
          <Leaderboard />
        </SubscriptionProvider>
      </WorkoutProvider>
    </CategoryProvider>
  </LeaderboardProvider>
);

const Leaderboard = () => {
  const { id } = useParams();
  const { List: CategoryList, categories } = useCategoryData();
  const [categoryId, setCategoryId] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const { ListPaginated } = useLeaderboardData();

  const hasCategories = useMemo(() => categories?.length !== 0, [categories]);
  const selectedName = categories.find((c) => c.id === categoryId)?.name;

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

    if (next) {
      setCategoryId(next);
      ListPaginated(id, next);
    }
    setHydrated(true);
  }, [ListPaginated, categories, hydrated, id]);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <LivePageShell
        title="Leaderboard"
        description="Ranking geral por categoria — destaque para o pódio."
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
              <FormField id="lb-category" label="Categoria">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Select
                    id="lb-category"
                    className="sm:max-w-sm"
                    value={categoryId}
                    onChange={(event) => {
                      const next = event.target.value;
                      setCategoryId(next);
                      if (id) writeLiveFilters(id, { categoryId: next });
                      if (next && id) ListPaginated(id, next);
                    }}
                  >
                    <option value="">Selecione a categoria</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  {categories.length > 1 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((category) => {
                        const active = category.id === categoryId;
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setCategoryId(category.id);
                              if (id) {
                                writeLiveFilters(id, { categoryId: category.id });
                                ListPaginated(id, category.id);
                              }
                            }}
                            className={[
                              'rounded-chip px-3 py-1 text-xs font-semibold transition',
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
                  ) : null}
                </div>
              </FormField>
              {selectedName ? (
                <p className="mt-2 text-xs text-slate-500">
                  Ranking · <span className="font-semibold text-slate-700">{selectedName}</span>
                </p>
              ) : null}
            </div>

            {!categoryId ? (
              <EmptyState
                title="Escolha a categoria"
                description="Selecione uma categoria para ver o placar."
              />
            ) : (
              <ListLeaderboard category={categoryId} champ={id as string} />
            )}
          </div>
        )}
      </LivePageShell>
    </Suspense>
  );
};

export default PrivateLeaderboardWithProvider;
