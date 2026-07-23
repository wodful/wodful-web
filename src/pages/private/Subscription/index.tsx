import ComponentModal from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PeoplePageShell } from '@/components/ui/PeoplePageShell';
import { CategoryProvider } from '@/contexts/category';
import { SubscriptionProvider } from '@/contexts/subscription';
import { TicketProvider } from '@/contexts/ticket';
import useCategoryData from '@/hooks/useCategoryData';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import type { ISubscriptionForm } from '@/data/interfaces/subscription';
import { Suspense, lazy, useEffect, useState } from 'react';
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
  const [subscriptionId, setSubscriptionId] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [participantsNumber, setParticipantsNumber] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { id } = useParams();
  const { List: CategoryList } = useCategoryData();
  const { setSubscriptionForm } = useSubscriptionData();

  const onClose = () => setIsOpen(false);

  function handleSubscriptionInfo(step: number, nextParticipantsNumber: number) {
    setParticipantsNumber(nextParticipantsNumber);
    setCurrentStep(step);
  }

  const openCreate = () => {
    setIsEditing(false);
    setSubscriptionForm({} as ISubscriptionForm);
    handleSubscriptionInfo(0, 0);
    setIsOpen(true);
  };

  const openEdit = (subId: string) => {
    setSubscriptionId(subId);
    setIsEditing(true);
    setIsOpen(true);
  };

  useEffect(() => {
    if (id) CategoryList(id);
  }, [CategoryList, id]);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <PeoplePageShell
        title="Inscrições"
        description="Acompanhe pagamentos, origem e status. Inclua atletas pelo painel quando precisar."
        actionLabel="Adicionar inscrição"
        onAction={openCreate}
      >
        <ComponentModal
          title={`${isEditing ? 'Editar' : 'Adicionar'} inscrição`}
          description={isEditing ? 'Responsável e time.' : 'Responsável, ticket e atletas.'}
          size="lg"
          isOpen={isOpen}
          onClose={() => {
            handleSubscriptionInfo(0, 0);
            onClose();
          }}
        >
          {isEditing && <FormResponsible subId={subscriptionId} onClose={onClose} />}
          {!isEditing && currentStep === 0 && (
            <FormSubscription
              id={id as string}
              openFormParticipants={handleSubscriptionInfo}
              onCancel={() => {
                handleSubscriptionInfo(0, 0);
                onClose();
              }}
            />
          )}
          {!isEditing && currentStep !== 0 && (
            <FormSubscriptionParticipants
              participantsNumber={participantsNumber}
              onClose={onClose}
              resetStep={handleSubscriptionInfo}
            />
          )}
        </ComponentModal>

        <ListSubscription
          id={id as string}
          onEdit={openEdit}
          emptyFallback={
            <EmptyState
              title="Nenhuma inscrição ainda"
              description="Adicione uma inscrição pelo painel ou aguarde as entradas pela página pública."
              actionLabel="Adicionar inscrição"
              onAction={openCreate}
            />
          }
        />
      </PeoplePageShell>
    </Suspense>
  );
};

export default SubscriptionWithProvider;
