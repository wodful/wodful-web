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
import { paginateItems } from '@/utils/setupList';
import { useEffect, useMemo, useState } from 'react';

interface IListCategory {
  openEdit: (category: ICategory) => void;
}

const tagMembers: Record<number, { label: string; tone: 'primary' | 'success' | 'neutral' }> = {
  1: { label: 'Individual', tone: 'primary' },
  2: { label: 'Dupla', tone: 'success' },
  3: { label: 'Trio', tone: 'primary' },
  4: { label: 'Time', tone: 'neutral' },
  5: { label: 'Time', tone: 'neutral' },
  6: { label: 'Time', tone: 'neutral' },
};

const ListCategory = ({ openEdit }: IListCategory) => {
  const [categoryId, setCategoryId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { categories, page, limit, setLimit, setPage, isLoading, Delete } = useCategoryData();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(q) ||
        (tagMembers[category.members]?.label ?? '').toLowerCase().includes(q),
    );
  }, [categories, search]);

  useEffect(() => {
    setPage(1);
  }, [search, setPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / limit) || 1);
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, limit, page, setPage]);

  const pageData = useMemo(() => paginateItems(filtered, page, limit), [filtered, page, limit]);
  const showPagination = pageData.count > limit;

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

      <div className="rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou formato…"
          aria-label="Buscar categorias"
          className="sm:max-w-sm"
        />
      </div>

      {pageData.count === 0 ? (
        <EmptyState
          title="Nenhuma categoria encontrada"
          description="Ajuste a busca ou limpe o filtro."
          actionLabel={search ? 'Limpar busca' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-surface border border-slate-200 bg-white shadow-sm">
          <DataTable containerClassName="!rounded-none !border-0 !shadow-none">
            <DataTableHead>
              <DataTableRow>
                <DataTableHeaderCell>Categoria</DataTableHeaderCell>
                <DataTableHeaderCell>Formato</DataTableHeaderCell>
                <DataTableHeaderCell />
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {pageData.results.map((category) => (
                <DataTableRow key={category.id}>
                  <DataTableCell className="font-medium text-slate-900">
                    {category.name}
                  </DataTableCell>
                  <DataTableCell>
                    <Badge tone={tagMembers[category.members]?.tone ?? 'neutral'}>
                      {tagMembers[category.members]?.label ?? category.members}
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

export default ListCategory;
