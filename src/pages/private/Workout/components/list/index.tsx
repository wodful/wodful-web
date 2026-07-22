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
import useCategoryData from '@/hooks/useCategoryData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { paginateItems } from '@/utils/setupList';
import { useEffect, useMemo, useState } from 'react';

interface IListWorkout {
  championshipId: string;
  showPontuacaoColumn?: boolean;
}

const workoutTypeBadgeClass: Record<string, string> = {
  AMRAP: 'bg-purple-100 text-purple-800',
  EMOM: 'bg-blue-100 text-blue-800',
  FORTIME: 'bg-emerald-100 text-emerald-800',
  PR: 'bg-amber-100 text-amber-800',
};

const ListWorkout = ({ championshipId, showPontuacaoColumn = false }: IListWorkout) => {
  const [workoutId, setWorkoutId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, setPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / limit) || 1);
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, limit, page, setPage]);

  const pageData = useMemo(() => paginateItems(filtered, page, limit), [filtered, page, limit]);
  const showPagination = pageData.count > limit;
  const useChips = categories.length > 1 && categories.length <= 8;

  const openDelete = (deleteId: string) => {
    setWorkoutId(deleteId);
    setIsOpen(true);
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
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por prova, tipo ou categoria…"
          aria-label="Buscar provas"
          className="sm:max-w-sm"
        />

        {categories.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Categoria</p>
            {useChips ? (
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoria">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('')}
                  className={[
                    'rounded-chip px-3 py-1.5 text-xs font-semibold transition',
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
                      onClick={() => setCategoryFilter(category.id)}
                      className={[
                        'rounded-chip px-3 py-1.5 text-xs font-semibold transition',
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
            ) : (
              <Select
                className="sm:max-w-xs"
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
            )}
          </div>
        ) : null}
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
                <DataTableHeaderCell>Categoria</DataTableHeaderCell>
                {showPontuacaoColumn ? <DataTableHeaderCell>Pontuação</DataTableHeaderCell> : null}
                <DataTableHeaderCell />
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {pageData.results.map((workout) => (
                <DataTableRow key={workout.id}>
                  <DataTableCell className="!py-2.5 font-medium text-slate-900">
                    {workout.name}
                  </DataTableCell>
                  <DataTableCell className="!py-2.5">
                    <Badge className={workoutTypeBadgeClass[workout.workoutType] ?? ''}>
                      {workout.workoutType}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell className="!py-2.5 text-slate-600">
                    {workout.categoryName}
                  </DataTableCell>
                  {showPontuacaoColumn ? (
                    <DataTableCell className="!py-2.5">
                      {workout.worthHalfPoints ? (
                        <Badge tone="warning">50 pts</Badge>
                      ) : (
                        <Badge tone="neutral">100 pts</Badge>
                      )}
                    </DataTableCell>
                  ) : null}
                  <DataTableCell className="!py-2.5">
                    <RowActions
                      entityLabel={workout.name}
                      onDelete={() => openDelete(workout.id)}
                    />
                  </DataTableCell>
                </DataTableRow>
              ))}
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
