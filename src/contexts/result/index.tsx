import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import {
  ICreateResultRequestDTO,
  IEditReleaseResultDTO,
  IEditResultDTO,
  IResultByCategory,
  IResultData,
} from '@/data/interfaces/result';
import { ResultService } from '@/services/Result';
import { resultMessages } from '@/utils/messages';
import { useToast } from '@/components/ui/Toast';
import { createContext, useCallback, useState } from 'react';

interface ResultProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export interface ResultContextData {
  resultPages: IResultByCategory[];
  result: IResultData;
  isLoading: boolean;
  page: number;
  limit: number;
  ListPaginated: (categoryId: string, name?: string) => void;
  ListPaginatedByWorkout: (categoryId: string, workoutId: string, name?: string) => void;
  setLimit: (value: number) => void;
  setPage: (value: number) => void;
  Delete: (id: string, categoryId: string) => Promise<void>;
  Create: (data: ICreateResultRequestDTO) => void;
  Get: (id: string) => Promise<void>;
  GetIsReleasedResult: (workoutId: string) => Promise<{ isReleased: boolean }>;
  Edit: (data: IEditResultDTO) => void;
  UpdateReleaseResult: ({ release, workoutId, categoryId }: IEditReleaseResultDTO) => Promise<void>;
}

const ResultContext = createContext({} as ResultContextData);

const axios = new AxiosAdapter();

export const ResultProvider = ({ children }: ResultProps) => {
  const toast = useToast();
  const [resultPages, setResultPages] = useState<IResultByCategory[]>([] as IResultByCategory[]);
  const [page, setPage] = useState<number>(1);
  const [result, setResult] = useState<IResultData>({} as IResultData);
  const [limit, setLimit] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('');
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string>('');
  const [currentSearch, setCurrentSearch] = useState<string | undefined>(undefined);

  const ListPaginated = useCallback(async (categoryId: string, name?: string) => {
    setCurrentCategoryId(categoryId);
    setCurrentWorkoutId('');
    setCurrentSearch(name);
    setIsLoading(true);
    await new ResultService(axios)
      .listByCategory(categoryId, name)
      .then((results) => {
        setResultPages(results as IResultByCategory[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const Get = useCallback(async (id: string) => {
    setIsLoading(true);
    await new ResultService(axios)
      .get(id)
      .then((results) => {
        setResult(results as IResultData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const GetIsReleasedResult = useCallback(async (workoutId: string) => {
    setIsLoading(true);
    const result = await new ResultService(axios)
      .getIsReleasedResult(workoutId)
      .then((data) => {
        return { isReleased: data.isReleased };
      })
      .finally(() => setIsLoading(false));

    return result;
  }, []);

  const ListPaginatedByWorkout = useCallback(
    async (categoryId: string, workoutId: string, name?: string) => {
      setCurrentCategoryId(categoryId);
      setCurrentWorkoutId(workoutId);
      setCurrentSearch(name);
      setIsLoading(true);
      await new ResultService(axios)
        .listByCategoryAndWorkout(categoryId, workoutId, name)
        .then((results) => {
          setResultPages(results as IResultByCategory[]);
        })
        .finally(() => setIsLoading(false));
    },
    [],
  );

  const refreshCurrentList = useCallback(async () => {
    if (!currentCategoryId) return;
    if (currentWorkoutId) {
      await ListPaginatedByWorkout(currentCategoryId, currentWorkoutId, currentSearch);
      return;
    }
    await ListPaginated(currentCategoryId, currentSearch);
  }, [currentCategoryId, currentWorkoutId, currentSearch, ListPaginated, ListPaginatedByWorkout]);

  const Create = useCallback(
    async ({ workoutId, subscriptionId, result, categoryId }: ICreateResultRequestDTO) => {
      setIsLoading(true);
      await new ResultService(axios)
        .create({ workoutId, subscriptionId, result, categoryId })
        .then(() => {
          toast({
            title: resultMessages['success'],
            status: 'success',
            isClosable: true,
          });
          ListPaginatedByWorkout(categoryId, workoutId);
        })
        .catch(() => {
          toast({
            title: resultMessages['error'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [ListPaginatedByWorkout, toast],
  );

  const UpdateReleaseResult = useCallback(
    async ({ workoutId, release, categoryId: _categoryId }: IEditReleaseResultDTO) => {
      setIsLoading(true);
      await new ResultService(axios)
        .editReleaseResult({ workoutId, release })
        .then(() => {
          toast({
            title: resultMessages['successRelease'],
            status: 'success',
            isClosable: true,
          });
          refreshCurrentList();
        })
        .catch(() => {
          toast({
            title: resultMessages['remove_release'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [refreshCurrentList, toast],
  );

  const Edit = useCallback(
    async ({ id, result, categoryId: _categoryId }: IEditResultDTO) => {
      setIsLoading(true);
      await new ResultService(axios)
        .edit({ id, result })
        .then(() => {
          toast({
            title: resultMessages['success_edit'],
            status: 'success',
            isClosable: true,
          });
          refreshCurrentList();
        })
        .catch(() => {
          toast({
            title: resultMessages['error_edit'],
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [refreshCurrentList, toast],
  );

  const Delete = useCallback(
    async (idCat: string, _categoryId: string) => {
      setIsLoading(true);
      await new ResultService(axios)
        .delete(idCat)
        .then(() => {
          toast({
            title: resultMessages['remove'],
            status: 'success',
            isClosable: true,
          });
          refreshCurrentList();
        })
        .finally(() => setIsLoading(false));
    },
    [refreshCurrentList, toast],
  );

  return (
    <ResultContext.Provider
      value={{
        isLoading,
        Create,
        Delete,
        limit,
        page,
        resultPages,
        result,
        ListPaginated,
        ListPaginatedByWorkout,
        setLimit,
        Get,
        Edit,
        setPage,
        GetIsReleasedResult,
        UpdateReleaseResult,
      }}
    >
      {children}
    </ResultContext.Provider>
  );
};

export default ResultContext;
