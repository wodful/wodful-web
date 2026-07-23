import ComponentModal from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { SetupPageShell } from '@/components/ui/SetupPageShell';
import { CategoryProvider } from '@/contexts/category';
import { ICategory } from '@/data/interfaces/category';
import useCategoryData from '@/hooks/useCategoryData';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
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
  const { List, categories, isLoading } = useCategoryData();
  const { id } = useParams();

  useEffect(() => {
    if (id) List(id);
  }, [List, id]);

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
  const hasElements = useMemo(() => categories.length > 0, [categories.length]);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <SetupPageShell
        title="Categorias"
        description="Defina as categorias do evento (individual, dupla, time)."
        actionLabel="Adicionar categoria"
        onAction={openCreate}
      >
        <ComponentModal
          title={category ? 'Editar categoria' : 'Adicionar categoria'}
          description="Nome, descrição e formato."
          size="lg"
          isOpen={isOpen}
          onClose={onClose}
        >
          <FormCategory
            key={category?.id ?? 'create'}
            id={id as string}
            onClose={onClose}
            oldCategory={category}
            resetCategory={resetCategory}
          />
        </ComponentModal>

        {isLoading && !hasElements ? (
          <Loader title="Carregando categorias..." />
        ) : hasElements ? (
          <ListCategory openEdit={openEdit} />
        ) : (
          <EmptyState
            title="Nenhuma categoria ainda"
            description="Crie a primeira categoria para organizar provas, tickets e ranking."
            actionLabel="Criar categoria"
            onAction={openCreate}
          />
        )}
      </SetupPageShell>
    </Suspense>
  );
};

export default CategoryWithProvider;
