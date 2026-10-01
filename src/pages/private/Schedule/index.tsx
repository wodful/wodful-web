import ComponentModal from '@/components/ComponentModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyList } from '@/components/EmptyList';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { LivePageShell } from '@/components/ui/LivePageShell';
import { CategoryProvider } from '@/contexts/category';
import { ScheduleProvider } from '@/contexts/schedule';
import { WorkoutProvider } from '@/contexts/workout';
import { IIsLiveDTO, IIsOverDTO } from '@/data/interfaces/schedule';
import useScheduleData from '@/hooks/useScheduleData';
import { groupBySlot, slotLaneQuantity, uniqueJoined } from '@/utils/scheduleSlots';
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
  const liveSlot = useMemo(() => {
    const slots = groupBySlot(schedulePages.results ?? []);
    return slots.find((slot) => slot.some((item) => item.isLive)) ?? null;
  }, [schedulePages.results]);

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
            {liveSlot ? (
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
                      {liveSlot[0].hour} · {uniqueJoined(liveSlot.map((item) => item.category.name))} ·{' '}
                      {uniqueJoined(liveSlot.map((item) => item.workout.name))}
                    </p>
                    <p className="text-xs text-slate-600">
                      {uniqueJoined(liveSlot.map((item) => `Bateria ${item.heat}`))} ·{' '}
                      {slotLaneQuantity(liveSlot)} baias
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button
                    variant="secondary"
                    className="!min-h-9 !px-3 !py-1.5 !text-xs"
                    onClick={() => handleIsLive(liveSlot[0].id, false)}
                  >
                    Parar
                  </Button>
                  <Button
                    variant="dangerOutline"
                    className="!min-h-9 !px-3 !py-1.5 !text-xs"
                    onClick={() => setConfirmEndId(liveSlot[0].id)}
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

        <ConfirmModal
          isOpen={!!confirmEndId}
          title="Encerrar atividade"
          description="A bateria será marcada como finalizada."
          confirmLabel="Encerrar"
          tone="danger"
          onConfirm={() => {
            if (confirmEndId) handleIsOver(confirmEndId, true);
            setConfirmEndId(null);
          }}
          onClose={() => setConfirmEndId(null)}
        />

        <ComponentModal
          title="Adicionar atividade ao cronograma"
          description="Horário e uma ou mais categorias na mesma bateria."
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
