import ComponentModal from '@/components/ComponentModal';
import DeleteData from '@/components/Delete';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { RowActions } from '@/components/ui/RowActions';
import { Tooltip } from '@/components/ui/Tooltip';
import { IParticipant } from '@/data/interfaces/participant';
import useParticipantData from '@/hooks/useParticipantData';
import { useEffect, useState } from 'react';
import { Info } from 'react-feather';
import { useParams } from 'react-router-dom';

function getInitials(name?: string) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

interface IListParticipants {
  participantOrTeamName: string | null;
  openModal: (whichOne: 'EDIT' | 'MEDAL' | 'KIT', participant: IParticipant) => void;
}

const ListParticipants = ({ participantOrTeamName, openModal }: IListParticipants) => {
  const { PatchMedal, PatchKit } = useParticipantData();

  const [isOpen, setIsOpen] = useState(false);
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [idParticipant, setIdParticipant] = useState<string>('');
  const [whichModal, setWhichModal] = useState<'MEDAL' | 'KIT'>('MEDAL');

  const { ListPaginated, participantsPages, page, limit, setLimit, setPage, isLoading } =
    useParticipantData();

  const { id } = useParams();

  useEffect(() => {
    ListPaginated(id as string, participantOrTeamName as string);
  }, [ListPaginated, id, participantOrTeamName]);

  useEffect(() => {
    setCurrentTotal(participantsPages.results?.length ?? 0);
  }, [participantsPages.results?.length]);

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const confirmDelete = () => {
    if (whichModal === 'MEDAL') PatchMedal(idParticipant, null, id!);
    if (whichModal === 'KIT') PatchKit(idParticipant, null, id!);
  };

  const openDelete = (participantId: string, whichOne: 'MEDAL' | 'KIT') => {
    setWhichModal(whichOne);
    setIdParticipant(participantId);
    onOpen();
  };

  return (
    <>
      <ComponentModal modalHeader="Desvincular" size="sm" isOpen={isOpen} onClose={onClose}>
        <DeleteData
          onClose={onClose}
          removedData={whichModal == 'MEDAL' ? 'a retirada de medalha' : 'a retirada de kit'}
          confirmDelete={confirmDelete}
        />
      </ComponentModal>

      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeaderCell>Participante</DataTableHeaderCell>
            <DataTableHeaderCell>Time / Apelido</DataTableHeaderCell>
            <DataTableHeaderCell>Categoria</DataTableHeaderCell>
            <DataTableHeaderCell>Medalha</DataTableHeaderCell>
            <DataTableHeaderCell>Kit</DataTableHeaderCell>
            <DataTableHeaderCell />
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {participantsPages.results?.length === 0 && (
            <DataTableRow>
              <DataTableCell colSpan={6} className="py-6 text-center text-slate-500">
                Sem registro de participantes
              </DataTableCell>
            </DataTableRow>
          )}
          {participantsPages.results?.map((participant) => (
            <DataTableRow key={participant.id}>
              <DataTableCell className="py-4">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {getInitials(participant.name)}
                  </span>
                  <span>{participant.name}</span>
                </div>
              </DataTableCell>

              <DataTableCell className="py-4">{participant.nickname}</DataTableCell>
              <DataTableCell className="py-4">{participant.category.name}</DataTableCell>
              <DataTableCell className="py-4">
                {participant.medalTakenBy ? (
                  <Tooltip label={participant.medalTakenBy}>
                    <span className="inline-flex cursor-pointer items-center gap-2">
                      Retirado
                      <Info size={16} aria-hidden />
                    </span>
                  </Tooltip>
                ) : (
                  'Aguardando'
                )}
              </DataTableCell>
              <DataTableCell className="py-4">
                {participant.kitTakenBy ? (
                  <Tooltip label={participant.kitTakenBy}>
                    <span className="inline-flex cursor-pointer items-center gap-2">
                      Retirado
                      <Info size={16} aria-hidden />
                    </span>
                  </Tooltip>
                ) : (
                  'Aguardando'
                )}
              </DataTableCell>

              <DataTableCell className="py-4">
                <RowActions
                  entityLabel={participant.name}
                  onEdit={() => openModal('EDIT', participant)}
                  menuActions={[
                    {
                      label: !participant.medalTakenBy
                        ? 'Retirar medalha'
                        : 'Devolver medalha',
                      onClick: () =>
                        !participant.medalTakenBy
                          ? openModal('MEDAL', participant)
                          : openDelete(participant.id, 'MEDAL'),
                    },
                    {
                      label: !participant.kitTakenBy ? 'Retirar kit' : 'Devolver kit',
                      onClick: () =>
                        !participant.kitTakenBy
                          ? openModal('KIT', participant)
                          : openDelete(participant.id, 'KIT'),
                    },
                  ]}
                />
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
      <PaginationBar
        page={page}
        limit={limit}
        count={participantsPages.count ?? 0}
        currentTotal={currentTotal}
        hasPrevious={!!participantsPages.previous}
        hasNext={!!participantsPages.next}
        isLoading={isLoading}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
        onPrevious={() => setPage(page - 1)}
        onNext={() => setPage(page + 1)}
      />
    </>
  );
};

export default ListParticipants;
