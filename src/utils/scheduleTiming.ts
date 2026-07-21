import { addDays, format } from 'date-fns';
import { IPublicSchedule } from '@/data/interfaces/schedule';

const WARMUP_BATTERY_COUNT = 2;

type WarmupAnchor = {
  id: string;
  category: string;
  start: number;
};

export function getScheduleStart(schedule: IPublicSchedule): Date {
  const ymd = format(new Date(schedule.date), 'yyyy-MM-dd');
  return addDays(new Date(`${ymd}T${schedule.hour}`), 1);
}

type TimedActivity = {
  item: IPublicSchedule;
  start: number;
};

function toTimed(schedules: IPublicSchedule[]): TimedActivity[] {
  return schedules
    .map((item) => ({ item, start: getScheduleStart(item).getTime() }))
    .sort((a, b) => a.start - b.start);
}

function storageKey(accessCode: string) {
  return `wodful:warmup-anchor:${accessCode}`;
}

function persistLiveAnchors(accessCode: string, anchors: WarmupAnchor[]) {
  if (!accessCode || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(storageKey(accessCode), JSON.stringify(anchors));
  } catch {
    // ignore quota / private mode
  }
}

function readPersistedAnchors(accessCode: string): WarmupAnchor[] {
  if (!accessCode || typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(storageKey(accessCode));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WarmupAnchor[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function takeNextPending(
  timed: TimedActivity[],
  anchorStart: number,
  limit: number,
  categoryName?: string,
): IPublicSchedule[] {
  const category = categoryName?.toLowerCase();

  return timed
    .filter(
      ({ item, start }) =>
        !item.isLive &&
        !item.isOver &&
        start > anchorStart &&
        (!category || item.category.name.toLowerCase() === category),
    )
    .slice(0, limit)
    .map(({ item }) => item);
}

function pickAfterAnchors(
  timed: TimedActivity[],
  anchors: WarmupAnchor[],
  count: number,
): Set<string> {
  const ids = new Set<string>();

  for (const anchor of anchors) {
    const sameCategory = takeNextPending(
      timed,
      anchor.start,
      count,
      anchor.category,
    );
    const picks =
      sameCategory.length > 0
        ? sameCategory
        : takeNextPending(timed, anchor.start, count);

    picks.forEach((item) => ids.add(item.id));
  }

  return ids;
}

function resolveWarmupAnchors(
  schedules: IPublicSchedule[],
  accessCode: string,
): WarmupAnchor[] {
  const timed = toTimed(schedules);
  const live = timed.filter(({ item }) => item.isLive);

  if (live.length) {
    const anchors = live.map(({ item, start }) => ({
      id: item.id,
      category: item.category.name,
      start,
    }));
    persistLiveAnchors(accessCode, anchors);
    return anchors;
  }

  const latestOverByCategory = new Map<string, WarmupAnchor>();
  for (const { item, start } of timed) {
    if (!item.isOver) continue;
    const key = item.category.name.toLowerCase();
    const prev = latestOverByCategory.get(key);
    if (!prev || start >= prev.start) {
      latestOverByCategory.set(key, {
        id: item.id,
        category: item.category.name,
        start,
      });
    }
  }

  if (latestOverByCategory.size) {
    return Array.from(latestOverByCategory.values());
  }

  return readPersistedAnchors(accessCode);
}

export function findWarmupBatteryIds(
  schedules: IPublicSchedule[],
  accessCode = '',
  count = WARMUP_BATTERY_COUNT,
): Set<string> {
  const timed = toTimed(schedules);
  const anchors = resolveWarmupAnchors(schedules, accessCode);
  if (!anchors.length) return new Set();
  return pickAfterAnchors(timed, anchors, count);
}
