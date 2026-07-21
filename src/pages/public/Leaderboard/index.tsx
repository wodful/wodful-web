import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import { PublicFilterBar } from '@/components/public/PublicFilterBar';
import { PublicLoader } from '@/components/ui/PublicLoader';
import { Select } from '@/components/ui/Select';
import { CategoryProvider } from '@/contexts/category';
import { LeaderboardProvider } from '@/contexts/leaderboard';
import useApp from '@/hooks/useApp';
import useCategoryData from '@/hooks/useCategoryData';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import { usePublicAutoRefresh } from '@/hooks/usePublicAutoRefresh';
import { usePublicCategoryParam } from '@/hooks/usePublicCategoryParam';
import {
  ChangeEvent,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ListPublicLeaderboard from './components';
import { ValidateAccess } from './helper/ValidateAccess';

const PublicLeaderboard = () => (
  <LeaderboardProvider>
    <CategoryProvider>
      <PublicLeaderboardAccess />
    </CategoryProvider>
  </LeaderboardProvider>
);

const PublicLeaderboardAccess = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setPublicChampionshipName } = useApp();
  const { PublicList, publicCategories } = useCategoryData();
  const { ListPublic } = useLeaderboardData();
  const { categoryId, setCategoryId } = usePublicCategoryParam();
  const [search, setSearch] = useState('');

  const hasCategory = Boolean(
    categoryId && publicCategories.some((item) => item.id === categoryId),
  );

  const handleSelection = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextId = event.target.value;
      if (!nextId) return;

      setCategoryId(nextId);

      const category = publicCategories.find((item) => item.id === nextId);
      if (!category) return;

      AnalyticsAdapter.event({
        action: 'buscar_leaderboard_categoria',
        category: 'Atleta',
        label: 'Buscar leaderboard por categoria',
        value: `${category.name}`,
      });
    },
    [publicCategories, setCategoryId],
  );

  const onRefresh = useCallback(async () => {
    if (!categoryId) return;
    await ListPublic(categoryId);
  }, [ListPublic, categoryId]);

  const { isRefreshing, updatedLabel, secondsSinceUpdate, refresh } =
    usePublicAutoRefresh({
      enabled: hasCategory,
      onRefresh,
    });

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
    ListPublic(categoryId);
  }, [categoryId, publicCategories, ListPublic]);

  return (
    <Suspense fallback={<PublicLoader label="Carregando ranking…" />}>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-4">
          <h1 className="sr-only">Ranking</h1>

          <PublicFilterBar
            searchId="leaderboard-search"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar atleta ou time…"
            searchLabel="Buscar no ranking"
            onRefresh={hasCategory ? refresh : undefined}
            isRefreshing={isRefreshing}
            updatedLabel={updatedLabel}
            secondsSinceUpdate={secondsSinceUpdate}
            categoryControl={
              <>
                <label htmlFor="category" className="sr-only">
                  Categoria
                </label>
                <Select
                  id="category"
                  value={hasCategory ? categoryId : ''}
                  onChange={handleSelection}
                  disabled={!publicCategories.length}
                  className="!min-h-11 !py-2 !text-sm"
                >
                  {!publicCategories.length ? (
                    <option value="">Carregando categorias…</option>
                  ) : (
                    publicCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </Select>
              </>
            }
          />
        </header>

        {hasCategory ? <ListPublicLeaderboard search={search} /> : null}
      </div>
    </Suspense>
  );
};

export default PublicLeaderboard;
