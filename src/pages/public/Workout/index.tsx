import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import { PublicLoader } from '@/components/ui/PublicLoader';
import { Select } from '@/components/ui/Select';
import { CategoryProvider } from '@/contexts/category';
import { WorkoutProvider } from '@/contexts/workout';
import useApp from '@/hooks/useApp';
import useCategoryData from '@/hooks/useCategoryData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { ChangeEvent, Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { Server } from 'react-feather';
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
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string;
    value: string;
  }>({
    name: 'Sem categoria',
    value: '0',
  });

  const hasCategorySelected = useMemo(
    () => selectedCategory.value !== '0',
    [selectedCategory.value],
  );

  const handleSelection = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const categoryId = event.target.value;
      if (!categoryId) {
        setSelectedCategory({
          name: 'Sem categoria',
          value: '0',
        });
        return;
      }

      PublicListByCategory(categoryId);
      const category = publicCategories.find((selected) => selected.id === categoryId);
      if (!category) return;

      setSelectedCategory({ name: category.name, value: category.id });

      AnalyticsAdapter.event({
        action: 'buscar_provas_categoria',
        category: 'Atleta',
        label: 'Buscar provas por categoria',
        value: `${category.name}`,
      });
    },
    [PublicListByCategory, publicCategories],
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

  return (
    <Suspense fallback={<PublicLoader label="Carregando provas…" />}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Provas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Selecione a categoria para ver as provas.
            </p>
          </div>

          {hasCategorySelected ? (
            <div className="w-full sm:max-w-xs">
              <label htmlFor="workout-category" className="sr-only">
                Categoria
              </label>
              <Select
                id="workout-category"
                value={selectedCategory.value}
                onChange={handleSelection}
              >
                {publicCategories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </header>

        {hasCategorySelected ? (
          <ListPublicWorkouts />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
            <Server size={56} className="text-gray-700" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">Selecione uma categoria</p>
              <p className="text-sm text-gray-500">
                As provas são exibidas por categoria do campeonato.
              </p>
            </div>
            <div className="w-full max-w-xs">
              <label htmlFor="workout-category-empty" className="sr-only">
                Categorias
              </label>
              <Select id="workout-category-empty" value="" onChange={handleSelection}>
                <option value="" disabled>
                  Categorias
                </option>
                {publicCategories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default PublicWorkouts;
