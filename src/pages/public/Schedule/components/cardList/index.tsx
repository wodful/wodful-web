import { IPublicSchedule } from '@/data/interfaces/schedule';
import useScheduleData from '@/hooks/useScheduleData';
import { formatDateOnly } from '@/utils/formatDate';
import { groupBySlot, slotKey, uniqueJoined } from '@/utils/scheduleSlots';
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
  items: IPublicSchedule[][];
};

type ScheduleSlot = IPublicSchedule[];

function sortByTime(a: IPublicSchedule, b: IPublicSchedule) {
  const dateA = getScheduleStart(a).getTime();
  const dateB = getScheduleStart(b).getTime();
  if (dateA !== dateB) return dateA - dateB;
  return a.hour.localeCompare(b.hour);
}

function sortSlots(a: ScheduleSlot, b: ScheduleSlot) {
  return sortByTime(a[0], b[0]);
}

function placeLabel(place?: number) {
  if (!place) return '';
  return `${place}º lugar`;
}

function showsAthletes(segment: IPublicSchedule) {
  return segment.showAthletes !== false;
}

function laneText(segment: IPublicSchedule, nickname: string, place?: number) {
  if (!showsAthletes(segment)) {
    return placeLabel(place) || nickname;
  }
  return nickname;
}

function matchesSearch(slot: ScheduleSlot, query: string) {
  if (!query) return true;
  return slot.some((segment) => {
    if (segment.workout.name.toLowerCase().includes(query)) return true;
    if (segment.category.name.toLowerCase().includes(query)) return true;
    return (segment.subscriptions ?? []).some((athlete) => {
      const label = laneText(segment, athlete.nickname, athlete.place).toLowerCase();
      if (label.includes(query)) return true;
      return showsAthletes(segment) && athlete.nickname.toLowerCase().includes(query);
    });
  });
}

function segmentSpan(segment: IPublicSchedule) {
  if (segment.laneQuantity && segment.laneQuantity > 0) return segment.laneQuantity;
  return segment.subscriptions?.length ?? 0;
}

/** Higher place number is worse. Unranked (0) stays at the end of the heat. */
function worstFirst(a: { ranking?: number }, b: { ranking?: number }) {
  return (b.ranking ?? 0) - (a.ranking ?? 0);
}

const ListCardPublicSchedule = ({
  search = '',
  categoryName = '',
  accessCode = '',
}: ListCardPublicScheduleProps) => {
  const { schedules } = useScheduleData();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const slots = useMemo(() => groupBySlot(schedules), [schedules]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const category = categoryName.trim().toLowerCase();

    return slots.filter((slot) => {
      if (category && !slot.some((segment) => segment.category.name.toLowerCase() === category)) {
        return false;
      }
      return matchesSearch(slot, query);
    });
  }, [slots, search, categoryName]);

  const warmupIds = useMemo(
    () => findWarmupBatteryIds(schedules, accessCode),
    [schedules, accessCode],
  );

  const isWarmup = useCallback(
    (slot: ScheduleSlot) => slot.some((segment) => warmupIds.has(segment.id)),
    [warmupIds],
  );

  const liveBatteries = useMemo(
    () => filtered.filter((slot) => slot.some((segment) => segment.isLive)).sort(sortSlots),
    [filtered],
  );

  const warmupBatteries = useMemo(
    () =>
      filtered
        .filter((slot) => isWarmup(slot) && !slot.some((segment) => segment.isLive))
        .sort(sortSlots),
    [filtered, isWarmup],
  );

  const dayGroups = useMemo(() => {
    const map = new Map<string, DayGroup>();

    filtered
      .filter((slot) => !slot.some((segment) => segment.isLive) && !isWarmup(slot))
      .sort(sortSlots)
      .forEach((slot) => {
        const key = formatDateOnly(slot[0].date, 'yyyy-MM-dd');
        const label = formatDateOnly(slot[0].date, 'dd/MM');
        const existing = map.get(key);
        if (existing) {
          existing.items.push(slot);
          return;
        }
        map.set(key, { key, label, items: [slot] });
      });

    return Array.from(map.values());
  }, [filtered, isWarmup]);

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
            {liveBatteries.map((slot) => (
              <ScheduleRow
                key={slotKey(slot[0])}
                slot={slot}
                isExpanded={expandedId === slotKey(slot[0])}
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
            {warmupBatteries.map((slot) => (
              <ScheduleRow
                key={slotKey(slot[0])}
                slot={slot}
                isExpanded={expandedId === slotKey(slot[0])}
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
            {group.items.map((slot) => (
              <ScheduleRow
                key={slotKey(slot[0])}
                slot={slot}
                isExpanded={expandedId === slotKey(slot[0])}
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
  slot: ScheduleSlot;
  isExpanded: boolean;
  isWarmup: boolean;
  onParticipantsClick: (scheduleId: string) => void;
};

function ScheduleRow({
  slot,
  isExpanded,
  isWarmup,
  onParticipantsClick,
}: ScheduleRowProps) {
  const schedule = slot[0];
  const mixed = slot.length > 1;
  const workoutLabel = uniqueJoined(slot.map((segment) => segment.workout.name));
  const rowKey = slotKey(schedule);

  let laneOffset = 0;
  const lanes = slot.flatMap((segment) => {
    const source = segment.subscriptions ?? [];
    const athletes = showsAthletes(segment) ? [...source].sort(worstFirst) : [...source];
    const count = athletes.length;
    const rows = athletes.map((subscription, index) => ({
      key: `${segment.id}-${subscription.place ?? subscription.nickname}-${index}`,
      label: laneText(segment, subscription.nickname, subscription.place),
      categoryName: segment.category.name,
      bay: laneOffset + (count - index),
    }));
    laneOffset += segmentSpan(segment);
    return rows;
  });
  const orderedLanes = [...lanes].sort((a, b) => b.bay - a.bay);
  const namedHeat = slot.some((segment) => showsAthletes(segment));
  const countBaias = orderedLanes.length;
  const preview = orderedLanes.slice(0, 3);
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
            {slot.some((segment) => segment.isLive) ? (
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
            {slot.map((segment) => (
              <span
                key={segment.id}
                className="inline-flex rounded-chip bg-gray-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-gray-600"
              >
                {segment.category.name}
              </span>
            ))}
          </div>

          <p className="mt-1 truncate text-sm font-medium capitalize text-gray-800">
            {workoutLabel}
          </p>

          {preview.length && !isExpanded ? (
            <p className="mt-1 truncate text-xs text-gray-400">
              {preview.map((item) => item.label).join(' · ')}
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
          onClick={() => onParticipantsClick(rowKey)}
        >
          {isExpanded
            ? namedHeat
              ? 'Ocultar participantes'
              : 'Ocultar posições'
            : namedHeat
              ? `Participantes (${countBaias})`
              : `Posições (${countBaias})`}
          <ChevronDown
            size={14}
            className={`transition ${isExpanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {isExpanded ? (
          <ul className="list-none space-y-2 bg-white p-0 px-4 py-3">
            {orderedLanes.map((lane) => (
              <li
                key={lane.key}
                className="flex list-none items-center justify-between gap-3"
              >
                <span className="min-w-0 truncate text-sm font-semibold text-gray-700">
                  {mixed ? (
                    <span className="mr-2 text-xs font-medium text-gray-500">
                      {lane.categoryName}
                    </span>
                  ) : null}
                  {lane.label}
                </span>
                <span className="shrink-0 text-xs text-gray-500">
                  Baia {lane.bay}
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
