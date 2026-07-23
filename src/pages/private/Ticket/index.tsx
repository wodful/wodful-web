import ComponentModal, { ModalFooter } from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SetupPageShell } from '@/components/ui/SetupPageShell';
import { CategoryProvider } from '@/contexts/category';
import { TicketProvider } from '@/contexts/ticket';
import useTicketData from '@/hooks/useTicketData';
import { ITicket } from '@/data/interfaces/ticket';
import { lazy, Suspense, useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const ListTicket = lazy(() => import('./components/list'));
const FormTicket = lazy(() => import('./components/form'));

const TicketWithProvider = () => (
  <CategoryProvider>
    <TicketProvider onClose={() => undefined}>
      <Ticket />
    </TicketProvider>
  </CategoryProvider>
);

const Ticket = () => {
  const { List, tickets, isLoading } = useTicketData();
  const { id } = useParams();
  const formId = useId();
  const [ticket, setTicket] = useState<ITicket>();
  const [isOpen, setIsOpen] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    if (id) List(id);
  }, [List, id]);

  const onClose = () => {
    setIsOpen(false);
    setCanSubmit(false);
  };

  const openEdit = useCallback((ticketObj: ITicket) => {
    setTicket(ticketObj);
    setCanSubmit(false);
    setIsOpen(true);
  }, []);

  const resetTicket = () => {
    setTicket(undefined);
  };

  const openCreate = useCallback(() => {
    resetTicket();
    setCanSubmit(false);
    setIsOpen(true);
  }, []);

  const hasElements = useMemo(() => tickets.length > 0, [tickets.length]);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <SetupPageShell
        title="Tickets"
        description="Gerencie lotes de inscrição, preços e janelas de venda."
        actionLabel="Adicionar ticket"
        onAction={openCreate}
      >
        <ComponentModal
          title={ticket ? 'Editar ticket' : 'Adicionar ticket'}
          description="Categoria, lote e janela de venda."
          size="lg"
          isOpen={isOpen}
          onClose={onClose}
          footer={
            <ModalFooter>
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form={formId}
                variant="primary"
                disabled={!canSubmit}
                className="w-full sm:w-auto"
              >
                {ticket ? 'Salvar' : 'Adicionar'}
              </Button>
            </ModalFooter>
          }
        >
          <FormTicket
            key={ticket?.id ?? 'create'}
            formId={formId}
            onClose={onClose}
            oldTicket={ticket}
            resetTicket={resetTicket}
            onValidityChange={setCanSubmit}
          />
        </ComponentModal>

        {isLoading && !hasElements ? (
          <Loader title="Carregando tickets..." />
        ) : hasElements ? (
          <ListTicket openEdit={openEdit} />
        ) : (
          <EmptyState
            title="Nenhum ticket ainda"
            description="Crie lotes de inscrição para as categorias do evento."
            actionLabel="Criar ticket"
            onAction={openCreate}
          />
        )}
      </SetupPageShell>
    </Suspense>
  );
};

export default TicketWithProvider;
