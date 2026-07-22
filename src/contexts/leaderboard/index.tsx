import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { ILeaderboard, IPublicLeaderboard } from '@/data/interfaces/leaderboard';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import { LeaderboardService } from '@/services/Leaderboard';
import { PublicLeaderboardService } from '@/services/Public/Leaderboard';
import { createContext, useCallback, useState } from 'react';

interface LeaderboardProps {
  children: React.ReactNode;
}

export interface LeaderboardContextData {
  leaderboardPages: IPageResponse<ILeaderboard>;
  publicLeaderboards: IPublicLeaderboard[];
  isLoading: boolean;
  page: number;
  limit: number;
  ListPublic: (id: string) => void;
  ListPaginated: (id: string, categoryId: string) => void;
  setLimit: (value: number) => void;
  setPage: (value: number) => void;
}

const LeaderboardContext = createContext({} as LeaderboardContextData);

const axios = new AxiosAdapter();

export const LeaderboardProvider = ({ children }: LeaderboardProps) => {
  const [leaderboardPages, setLeaderboardsPages] = useState<IPageResponse<ILeaderboard>>(
    {} as IPageResponse<ILeaderboard>,
  );
  const [publicLeaderboards, setPublicLeaderboards] = useState<IPublicLeaderboard[]>(
    [] as IPublicLeaderboard[],
  );

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const ListPaginated = useCallback(
    async (champId: string, categoryId: string) => {
      setIsLoading(true);
      await new LeaderboardService(axios)
        .list(champId, categoryId, limit, page)
        .then((paginatedLeaderboards) => {
          setLeaderboardsPages(paginatedLeaderboards as IPageResponse<ILeaderboard>);
        })
        .finally(() => setIsLoading(false));
    },
    [limit, page],
  );

  const ListPublic = useCallback(async (id: string) => {
    setIsLoading(true);
    await new PublicLeaderboardService(axios)
      .list(id)
      .then((leaderboards) => {
        setPublicLeaderboards(leaderboards as IPublicLeaderboard[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <LeaderboardContext.Provider
      value={{
        isLoading,
        limit,
        page,
        leaderboardPages,
        ListPublic,
        publicLeaderboards,
        ListPaginated,
        setLimit,
        setPage,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export default LeaderboardContext;
