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
import { ICategory } from '@/data/interfaces/category';
import useCategoryData from '@/hooks/useCategoryData';
import {
  categoryFormatLabel,
  categoryFormatTone,
} from '@/utils/categoryFormat';
import { paginateItems } from '@/utils/setupList';
import { useEffect, useMemo, useState } from 'react';

interface IListCategory {
  openEdit: (category: ICategory) => void;
}

const formatFilters = [
  { value: 0, label: 'Todos' },
  { value: 1, label: 'Individual' },
  { value: 2, label: 'Dupla' },
  { value: 3, label: 'Trio' },
  { value: 4, label: 'Time' },
] as const;

function matchesFormatFilter(members: number, filter: number) {
  if (filter === 0) return true;
  if (filter === 4) return members >= 4;
  return members === filter;
}

const ListCategory = ({ openEdit }: IListCategory) => {
  const [categoryId, setCategoryId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState(0);

  const { categories, page, limit, setLimit, setPage, isLoading, Delete } = useCategoryData();

  const formatCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: categories.length, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const category of categories) {
      if (category.members >= 4) counts[4] += 1;
      else if (counts[category.members] !== undefined) counts[category.members] += 1;
    }
    return counts;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((category) => {
      if (!matchesFormatFilter(category.members, formatFilter)) return false;
      if (!q) return true;
      const format = categoryFormatLabel(category.members).toLowerCase();
      return (
        category.name.toLowerCase().includes(q) ||
        format.includes(q) ||
        (category.description ?? '').toLowerCase().includes(q)
      );
    });
  }, [categories, search, formatFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, formatFilter, setPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / limit) || 1);
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, limit, page, setPage]);

  const pageData = useMemo(() => paginateItems(filtered, page, limit), [filtered, page, limit]);
  const showPagination = pageData.count > limit;
  const hasActiveFilters = !!search.trim() || formatFilter !== 0;

  const openDelete = (deleteId: string) => {
    setCategoryId(deleteId);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <ComponentModal
        modalHeader="Remover categoria"
        size="sm"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DeleteData
          onClose={() => setIsOpen(false)}
          removedData="a categoria"
          confirmDelete={() => Delete(categoryId)}
        />
      </ComponentModal>

      <div className="space-y-3 rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, formato ou descrição…"
          aria-label="Buscar categorias"
          className="min-w-0 w-full"
        />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por formato">
          {formatFilters.map((option) => {
            const active = formatFilter === option.value;
            const count = formatCounts[option.value] ?? 0;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setFormatFilter(option.value)}
                className={[
                  'rounded-chip px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  active
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {option.label}
                <span className={active ? 'ml-1.5 text-white/80' : 'ml-1.5 text-slate-400'}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">
          {categories.length}{' '}
          {categories.length === 1 ? 'categoria' : 'categorias'}
          {hasActiveFilters ? ` · ${filtered.length} no filtro` : ''}
        </p>
      </div>

      {pageData.count === 0 ? (
        <EmptyState
          title="Nenhuma categoria encontrada"
          description="Ajuste a busca ou o filtro de formato."
          actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
          onAction={
            hasActiveFilters
              ? () => {
                  setSearch('');
                  setFormatFilter(0);
                }
              : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-surface border border-slate-200 bg-white shadow-sm">
          <DataTable containerClassName="!rounded-none !border-0 !shadow-none">
            <DataTableHead>
              <DataTableRow>
                <DataTableHeaderCell>Categoria</DataTableHeaderCell>
                <DataTableHeaderCell>Formato</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">
                  <span className="sr-only">Ações</span>
                </DataTableHeaderCell>
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {pageData.results.map((category) => {
                const description = category.description?.trim();
                return (
                  <DataTableRow key={category.id}>
                    <DataTableCell>
                      <div className="min-w-0 max-w-md">
                        <p className="font-medium text-slate-900">{category.name}</p>
                        {description ? (
                          <p
                            className="mt-0.5 truncate text-xs text-slate-500"
                            title={description}
                          >
                            {description}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-slate-400">Sem descrição</p>
                        )}
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <Badge tone={categoryFormatTone(category.members)}>
                        {categoryFormatLabel(category.members)}
                      </Badge>
                    </DataTableCell>
                    <DataTableCell>
                      <RowActions
                        entityLabel={category.name}
                        onEdit={() => openEdit(category)}
                        onDelete={() => openDelete(category.id)}
                      />
                    </DataTableCell>
                  </DataTableRow>
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

export default ListCategory;
