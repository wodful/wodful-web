import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import ComponentModal from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SetupPageShell } from '@/components/ui/SetupPageShell';
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
  const { List, workouts, isLoading } = useWorkoutData();
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [resultType, setResultType] = useState<string | null>(null);

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (id) List(id);
  }, [List, id]);

  useEffect(() => {
    if (!id) return;
    championshipService
      .getById(id)
      .then((championship: IChampionship) => setResultType(championship.resultType))
      .catch(() => setResultType(null));
  }, [id]);

  const hasElements = useMemo(() => workouts.length > 0, [workouts.length]);
  const isScoreType = resultType === 'SCORE';

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <SetupPageShell
        title="Provas"
        description="Cadastre provas por categoria. Selecione várias de uma vez e ajuste tipo e descrição de cada uma."
        actionLabel="Adicionar prova"
        onAction={() => setIsOpen(true)}
      >
        <ComponentModal
          title="Adicionar prova"
          description="Categorias, tipo e descrição."
          size="xl"
          isOpen={isOpen}
          onClose={onClose}
        >
          <FormWorkout id={id as string} onClose={onClose} showHalfPointsOption={isScoreType} />
        </ComponentModal>

        {isLoading && !hasElements ? (
          <Loader title="Carregando provas..." />
        ) : hasElements ? (
          <ListWorkout championshipId={id as string} showPontuacaoColumn={isScoreType} />
        ) : (
          <EmptyState
            title="Nenhuma prova ainda"
            description="Crie provas vinculadas às categorias do evento."
            actionLabel="Criar prova"
            onAction={() => setIsOpen(true)}
          />
        )}
      </SetupPageShell>
    </Suspense>
  );
};

export default WorkoutWithProvider;
