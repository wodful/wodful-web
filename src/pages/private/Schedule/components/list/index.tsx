import { Fragment, useEffect, useMemo, useState } from 'react';

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
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField } from '@/components/ui/FormField';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { RowActions } from '@/components/ui/RowActions';
import { Select } from '@/components/ui/Select';
import { IIsLiveDTO, IIsOverDTO, ISchedule } from '@/data/interfaces/schedule';
import useScheduleData from '@/hooks/useScheduleData';
import { formatDateOnly } from '@/utils/formatDate';
import { groupBySlot, slotLaneQuantity, uniqueJoined } from '@/utils/scheduleSlots';
import { ChevronDown } from 'react-feather';

type StatusFilter = 'all' | 'live' | 'upcoming' | 'over';

interface IListSchedule {
  championshipId: string;
  onRequestEnd: (activityId: string) => void;
  onRequestEdit: (slot: ISchedule[]) => void;
}

function heatAthletes(slot: ISchedule[]) {
  let laneOffset = 0;

  const lanes = slot.flatMap((segment) => {
    const athletes = segment.subscriptions ?? [];
    const count = athletes.length;
    const span = segment.laneQuantity > 0 ? segment.laneQuantity : count;
    const rows = athletes.map((athlete, index) => ({
      key: `${segment.id}-${athlete.nickname}-${index}`,
      nickname: athlete.nickname,
      categoryName: segment.category.name,
      bay: laneOffset + (count - index),
      generalScore: athlete.generalScore,
    }));
    laneOffset += span;
    return rows;
  });

  return lanes.sort((a, b) => b.bay - a.bay);
}

function formatPoints(score: number) {
  return `${score} ${score === 1 ? 'pt' : 'pts'}`;
}

function activityStatus(schedule: ISchedule, nextPendingId?: string) {
  if (schedule.isLive) return 'live' as const;
  if (schedule.isOver) return 'over' as const;
  if (schedule.id === nextPendingId) return 'next' as const;
  return 'scheduled' as const;
}

function startsOpen(status: ReturnType<typeof activityStatus>) {
  return status === 'live' || status === 'next' || status === 'over';
}

