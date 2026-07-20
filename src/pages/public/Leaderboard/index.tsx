import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import { PublicLoader } from '@/components/ui/PublicLoader';
import { Select } from '@/components/ui/Select';
import { CategoryProvider } from '@/contexts/category';
import { LeaderboardProvider } from '@/contexts/leaderboard';
import useApp from '@/hooks/useApp';
import useCategoryData from '@/hooks/useCategoryData';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import { ChangeEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Server } from 'react-feather';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ListPublicLeaderboard from './components';
import { ValidateAccess } from './helper/ValidateAccess';

const PublicLeaderboard = () => {
  return (
    <LeaderboardProvider>
      <CategoryProvider>
        <PublicLeaderboardAccess />
      </CategoryProvider>
    </LeaderboardProvider>
  );
};

const PublicLeaderboardAccess = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { setPublicChampionshipName } = useApp();
  const { PublicList, publicCategories } = useCategoryData();
  const { ListPublic } = useLeaderboardData();
  const location = useLocation();
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

      ListPublic(String(categoryId));
      const category = publicCategories.find(
        (selected) => selected.id === categoryId,
      );
      if (!category) return;

      setSelectedCategory({ name: category.name, value: category.id });

      AnalyticsAdapter.event({
        action: 'buscar_leaderboard_categoria',
        category: 'Atleta',
        label: 'Buscar leaderboard por categoria',
        value: `${category.name}`,
      });
    },
    [ListPublic, publicCategories],
  );

  useEffect(() => {
    if (code) PublicList(code);
  }, [PublicList, code]);

  useEffect(() => {
    AnalyticsAdapter.pageview(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const name = ValidateAccess.verify(code as string, navigate);
    if (name) setPublicChampionshipName(name);
  }, [code, navigate, setPublicChampionshipName]);

  return (
    <Suspense fallback={<PublicLoader label="Carregando ranking…" />}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Ranking
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Selecione a categoria para ver a classificação.
            </p>
          </div>

          {hasCategorySelected ? (
            <div className="w-full sm:max-w-xs">
              <label htmlFor="category" className="sr-only">
                Categoria
              </label>
              <Select
                id="category"
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
          <ListPublicLeaderboard />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
            <Server size={56} className="text-gray-700" aria-hidden />
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">Selecione uma categoria</p>
              <p className="text-sm text-gray-500">
                O ranking é exibido por categoria do campeonato.
              </p>
            </div>
            <div className="w-full max-w-xs">
              <label htmlFor="category-empty" className="sr-only">
                Categorias
              </label>
              <Select
                id="category-empty"
                value=""
                onChange={handleSelection}
              >
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

export default PublicLeaderboard;
