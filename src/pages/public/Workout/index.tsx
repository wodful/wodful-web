import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import { PublicFilterBar } from '@/components/public/PublicFilterBar';
import { PublicLoader } from '@/components/ui/PublicLoader';
import { Select } from '@/components/ui/Select';
import { CategoryProvider } from '@/contexts/category';
import { WorkoutProvider } from '@/contexts/workout';
import useApp from '@/hooks/useApp';
import useCategoryData from '@/hooks/useCategoryData';
import { usePublicCategoryParam } from '@/hooks/usePublicCategoryParam';
import useWorkoutData from '@/hooks/useWorkoutData';
import {
  ChangeEvent,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ValidateAccess } from '../Leaderboard/helper/ValidateAccess';

const ListPublicWorkouts = lazy(() => import('./components/'));

const PublicWorkouts = () => (
  <WorkoutProvider>
    <CategoryProvider>
      <Workouts />
    </CategoryProvider>
  </WorkoutProvider>
);

const Workouts = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setPublicChampionshipName } = useApp();
  const { PublicList, publicCategories } = useCategoryData();
  const { PublicListByCategory } = useWorkoutData();
  const { categoryId, setCategoryId } = usePublicCategoryParam();
  const [search, setSearch] = useState('');

  const handleSelection = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextId = event.target.value;
      if (!nextId) return;

      setCategoryId(nextId);
      setSearch('');

      const category = publicCategories.find((item) => item.id === nextId);
      if (!category) return;

      AnalyticsAdapter.event({
        action: 'buscar_provas_categoria',
        category: 'Atleta',
        label: 'Buscar provas por categoria',
        value: `${category.name}`,
      });
    },
    [publicCategories, setCategoryId],
  );

  useEffect(() => {
    const name = ValidateAccess.verify(code as string, navigate);
    if (name) setPublicChampionshipName(name);
  }, [code, navigate, setPublicChampionshipName]);

  useEffect(() => {
    AnalyticsAdapter.pageview(location.pathname);
    if (code) PublicList(code);
  }, [PublicList, code, location.pathname]);

  useEffect(() => {
    ValidateAccess.verify(code as string, navigate);
  }, [code, navigate]);

  useEffect(() => {
    if (!publicCategories.length) return;
    const valid =
      categoryId && publicCategories.some((item) => item.id === categoryId);
    if (valid) return;
    setCategoryId(publicCategories[0].id);
  }, [publicCategories, categoryId, setCategoryId]);

  useEffect(() => {
    if (!categoryId) return;
    if (!publicCategories.some((item) => item.id === categoryId)) return;
    PublicListByCategory(categoryId);
  }, [categoryId, publicCategories, PublicListByCategory]);

  const hasCategory = Boolean(
    categoryId && publicCategories.some((item) => item.id === categoryId),
  );

  return (
    <Suspense fallback={<PublicLoader label="Carregando provas…" />}>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-4">
          <h1 className="sr-only">Provas</h1>

          {hasCategory ? (
            <PublicFilterBar
              searchId="workout-search"
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Buscar prova…"
              searchLabel="Buscar prova"
              categoryControl={
                <>
                  <label htmlFor="workout-category" className="sr-only">
                    Categoria
                  </label>
                  <Select
                    id="workout-category"
                    value={categoryId}
                    onChange={handleSelection}
                    disabled={!publicCategories.length}
                    className="!min-h-11 !py-2 !text-sm"
                  >
                    {publicCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </>
              }
            />
          ) : (
            <div className="w-full sm:max-w-xs">
              <label htmlFor="workout-category-loading" className="sr-only">
                Categoria
              </label>
              <Select
                id="workout-category-loading"
                value=""
                disabled
                className="!min-h-11 !py-2 !text-sm"
              >
                <option value="">Carregando categorias…</option>
              </Select>
            </div>
          )}
        </header>

        {hasCategory ? <ListPublicWorkouts search={search} /> : null}
      </div>
    </Suspense>
  );
};

export default PublicWorkouts;
