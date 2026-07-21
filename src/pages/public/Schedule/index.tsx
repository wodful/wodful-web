import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import { PublicFilterBar } from '@/components/public/PublicFilterBar';
import { PublicLoader } from '@/components/ui/PublicLoader';
import { Select } from '@/components/ui/Select';
import { CategoryProvider } from '@/contexts/category';
import { ScheduleProvider } from '@/contexts/schedule';
import useApp from '@/hooks/useApp';
import useCategoryData from '@/hooks/useCategoryData';
import { usePublicAutoRefresh } from '@/hooks/usePublicAutoRefresh';
import { usePublicCategoryParam } from '@/hooks/usePublicCategoryParam';
import useScheduleData from '@/hooks/useScheduleData';
import {
  ChangeEvent,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ValidateAccess } from '../Leaderboard/helper/ValidateAccess';

const ListCardPublicSchedule = lazy(() => import('./components/cardList'));

const PublicSchedule = () => (
  <ScheduleProvider>
    <CategoryProvider>
      <PublicScheduleAccess />
    </CategoryProvider>
  </ScheduleProvider>
);

const PublicScheduleAccess = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { PublicList } = useScheduleData();
  const { PublicList: PublicCategoryList, publicCategories } = useCategoryData();
  const { setPublicChampionshipName } = useApp();
  const { categoryId, setCategoryId } = usePublicCategoryParam();
  const [search, setSearch] = useState('');

  const selectedCategoryName = useMemo(() => {
    if (!categoryId) return '';
    return publicCategories.find((item) => item.id === categoryId)?.name ?? '';
  }, [categoryId, publicCategories]);

  const handleSelection = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextId = event.target.value;
      setCategoryId(nextId === 'all' ? '' : nextId);
    },
    [setCategoryId],
  );

  const onRefresh = useCallback(async () => {
    if (!code) return;
    AnalyticsAdapter.event({
      action: 'buscar_cronograma_atualizado',
      category: 'Atleta',
      label: 'Atualizar cronograma',
      value: `${code}`,
    });
    await PublicList(code);
  }, [PublicList, code]);

  const { isRefreshing, updatedLabel, secondsSinceUpdate, refresh } =
    usePublicAutoRefresh({
      enabled: Boolean(code),
      onRefresh,
    });

  useEffect(() => {
    if (code) {
      PublicList(code);
      PublicCategoryList(code);
    }
  }, [PublicList, PublicCategoryList, code]);

  useEffect(() => {
    AnalyticsAdapter.pageview(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const name = ValidateAccess.verify(code as string, navigate);
    if (name) setPublicChampionshipName(name);
  }, [code, navigate, setPublicChampionshipName]);

  useEffect(() => {
    ValidateAccess.verify(code as string, navigate);
  }, [code, navigate]);

  useEffect(() => {
    if (!publicCategories.length || !categoryId) return;
    const exists = publicCategories.some((item) => item.id === categoryId);
    if (!exists) setCategoryId('');
  }, [publicCategories, categoryId, setCategoryId]);

  return (
    <Suspense fallback={<PublicLoader label="Carregando cronograma…" />}>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-4">
          <h1 className="sr-only">Cronograma</h1>

          <PublicFilterBar
            searchId="schedule-search"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar atleta ou time…"
            searchLabel="Buscar no cronograma"
            onRefresh={refresh}
            isRefreshing={isRefreshing}
            updatedLabel={updatedLabel}
            secondsSinceUpdate={secondsSinceUpdate}
            categoryControl={
              <>
                <label htmlFor="schedule-category" className="sr-only">
                  Filtrar por categoria
                </label>
                <Select
                  id="schedule-category"
                  value={categoryId || 'all'}
                  onChange={handleSelection}
                  className="!min-h-11 !py-2 !text-sm"
                >
                  <option value="all">Todas as categorias</option>
                  {publicCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </>
            }
          />
        </header>

        <ListCardPublicSchedule
          search={search}
          categoryName={selectedCategoryName}
          accessCode={code}
        />
      </div>
    </Suspense>
  );
};

export default PublicSchedule;
