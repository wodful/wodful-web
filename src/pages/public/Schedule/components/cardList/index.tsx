import { IPublicSchedule } from '@/data/interfaces/schedule';
import useScheduleData from '@/hooks/useScheduleData';
import { incrementAndFormatDate } from '@/utils/formatDate';
import { findWarmupBatteryIds, getScheduleStart } from '@/utils/scheduleTiming';
import { useCallback, useMemo, useState } from 'react';
import { ChevronDown, Clipboard } from 'react-feather';

type ListCardPublicScheduleProps = {
  search?: string;
  categoryName?: string;
  accessCode?: string;
};

type DayGroup = {
  key: string;
  label: string;
  items: IPublicSchedule[];
};

function sortByTime(a: IPublicSchedule, b: IPublicSchedule) {
  const dateA = getScheduleStart(a).getTime();
  const dateB = getScheduleStart(b).getTime();
  if (dateA !== dateB) return dateA - dateB;
  return a.hour.localeCompare(b.hour);
}

function matchesSearch(schedule: IPublicSchedule, query: string) {
  if (!query) return true;
  const nicknames = (schedule.subscriptions ?? [])
    .map((item) => item.nickname.toLowerCase())
    .join(' ');
  return (
    nicknames.includes(query) ||
    schedule.workout.name.toLowerCase().includes(query) ||
    schedule.category.name.toLowerCase().includes(query)
  );
}

const ListCardPublicSchedule = ({
  search = '',
  categoryName = '',
  accessCode = '',
}: ListCardPublicScheduleProps) => {
  const { schedules } = useScheduleData();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const category = categoryName.trim().toLowerCase();

    return schedules.filter((schedule) => {
      if (category && schedule.category.name.toLowerCase() !== category) {
        return false;
      }
      return matchesSearch(schedule, query);
    });
  }, [schedules, search, categoryName]);

  const warmupIds = useMemo(
    () => findWarmupBatteryIds(schedules, accessCode),
    [schedules, accessCode],
  );

  const liveBatteries = useMemo(
    () => filtered.filter((item) => item.isLive).sort(sortByTime),
    [filtered],
  );

  const warmupBatteries = useMemo(
    () =>
      filtered
        .filter((item) => warmupIds.has(item.id))
        .sort(sortByTime),
    [filtered, warmupIds],
  );

  const dayGroups = useMemo(() => {
    const map = new Map<string, DayGroup>();

    filtered
      .filter((item) => !item.isLive && !warmupIds.has(item.id))
      .sort(sortByTime)
      .forEach((schedule) => {
        const key = incrementAndFormatDate(schedule.date, 'yyyy-MM-dd');
        const label = incrementAndFormatDate(schedule.date, 'dd/MM');
        const existing = map.get(key);
        if (existing) {
          existing.items.push(schedule);
          return;
        }
        map.set(key, { key, label, items: [schedule] });
      });

    return Array.from(map.values());
  }, [filtered, warmupIds]);

  const handleParticipantsClick = useCallback((scheduleId: string) => {
    setExpandedId((current) => (current === scheduleId ? null : scheduleId));
  }, []);

  if (!schedules.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-surface border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
        <Clipboard size={56} className="text-gray-700" aria-hidden />
        <p className="font-semibold text-primary">Cronograma sem atividades!</p>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="rounded-surface border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
        <p className="font-medium text-gray-800">Nenhuma bateria encontrada</p>
        <p className="mt-1 text-sm text-gray-500">
          Ajuste a categoria ou a busca e tente de novo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {liveBatteries.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
            Ao vivo
          </h2>
          <ul className="list-none divide-y divide-red-100 overflow-hidden rounded-surface border border-red-200 border-l-4 border-l-red-500 bg-white p-0">
            {liveBatteries.map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                schedule={schedule}
                isExpanded={expandedId === schedule.id}
                isWarmup={false}
                onParticipantsClick={handleParticipantsClick}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {warmupBatteries.length ? (
        <section className="flex flex-col gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
              Aquecimento
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Dirija-se à área de aquecimento.
            </p>
          </div>
          <ul className="list-none divide-y divide-primary/10 overflow-hidden rounded-surface border border-primary/25 border-l-4 border-l-primary bg-white p-0">
            {warmupBatteries.map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                schedule={schedule}
                isExpanded={expandedId === schedule.id}
                isWarmup
                onParticipantsClick={handleParticipantsClick}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {dayGroups.map((group) => (
        <section key={group.key} className="flex flex-col gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {group.label}
          </h2>
          <ul className="list-none divide-y divide-gray-100 overflow-hidden rounded-surface border border-gray-200 bg-white p-0">
            {group.items.map((schedule) => (
              <ScheduleRow
                key={schedule.id}
                schedule={schedule}
                isExpanded={expandedId === schedule.id}
                isWarmup={false}
                onParticipantsClick={handleParticipantsClick}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

type ScheduleRowProps = {
  schedule: IPublicSchedule;
  isExpanded: boolean;
  isWarmup: boolean;
  onParticipantsClick: (scheduleId: string) => void;
};

function ScheduleRow({
  schedule,
  isExpanded,
  isWarmup,
  onParticipantsClick,
}: ScheduleRowProps) {
  const countBaias = schedule.subscriptions?.length ?? 0;
  const preview = (schedule.subscriptions ?? []).slice(0, 3);
  const remaining = Math.max(countBaias - preview.length, 0);

  return (
    <li className="list-none bg-white">
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="min-w-[3.25rem] shrink-0 pt-0.5">
          <p className="text-base font-bold tabular-nums text-gray-900">
            {schedule.hour}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {schedule.isLive ? (
              <span className="schedule-live-badge" aria-label="Ao vivo">
                <span className="schedule-live-dot" aria-hidden />
                Live
              </span>
            ) : null}
            {isWarmup ? (
              <span className="inline-flex items-center rounded-chip border border-primary/30 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                Aquecimento liberado
              </span>
            ) : null}
            <span className="inline-flex rounded-chip bg-gray-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-gray-600">
              {schedule.category.name}
            </span>
          </div>

          <p className="mt-1 truncate text-sm font-medium capitalize text-gray-800">
            {schedule.workout.name}
          </p>

          {preview.length && !isExpanded ? (
            <p className="mt-1 truncate text-xs text-gray-400">
              {preview.map((item) => item.nickname).join(' · ')}
              {remaining > 0 ? ` · +${remaining}` : ''}
            </p>
          ) : null}
        </div>
      </div>

      <div className="border-t border-gray-100">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
          aria-expanded={isExpanded}
          onClick={() => onParticipantsClick(schedule.id)}
        >
          {isExpanded
            ? 'Ocultar participantes'
            : `Participantes (${countBaias})`}
          <ChevronDown
            size={14}
            className={`transition ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {isExpanded ? (
          <ul className="list-none space-y-2 bg-white p-0 px-4 py-3">
            {schedule.subscriptions?.map((subscription, index) => (
              <li
                key={`${schedule.id}-${subscription.nickname}-${index}`}
                className="flex list-none items-center justify-between gap-3"
              >
                <span className="truncate text-sm font-semibold text-gray-700">
                  {subscription.nickname}
                </span>
                <span className="shrink-0 text-xs text-gray-500">
                  Baia {Math.abs(index - countBaias)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

export default ListCardPublicSchedule;
