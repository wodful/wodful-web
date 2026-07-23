import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import { IParticipant, IParticipants, PickupStatusFilter } from '@/data/interfaces/participant';
import { ParticipantsService } from '@/services/Participants';
import { participantMessages } from '@/utils/messages';
import { useToast } from '@/components/ui/Toast';
import { createContext, useCallback, useState } from 'react';

interface TicketProviderProps {
  children: React.ReactNode;
}

export interface ParticipantContextData {
  participantsPages: IPageResponse<IParticipants>;
  isLoading: boolean;
  isError: boolean;
  limit: number;
  setLimit: (value: number) => void;
  page: number;
  setPage: (value: number) => void;
  ListPaginated: (
    id: string | null,
    filters?: {
      search?: string;
      categoryId?: string;
      kitStatus?: PickupStatusFilter | '';
      medalStatus?: PickupStatusFilter | '';
    },
  ) => Promise<void>;
  PatchMedal(
    idParticipant: string,
    medalTakenBy: string | null,
    idChampionship: string,
  ): Promise<void>;
  PatchKit(idParticipant: string, kitTakenBy: string | null, idChampionship: string): Promise<void>;
  Edit(
    { id, affiliation, city, identificationCode, name, tShirtSize }: IParticipant,
    idChampionship: string,
  ): Promise<void>;
  ExportToCSV(champId: string): Promise<void>;
  ExportContactsToCSV(champId: string): Promise<void>;
}

const ParticipantContext = createContext({} as ParticipantContextData);

const axios = new AxiosAdapter();

export const ParticipantProvider = ({ children }: TicketProviderProps) => {
  const toast = useToast();
  const [participantsPages, setParticipantsPages] = useState<IPageResponse<IParticipants>>(
    {} as IPageResponse<IParticipants>,
  );
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError] = useState<boolean>(false);
  const [currentSearch, setCurrentSearch] = useState<string | undefined>(undefined);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | undefined>(undefined);
  const [currentKitStatus, setCurrentKitStatus] = useState<PickupStatusFilter | undefined>(
    undefined,
  );
  const [currentMedalStatus, setCurrentMedalStatus] = useState<PickupStatusFilter | undefined>(
    undefined,
  );

  const ExportToCSV = useCallback(async (champId: string) => {
    setIsLoading(true);
    await new ParticipantsService(axios)
      .exportToCsv(`${champId}`)
      .then((url) => {
        window.open(`${import.meta.env.VITE_BASE_SERVER_URL}/${url.downloadUrl}`, 'blank');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const ExportContactsToCSV = useCallback(async (champId: string) => {
    setIsLoading(true);
    await new ParticipantsService(axios)
      .exportContactsToCsv(`${champId}`)
      .then((url) => {
        window.open(`${import.meta.env.VITE_BASE_SERVER_URL}/${url.downloadUrl}`, 'blank');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const ListPaginated = useCallback(
    async (
      id: string | null,
      filters?: {
        search?: string;
        categoryId?: string;
        kitStatus?: PickupStatusFilter | '';
        medalStatus?: PickupStatusFilter | '';
      },
    ) => {
      const nextSearch = filters?.search;
      const nextCategoryId = filters?.categoryId || undefined;
      const nextKitStatus = filters?.kitStatus || undefined;
      const nextMedalStatus = filters?.medalStatus || undefined;

      setCurrentSearch(nextSearch);
      setCurrentCategoryId(nextCategoryId);
      setCurrentKitStatus(nextKitStatus);
      setCurrentMedalStatus(nextMedalStatus);
      setIsLoading(true);
      await new ParticipantsService(axios)
        .listAll({
          championshipId: id,
          limit,
          page,
          search: nextSearch,
          categoryId: nextCategoryId,
          kitStatus: nextKitStatus,
          medalStatus: nextMedalStatus,
        })
        .then((paginatedParticipants) => {
          setParticipantsPages(paginatedParticipants as IPageResponse<IParticipants>);
        })
        .finally(() => setIsLoading(false));
    },
    [limit, page],
  );

  const refreshList = useCallback(
    async (idChampionship: string) => {
      await ListPaginated(idChampionship, {
        search: currentSearch,
        categoryId: currentCategoryId,
        kitStatus: currentKitStatus,
        medalStatus: currentMedalStatus,
      });
    },
    [ListPaginated, currentSearch, currentCategoryId, currentKitStatus, currentMedalStatus],
  );

  const Edit = useCallback(
    async (
      { id, affiliation, city, identificationCode, name, tShirtSize }: IParticipant,
      idChampionship: string,
    ) => {
      setIsLoading(true);
      await new ParticipantsService(axios)
        .edit({ id, affiliation, city, identificationCode, name, tShirtSize })
        .then(() => {
          toast({
            title: participantMessages['success_edit'],
            status: 'success',
            isClosable: true,
          });
          refreshList(idChampionship);
        })
        .catch(() => {
          toast({
            title: participantMessages['error_edit'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [toast, refreshList],
  );

  const PatchKit = useCallback(
    async (idParticipant: string, kitTakenBy: string | null, idChampionship: string) => {
      setIsLoading(true);
      await new ParticipantsService(axios)
        .patchKit(idParticipant, kitTakenBy)
        .then(() => {
          toast({
            title: participantMessages['success_kit'],
            status: 'success',
            isClosable: true,
          });
          refreshList(idChampionship);
        })
        .catch(() => {
          toast({
            title: participantMessages['error_kit'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [toast, refreshList],
  );

  const PatchMedal = useCallback(
    async (idParticipant: string, medalTakenBy: string | null, idChampionship: string) => {
      setIsLoading(true);
      await new ParticipantsService(axios)
        .patchMedal(idParticipant, medalTakenBy)
        .then(() => {
          toast({
            title: participantMessages['success_medal'],
            status: 'success',
            isClosable: true,
          });
          refreshList(idChampionship);
        })
        .catch(() => {
          toast({
            title: participantMessages['error_medal'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [toast, refreshList],
  );

  return (
    <ParticipantContext.Provider
      value={{
        participantsPages,
        isLoading,
        isError,
        limit,
        page,
        setLimit,
        setPage,
        PatchMedal,
        PatchKit,
        Edit,
        ListPaginated,
        ExportToCSV,
        ExportContactsToCSV,
      }}
    >
      {children}
    </ParticipantContext.Provider>
  );
};

export default ParticipantContext;
