import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import ComponentModal from '@/components/ComponentModal';
import { EmptyList } from '@/components/EmptyList';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { CategoryProvider } from '@/contexts/category';
import { WorkoutProvider } from '@/contexts/workout';
import { IChampionship } from '@/data/interfaces/championship';
import useWorkoutData from '@/hooks/useWorkoutData';
import { ChampionshipService } from '@/services/Championship';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const axios = new AxiosAdapter();
const championshipService = new ChampionshipService(axios);

const ListWorkout = lazy(() => import('./components/list'));
const FormWorkout = lazy(() => import('./components/form'));

const WorkoutWithProvider = () => (
  <CategoryProvider>
    <WorkoutProvider onClose={() => undefined}>
      <Workout />
    </WorkoutProvider>
  </CategoryProvider>
);

const Workout = () => {
  const { workoutsPages } = useWorkoutData();
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [resultType, setResultType] = useState<string | null>(null);

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (!id) return;
    championshipService
      .getById(id)
      .then((championship: IChampionship) => setResultType(championship.resultType))
      .catch(() => setResultType(null));
  }, [id]);

  const hasElements: boolean = useMemo(() => workoutsPages.count !== 0, [workoutsPages]);
  const isScoreType = resultType === 'SCORE';

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <div className="flex w-full flex-col items-center p-6">
        {hasElements ? (
          <div className="flex w-full items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Lista de provas</h1>
            <Button variant="primary" className="w-auto" onClick={() => setIsOpen(true)}>
              Adicionar prova
            </Button>
          </div>
        ) : null}

        <ComponentModal modalHeader="Criar prova" size="lg" isOpen={isOpen} onClose={onClose}>
          <FormWorkout id={id as string} onClose={onClose} showHalfPointsOption={isScoreType} />
        </ComponentModal>

        {hasElements ? (
          <div className="mt-6 w-full">
            <ListWorkout id={id as string} showPontuacaoColumn={isScoreType} />
          </div>
        ) : (
          <EmptyList
            text="Você não possui provas ainda!"
            contentButton="Crie uma prova"
            onClose={() => setIsOpen(true)}
          />
        )}
      </div>
    </Suspense>
  );
};

export default WorkoutWithProvider;
