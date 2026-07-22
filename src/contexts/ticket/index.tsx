import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import { ITicket, TicketDTO } from '@/data/interfaces/ticket';
import { TicketService } from '@/services/Ticket';
import { ticketMessages } from '@/utils/messages';
import { useToast } from '@/components/ui/Toast';
import { createContext, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

interface TicketProviderProps {
  children: React.ReactNode;
  onClose: () => void;
}

export interface TicketContextData {
  tickets: ITicket[];
  ticketsPages: IPageResponse<ITicket>;
  isLoading: boolean;
  isError: boolean;
  limit: number;
  setLimit: (value: number) => void;
  page: number;
  setPage: (value: number) => void;
  Delete: (id: string) => Promise<void>;
  ListPaginated: (id: string) => Promise<void>;
  List: (id: string) => Promise<void>;
  ListEnabled: (id: string) => Promise<void>;
  Create: ({
    name,
    description,
    startDate,
    endDate,
    price,
    quantity,
    categoryId,
    paymentLink,
  }: TicketDTO) => Promise<void>;
  Edit: ({
    id,
    name,
    description,
    startDate,
    endDate,
    price,
    quantity,
    categoryId,
    paymentLink,
  }: TicketDTO) => Promise<void>;
}

const TicketContext = createContext({} as TicketContextData);

const axios = new AxiosAdapter();

export const TicketProvider = ({ children, onClose }: TicketProviderProps) => {
  const toast = useToast();
  const [ticketsPages, setTicketsPages] = useState<IPageResponse<ITicket>>(
    {} as IPageResponse<ITicket>,
  );
  const [limit, setLimit] = useState<number>(5);
  const [page, setPage] = useState<number>(1);
  const [tickets, setTickets] = useState<ITicket[]>([] as ITicket[]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError] = useState<boolean>(false);

  const { id: idPath } = useParams();

  const List = useCallback(async (id: string) => {
    setIsLoading(true);
    await new TicketService(axios)
      .listAll(id)
      .then((allTickets) => {
        setTickets(allTickets as ITicket[]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const ListEnabled = useCallback(async (id: string) => {
    setIsLoading(true);
    await new TicketService(axios)
      .listEnabled(id)
      .then((enabledTickets) => {
        setTickets(enabledTickets as ITicket[]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const ListPaginated = useCallback(
    async (id: string) => {
      setIsLoading(true);
      await new TicketService(axios)
        .listAll(id, limit, page)
        .then((paginatedTickets) => {
          setTicketsPages(paginatedTickets as IPageResponse<ITicket>);
        })
        .finally(() => setIsLoading(false));
    },
    [limit, page],
  );

  const Create = useCallback(
    async ({
      name,
      description,
      startDate,
      endDate,
      price,
      quantity,
      categoryId,
      paymentLink,
    }: TicketDTO) => {
      setIsLoading(true);
      await new TicketService(axios)
        .create({
          name,
          description,
          startDate,
          endDate,
          price,
          quantity,
          categoryId,
          paymentLink,
        })
        .then(() => {
          toast({
            title: ticketMessages['success'],
            status: 'success',
            isClosable: true,
          });
          ListPaginated(idPath as string);
          onClose!();
        })
        .catch(() => {
          toast({
            title: ticketMessages['error'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [ListPaginated, onClose, toast, idPath],
  );

  const Edit = useCallback(
    async ({
      id,
      description,
      name,
      price,
      quantity,
      endDate,
      startDate,
      categoryId,
      paymentLink,
    }: TicketDTO) => {
      setIsLoading(true);
      await new TicketService(axios)
        .edit({
          id,
          description,
          name,
          price,
          quantity,
          endDate,
          startDate,
          categoryId,
          paymentLink,
        })
        .then(() => {
          toast({
            title: ticketMessages['success_edit'],
            status: 'success',
            isClosable: true,
          });
          ListPaginated(idPath as string);
          onClose!();
        })
        .catch(() => {
          toast({
            title: ticketMessages['error_edit'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [onClose, toast, ListPaginated, idPath],
  );

  const Delete = useCallback(
    async (idCat: string) => {
      setIsLoading(true);
      await new TicketService(axios)
        .delete(idCat)
        .then(() => {
          toast({
            title: ticketMessages['remove'],
            status: 'success',
            isClosable: true,
          });
          ListPaginated(String(idPath));
        })
        .catch(() => {
          toast({
            title: ticketMessages['remove_err'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [ListPaginated, idPath, toast],
  );

  return (
    <TicketContext.Provider
      value={{
        tickets,
        ticketsPages,
        isLoading,
        isError,
        limit,
        page,
        setLimit,
        setPage,
        Delete,
        Create,
        List,
        ListEnabled,
        ListPaginated,
        Edit,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export default TicketContext;
