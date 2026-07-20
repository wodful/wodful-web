import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import { Button } from '@/components/ui/Button';
import { PublicLoader } from '@/components/ui/PublicLoader';
import { CategoryProvider } from '@/contexts/category';
import { ScheduleProvider } from '@/contexts/schedule';
import useApp from '@/hooks/useApp';
import useScheduleData from '@/hooks/useScheduleData';
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'react-feather';
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
  const [isLoading, setIsLoading] = useState(false);
  const { setPublicChampionshipName } = useApp();

  const handleIsAttList = useCallback(() => {
    AnalyticsAdapter.event({
      action: 'buscar_cronograma_atualizado',
      category: 'Atleta',
      label: 'Atualizar cronograma',
      value: `${code}`,
    });

    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, [code]);

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
    ValidateAccess.verify(code as string, navigate);
  }, [code, navigate]);

  return (
    <Suspense fallback={<PublicLoader label="Carregando cronograma…" />}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Cronograma
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Horários e heats do campeonato.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            isLoading={isLoading}
            loadingLabel="Atualizando…"
            className="sm:!w-auto"
            onClick={() => {
              PublicList(code!);
              handleIsAttList();
            }}
          >
            <RefreshCw size={16} aria-hidden />
            Atualizar
          </Button>
        </header>

        <ListCardPublicSchedule />
      </div>
    </Suspense>
  );
};

export default PublicSchedule;
