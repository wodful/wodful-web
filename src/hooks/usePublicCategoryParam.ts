import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function usePublicCategoryParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('category') ?? '';

  const setCategoryId = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id) next.set('category', id);
          else next.delete('category');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { categoryId, setCategoryId };
}
