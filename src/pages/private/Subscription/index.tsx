import ComponentModal from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { CategoryProvider } from '@/contexts/category';
import { SubscriptionProvider } from '@/contexts/subscription';
import { TicketProvider } from '@/contexts/ticket';
import useCategoryData from '@/hooks/useCategoryData';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import { ChangeEvent, Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FormSubscriptionParticipants from './components/formParticipants';
import FormResponsible from './components/formResponsible';
import FormSubscription from './components/formSubscription';

const ListSubscription = lazy(() => import('./components/list'));

const noopClose = () => undefined;

const SubscriptionWithProvider = () => {
  return (
    <CategoryProvider>
      <TicketProvider onClose={noopClose}>
        <SubscriptionProvider onClose={noopClose}>
          <Subscription />
        </SubscriptionProvider>
      </TicketProvider>
    </CategoryProvider>
  );
};

const Subscription = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [participantsNumber, setParticipantsNumber] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  const { id } = useParams();
  const { ListPaginated } = useSubscriptionData();
  const { List: CategoryList, categories } = useCategoryData();

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  function handleSubscriptionInfo(step: number, participantsNumber: number) {
    setParticipantsNumber(participantsNumber);
    setCurrentStep(step);
  }

  const resetCategoryData = () => {
    setSelectedCategory('Todos');
    setCategoryId('');
  };

  const openCreate = () => {
    setIsEditing(false);
    resetCategoryData();
    ListPaginated(id as string);
    onOpen();
  };

  const openEdit = (subId: string) => {
    setSubscriptionId(subId);
    setIsEditing(true);
    onOpen();
  };

  const handleChangeCategory = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      if (event.target.value) {
        setCategoryId(event.target.value);
        setSelectedCategory(
          categories.find((selected) => selected.id === event.target.value)!.name,
        );
        return;
      }
      resetCategoryData();
    },
    [categories],
  );

  useEffect(() => {
    if (id) {
      CategoryList(id);
    }
  }, [CategoryList, id]);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <div className="flex w-full flex-col items-center p-6">
        <div className="flex w-full items-center justify-between gap-3">
          <article className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Inscrições</h1>
            <span className="inline-flex w-fit rounded border border-slate-400 px-2 py-0.5 text-xs font-bold capitalize text-slate-500">
              Categoria: {selectedCategory}
            </span>
          </article>
          <div className="flex items-end gap-4 self-end">
            <Select
              id="category"
              value={categoryId}
              onChange={(event) => handleChangeCategory(event)}
              className="min-w-[200px]"
            >
              <option value="">Selecionar categoria</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Button variant="primary" className="w-auto min-w-[170px]" onClick={openCreate}>
              Adicionar inscrição
            </Button>
          </div>
        </div>
        <div className="mt-6 w-full">
          <ListSubscription id={id as string} categoryId={categoryId} onEdit={openEdit} />
        </div>

        <ComponentModal
          modalHeader={`${isEditing ? 'Editar' : 'Adicionar'} inscrição`}
          size="lg"
          isOpen={isOpen}
          onClose={() => {
            handleSubscriptionInfo(0, 0);
            onClose();
          }}
        >
          {isEditing && <FormResponsible subId={subscriptionId} onClose={onClose} />}
          {!isEditing && currentStep === 0 && (
            <FormSubscription id={id as string} openFormParticipants={handleSubscriptionInfo} />
          )}
          {!isEditing && currentStep !== 0 && (
            <FormSubscriptionParticipants
              participantsNumber={participantsNumber as number}
              onClose={onClose}
              resetStep={handleSubscriptionInfo}
            />
          )}
        </ComponentModal>
      </div>
    </Suspense>
  );
};

export default SubscriptionWithProvider;
