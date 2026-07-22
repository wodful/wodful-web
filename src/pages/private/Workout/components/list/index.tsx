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
import useWorkoutData from '@/hooks/useWorkoutData';
import { useEffect, useState } from 'react';
import { MoreHorizontal } from 'react-feather';

interface IListWorkout {
  id: string;
  showPontuacaoColumn?: boolean;
}

const workoutTypeBadgeClass: Record<string, string> = {
  AMRAP: 'bg-purple-100 text-purple-800',
  EMOM: 'bg-blue-100 text-blue-800',
  FORTIME: 'bg-emerald-100 text-emerald-800',
  PR: 'bg-amber-100 text-amber-800',
};

const ListWorkout = ({ id, showPontuacaoColumn = false }: IListWorkout) => {
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [workoutId, setWorkoutId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const { ListPaginated, workoutsPages, page, limit, setLimit, setPage, isLoading, Delete } =
    useWorkoutData();

  useEffect(() => {
    ListPaginated(id);
  }, [ListPaginated, id]);

  useEffect(() => {
    setCurrentTotal(workoutsPages.results?.length ?? 0);
  }, [workoutsPages.results?.length]);

  const openDelete = (deleteId: string) => {
    setWorkoutId(deleteId);
    setIsOpen(true);
  };

  const confirmDelete = () => {
    Delete(workoutId);
  };

  return (
    <>
      <ComponentModal
        modalHeader="Remover prova"
        size="sm"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DeleteData
          onClose={() => setIsOpen(false)}
          removedData="a prova"
          confirmDelete={confirmDelete}
        />
      </ComponentModal>

      <DataTable>
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
          {workoutsPages.results?.map((workout) => (
            <DataTableRow key={workout.id}>
              <DataTableCell className="py-4">{workout.name}</DataTableCell>
              <DataTableCell className="py-4">
                <Badge className={workoutTypeBadgeClass[workout.workoutType] ?? ''}>
                  {workout.workoutType}
                </Badge>
              </DataTableCell>
              <DataTableCell className="py-4">{workout.categoryName}</DataTableCell>
              {showPontuacaoColumn ? (
                <DataTableCell className="py-4">
                  {workout.worthHalfPoints ? (
                    <Badge tone="warning">50 Pontos</Badge>
                  ) : (
                    <Badge tone="neutral">100 Pontos</Badge>
                  )}
                </DataTableCell>
              ) : null}
              <DataTableCell className="py-4">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuButton aria-label="Opções">
                      <MoreHorizontal size={18} />
                    </DropdownMenuButton>
                    <DropdownMenuList side="top">
                      <DropdownMenuItem danger onClick={() => openDelete(workout.id)}>
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
        count={workoutsPages.count ?? 0}
        currentTotal={currentTotal}
        hasPrevious={!!workoutsPages.previous}
        hasNext={!!workoutsPages.next}
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

export default ListWorkout;
