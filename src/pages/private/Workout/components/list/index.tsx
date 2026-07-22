import ComponentModal from '@/components/ComponentModal';
import DeleteData from '@/components/Delete';
import { Badge } from '@/components/ui/Badge';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { RowActions } from '@/components/ui/RowActions';
import { Select } from '@/components/ui/Select';
import { IWorkout } from '@/data/interfaces/workout';
import useCategoryData from '@/hooks/useCategoryData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { paginateItems } from '@/utils/setupList';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'react-feather';

interface IListWorkout {
  championshipId: string;
  showPontuacaoColumn?: boolean;
}

type WorkoutGroup = {
  name: string;
  items: IWorkout[];
};

const workoutTypeBadgeClass: Record<string, string> = {
  AMRAP: 'bg-purple-100 text-purple-800',
  EMOM: 'bg-blue-100 text-blue-800',
  FORTIME: 'bg-emerald-100 text-emerald-800',
  PR: 'bg-amber-100 text-amber-800',
};

function groupWorkouts(workouts: IWorkout[]): WorkoutGroup[] {
  const map = new Map<string, IWorkout[]>();

  for (const workout of workouts) {
    const key = workout.name.trim() || workout.id;
    const list = map.get(key) ?? [];
    list.push(workout);
    map.set(key, list);
  }

  return [...map.entries()]
    .map(([name, items]) => ({
      name,
      items: [...items].sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName, 'pt-BR'),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

const ListWorkout = ({ championshipId, showPontuacaoColumn = false }: IListWorkout) => {
  const [workoutId, setWorkoutId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { workouts, page, limit, setLimit, setPage, isLoading, Delete } = useWorkoutData();
  const { List: ListCategories, categories } = useCategoryData();

  useEffect(() => {
    if (championshipId) ListCategories(championshipId);
  }, [ListCategories, championshipId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const categoryName =
      categoryFilter && categories.find((c) => c.id === categoryFilter)?.name;

    return workouts.filter((workout) => {
      if (categoryFilter) {
        const matchesId = workout.categoryId
          ? workout.categoryId === categoryFilter
          : false;
        const matchesName = categoryName
          ? workout.categoryName === categoryName
          : false;
        if (!matchesId && !matchesName) return false;
      }
      if (!q) return true;
      return (
        workout.name.toLowerCase().includes(q) ||
        workout.categoryName.toLowerCase().includes(q) ||
        workout.workoutType.toLowerCase().includes(q)
      );
    });
  }, [workouts, search, categoryFilter, categories]);

  const groups = useMemo(() => groupWorkouts(filtered), [filtered]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, setPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(groups.length / limit) || 1);
    if (page > maxPage) setPage(maxPage);
  }, [groups.length, limit, page, setPage]);

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const group of groups) {
        if (next[group.name] === undefined) {
          next[group.name] = group.items.length === 1 || !!search || !!categoryFilter;
        }
      }
      return next;
    });
  }, [groups, search, categoryFilter]);

  const pageData = useMemo(() => paginateItems(groups, page, limit), [groups, page, limit]);
  const showPagination = pageData.count > limit;
  const useChips = categories.length > 1 && categories.length <= 8;
  const uniqueNames = useMemo(
    () => new Set(workouts.map((workout) => workout.name.trim())).size,
    [workouts],
  );

  const openDelete = (deleteId: string) => {
    setWorkoutId(deleteId);
    setIsOpen(true);
  };

  const toggleGroup = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="space-y-4">
      <ComponentModal
        modalHeader="Remover prova"
        size="sm"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DeleteData
          onClose={() => setIsOpen(false)}
          removedData="a prova"
          confirmDelete={() => Delete(workoutId)}
        />
      </ComponentModal>

      <div className="space-y-3 rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por prova, tipo ou categoria…"
            aria-label="Buscar provas"
            className="min-w-0 flex-1"
          />
          {!useChips && categories.length > 0 ? (
            <Select
              className="sm:w-52"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filtrar por categoria"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          ) : null}
        </div>

        {useChips ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoria">
            <button
              type="button"
              aria-pressed={!categoryFilter}
              onClick={() => setCategoryFilter('')}
              className={[
                'rounded-chip px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                !categoryFilter
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
            >
              Todas
            </button>
            {categories.map((category) => {
              const active = category.id === categoryFilter;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategoryFilter(category.id)}
                  className={[
                    'rounded-chip px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    active
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        ) : null}

        <p className="text-xs text-slate-500">
          {workouts.length} provas · {uniqueNames} nomes
        </p>
      </div>

      {pageData.count === 0 ? (
        <EmptyState
          title="Nenhuma prova encontrada"
          description="Ajuste a busca ou o filtro de categoria."
          actionLabel={search || categoryFilter ? 'Limpar filtros' : undefined}
          onAction={
            search || categoryFilter
              ? () => {
                  setSearch('');
                  setCategoryFilter('');
                }
              : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-surface border border-slate-200 bg-white shadow-sm">
          <DataTable containerClassName="!rounded-none !border-0 !shadow-none">
            <DataTableHead>
              <DataTableRow>
                <DataTableHeaderCell>Prova</DataTableHeaderCell>
                <DataTableHeaderCell>Tipo</DataTableHeaderCell>
                <DataTableHeaderCell>Categorias</DataTableHeaderCell>
                {showPontuacaoColumn ? <DataTableHeaderCell>Pontuação</DataTableHeaderCell> : null}
                <DataTableHeaderCell className="text-right">
                  <span className="sr-only">Ações</span>
                </DataTableHeaderCell>
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {pageData.results.map((group) => {
                const isExpanded = !!expanded[group.name];
                const types = [...new Set(group.items.map((item) => item.workoutType))];
                const panelId = `workout-group-${group.name}`;

                return (
                  <Fragment key={group.name}>
                    <DataTableRow className="bg-slate-50/60">
                      <DataTableCell className="!py-2.5">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          onClick={() => toggleGroup(group.name)}
                        >
                          <ChevronDown
                            size={16}
                            aria-hidden
                            className={[
                              'shrink-0 text-slate-500 transition-transform',
                              isExpanded ? 'rotate-0' : '-rotate-90',
                            ].join(' ')}
                          />
                          <span className="font-semibold text-slate-900">{group.name}</span>
                        </button>
                      </DataTableCell>
                      <DataTableCell className="!py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {types.map((type) => (
                            <Badge key={type} className={workoutTypeBadgeClass[type] ?? ''}>
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </DataTableCell>
                      <DataTableCell className="!py-2.5 text-slate-600">
                        {group.items.length}{' '}
                        {group.items.length === 1 ? 'categoria' : 'categorias'}
                      </DataTableCell>
                      {showPontuacaoColumn ? <DataTableCell className="!py-2.5" /> : null}
                      <DataTableCell className="!py-2.5" />
                    </DataTableRow>

                    {isExpanded
                      ? group.items.map((workout, index) => (
                          <DataTableRow key={workout.id}>
                            <DataTableCell className="!py-2 pl-10 text-slate-700">
                              <span id={index === 0 ? panelId : undefined}>
                                {workout.categoryName}
                              </span>
                            </DataTableCell>
                            <DataTableCell className="!py-2">
                              <Badge className={workoutTypeBadgeClass[workout.workoutType] ?? ''}>
                                {workout.workoutType}
                              </Badge>
                            </DataTableCell>
                            <DataTableCell className="!py-2 text-slate-500">—</DataTableCell>
                            {showPontuacaoColumn ? (
                              <DataTableCell className="!py-2">
                                {workout.worthHalfPoints ? (
                                  <Badge tone="warning">50 pts</Badge>
                                ) : (
                                  <Badge tone="neutral">100 pts</Badge>
                                )}
                              </DataTableCell>
                            ) : null}
                            <DataTableCell className="!py-2">
                              <RowActions
                                entityLabel={`${workout.name} · ${workout.categoryName}`}
                                onDelete={() => openDelete(workout.id)}
                              />
                            </DataTableCell>
                          </DataTableRow>
                        ))
                      : null}
                  </Fragment>
                );
              })}
            </DataTableBody>
          </DataTable>

          {showPagination ? (
            <PaginationBar
              page={page}
              limit={limit}
              count={pageData.count}
              currentTotal={pageData.results.length}
              hasPrevious={pageData.previous}
              hasNext={pageData.next}
              isLoading={isLoading}
              limitOptions={[10, 20, 50]}
              onLimitChange={(next) => {
                setLimit(next);
                setPage(1);
              }}
              onPrevious={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ListWorkout;
