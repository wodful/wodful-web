import ComponentModal from '@/components/ComponentModal';
import { EmptyList } from '@/components/EmptyList';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { LivePageShell } from '@/components/ui/LivePageShell';
import { CategoryProvider } from '@/contexts/category';
import { ScheduleProvider } from '@/contexts/schedule';
import { WorkoutProvider } from '@/contexts/workout';
import { IIsLiveDTO, IIsOverDTO } from '@/data/interfaces/schedule';
import useScheduleData from '@/hooks/useScheduleData';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { Radio } from 'react-feather';
import { useParams } from 'react-router-dom';
import ScheduleForm from './components/form';
import ListSchedule from './components/list';

const ScheduleWithProvider = () => (
  <ScheduleProvider onClose={() => undefined}>
    <CategoryProvider>
      <WorkoutProvider>
        <Schedule />
      </WorkoutProvider>
    </CategoryProvider>
  </ScheduleProvider>
);

const Schedule = () => {
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEndId, setConfirmEndId] = useState<string | null>(null);

  const { schedulePages, IsLive, IsOver } = useScheduleData();

  const hasElements = useMemo(() => schedulePages.count !== 0, [schedulePages]);
  const liveActivity = useMemo(
    () => schedulePages.results?.find((item) => item.isLive),
    [schedulePages.results],
  );

  const handleIsLive = useCallback(
    (activityId: string, isLive: boolean) => {
      if (!id) return;
      const payload: IIsLiveDTO = { championshipId: id, activityId, isLive };
      IsLive(payload);
    },
    [IsLive, id],
  );

  const handleIsOver = useCallback(
    (activityId: string, isOver: boolean) => {
      if (!id) return;
      const payload: IIsOverDTO = { championshipId: id, activityId, isOver };
      IsOver(payload);
    },
    [IsOver, id],
  );

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <LivePageShell
        title="Cronograma"
        description="Gerencie suas baterias do evento."
        actions={
          hasElements ? (
            <Button variant="primary" onClick={() => setIsOpen(true)}>
              Adicionar atividade
            </Button>
          ) : null
        }
      >
        {hasElements ? (
          <div className="space-y-4">
            {liveActivity ? (
              <div
                className="flex flex-col gap-3 rounded-surface border border-red-200 border-l-4 border-l-red-500 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                    <Radio size={16} aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      Ao vivo agora
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {liveActivity.hour} · {liveActivity.category.name} ·{' '}
                      {liveActivity.workout.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      Bateria {liveActivity.heat} · {liveActivity.laneQuantity} baias
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button
                    variant="secondary"
                    className="!min-h-9 !px-3 !py-1.5 !text-xs"
                    onClick={() => handleIsLive(liveActivity.id, false)}
                  >
                    Parar
                  </Button>
                  <Button
                    variant="dangerOutline"
                    className="!min-h-9 !px-3 !py-1.5 !text-xs"
                    onClick={() => setConfirmEndId(liveActivity.id)}
                  >
                    Encerrar
                  </Button>
                </div>
              </div>
            ) : null}

            <ListSchedule
              championshipId={id as string}
              onRequestEnd={(activityId) => setConfirmEndId(activityId)}
            />
          </div>
        ) : (
          <EmptyList
            text="Você não possui um cronograma ainda!"
            contentButton="Crie um cronograma"
            onClose={() => setIsOpen(true)}
          />
        )}

        <ComponentModal
          modalHeader="Encerrar atividade"
          size="sm"
          isOpen={!!confirmEndId}
          onClose={() => setConfirmEndId(null)}
        >
          <div className="flex w-full flex-col gap-5 pb-2">
            <p className="text-sm text-slate-700">
              Encerrar marca a bateria como finalizada. Você poderá reabrir depois, se precisar.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  if (confirmEndId) handleIsOver(confirmEndId, true);
                  setConfirmEndId(null);
                }}
              >
                Encerrar
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setConfirmEndId(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </ComponentModal>

        <ComponentModal
          modalHeader="Adicionar atividade ao cronograma"
          size="lg"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <ScheduleForm onClose={() => setIsOpen(false)} />
        </ComponentModal>
      </LivePageShell>
    </Suspense>
  );
};

export default ScheduleWithProvider;
