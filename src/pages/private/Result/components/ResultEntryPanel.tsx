import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'react-feather';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import useResultData from '@/hooks/useResultData';
import useSubscriptionData from '@/hooks/useSubscriptionData';

type ResultEntryPanelProps = {
  categoryId: string;
  workoutId: string;
  workoutName?: string;
  workoutType?: string;
  isTeam?: boolean;
  /** When all results are entered: whether they are public yet. */
  isReleased?: boolean | null;
  onRelease?: () => void;
};

/** Compact continuous entry — inherits category/workout from page filters. */
export function ResultEntryPanel({
  categoryId,
  workoutId,
  workoutName,
  workoutType = 'AMRAP',
  isTeam = false,
  isReleased = null,
  onRelease,
}: ResultEntryPanelProps) {
  const { Create, isLoading } = useResultData();
  const { ListAllByCategory, subscriptions } = useSubscriptionData();

  const [subscriptionId, setSubscriptionId] = useState('');
  const [result, setResult] = useState('');
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const athleteRef = useRef<HTMLSelectElement>(null);
  const resultRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!categoryId || !workoutId) return;
    void ListAllByCategory(categoryId, workoutId);
    setSubscriptionId('');
    setResult('');
    setQuery('');
  }, [ListAllByCategory, categoryId, workoutId]);

  const pending = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions ?? [];
    return (subscriptions ?? []).filter((s) => s.nickname.toLowerCase().includes(q));
  }, [query, subscriptions]);

  const pendingCount = subscriptions?.length ?? 0;
  const canSubmit = Boolean(subscriptionId && result.trim() && !submitting && !isLoading);
  const athleteLabel = isTeam ? 'Equipe' : 'Atleta';
  const showFilter = pendingCount > 8;
  const subject = isTeam ? 'equipes' : 'atletas';

  const resetForNext = () => {
    setSubscriptionId('');
    setResult('');
    setQuery('');
    requestAnimationFrame(() => {
      if (showFilter) {
        document.getElementById('entry-athlete-search')?.focus();
      } else {
        athleteRef.current?.focus();
      }
    });
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const ok = await Create(
        {
          categoryId,
          workoutId,
          subscriptionId,
          result: result.trim(),
        },
        { silent: true },
      );
      if (!ok) return;

      await ListAllByCategory(categoryId, workoutId);
      resetForNext();
    } finally {
      setSubmitting(false);
    }
  };

  const onAthleteChange = (id: string) => {
    setSubscriptionId(id);
    if (id) {
      requestAnimationFrame(() => {
        resultRef.current?.focus();
        resultRef.current?.select();
      });
    }
  };

  if (pendingCount === 0) {
    if (isReleased === true) {
      return (
        <div
          className="flex flex-col gap-3 rounded-surface border border-emerald-200 bg-emerald-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-emerald-100 text-emerald-700">
              <CheckCircle size={16} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Resultados liberados
                {workoutName ? ` · ${workoutName}` : ''}
              </p>
              <p className="mt-0.5 text-sm text-emerald-800/80">
                Todos {isTeam ? 'as' : 'os'} {subject} já têm resultado e o público pode ver.
              </p>
            </div>
          </div>
          {onRelease ? (
            <Button
              type="button"
              variant="secondary"
              className="!min-h-9 shrink-0 border-emerald-300 bg-white text-emerald-950 hover:border-emerald-400"
              onClick={onRelease}
            >
              <EyeOff size={14} aria-hidden />
              Ocultar resultados
            </Button>
          ) : null}
        </div>
      );
    }

    return (
      <div
        className="flex flex-col gap-3 rounded-surface border border-amber-200 bg-amber-50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
        role="status"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-amber-100 text-amber-800">
            <AlertCircle size={16} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-950">
              Pronto para liberar
              {workoutName ? ` · ${workoutName}` : ''}
            </p>
            <p className="mt-0.5 text-sm text-amber-900/80">
              Todos {isTeam ? 'as' : 'os'} {subject} já têm resultado. Liberar para o público ver.
            </p>
          </div>
        </div>
        {onRelease ? (
          <Button
            type="button"
            variant="secondary"
            className="!min-h-9 shrink-0 border-amber-300 bg-white text-amber-950 hover:border-amber-400 hover:text-amber-950"
            onClick={onRelease}
          >
            <Eye size={14} aria-hidden />
            Liberar resultados
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-surface border border-primary/20 bg-primary/[0.04] p-3 sm:p-3.5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Lançar{workoutName ? ` · ${workoutName}` : ''}
          </p>
          <p className="text-xs text-slate-600">
            {pendingCount} {subject} pendente{pendingCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <form
        id="result-entry-panel"
        onSubmit={(e) => void handleSubmit(e)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_auto]"
      >
        <FormField id="entry-athlete" label={athleteLabel}>
          <div className={showFilter ? 'space-y-2' : undefined}>
            {showFilter ? (
              <Input
                id="entry-athlete-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Filtrar ${athleteLabel.toLowerCase()}…`}
                autoComplete="off"
              />
            ) : null}
            <Select
              ref={athleteRef}
              id="entry-athlete"
              value={subscriptionId}
              onChange={(e) => onAthleteChange(e.target.value)}
              required
            >
              <option value="">Selecione…</option>
              {pending.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nickname}
                </option>
              ))}
            </Select>
          </div>
        </FormField>

        <FormField id="entry-result" label="Resultado">
          <Input
            ref={resultRef}
            id="entry-result"
            type={workoutType === 'FORTIME' ? 'time' : 'number'}
            step={workoutType === 'FORTIME' ? 1 : undefined}
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="Resultado"
            required
          />
        </FormField>

        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="hidden text-sm font-medium text-transparent sm:block" aria-hidden>
            .
          </span>
          <Button
            type="submit"
            variant="primary"
            className="!min-h-11 w-full sm:w-auto"
            disabled={!canSubmit}
            isLoading={submitting}
            loadingLabel="Salvando…"
          >
            Adicionar
          </Button>
        </div>
      </form>
    </div>
  );
}
