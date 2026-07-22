import { Fragment, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal } from 'react-feather';

import ComponentModal from '@/components/ComponentModal';
import DeleteData from '@/components/Delete';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField } from '@/components/ui/FormField';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { Select } from '@/components/ui/Select';
import { IIsLiveDTO, IIsOverDTO, ISchedule } from '@/data/interfaces/schedule';
import useScheduleData from '@/hooks/useScheduleData';
import { incrementAndFormatDate } from '@/utils/formatDate';

type StatusFilter = 'all' | 'live' | 'upcoming' | 'over';

interface IListSchedule {
  championshipId: string;
  onRequestEnd: (activityId: string) => void;
}

function activityStatus(schedule: ISchedule, nextPendingId?: string) {
  if (schedule.isLive) return 'live' as const;
  if (schedule.isOver) return 'over' as const;
  if (schedule.id === nextPendingId) return 'next' as const;
  return 'scheduled' as const;
}

const ListSchedule = ({ championshipId, onRequestEnd }: IListSchedule) => {
  const [currentTotal, setCurrentTotal] = useState(0);
  const [scheduleId, setScheduleId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [workoutFilter, setWorkoutFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const {
    ListPaginated,
    schedulePages,
    page,
    limit,
    setLimit,
    setPage,
    isLoading,
    Delete,
    IsLive,
    IsOver,
  } = useScheduleData();

  useEffect(() => {
    ListPaginated(championshipId);
  }, [ListPaginated, championshipId]);

  useEffect(() => {
    setCurrentTotal(schedulePages.results?.length ?? 0);
  }, [schedulePages.results?.length]);

  const results = schedulePages.results ?? [];

  const nextPendingId = useMemo(() => {
    const pending = results.find((item) => !item.isLive && !item.isOver);
    return pending?.id;
  }, [results]);

  const categories = useMemo(() => {
    return Array.from(new Set(results.map((item) => item.category.name))).sort();
  }, [results]);

  const workouts = useMemo(() => {
    return Array.from(
      new Set(
        results
          .filter((item) => !categoryFilter || item.category.name === categoryFilter)
          .map((item) => item.workout.name),
      ),
    ).sort();
  }, [categoryFilter, results]);

  const filtered = useMemo(() => {
    return results.filter((item) => {
      if (categoryFilter && item.category.name !== categoryFilter) return false;
      if (workoutFilter && item.workout.name !== workoutFilter) return false;
      const status = activityStatus(item, nextPendingId);
      if (statusFilter === 'live' && status !== 'live') return false;
      if (statusFilter === 'over' && status !== 'over') return false;
      if (statusFilter === 'upcoming' && status !== 'next' && status !== 'scheduled') {
        return false;
      }
      return true;
    });
  }, [categoryFilter, nextPendingId, results, statusFilter, workoutFilter]);

  const handleIsLive = (activityId: string, isLive: boolean) => {
    const payload: IIsLiveDTO = { championshipId, activityId, isLive };
    IsLive(payload);
  };

  const handleIsOver = (activityId: string, isOver: boolean) => {
    const payload: IIsOverDTO = { championshipId, activityId, isOver };
    IsOver(payload);
  };

  let lastDateLabel = '';

  return (
    <>
      <ComponentModal
        modalHeader="Remover cronograma"
        size="sm"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DeleteData
          onClose={() => setIsOpen(false)}
          removedData="o cronograma"
          confirmDelete={() => Delete(scheduleId)}
        />
      </ComponentModal>

      <div className="rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField id="sch-cat" label="Categoria">
            <Select
              id="sch-cat"
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setWorkoutFilter('');
              }}
            >
              <option value="">Todas</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="sch-workout" label="Prova">
            <Select
              id="sch-workout"
              value={workoutFilter}
              onChange={(event) => setWorkoutFilter(event.target.value)}
            >
              <option value="">Todas</option>
              {workouts.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="sch-status" label="Status">
            <Select
              id="sch-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="all">Todas</option>
              <option value="live">Ao vivo</option>
              <option value="upcoming">Pendentes</option>
              <option value="over">Encerradas</option>
            </Select>
          </FormField>
        </div>
      </div>

      {!filtered.length ? (
        <EmptyState
          title="Nenhuma atividade neste filtro"
          description="Ajuste categoria, prova ou status para ver o cronograma."
        />
      ) : (
        <DataTable>
          <DataTableHead>
            <DataTableRow>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell>Horário</DataTableHeaderCell>
              <DataTableHeaderCell>Atividade</DataTableHeaderCell>
              <DataTableHeaderCell>Heat</DataTableHeaderCell>
              <DataTableHeaderCell className="text-right">Ações</DataTableHeaderCell>
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {filtered.map((schedule) => {
              const status = activityStatus(schedule, nextPendingId);
              const muted = status === 'over';
              const dateLabel = incrementAndFormatDate(schedule.date);
              const showDateHeader = dateLabel !== lastDateLabel;
              if (showDateHeader) lastDateLabel = dateLabel;

              return (
                <Fragment key={schedule.id}>
                  {showDateHeader ? (
                    <DataTableRow className="bg-slate-50 hover:bg-slate-50">
                      <DataTableCell
                        colSpan={5}
                        className="py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {dateLabel}
                      </DataTableCell>
                    </DataTableRow>
                  ) : null}
                  <DataTableRow
                    className={
                      status === 'live'
                        ? 'border-l-4 border-l-red-500 bg-red-50/70'
                        : status === 'over'
                          ? 'bg-slate-50 text-slate-400'
                          : ''
                    }
                  >
                    <DataTableCell>
                      {status === 'live' ? (
                        <Badge tone="danger" className="gap-1.5">
                          <span className="schedule-live-dot" aria-hidden />
                          Ao vivo
                        </Badge>
                      ) : null}
                      {status === 'over' ? <Badge tone="neutral">Encerrada</Badge> : null}
                      {status === 'next' ? <Badge tone="primary">Próxima</Badge> : null}
                      {status === 'scheduled' ? (
                        <Badge tone="neutral">Agendada</Badge>
                      ) : null}
                    </DataTableCell>
                    <DataTableCell>
                      <p
                        className={`text-base font-semibold tabular-nums text-slate-900 ${
                          muted ? 'line-through' : ''
                        }`}
                      >
                        {schedule.hour}
                      </p>
                    </DataTableCell>
                    <DataTableCell>
                      <div className={muted ? 'line-through' : ''}>
                        <p className="font-medium text-slate-900">{schedule.category.name}</p>
                        <p className="text-xs text-slate-500">{schedule.workout.name}</p>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone="neutral" className={muted ? 'opacity-60' : ''}>
                          Bat. {schedule.heat}
                        </Badge>
                        <Badge tone="neutral" className={muted ? 'opacity-60' : ''}>
                          {schedule.laneQuantity} baias
                        </Badge>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex flex-col items-stretch justify-end gap-2 sm:flex-row sm:items-center">
                        {status === 'next' || status === 'scheduled' ? (
                          <Button
                            variant="primary"
                            className="!min-h-9 !px-3 !py-1.5 !text-xs"
                            onClick={() => handleIsLive(schedule.id, true)}
                          >
                            Iniciar
                          </Button>
                        ) : null}
                        {status === 'live' ? (
                          <>
                            <Button
                              variant="secondary"
                              className="!min-h-9 !px-3 !py-1.5 !text-xs"
                              onClick={() => handleIsLive(schedule.id, false)}
                            >
                              Parar
                            </Button>
                            <Button
                              variant="dangerOutline"
                              className="!min-h-9 !px-3 !py-1.5 !text-xs"
                              onClick={() => onRequestEnd(schedule.id)}
                            >
                              Encerrar
                            </Button>
                          </>
                        ) : null}
                        {status === 'over' ? (
                          <Button
                            variant="ghost"
                            className="!min-h-9 !px-3 !py-1.5 !text-xs"
                            onClick={() => handleIsOver(schedule.id, false)}
                          >
                            Reabrir
                          </Button>
                        ) : null}
                        {status === 'next' || status === 'scheduled' ? (
                          <DropdownMenu>
                            <DropdownMenuButton aria-label="Mais opções">
                              <MoreHorizontal size={18} />
                            </DropdownMenuButton>
                            <DropdownMenuList side="top">
                              <DropdownMenuItem
                                danger
                                onClick={() => {
                                  setScheduleId(schedule.id);
                                  setIsOpen(true);
                                }}
                              >
                                Deletar
                              </DropdownMenuItem>
                            </DropdownMenuList>
                          </DropdownMenu>
                        ) : null}
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                </Fragment>
              );
            })}
          </DataTableBody>
        </DataTable>
      )}

      <PaginationBar
        page={page}
        limit={limit}
        count={schedulePages.count ?? 0}
        currentTotal={currentTotal}
        hasPrevious={!!schedulePages.previous}
        hasNext={!!schedulePages.next}
        isLoading={isLoading}
        limitOptions={[10, 20, 40]}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
        onPrevious={() => setPage(page - 1)}
        onNext={() => setPage(page + 1)}
      />
    </>
  );
};

export default ListSchedule;
