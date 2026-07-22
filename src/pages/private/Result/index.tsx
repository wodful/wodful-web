import { ChangeEvent, lazy, Suspense, useCallback, useEffect, useState } from 'react';

import ComponentModal from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CategoryProvider } from '@/contexts/category';
import { ResultProvider } from '@/contexts/result';
import { SubscriptionProvider } from '@/contexts/subscription';
import { WorkoutProvider } from '@/contexts/workout';
import useCategoryData from '@/hooks/useCategoryData';
import useResultData from '@/hooks/useResultData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { Menu as MenuIcon, Search } from 'react-feather';
import { useParams } from 'react-router-dom';

const ResultForm = lazy(() => import('./components/form'));
const ListResults = lazy(() => import('./components/list'));
const ReleaseResultsForm = lazy(() => import('./components/releaseResults'));

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
  const [selectedCategory, setSelectedCategory] = useState<string>('Sem categoria');
  const [resultId, setResultId] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string>('');
  const [workoutId, setWorkoutId] = useState<string>('');
  const [isOpenReleaseResults, setIsOpenReleaseResults] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const { List: CategoryList, categories } = useCategoryData();
  const { ListPaginated: ListResultsData, ListPaginatedByWorkout } = useResultData();
  const { workouts, ListByCategory: ListWorkouts } = useWorkoutData();

  useEffect(() => {
    if (id) {
      CategoryList(id);
    }
  }, [CategoryList, id]);

  const openCreate = () => {
    setResultId(undefined);
    setIsOpen(true);
  };

  const openReleaseResults = () => {
    setIsOpenReleaseResults(true);
  };

  const openEdit = useCallback((editId: string) => {
    setResultId(editId);
    setIsOpen(true);
  }, []);

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    const nameLength = event.target.value.length;

    if (nameLength < 3) {
      return;
    }

    if (nameLength >= 3 && workoutId) {
      ListPaginatedByWorkout(categoryId, workoutId, name);
      return;
    }

    if (nameLength >= 3 && categoryId) {
      ListResultsData(categoryId, name);
      return;
    }
  };

  const handleChangeCategory = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (event.target.value) {
        ListResultsData(event.target.value);
        setCategoryId(event.target.value);
        setSelectedCategory(
          categories.find((selected) => selected.id === event.target.value)!.name,
        );
        ListWorkouts(event.target.value);
        return;
      }
      setCategoryId('');
    },
    [ListResultsData, ListWorkouts, categories],
  );

  const handleChangeWorkout = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const nextWorkoutId = event.target.value;
      if (categoryId) {
        setWorkoutId(nextWorkoutId);
        ListPaginatedByWorkout(categoryId, event.target.value);
      }
    },
    [ListPaginatedByWorkout, categoryId],
  );

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <main className="flex w-full flex-col items-center p-6" role="main">
        <section
          className="flex w-full flex-col items-start justify-between gap-4 lg:flex-row lg:items-end"
          role="textbox"
        >
          <article className="flex flex-col gap-3" role="textbox">
            <h1 className="text-2xl font-bold text-slate-900" role="heading">
              Resultados
            </h1>
            <span
              className="inline-flex w-fit rounded border border-slate-500 px-2 py-0.5 text-xs font-bold capitalize text-slate-500"
              role="textbox"
            >
              Categoria: {selectedCategory}
            </span>
          </article>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:justify-end">
            <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
              <Search
                size={20}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                className="!pl-10"
                onChange={handleOnChange}
                disabled={!categories.length || !categoryId}
                placeholder="Buscar participante"
              />
            </div>
            <Select
              className="min-w-[180px]"
              disabled={!categories.length || !categoryId}
              id="workout"
              value={workoutId}
              onChange={(event) => handleChangeWorkout(event)}
            >
              <option value="">Selecione uma prova</option>
              {workouts?.map((workout) => (
                <option key={workout.id} value={workout.id}>
                  {workout.name}
                </option>
              ))}
            </Select>
            <Select
              className="min-w-[180px]"
              id="category"
              value={categoryId}
              onChange={(event) => handleChangeCategory(event)}
            >
              <option value="">Selecione a categoria</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <DropdownMenu>
              <DropdownMenuButton
                aria-label="Opções"
                className="!h-11 !w-auto gap-2 px-4 text-sm font-semibold text-slate-700"
              >
                <MenuIcon size={20} aria-hidden />
                Opções
              </DropdownMenuButton>
              <DropdownMenuList>
                <DropdownMenuItem onClick={() => openReleaseResults()}>
                  Liberar / Ocultar resultados
                </DropdownMenuItem>
              </DropdownMenuList>
            </DropdownMenu>
            <Button variant="primary" className="min-w-[170px] w-full sm:w-auto" onClick={openCreate}>
              Adicionar resultado
            </Button>
          </div>
        </section>
        <ComponentModal
          modalHeader={resultId ? 'Editar resultado' : 'Adicionar resultado'}
          size="lg"
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <ResultForm onClose={() => setIsOpen(false)} oldResultId={resultId} />
        </ComponentModal>

        <ComponentModal
          modalHeader="Liberar / Ocultar resultados"
          size="lg"
          isOpen={isOpenReleaseResults}
          onClose={() => setIsOpenReleaseResults(false)}
        >
          <ReleaseResultsForm onClose={() => setIsOpenReleaseResults(false)} />
        </ComponentModal>
        <section className="mt-6 w-full">
          <ListResults openEdit={openEdit} categoryId={categoryId} />
        </section>
      </main>
    </Suspense>
  );
};

export default ResultWithProvider;
