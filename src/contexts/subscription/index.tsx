import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import {
  IParticipantForm,
  ISubscription,
  ISubscriptionDTO,
  ISubscriptionForm,
  ISubscriptionPaymentLink,
  SubscriptionPaymentOrigin,
  UpdateSubscriptionDTO,
} from '@/data/interfaces/subscription';
import { SubscriptionService } from '@/services/Subscription';
import { subscriptionMessages } from '@/utils/messages';
import { useToast } from '@/components/ui/Toast';
import { createContext, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

interface SubscriptionProviderProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export interface SubscriptionContextData {
  subscriptionForm: ISubscriptionForm;
  setSubscriptionForm: (value: ISubscriptionForm) => void;
  subscriptions: ISubscription[];
  subscription: ISubscription;
  subscriptionsPages: IPageResponse<ISubscription>;
  isLoading: boolean;
  limit: number;
  setLimit: (value: number) => void;
  page: number;
  setPage: (value: number) => void;
  originFilter: SubscriptionPaymentOrigin | '';
  setOriginFilter: (value: SubscriptionPaymentOrigin | '') => void;
  Delete: (id: string) => Promise<void>;
  List: (id: string) => Promise<void>;
  UpdateStatus: (id: string, status: string) => Promise<void>;
  SetComplimentary: (id: string, isComplimentary: boolean) => Promise<void>;
  CreatePaymentLink: (id: string) => Promise<ISubscriptionPaymentLink | null>;
  ResendApprovedEmail: (id: string) => Promise<void>;
  ListPaginated: (
    id: string,
    categoryId?: string,
    origin?: SubscriptionPaymentOrigin | '',
    q?: string,
  ) => Promise<void>;
  ListAllByCategory: (categoryId: string, workoutId?: string) => Promise<void>;
  Create: (participants: IParticipantForm) => Promise<void>;
  Get: (id: string) => Promise<void>;
  Update: (id: string, data: UpdateSubscriptionDTO) => Promise<void>;
}

const SubscriptionContext = createContext({} as SubscriptionContextData);

const axios = new AxiosAdapter();

export const SubscriptionProvider = ({ children, onClose }: SubscriptionProviderProps) => {
  const { id } = useParams();
  const toast = useToast();
  const [subscriptionsPages, setSubscriptionsPages] = useState<IPageResponse<ISubscription>>(
    {} as IPageResponse<ISubscription>,
  );
  const [subscriptionForm, setSubscriptionForm] = useState<ISubscriptionForm>(
    {} as ISubscriptionForm,
  );
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [originFilter, setOriginFilter] = useState<SubscriptionPaymentOrigin | ''>('');
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([] as ISubscription[]);
  const [subscription, setSubscription] = useState<ISubscription>({} as ISubscription);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentChampionshipId, setCurrentChampionshipId] = useState<string>(String(id ?? ''));
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState<string | undefined>(undefined);
  const [currentOriginFilter, setCurrentOriginFilter] = useState<
    SubscriptionPaymentOrigin | ''
  >('');
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  const Get = useCallback(async (id: string) => {
    setIsLoading(true);
    await new SubscriptionService(axios)
      .get(id)
      .then((subs) => setSubscription(subs))
      .finally(() => setIsLoading(false));
  }, []);

  const List = useCallback(async (id: string) => {
    setIsLoading(true);
    await new SubscriptionService(axios)
      .listAll(id)
      .then((subscriptions) => {
        setSubscriptions(subscriptions as ISubscription[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const ListAllByCategory = useCallback(
    async (categoryId: string, workoutId?: string) => {
      setIsLoading(true);
      await new SubscriptionService(axios)
        .listAllByCategory(String(id), categoryId, workoutId)
        .then((allSubs) => {
          setSubscriptions(allSubs as ISubscription[]);
        })
        .finally(() => setIsLoading(false));
    },
    [id],
  );

  const ListPaginated = useCallback(
    async (
      championshipId: string,
      categoryId?: string,
      origin?: SubscriptionPaymentOrigin | '',
      q?: string,
    ) => {
      const nextOrigin = origin ?? '';
      const nextQuery = q ?? '';
      setCurrentChampionshipId(championshipId);
      setCurrentCategoryFilter(categoryId);
      setCurrentOriginFilter(nextOrigin);
      setCurrentSearchQuery(nextQuery);
      setIsLoading(true);
      await new SubscriptionService(axios)
        .listAll(championshipId, {
          limit,
          page,
          categoryId,
          origin: nextOrigin,
          q: nextQuery,
        })
        .then((paginatedSubscriptions) => {
          setSubscriptionsPages(paginatedSubscriptions as IPageResponse<ISubscription>);
        })
        .finally(() => setIsLoading(false));
    },
    [limit, page],
  );

  const refreshCurrentList = useCallback(async () => {
    if (!currentChampionshipId) return;
    await ListPaginated(
      currentChampionshipId,
      currentCategoryFilter,
      currentOriginFilter,
      currentSearchQuery,
    );
  }, [
    currentChampionshipId,
    currentCategoryFilter,
    currentOriginFilter,
    currentSearchQuery,
    ListPaginated,
  ]);

  const Create = useCallback(
    async (participants: IParticipantForm) => {
      const subscriptionDTO: ISubscriptionDTO = {
        nickname: participants.nickname,
        participants: participants.participants,
        responsibleEmail: subscriptionForm.responsibleEmail,
        responsibleName: subscriptionForm.responsibleName,
        responsiblePhone: subscriptionForm.responsiblePhone,
        ticketId: subscriptionForm.ticketId,
        approveManually: Boolean(participants.approveManually),
        isComplimentary: Boolean(participants.isComplimentary),
      };
      setIsLoading(true);
      await new SubscriptionService(axios)
        .create(subscriptionDTO)
        .then(() => {
          toast({
            title: subscriptionMessages['success'],
            status: 'success',
            isClosable: true,
          });
          refreshCurrentList();
          onClose!();
        })
        .catch(() => {
          toast({
            title: subscriptionMessages['error'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [
      subscriptionForm.responsibleEmail,
      subscriptionForm.responsibleName,
      subscriptionForm.responsiblePhone,
      subscriptionForm.ticketId,
      toast,
      refreshCurrentList,
      onClose,
    ],
  );

  const Delete = useCallback(
    async (idSub: string) => {
      setIsLoading(true);
      await new SubscriptionService(axios)
        .delete(idSub)
        .then(() => {
          toast({
            title: subscriptionMessages['remove'],
            status: 'success',
            isClosable: true,
          });
          refreshCurrentList();
        })
        .catch(() => {
          toast({
            title: subscriptionMessages['remove_err'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [refreshCurrentList, toast],
  );

  const Update = useCallback(
    async (subscriptionId: string, data: UpdateSubscriptionDTO) => {
      setIsLoading(true);
      await new SubscriptionService(axios)
        .update(subscriptionId, data)
        .then(() => {
          toast({
            title: subscriptionMessages['update'],
            status: 'success',
            isClosable: true,
          });
          refreshCurrentList();
        })
        .catch(() => {
          toast({
            title: subscriptionMessages['update_err'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [refreshCurrentList, toast],
  );

  const UpdateStatus = useCallback(
    async (idSub: string, status: string) => {
      setIsLoading(true);
      await new SubscriptionService(axios)
        .updateStatus(idSub, status)
        .then(() => {
          toast({
            title: subscriptionMessages['status_update'],
            status: 'success',
            isClosable: true,
          });
          refreshCurrentList();
        })
        .catch(() => {
          toast({
            title: subscriptionMessages['status_update_err'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [refreshCurrentList, toast],
  );

  const SetComplimentary = useCallback(
    async (idSub: string, isComplimentary: boolean) => {
      setIsLoading(true);
      await new SubscriptionService(axios)
        .setComplimentary(idSub, isComplimentary)
        .then(() => {
          toast({
            title: subscriptionMessages['complimentary_success'],
            status: 'success',
            isClosable: true,
          });
          refreshCurrentList();
        })
        .catch(() => {
          toast({
            title: subscriptionMessages['complimentary_error'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [refreshCurrentList, toast],
  );

  const CreatePaymentLink = useCallback(
    async (idSub: string) => {
      setIsLoading(true);
      try {
        const result = await new SubscriptionService(axios).createPaymentLink(idSub);
        toast({
          title: subscriptionMessages['payment_link_success'],
          status: 'success',
          isClosable: true,
        });
        return result;
      } catch {
        toast({
          title: subscriptionMessages['payment_link_error'],
          status: 'error',
          isClosable: true,
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast],
  );

  const ResendApprovedEmail = useCallback(
    async (idSub: string) => {
      setIsLoading(true);
      await new SubscriptionService(axios)
        .resendApprovedEmail(idSub)
        .then(() => {
          toast({
            title: subscriptionMessages['resend_email_success'],
            status: 'success',
            isClosable: true,
          });
        })
        .catch(() => {
          toast({
            title: subscriptionMessages['resend_email_error'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [toast],
  );

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionForm,
        setSubscriptionForm,
        subscriptions,
        subscriptionsPages,
        isLoading,
        limit,
        page,
        setLimit,
        setPage,
        originFilter,
        setOriginFilter,
        Create,
        Delete,
        UpdateStatus,
        SetComplimentary,
        CreatePaymentLink,
        ResendApprovedEmail,
        List,
        ListPaginated,
        ListAllByCategory,
        Get,
        subscription,
        Update,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;