const ListSchedule = ({ championshipId, onRequestEnd, onRequestEdit }: IListSchedule) => {
  const [currentTotal, setCurrentTotal] = useState(0);
  const [scheduleId, setScheduleId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [workoutFilter, setWorkoutFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

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
  const slots = useMemo(() => groupBySlot(results), [results]);

  const nextPendingId = useMemo(() => {
    const pending = slots.find((slot) => !slot[0].isLive && !slot[0].isOver);
    return pending?.[0].id;
  }, [slots]);

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
    return slots.filter((slot) => {
      if (categoryFilter && !slot.some((item) => item.category.name === categoryFilter)) {
        return false;
      }
      if (workoutFilter && !slot.some((item) => item.workout.name === workoutFilter)) {
        return false;
      }
      const status = activityStatus(slot[0], nextPendingId);
      if (statusFilter === 'live' && status !== 'live') return false;
      if (statusFilter === 'over' && status !== 'over') return false;
      if (statusFilter === 'upcoming' && status !== 'next' && status !== 'scheduled') {
        return false;
      }
      return true;
    });
  }, [categoryFilter, nextPendingId, slots, statusFilter, workoutFilter]);

  const toggleAthletes = (scheduleId: string, status: ReturnType<typeof activityStatus>) => {
    setExpandedIds((current) => {
      const open = current[scheduleId] ?? startsOpen(status);
      return { ...current, [scheduleId]: !open };
    });
  };

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
      <DeleteData
        isOpen={isOpen}
        title="Remover cronograma"
        onClose={() => setIsOpen(false)}
        removedData="o cronograma"
        confirmDelete={() => Delete(scheduleId)}
      />

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
            {filtered.map((slot) => {
              const schedule = slot[0];
              const status = activityStatus(schedule, nextPendingId);
              const muted = status === 'over';
              const dateLabel = formatDateOnly(schedule.date);
              const showDateHeader = dateLabel !== lastDateLabel;
              if (showDateHeader) lastDateLabel = dateLabel;
              const categoryLabel = uniqueJoined(slot.map((item) => item.category.name));
              const workoutLabel = uniqueJoined(slot.map((item) => item.workout.name));
              const laneTotal = slotLaneQuantity(slot);
              const athletes = heatAthletes(slot);
              const open = expandedIds[schedule.id] ?? startsOpen(status);
              const bandClass =
                status === 'live'
                  ? 'border-l-4 border-l-red-500 bg-red-50/70'
                  : status === 'over'
                    ? 'bg-slate-50 text-slate-400'
                    : open
                      ? 'bg-slate-50/80'
                      : '';

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
                    className={`${bandClass} ${
                      status === 'live' ? 'hover:!bg-red-50/70' : open ? 'hover:!bg-slate-50/80' : ''
                    }`}
                    onClick={() => toggleAthletes(schedule.id, status)}
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
                        <p className="font-medium text-slate-900">{categoryLabel}</p>
                        <p className="text-xs text-slate-500">{workoutLabel}</p>
                      </div>
                      {athletes.length ? (
                        <button
                          type="button"
                          className="mt-1 inline-flex items-center gap-1 rounded-control text-xs font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-expanded={open}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleAthletes(schedule.id, status);
                          }}
                        >
                          {athletes.length} {athletes.length === 1 ? 'atleta' : 'atletas'}
                          <ChevronDown
                            size={14}
                            className={`transition ${open ? 'rotate-180' : ''}`}
                            aria-hidden
                          />
                        </button>
                      ) : null}
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {slot.map((item) => (
                          <Badge
                            key={item.id}
                            tone="neutral"
                            className={muted ? 'opacity-60' : ''}
                          >
                            {slot.length > 1 ? `${item.category.name} · ` : ''}
                            Bat. {item.heat}
                          </Badge>
                        ))}
                        <Badge tone="neutral" className={muted ? 'opacity-60' : ''}>
                          {laneTotal} baias
                        </Badge>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <div
                        className="flex flex-col items-stretch justify-end gap-2 sm:flex-row sm:items-center"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {status === 'next' || status === 'scheduled' ? (
                          <Button
                            variant={status === 'next' ? 'primary' : 'secondary'}
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
                        <RowActions
                          entityLabel={
                            slot.length > 1 ? 'bateria mista' : `bateria ${schedule.heat}`
                          }
                          onEdit={() => onRequestEdit(slot)}
                          onDelete={
                            status === 'next' || status === 'scheduled'
                              ? () => {
                                  setScheduleId(schedule.id);
                                  setIsOpen(true);
                                }
                              : undefined
                          }
                        />
                      </div>
                    </DataTableCell>
                  </DataTableRow>
                  {open && athletes.length ? (
                    <DataTableRow
                      className={`!border-t-0 ${bandClass} ${
                        status === 'live' ? 'hover:!bg-red-50/70' : 'hover:!bg-slate-50/80'
                      }`}
                    >
                      <DataTableCell colSpan={5} className="!px-0 !py-0">
                        <ul className="border-t border-slate-200">
                          {athletes.map((athlete) => (
                            <li
                              key={athlete.key}
                              className="flex min-w-0 items-center gap-3 border-b border-slate-100 px-4 py-2.5 last:border-b-0"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold tabular-nums text-white">
                                {athlete.bay}
                              </span>
                              <span
                                className={`min-w-0 flex-1 truncate text-sm ${
                                  muted ? 'text-slate-400 line-through' : 'text-slate-800'
                                }`}
                              >
                                {slot.length > 1 ? (
                                  <span className="mr-1.5 text-xs text-slate-400">
                                    {athlete.categoryName}
                                  </span>
                                ) : null}
                                {athlete.nickname}
                              </span>
                              {athlete.generalScore != null ? (
                                <span
                                  className={`shrink-0 text-xs tabular-nums ${
                                    muted ? 'text-slate-400 line-through' : 'text-slate-500'
                                  }`}
                                >
                                  {formatPoints(athlete.generalScore)}
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </DataTableCell>
                    </DataTableRow>
                  ) : null}
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
