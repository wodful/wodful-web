import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import ComponentModal from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import { PeoplePageShell } from '@/components/ui/PeoplePageShell';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/components/ui/Toast';
import { CategoryProvider } from '@/contexts/category';
import { ParticipantProvider } from '@/contexts/participant';
import { IParticipants } from '@/data/interfaces/participant';
import useApp from '@/hooks/useApp';
import useCategoryData from '@/hooks/useCategoryData';
import useParticipantData from '@/hooks/useParticipantData';
import { participantMessages } from '@/utils/messages';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Menu as MenuIcon } from 'react-feather';
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
  const { ExportToCSV, ExportContactsToCSV } = useParticipantData();
  const { List: CategoryList } = useCategoryData();
  const { currentChampionship } = useApp();
  const toast = useToast();

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const openModal = (whichOne: 'EDIT' | 'MEDAL' | 'KIT', participantObj: IParticipants) => {
    setWhichModal(whichOne);
    setParticipant(participantObj);
    onOpen();
  };

  const exportToCsv = () => {
    AnalyticsAdapter.event({
      action: 'exportar_camisetas_participantes',
      category: 'ADM',
      label: 'Exportar camisetas',
      value: `camisetas`,
    });

    ExportToCSV(currentChampionship.id);

    toast({
      title: participantMessages['success_export'],
      status: 'success',
      isClosable: true,
    });
  };

  const exportContactsToCsv = () => {
    AnalyticsAdapter.event({
      action: 'exportar_contatos_inscricoes',
      category: 'ADM',
      label: 'Exportar contatos',
      value: `contatos`,
    });

    ExportContactsToCSV(currentChampionship.id);

    toast({
      title: participantMessages['success_export_contacts'],
      status: 'success',
      isClosable: true,
    });
  };

  useEffect(() => {
    if (id) CategoryList(id);
  }, [CategoryList, id]);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <PeoplePageShell
        title="Participantes"
        description="Consulte atletas, boxes e retire kits e medalhas no dia do evento."
        actions={
          <DropdownMenu>
            <Tooltip label="Opções de exportação de relatórios">
              <DropdownMenuButton className="!h-auto !w-auto gap-2 rounded-control border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <MenuIcon size={18} aria-hidden />
                Opções
              </DropdownMenuButton>
            </Tooltip>
            <DropdownMenuList align="right">
              <DropdownMenuItem onClick={exportToCsv}>Exportar camisas</DropdownMenuItem>
              <DropdownMenuItem onClick={exportContactsToCsv}>Exportar contatos</DropdownMenuItem>
            </DropdownMenuList>
          </DropdownMenu>
        }
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
