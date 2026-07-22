const PREFIX = 'wodful:live-filters:';

type LiveFilters = {
  categoryId?: string;
  workoutId?: string;
};

export function readLiveFilters(championshipId: string): LiveFilters {
  try {
    const raw = localStorage.getItem(`${PREFIX}${championshipId}`);
    if (!raw) return {};
    return JSON.parse(raw) as LiveFilters;
  } catch {
    return {};
  }
}

export function writeLiveFilters(championshipId: string, next: LiveFilters) {
  try {
    const prev = readLiveFilters(championshipId);
    localStorage.setItem(`${PREFIX}${championshipId}`, JSON.stringify({ ...prev, ...next }));
  } catch {
    // ignore quota / private mode
  }
}
