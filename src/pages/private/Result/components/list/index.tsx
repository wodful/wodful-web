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
import useResultData from '@/hooks/useResultData';
import { useState } from 'react';
import { MoreHorizontal } from 'react-feather';

interface IListResultProps {
  openEdit: (id: string) => void;
  categoryId: string;
}

const ListResults = ({ openEdit, categoryId }: IListResultProps) => {
  const { resultPages, Delete } = useResultData();
  const [resultId, setResultId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const openDelete = (id: string) => {
    setResultId(id);
    setIsOpen(true);
  };

  const confirmDelete = () => {
    Delete(resultId, categoryId);
  };

  return (
    <>
      <ComponentModal
        modalHeader="Remover resultado"
        size="sm"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DeleteData
          onClose={() => setIsOpen(false)}
          removedData="o resultado"
          confirmDelete={confirmDelete}
        />
      </ComponentModal>
      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeaderCell>Participantes</DataTableHeaderCell>
            <DataTableHeaderCell>Prova</DataTableHeaderCell>
            <DataTableHeaderCell>Resultado</DataTableHeaderCell>
            <DataTableHeaderCell>Colocação</DataTableHeaderCell>
            <DataTableHeaderCell>Pontos</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell />
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {resultPages.length === 0 && (
            <DataTableRow>
              <DataTableCell />
              <DataTableCell />
              <DataTableCell className="py-6 text-center">
                Busque por uma categoria
              </DataTableCell>
            </DataTableRow>
          )}
          {resultPages?.map((result) => (
            <DataTableRow key={result.id}>
              <DataTableCell className="py-4 capitalize">{result.nickname}</DataTableCell>
              <DataTableCell className="py-4">{result.workout.name}</DataTableCell>
              <DataTableCell className="py-4">{result.result}</DataTableCell>
              <DataTableCell className="py-4">{result.classification}° Lugar</DataTableCell>
              <DataTableCell className="py-4">
                {Number(result.points) === 0
                  ? 'Sem pontuação'
                  : `${Number(result.points)} ${
                      Number(result.points) === 1 ? 'Ponto' : 'Pontos'
                    }`}
              </DataTableCell>
              <DataTableCell className="py-4">
                {result.isReleased ? (
                  <Badge tone="primary">LIBERADO</Badge>
                ) : (
                  <Badge tone="neutral">OCULTO</Badge>
                )}
              </DataTableCell>
              <DataTableCell className="py-4">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuButton aria-label="Opções">
                      <MoreHorizontal size={18} />
                    </DropdownMenuButton>
                    <DropdownMenuList>
                      <DropdownMenuItem onClick={() => openEdit(result.id)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem danger onClick={() => openDelete(result.id)}>
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
    </>
  );
};

export default ListResults;
