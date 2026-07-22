import ComponentModal from '@/components/ComponentModal';
import DeleteData from '@/components/Delete';
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
import { ITicket } from '@/data/interfaces/ticket';
import useTicketData from '@/hooks/useTicketData';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { useCallback, useEffect, useState } from 'react';
import { MoreHorizontal } from 'react-feather';
import { useParams } from 'react-router-dom';

interface IListTicketProps {
  openEdit: (ticket: ITicket) => void;
}

const ListTicket = ({ openEdit }: IListTicketProps) => {
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [ticketId, setTicketId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const { ListPaginated, ticketsPages, page, limit, setLimit, setPage, isLoading, Delete } =
    useTicketData();

  const { id } = useParams();

  useEffect(() => {
    ListPaginated(id as string);
  }, [ListPaginated, id]);

  useEffect(() => {
    setCurrentTotal(ticketsPages.results?.length ?? 0);
  }, [ticketsPages.results?.length]);

  const openDelete = (deleteId: string) => {
    setTicketId(deleteId);
    setIsOpen(true);
  };

  const confirmDelete = () => {
    Delete(ticketId);
  };

  const countRestTickets = useCallback((quantity: number, inUse: number) => {
    if (quantity - inUse === 0) return 'Esgotado';

    return quantity - inUse;
  }, []);

  return (
    <>
      <ComponentModal
        modalHeader="Remover ingresso"
        size="sm"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DeleteData
          onClose={() => setIsOpen(false)}
          removedData="o ingresso"
          confirmDelete={confirmDelete}
        />
      </ComponentModal>

      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeaderCell>Nome</DataTableHeaderCell>
            <DataTableHeaderCell>Valor do ingresso</DataTableHeaderCell>
            <DataTableHeaderCell>Início</DataTableHeaderCell>
            <DataTableHeaderCell>Encerramento</DataTableHeaderCell>
            <DataTableHeaderCell>Quantidade</DataTableHeaderCell>
            <DataTableHeaderCell>Restantes</DataTableHeaderCell>
            <DataTableHeaderCell />
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {ticketsPages.results?.map((ticket) => (
            <DataTableRow key={ticket.id}>
              <DataTableCell className="py-4">{ticket.name}</DataTableCell>
              <DataTableCell className="py-4">{formatCurrency(ticket.price)}</DataTableCell>
              <DataTableCell className="py-4">
                {formatDate(ticket.startDate, 'dd/MM/yyyy HH:mm')}
              </DataTableCell>
              <DataTableCell className="py-4">
                {formatDate(ticket.endDate, 'dd/MM/yyyy HH:mm')}
              </DataTableCell>
              <DataTableCell className="py-4">{ticket.quantity}</DataTableCell>
              <DataTableCell className="py-4">
                {countRestTickets(ticket.quantity, ticket.inUse)}
              </DataTableCell>
              <DataTableCell className="py-4">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuButton aria-label="Opções">
                      <MoreHorizontal size={18} />
                    </DropdownMenuButton>
                    <DropdownMenuList>
                      <DropdownMenuItem onClick={() => openEdit(ticket)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem danger onClick={() => openDelete(ticket.id)}>
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
        count={ticketsPages.count ?? 0}
        currentTotal={currentTotal}
        hasPrevious={!!ticketsPages.previous}
        hasNext={!!ticketsPages.next}
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

export default ListTicket;
