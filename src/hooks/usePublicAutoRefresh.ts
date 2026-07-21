import { useCallback, useEffect, useState } from 'react';

function formatRelativeUpdated(lastUpdatedAt: number, now: number) {
  const seconds = Math.max(0, Math.floor((now - lastUpdatedAt) / 1000));
  if (seconds < 10) return 'Atualizado agora';
  if (seconds < 60) return `Atualizado há ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return 'Atualizado há 1 min';
  return `Atualizado há ${minutes} min`;
}

type UsePublicAutoRefreshOptions = {
  enabled?: boolean;
  intervalMs?: number;
  onRefresh: () => void | Promise<void>;
};

export function usePublicAutoRefresh({
  enabled = true,
  intervalMs = 45000,
  onRefresh,
}: UsePublicAutoRefreshOptions) {
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(
    async (manual = false) => {
      if (!enabled) return;
      setIsRefreshing(true);
      try {
        await onRefresh();
        setLastUpdatedAt(Date.now());
        if (manual) setNowTick(Date.now());
      } finally {
        setIsRefreshing(false);
      }
    },
    [enabled, onRefresh],
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const id = window.setInterval(() => {
      void refresh(false);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, refresh]);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 5000);
    return () => window.clearInterval(id);
  }, []);

  return {
    isRefreshing,
    secondsSinceUpdate: Math.max(
      0,
      Math.floor((nowTick - lastUpdatedAt) / 1000),
    ),
    updatedLabel: formatRelativeUpdated(lastUpdatedAt, nowTick),
    refresh: () => refresh(true),
  };
}
