import ComponentModal from '@/components/ComponentModal';
import { EmptyList } from '@/components/EmptyList';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { CategoryProvider } from '@/contexts/category';
import { ICategory } from '@/data/interfaces/category';
import useCategoryData from '@/hooks/useCategoryData';
import { lazy, Suspense, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import FormCategory from './components/form';

const ListCategory = lazy(() => import('./components/list'));

const CategoryWithProvider = () => (
  <CategoryProvider onClose={() => undefined}>
    <Category />
  </CategoryProvider>
);

const Category = () => {
  const [category, setCategory] = useState<ICategory>();
  const [isOpen, setIsOpen] = useState(false);
  const { categoriesPages } = useCategoryData();
  const { id } = useParams();

  const openEdit = (categoryObj: ICategory) => {
    setCategory(categoryObj);
    setIsOpen(true);
  };

  const resetCategory = () => setCategory(undefined);

  const openCreate = () => {
    resetCategory();
    setIsOpen(true);
  };

  const onClose = () => setIsOpen(false);
  const hasElements = useMemo(() => categoriesPages.count !== 0, [categoriesPages]);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <div className="flex w-full flex-col items-center p-6">
        {hasElements ? (
          <div className="flex w-full items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Lista de categorias</h1>
            <Button variant="primary" className="w-auto" onClick={openCreate}>
              Adicionar categoria
            </Button>
          </div>
        ) : null}

        <ComponentModal
          modalHeader={category ? 'Editar categoria' : 'Criar categoria'}
          size="lg"
          isOpen={isOpen}
          onClose={onClose}
        >
          <FormCategory
            id={id as string}
            onClose={onClose}
            oldCategory={category}
            resetCategory={resetCategory}
          />
        </ComponentModal>

        {hasElements ? (
          <div className="mt-6 w-full">
            <ListCategory id={id as string} openEdit={openEdit} />
          </div>
        ) : (
          <EmptyList
            text="Você não possui categorias ainda!"
            contentButton="Crie uma categoria"
            onClose={openCreate}
          />
        )}
      </div>
    </Suspense>
  );
};

export default CategoryWithProvider;
