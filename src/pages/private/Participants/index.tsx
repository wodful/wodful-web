import AnalyticsAdapter from '@/adapters/AnalyticsAdapter';
import ComponentModal from '@/components/ComponentModal';
import { Loader } from '@/components/Loader';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { useToast } from '@/components/ui/Toast';
import { ParticipantProvider } from '@/contexts/participant';
import { IParticipant } from '@/data/interfaces/participant';
import useApp from '@/hooks/useApp';
import useParticipantData from '@/hooks/useParticipantData';
import { participantMessages } from '@/utils/messages';
import { ChangeEvent, Suspense, lazy, useState } from 'react';
import { Menu as MenuIcon, Search } from 'react-feather';
import FormParticipant from './components/form';
import FormKit from './components/formKit';
import FormMedal from './components/formMedal';

const ListParticipants = lazy(() => import('./components/list'));

const ParticipantWithProvider = () => {
  return (
    <ParticipantProvider>
      <Participants />
    </ParticipantProvider>
  );
};

const Participants = () => {
  const [searchBy, setSearchBy] = useState<string>('');
  const [whichModal, setWhichModal] = useState<'EDIT' | 'MEDAL' | 'KIT'>('EDIT');
  const [participant, setParticipant] = useState<IParticipant>();
  const [isOpen, setIsOpen] = useState(false);

  const { ExportToCSV, ExportContactsToCSV } = useParticipantData();
  const { currentChampionship } = useApp();
  const toast = useToast();

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value.length;
    return name >= 3 ? setSearchBy(event.target.value) : setSearchBy('');
  };

  const openModal = (whichOne: 'EDIT' | 'MEDAL' | 'KIT', participantObj: IParticipant) => {
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

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <div className="flex w-full flex-col items-center p-6">
        <div className="flex w-full items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Lista de Participantes</h1>
          <div className="flex items-center gap-3">
            <div className="relative min-w-[320px]">
              <Search
                size={20}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                onChange={handleOnChange}
                className="!pl-10"
                placeholder="Buscar participante ou time"
              />
            </div>
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
          </div>
        </div>

        <ComponentModal
          modalHeader={
            whichModal == 'EDIT'
              ? 'Editar participante'
              : whichModal == 'MEDAL'
                ? 'Retirar medalha'
                : 'Retirar kit'
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

        <div className="mt-6 w-full">
          <ListParticipants participantOrTeamName={searchBy} openModal={openModal} />
        </div>
      </div>
    </Suspense>
  );
};

export default ParticipantWithProvider;
