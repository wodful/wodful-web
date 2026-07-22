import { IPublicSchedule } from '@/data/interfaces/schedule';
import { PublicScheduleService } from '@/services/Public/Schedule';
import { useToast } from '@/components/ui/Toast';
import { createContext, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import {
  ICreateScheduleRequestDTO,
  IIsLiveDTO,
  IIsOverDTO,
  ISchedule,
} from '@/data/interfaces/schedule';
import { ScheduleService } from '@/services/Schedule';
import { activityMessages, resultMessages } from '@/utils/messages';

export interface ScheduleContextData {
  schedulePages: IPageResponse<ISchedule>;
  isLoading: boolean;
  page: number;
  limit: number;
  ListPaginated: (championshipId: string) => void;
  IsLive: ({ championshipId, activityId, isLive }: IIsLiveDTO) => void;
  IsOver: ({ championshipId, activityId, isOver }: IIsOverDTO) => void;
  setLimit: (value: number) => void;
  setPage: (value: number) => void;
  Create: ({ workoutId, categoryId, date, hour, laneQuantity }: ICreateScheduleRequestDTO) => void;
  Delete: (value: string) => void;
  schedules: IPublicSchedule[];
  PublicList: (code: string) => Promise<void>;
}

export const ScheduleContext = createContext({} as ScheduleContextData);

const axios = new AxiosAdapter();

interface ScheduleProviderProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export const ScheduleProvider = ({ children, onClose }: ScheduleProviderProps) => {
  const toast = useToast();
  const [schedulePages, setSchedulePages] = useState<IPageResponse<ISchedule>>(
    {} as IPageResponse<ISchedule>,
  );
  const [limit, setLimit] = useState<number>(5);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<IPublicSchedule[]>([] as IPublicSchedule[]);

  const { id } = useParams();

  const ListPaginated = useCallback(
    async (championshipId: string) => {
      setIsLoading(true);
      await new ScheduleService(axios)
        .list(championshipId, limit, page)
        .then((paginatedSchedules) => {
          setSchedulePages(paginatedSchedules as IPageResponse<ISchedule>);
        })
        .finally(() => setIsLoading(false));
    },
    [limit, page],
  );

  const Create = useCallback(
    async ({
      date,
      hour,
      categoryId,
      workoutId,
      heat,
      laneQuantity,
    }: ICreateScheduleRequestDTO) => {
      setIsLoading(true);
      await new ScheduleService(axios)
        .create({ date, hour, categoryId, workoutId, heat, laneQuantity })
        .then(() => {
          toast({
            title: activityMessages['success'],
            status: 'success',
            isClosable: true,
          });
          ListPaginated(id as string);
          onClose!();
        })
        .catch(() => {
          toast({
            title: activityMessages['error'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [ListPaginated, id, onClose, toast],
  );

  const IsLive = useCallback(
    async ({ championshipId, activityId, isLive }: IIsLiveDTO) => {
      setIsLoading(true);
      await new ScheduleService(axios)
        .isLive(championshipId, activityId, isLive)
        .then(() => {
          toast({
            title: isLive ? activityMessages['start'] : activityMessages['stop'],
            status: 'success',
            isClosable: true,
          });
          ListPaginated(id as string);
          onClose!();
        })
        .catch(() => {
          toast({
            title: activityMessages['errorStatus'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [ListPaginated, id, onClose, toast],
  );

  const IsOver = useCallback(
    async ({ championshipId, activityId, isOver }: IIsOverDTO) => {
      setIsLoading(true);
      await new ScheduleService(axios)
        .isOver(championshipId, activityId, isOver)
        .then(() => {
          toast({
            title: activityMessages['finish'],
            status: 'success',
            isClosable: true,
          });
          ListPaginated(id as string);
          onClose!();
        })
        .catch(() => {
          toast({
            title: activityMessages['errorStatus'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [ListPaginated, id, onClose, toast],
  );

  const Delete = useCallback(
    async (idCat: string) => {
      await new ScheduleService(axios)
        .delete(idCat)
        .then(() => {
          toast({
            title: resultMessages['remove'],
            status: 'success',
            isClosable: true,
          });
          ListPaginated(id as string);
        })
        .finally(() => setIsLoading(false));
    },
    [ListPaginated, id, toast],
  );

  const PublicList = useCallback(async (code: string) => {
    setIsLoading(true);
    await new PublicScheduleService(axios)
      .list(code)
      .then((schedules) => {
        setSchedules(schedules as IPublicSchedule[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <ScheduleContext.Provider
      value={{
        schedulePages,
        IsLive,
        IsOver,
        isLoading,
        page,
        limit,
        ListPaginated,
        setLimit,
        setPage,
        Delete,
        Create,
        schedules,
        PublicList,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export default ScheduleContext;
