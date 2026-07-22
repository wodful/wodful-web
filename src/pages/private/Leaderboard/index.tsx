import { lazy, Suspense, useEffect, useMemo, useState } from 'react';

import { EmptyList } from '@/components/EmptyList';
import { Loader } from '@/components/Loader';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { CategoryProvider } from '@/contexts/category';
import { LeaderboardProvider } from '@/contexts/leaderboard';
import { SubscriptionProvider } from '@/contexts/subscription';
import { WorkoutProvider } from '@/contexts/workout';
import useCategoryData from '@/hooks/useCategoryData';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import { useParams } from 'react-router-dom';

const ListLeaderboard = lazy(() => import('./components/list'));

const PrivateLeaderboardWithProvider = () => {
  return (
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
};

const Leaderboard = () => {
  const { id } = useParams();
  const { List: CategoryList, categories } = useCategoryData();
  const [selectedCategory, setSelectedCategory] = useState<string>('Sem categoria');
  const [categoryId, setCategoryId] = useState<string>('');

  const { ListPaginated } = useLeaderboardData();

  const hasElements: boolean = useMemo(() => categories?.length !== 0, [categories]);

  useEffect(() => {
    if (id) CategoryList(id);
  }, [CategoryList, id]);

  return (
    <Suspense fallback={<Loader title='Carregando ...' />}>
      <main className='flex w-full flex-col items-center p-6' role='main'>
        {hasElements && (
          <section className='flex w-full items-center justify-between gap-3' role='textbox'>
            <article className='flex flex-col gap-3' role='textbox'>
              <h1 className='text-2xl font-bold text-slate-900' role='heading'>
                Leaderboard
              </h1>
              <Badge
                tone='neutral'
                className='w-fit rounded border border-slate-400 px-2 py-0.5 text-xs capitalize'
              >
                Categoria: {selectedCategory}
              </Badge>
            </article>
            <article className='flex items-center gap-4'>
              <Select
                id='category'
                className='min-w-[200px]'
                onChange={(event) => {
                  if (event.target.value) {
                    ListPaginated(String(id), event.target.value);
                    setCategoryId(event.target.value);
                    setSelectedCategory(
                      categories.find((selected) => selected.id === event.target.value)!.name,
                    );
                  }
                }}
              >
                <option value=''>Selecione a categoria</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </article>
          </section>
        )}

        {hasElements && (
          <section className='mt-6 w-full'>
            <ListLeaderboard category={categoryId as string} champ={id as string} />
          </section>
        )}

        {!hasElements && (
          <EmptyList
            text='Você não possui um leaderboard ainda!'
            linkTo={`/championships/${id}/categories`}
            textLinkTo='Comece seu campeonato aqui.'
          />
        )}
      </main>
    </Suspense>
  );
};

export default PrivateLeaderboardWithProvider;
