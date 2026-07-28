import ComponentModal from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import { PeoplePageShell } from '@/components/ui/PeoplePageShell';
import { CategoryProvider } from '@/contexts/category';
import { ParticipantProvider } from '@/contexts/participant';
import { IParticipants } from '@/data/interfaces/participant';
import useCategoryData from '@/hooks/useCategoryData';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FormParticipant from './components/form';
import FormKit from './components/formKit';
import FormMedal from './components/formMedal';

const ListParticipants = lazy(() => import('./components/list'));

const ParticipantWithProvider = () => {
  return (
    <CategoryProvider>
      <ParticipantProvider>
        <Participants />
      </ParticipantProvider>
    </CategoryProvider>
  );
};

const Participants = () => {
  const [whichModal, setWhichModal] = useState<'EDIT' | 'MEDAL' | 'KIT'>('EDIT');
  const [participant, setParticipant] = useState<IParticipants>();
  const [isOpen, setIsOpen] = useState(false);

  const { id } = useParams();
  const { List: CategoryList } = useCategoryData();

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const openModal = (whichOne: 'EDIT' | 'MEDAL' | 'KIT', participantObj: IParticipants) => {
    setWhichModal(whichOne);
    setParticipant(participantObj);
    onOpen();
  };

  useEffect(() => {
    if (id) CategoryList(id);
  }, [CategoryList, id]);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <PeoplePageShell
        title="Participantes"
        description="Consulte atletas, boxes e retire kits e medalhas no dia do evento."
      >
        <ComponentModal
          title={
            whichModal == 'EDIT'
              ? 'Editar participante'
              : whichModal == 'MEDAL'
                ? 'Retirar medalha'
                : 'Retirar kit'
          }
          description={
            whichModal === 'EDIT'
              ? 'Dados do atleta.'
              : whichModal === 'MEDAL'
                ? 'Quem retirou a medalha.'
                : 'Quem retirou o kit.'
          }
          size="lg"
          isOpen={isOpen}
          onClose={onClose}
        >
          {whichModal === 'EDIT' && (
            <FormParticipant onClose={onClose} oldParticipant={participant} />
          )}
          {whichModal === 'MEDAL' && (
            <FormMedal onClose={onClose} idParticipant={participant!.id} />
          )}
          {whichModal === 'KIT' && <FormKit onClose={onClose} idParticipant={participant!.id} />}
        </ComponentModal>

        <ListParticipants openModal={openModal} />
      </PeoplePageShell>
    </Suspense>
  );
};

export default ParticipantWithProvider;
