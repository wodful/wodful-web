import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import { ICoupon, CouponDTO } from '@/data/interfaces/coupon';
import { CouponService } from '@/services/Coupon';
import { useToast } from '@/components/ui/Toast';
import { createContext, useCallback, useState } from 'react';

interface CouponProviderProps {
  children: React.ReactNode;
}

interface CouponContextData {
  coupons: ICoupon[];
  couponsPages: IPageResponse<ICoupon>;
  isLoading: boolean;
  limit: number;
  setLimit: (value: number) => void;
  page: number;
  setPage: (value: number) => void;
  List: (championshipId: string) => Promise<void>;
  ListPaginated: (championshipId: string) => Promise<void>;
  Create: (data: CouponDTO) => Promise<void>;
  Update: (id: string, data: Partial<CouponDTO>) => Promise<void>;
  Delete: (id: string, championshipId: string) => Promise<void>;
}

const CouponContext = createContext({} as CouponContextData);

const axios = new AxiosAdapter();

export const CouponProvider = ({ children }: CouponProviderProps) => {
  const toast = useToast();
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [couponsPages, setCouponsPages] = useState<IPageResponse<ICoupon>>(
    {} as IPageResponse<ICoupon>,
  );
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const List = useCallback(async (championshipId: string) => {
    setIsLoading(true);
    await new CouponService(axios)
      .listByChampionship(championshipId)
      .then((data) => {
        setCoupons(Array.isArray(data) ? data : (data as IPageResponse<ICoupon>).results ?? []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const ListPaginated = useCallback(
    async (championshipId: string) => {
      setIsLoading(true);
      await new CouponService(axios)
        .listByChampionship(championshipId, limit, page)
        .then((data) => {
          setCouponsPages(data as IPageResponse<ICoupon>);
        })
        .finally(() => setIsLoading(false));
    },
    [limit, page],
  );

  const Create = useCallback(
    async (data: CouponDTO) => {
      setIsLoading(true);
      await new CouponService(axios)
        .create(data)
        .then(() => {
          toast({
            title: 'Cupom criado com sucesso',
            status: 'success',
            isClosable: true,
          });
          List(data.championshipId);
        })
        .catch(() => {
          toast({
            title: 'Erro ao criar cupom',
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [List, toast],
  );

  const Update = useCallback(
    async (id: string, data: Partial<CouponDTO>) => {
      setIsLoading(true);
      await new CouponService(axios)
        .update(id, data)
        .then(() => {
          toast({
            title: 'Cupom atualizado com sucesso',
            status: 'success',
            isClosable: true,
          });
          if (data.championshipId) {
            List(data.championshipId);
          }
        })
        .catch(() => {
          toast({
            title: 'Erro ao atualizar cupom',
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [List, toast],
  );

  const Delete = useCallback(
    async (id: string, championshipId: string) => {
      setIsLoading(true);
      await new CouponService(axios)
        .delete(id)
        .then(() => {
          toast({
            title: 'Cupom removido com sucesso',
            status: 'success',
            isClosable: true,
          });
          List(championshipId);
        })
        .catch(() => {
          toast({
            title: 'Erro ao remover cupom',
            status: 'error',
            isClosable: true,
          });
        })
        .finally(() => setIsLoading(false));
    },
    [List, toast],
  );

  return (
    <CouponContext.Provider
      value={{
        coupons,
        couponsPages,
        isLoading,
        limit,
        setLimit,
        page,
        setPage,
        List,
        ListPaginated,
        Create,
        Update,
        Delete,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
};

export default CouponContext;

