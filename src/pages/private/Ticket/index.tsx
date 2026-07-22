import ComponentModal from '@/components/ComponentModal';
import { EmptyList } from '@/components/EmptyList';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { CategoryProvider } from '@/contexts/category';
import { TicketProvider } from '@/contexts/ticket';
import useTicketData from '@/hooks/useTicketData';
import { ITicket } from '../../../data/interfaces/ticket/index';
import { lazy, Suspense, useCallback, useMemo, useState } from 'react';

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
  const { ticketsPages } = useTicketData();
  const [ticket, setTicket] = useState<ITicket>();
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => setIsOpen(false);

  const openEdit = useCallback((ticketObj: ITicket) => {
    setTicket(ticketObj);
    setIsOpen(true);
  }, []);

  const resetTicket = () => {
    setTicket(undefined);
  };

  const openCreate = useCallback(() => {
    resetTicket();
    setIsOpen(true);
  }, []);

  const hasElements: boolean = useMemo(() => ticketsPages.count !== 0, [ticketsPages]);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <div className="flex w-full flex-col items-center p-6">
        {hasElements ? (
          <div className="flex w-full items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Gestão de tickets</h1>
            <Button variant="primary" className="w-auto" onClick={openCreate}>
              Adicionar ticket
            </Button>
          </div>
        ) : null}

        <ComponentModal
          modalHeader={ticket ? 'Editar ticket' : 'Adicionar ticket'}
          size="lg"
          isOpen={isOpen}
          onClose={onClose}
        >
          <FormTicket onClose={onClose} oldTicket={ticket} resetTicket={resetTicket} />
        </ComponentModal>

        {hasElements ? (
          <div className="mt-6 w-full">
            <ListTicket openEdit={openEdit} />
          </div>
        ) : (
          <EmptyList
            text="Você não possui tickets ainda!"
            contentButton="Crie um ticket"
            onClose={openCreate}
          />
        )}
      </div>
    </Suspense>
  );
};

export default TicketWithProvider;
