import { IPublicSchedule } from '@/data/interfaces/schedule';
import { toDateOnlyString } from '@/utils/formatDate';

const WARMUP_BATTERY_COUNT = 2;
const PRODUCT_TZ_OFFSET = '-03:00';

type WarmupAnchor = {
  id: string;
  start: number;
};

/** Combine schedule @db.Date + hour as America/Sao_Paulo instant (no +1 hack). */
export function getScheduleStart(schedule: IPublicSchedule): Date {
  const ymd = toDateOnlyString(schedule.date);
  const hour = schedule.hour?.length === 5 ? `${schedule.hour}:00` : schedule.hour;
  return new Date(`${ymd}T${hour}${PRODUCT_TZ_OFFSET}`);
}

type TimedActivity = {
  item: IPublicSchedule;
  start: number;
};

function toTimed(schedules: IPublicSchedule[]): TimedActivity[] {
  const sorted = schedules
    .map((item) => ({ item, start: getScheduleStart(item).getTime() }))
    .sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return (a.item.slotOrder ?? 0) - (b.item.slotOrder ?? 0);
    });

  const seen = new Set<string>();
  const collapsed: TimedActivity[] = [];
  sorted.forEach((entry) => {
    const key = entry.item.slotId || entry.item.id;
    if (seen.has(key)) return;
    seen.add(key);
    collapsed.push(entry);
  });
  return collapsed;
}

function storageKey(accessCode: string) {
  return `wodful:warmup-anchor:${accessCode}`;
}

function persistLiveAnchor(accessCode: string, anchor: WarmupAnchor) {
  if (!accessCode || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(storageKey(accessCode), JSON.stringify(anchor));
  } catch {
    // ignore quota / private mode
  }
}

function clearPersistedAnchor(accessCode: string) {
  if (!accessCode || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(storageKey(accessCode));
  } catch {
    // ignore private mode
  }
}

function readPersistedAnchor(accessCode: string): WarmupAnchor | null {
  if (!accessCode || typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(storageKey(accessCode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WarmupAnchor | WarmupAnchor[];
    // Compat: versões antigas gravavam um array de âncoras
    if (Array.isArray(parsed)) {
      if (!parsed.length) return null;
      return parsed.reduce((latest, item) =>
        item.start >= latest.start ? item : latest,
      );
    }
    if (parsed && typeof parsed.start === 'number') return parsed;
    return null;
  } catch {
    return null;
  }
}

function takeNextPendingByTime(
  timed: TimedActivity[],
  anchorStart: number,
  limit: number,
): IPublicSchedule[] {
  return timed
    .filter(
      ({ item, start }) =>
        !item.isLive && !item.isOver && start > anchorStart,
    )
    .slice(0, limit)
    .map(({ item }) => item);
}

function latestByStart(items: TimedActivity[]): TimedActivity | null {
  if (!items.length) return null;
  return items.reduce((latest, item) =>
    item.start >= latest.start ? item : latest,
  );
}

function resolveWarmupAnchor(
  schedules: IPublicSchedule[],
  accessCode: string,
): WarmupAnchor | null {
  const timed = toTimed(schedules);
  const live = timed.filter(({ item }) => item.isLive);

  if (live.length) {
    const current = latestByStart(live)!;
    const anchor = { id: current.item.id, start: current.start };
    persistLiveAnchor(accessCode, anchor);
    return anchor;
  }

  const latestOver = latestByStart(timed.filter(({ item }) => item.isOver));
  const persisted = readPersistedAnchor(accessCode);

  // 1ª prova iniciada e parada sem encerrar: limpa o token
  if (persisted && !latestOver) {
    clearPersistedAnchor(accessCode);
    return null;
  }

  // Gap entre baterias: preferir o LIVE recente da sessão, se for mais novo
  if (persisted && latestOver && persisted.start >= latestOver.start) {
    return persisted;
  }

  if (latestOver) {
    return { id: latestOver.item.id, start: latestOver.start };
  }

  return null;
}

export function findWarmupBatteryIds(
  schedules: IPublicSchedule[],
  accessCode = '',
  count = WARMUP_BATTERY_COUNT,
): Set<string> {
  const timed = toTimed(schedules);
  const anchor = resolveWarmupAnchor(schedules, accessCode);
  if (!anchor) return new Set();

  return new Set(
    takeNextPendingByTime(timed, anchor.start, count).map((item) => item.id),
  );
}
