import { ChangeEvent, lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, EyeOff, Search } from 'react-feather';

import ComponentModal from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { LivePageShell } from '@/components/ui/LivePageShell';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { CategoryProvider } from '@/contexts/category';
import { ResultProvider } from '@/contexts/result';
import { SubscriptionProvider } from '@/contexts/subscription';
import { WorkoutProvider } from '@/contexts/workout';
import useCategoryData from '@/hooks/useCategoryData';
import useResultData from '@/hooks/useResultData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { readLiveFilters, writeLiveFilters } from '@/utils/liveFilters';
import ListResults, { type ReleaseFilter } from './components/list';

const ResultForm = lazy(() => import('./components/form'));

const ResultWithProvider = () => (
  <ResultProvider onClose={() => undefined}>
    <CategoryProvider>
      <WorkoutProvider>
        <SubscriptionProvider>
          <Result />
        </SubscriptionProvider>
      </WorkoutProvider>
    </CategoryProvider>
  </ResultProvider>
);

const Result = () => {
  const { id } = useParams();
  const toast = useToast();
  const [resultId, setResultId] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState('');
  const [workoutId, setWorkoutId] = useState('');
  const [releaseFilter, setReleaseFilter] = useState<ReleaseFilter>('all');
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [confirmReleaseOpen, setConfirmReleaseOpen] = useState(false);
  const [workoutReleased, setWorkoutReleased] = useState<boolean | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { List: CategoryList, categories } = useCategoryData();
  const {
    ListPaginated: ListResultsData,
    ListPaginatedByWorkout,
    resultPages,
    GetIsReleasedResult,
    UpdateReleaseResult,
  } = useResultData();
  const { workouts, ListByCategory: ListWorkouts } = useWorkoutData();

  useEffect(() => {
    if (id) CategoryList(id);
  }, [CategoryList, id]);

  useEffect(() => {
    if (!id || !categories.length || hydrated) return;

    const saved = readLiveFilters(id);
    const fallback =
      categories.length === 1 ? categories[0].id : saved.categoryId || '';

    const exists = categories.some((c) => c.id === fallback);
    if (exists) {
      setCategoryId(fallback);
      ListResultsData(fallback);
      ListWorkouts(fallback);
      if (saved.workoutId) {
        setWorkoutId(saved.workoutId);
        ListPaginatedByWorkout(fallback, saved.workoutId);
      }
    }
    setHydrated(true);
  }, [
    ListPaginatedByWorkout,
    ListResultsData,
    ListWorkouts,
    categories,
    hydrated,
    id,
  ]);

  useEffect(() => {
    if (!workoutId) {
      setWorkoutReleased(null);
      return;
    }

    let cancelled = false;
    GetIsReleasedResult(workoutId)
      .then((data) => {
        if (!cancelled) setWorkoutReleased(Boolean(data?.isReleased));
      })
      .catch(() => {
        if (!cancelled) setWorkoutReleased(false);
      });

    return () => {
      cancelled = true;
    };
  }, [GetIsReleasedResult, workoutId, resultPages]);

  const selectWorkout = useCallback(
    (nextWorkoutId: string) => {
      setWorkoutId(nextWorkoutId);
      if (id) writeLiveFilters(id, { workoutId: nextWorkoutId });
      if (!categoryId) return;
      if (nextWorkoutId) {
        ListPaginatedByWorkout(categoryId, nextWorkoutId);
        return;
      }
      ListResultsData(categoryId);
    },
    [ListPaginatedByWorkout, ListResultsData, categoryId, id],
  );

  const openCreate = () => {
    setResultId(undefined);
    setIsOpen(true);
  };

  const openEdit = useCallback((editId: string) => {
    setResultId(editId);
    setIsOpen(true);
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setSearchValue(name);
    if (name.length > 0 && name.length < 3) return;
    if (!categoryId) return;

    if (name.length === 0) {
      if (workoutId) ListPaginatedByWorkout(categoryId, workoutId);
      else ListResultsData(categoryId);
      return;
    }

    if (workoutId) {
      ListPaginatedByWorkout(categoryId, workoutId, name);
      return;
    }
    ListResultsData(categoryId, name);
  };

  const handleChangeCategory = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    setWorkoutId('');
    setSearchValue('');
    setReleaseFilter('all');
    setWorkoutReleased(null);
    setCategoryId(next);
    if (id) writeLiveFilters(id, { categoryId: next, workoutId: '' });

    if (next) {
      ListResultsData(next);
      ListWorkouts(next);
    }
  };

  const openReleaseAction = () => {
    if (!workoutId) {
      toast({
        title: 'Selecione uma prova para liberar ou ocultar os resultados.',
        status: 'warning',
        isClosable: true,
      });
      return;
    }
    setConfirmReleaseOpen(true);
  };

  const confirmReleaseAction = async () => {
    if (!workoutId || !categoryId || workoutReleased === null) return;
    setReleasing(true);
    try {
      await UpdateReleaseResult({
        workoutId,
        categoryId,
        release: !workoutReleased,
      });
      setWorkoutReleased(!workoutReleased);
      setConfirmReleaseOpen(false);
    } finally {
      setReleasing(false);
    }
  };

  const selectedCategoryName =
    categories.find((c) => c.id === categoryId)?.name ?? null;

  const selectedWorkoutName = workouts.find((w) => w.id === workoutId)?.name;

  const hiddenCount = useMemo(
    () => resultPages?.filter((r) => !r.isReleased).length ?? 0,
    [resultPages],
  );

  const releaseButtonLabel =
    workoutReleased === true
      ? `Ocultar · ${selectedWorkoutName}`
      : workoutReleased === false
        ? `Liberar · ${selectedWorkoutName}`
        : selectedWorkoutName
          ? `Liberar / ocultar · ${selectedWorkoutName}`
          : 'Liberar / ocultar · selecione a prova';

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <LivePageShell
        title="Resultados"
        description="Lance scores por categoria e prova. Libere quando o público puder ver."
        actions={
          <Button variant="primary" disabled={!categoryId} onClick={openCreate}>
            Adicionar resultado
          </Button>
        }
      >
        <div className="mb-4 space-y-3 rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="result-category" label="Categoria">
              <Select
                id="result-category"
                value={categoryId}
                onChange={handleChangeCategory}
              >
                <option value="">Selecione a categoria</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              id="result-search"
              label="Buscar participante"
              hint="Mínimo de 3 letras."
            >
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <Input
                  id="result-search"
                  className="!pl-10"
                  value={searchValue}
                  onChange={handleSearchChange}
                  disabled={!categoryId}
                  placeholder="Nome do participante"
                />
              </div>
              {searchValue.length > 0 && searchValue.length < 3 ? (
                <p className="mt-1 text-xs text-amber-700">
                  Digite mais {3 - searchValue.length} letra(s) para buscar.
                </p>
              ) : null}
            </FormField>
          </div>

          {categoryId ? (
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-sm font-medium text-slate-700">Prova</p>
              {workouts.length ? (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por prova">
                  <button
                    type="button"
                    onClick={() => selectWorkout('')}
                    className={[
                      'rounded-chip px-3 py-1.5 text-xs font-semibold transition',
                      !workoutId
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    Todas
                  </button>
                  {workouts.map((workout) => {
                    const active = workout.id === workoutId;
                    return (
                      <button
                        key={workout.id}
                        type="button"
                        onClick={() => selectWorkout(workout.id)}
                        className={[
                          'rounded-chip px-3 py-1.5 text-xs font-semibold transition',
                          active
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                        ].join(' ')}
                      >
                        {workout.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Nenhuma prova nesta categoria.</p>
              )}
            </div>
          ) : null}

          {categoryId ? (
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    ['all', 'Todos'],
                    ['released', 'Liberados'],
                    ['hidden', 'Ocultos'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReleaseFilter(value)}
                    className={[
                      'rounded-chip px-3 py-1 text-xs font-semibold transition',
                      releaseFilter === value
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    {label}
                    {value === 'hidden' && hiddenCount > 0 ? ` (${hiddenCount})` : ''}
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                className="!min-h-9 !px-3 !py-1.5 !text-xs"
                aria-label={releaseButtonLabel}
                onClick={openReleaseAction}
              >
                {workoutReleased ? (
                  <EyeOff size={14} aria-hidden />
                ) : (
                  <Eye size={14} aria-hidden />
                )}
                {releaseButtonLabel}
              </Button>
            </div>
          ) : null}
        </div>

        {!categories.length ? (
          <EmptyState
            title="Nenhuma categoria cadastrada"
            description="Crie categorias no Setup para começar a lançar resultados."
            secondary={
              <Link
                to={`/championships/${id}/categories`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Ir para categorias
              </Link>
            }
          />
        ) : !categoryId ? (
          <EmptyState
            title="Selecione uma categoria"
            description="Escolha a categoria acima para ver e lançar resultados."
          />
        ) : (
          <ListResults
            openEdit={openEdit}
            categoryId={categoryId}
            releaseFilter={releaseFilter}
            workoutLabel={selectedWorkoutName}
            showWorkoutColumn={!workoutId}
          />
        )}

        <ComponentModal
          modalHeader={resultId ? 'Editar resultado' : 'Adicionar resultado'}
          size="lg"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <ResultForm onClose={() => setIsOpen(false)} oldResultId={resultId} />
        </ComponentModal>

        <ComponentModal
          modalHeader={workoutReleased ? 'Ocultar resultados' : 'Liberar resultados'}
          size="sm"
          isOpen={confirmReleaseOpen}
          onClose={() => setConfirmReleaseOpen(false)}
        >
          <div className="flex flex-col gap-5 pb-2">
            <p className="text-sm text-slate-700">
              {workoutReleased ? (
                <>
                  Ocultar os resultados de{' '}
                  <strong>{selectedWorkoutName}</strong> ({selectedCategoryName}) do
                  público?
                </>
              ) : (
                <>
                  Liberar os resultados de{' '}
                  <strong>{selectedWorkoutName}</strong> ({selectedCategoryName}) para o
                  público?
                </>
              )}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant={workoutReleased ? 'danger' : 'primary'}
                className="w-full"
                isLoading={releasing}
                onClick={() => void confirmReleaseAction()}
              >
                {workoutReleased ? 'Ocultar' : 'Liberar'}
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                disabled={releasing}
                onClick={() => setConfirmReleaseOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </ComponentModal>
      </LivePageShell>
    </Suspense>
  );
};

export default ResultWithProvider;
