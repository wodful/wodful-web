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
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { ICategory } from '@/data/interfaces/category';
import useCategoryData from '@/hooks/useCategoryData';
import { useEffect, useState } from 'react';
import { MoreHorizontal } from 'react-feather';

interface IListCategory {
  id: string;
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

const ListCategory = ({ id, openEdit }: IListCategory) => {
  const [currentTotal, setCurrentTotal] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { ListPaginated, categoriesPages, page, limit, setLimit, setPage, isLoading, Delete } =
    useCategoryData();

  useEffect(() => {
    ListPaginated(id);
  }, [ListPaginated, id]);

  useEffect(() => {
    setCurrentTotal(categoriesPages.results?.length);
  }, [categoriesPages.results?.length]);

  const openDelete = (deleteId: string) => {
    setCategoryId(deleteId);
    setIsOpen(true);
  };

  return (
    <>
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

      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeaderCell>Categoria</DataTableHeaderCell>
            <DataTableHeaderCell>Formato</DataTableHeaderCell>
            <DataTableHeaderCell />
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {categoriesPages.results?.map((category) => (
            <DataTableRow key={category.id}>
              <DataTableCell className="py-4">{category.name}</DataTableCell>
              <DataTableCell className="py-4">
                <Badge tone={tagMembers[category.members]?.tone ?? 'neutral'}>
                  {tagMembers[category.members]?.label ?? category.members}
                </Badge>
              </DataTableCell>
              <DataTableCell className="py-4">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuButton aria-label="Opções">
                      <MoreHorizontal size={18} />
                    </DropdownMenuButton>
                    <DropdownMenuList side="top">
                      <DropdownMenuItem onClick={() => openEdit(category)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem danger onClick={() => openDelete(category.id)}>
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuList>
                  </DropdownMenu>
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
      <PaginationBar
        page={page}
        limit={limit}
        count={categoriesPages.count ?? 0}
        currentTotal={currentTotal ?? 0}
        hasPrevious={!!categoriesPages.previous}
        hasNext={!!categoriesPages.next}
        isLoading={isLoading}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
        onPrevious={() => setPage(page - 1)}
        onNext={() => setPage(page + 1)}
      />
    </>
  );
};

export default ListCategory;
