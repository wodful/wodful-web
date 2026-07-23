import { ConfirmModal } from '@/components/ConfirmModal';
import { Badge } from '@/components/ui/Badge';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { RowActions } from '@/components/ui/RowActions';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { IParticipants, PickupStatusFilter } from '@/data/interfaces/participant';
import useCategoryData from '@/hooks/useCategoryData';
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

const PICKUP_OPTIONS: { value: PickupStatusFilter | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Aguardando' },
  { value: 'taken', label: 'Retirado' },
];

interface IListParticipants {
  openModal: (whichOne: 'EDIT' | 'MEDAL' | 'KIT', participant: IParticipants) => void;
}

function PickupBadge({ takenBy }: { takenBy: string | null }) {
  if (takenBy) {
    return (
      <Tooltip label={takenBy}>
        <span className="inline-flex cursor-pointer items-center gap-1.5">
          <Badge tone="success">Retirado</Badge>
          <Info size={14} className="text-slate-400" aria-hidden />
        </span>
      </Tooltip>
    );
  }

  return <Badge tone="warning">Aguardando</Badge>;
}

const ListParticipants = ({ openModal }: IListParticipants) => {
  const { PatchMedal, PatchKit } = useParticipantData();

  const [isOpen, setIsOpen] = useState(false);
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [idParticipant, setIdParticipant] = useState<string>('');
  const [whichModal, setWhichModal] = useState<'MEDAL' | 'KIT'>('MEDAL');
  const [categoryId, setCategoryId] = useState('');
  const [kitStatus, setKitStatus] = useState<PickupStatusFilter | ''>('');
  const [medalStatus, setMedalStatus] = useState<PickupStatusFilter | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { ListPaginated, participantsPages, page, limit, setLimit, setPage, isLoading } =
    useParticipantData();
  const { categories } = useCategoryData();

  const { id } = useParams();

  useEffect(() => {
    const next = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearchQuery((prev) => (prev === next ? prev : next));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryId, kitStatus, medalStatus, setPage]);

  useEffect(() => {
    if (!id) return;
    ListPaginated(id, {
      search: searchQuery || undefined,
      categoryId: categoryId || undefined,
      kitStatus,
      medalStatus,
    });
  }, [ListPaginated, id, searchQuery, categoryId, kitStatus, medalStatus]);

  useEffect(() => {
    setCurrentTotal(participantsPages.results?.length ?? 0);
  }, [participantsPages.results?.length]);

  const onClose = () => setIsOpen(false);
  const onOpen = () => setIsOpen(true);

  const confirmDelete = () => {
    if (whichModal === 'MEDAL') PatchMedal(idParticipant, null, id!);
    if (whichModal === 'KIT') PatchKit(idParticipant, null, id!);
    onClose();
  };

  const openDelete = (participantId: string, whichOne: 'MEDAL' | 'KIT') => {
    setWhichModal(whichOne);
    setIdParticipant(participantId);
    onOpen();
  };

  const useCategoryChips = categories.length > 1 && categories.length <= 8;
  const totalCount = participantsPages.count ?? 0;
  const hasActiveFilters = Boolean(categoryId || kitStatus || medalStatus || searchQuery);
  const results = participantsPages.results ?? [];
  const isMedalReturn = whichModal === 'MEDAL';

  const clearFilters = () => {
    setCategoryId('');
    setKitStatus('');
    setMedalStatus('');
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const setCategory = (next: string) => {
    setPage(1);
    setCategoryId(next);
  };

  return (
    <div className="space-y-4">
      <ConfirmModal
        isOpen={isOpen}
        title={isMedalReturn ? 'Devolver medalha' : 'Devolver kit'}
        description={
          isMedalReturn
            ? 'A retirada desta medalha será desfeita.'
            : 'A retirada deste kit será desfeita.'
        }
        confirmLabel="Devolver"
        onConfirm={confirmDelete}
        onClose={onClose}
      />

      <div className="space-y-3 rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar participante ou time"
            aria-label="Buscar participantes"
            className="min-w-0 flex-1"
          />
          <Select
            className="sm:w-40"
            value={medalStatus}
            onChange={(e) => {
              setPage(1);
              setMedalStatus(e.target.value as PickupStatusFilter | '');
            }}
            aria-label="Filtrar por medalha"
          >
            {PICKUP_OPTIONS.map((option) => (
              <option key={`medal-${option.value || 'all'}`} value={option.value}>
                Medalha: {option.label}
              </option>
            ))}
          </Select>
          <Select
            className="sm:w-40"
            value={kitStatus}
            onChange={(e) => {
              setPage(1);
              setKitStatus(e.target.value as PickupStatusFilter | '');
            }}
            aria-label="Filtrar por kit"
          >
            {PICKUP_OPTIONS.map((option) => (
              <option key={`kit-${option.value || 'all'}`} value={option.value}>
                Kit: {option.label}
              </option>
            ))}
          </Select>
          {!useCategoryChips && categories.length > 0 ? (
            <Select
              className="sm:w-52"
              value={categoryId}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filtrar por categoria"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          ) : null}
        </div>

        {useCategoryChips ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por categoria">
            <button
              type="button"
              aria-pressed={!categoryId}
              onClick={() => setCategory('')}
              className={[
                'rounded-chip px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                !categoryId
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              ].join(' ')}
            >
              Todas
            </button>
            {categories.map((category) => {
              const active = category.id === categoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(category.id)}
                  className={[
                    'rounded-chip px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    active
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        ) : null}

        <p className="text-xs text-slate-500">
          {totalCount} {totalCount === 1 ? 'participante' : 'participantes'}
          {hasActiveFilters ? ' · filtros ativos' : ''}
        </p>
      </div>

      {!isLoading && totalCount === 0 ? (
        <EmptyState
          title="Nenhum participante encontrado"
          description="Ajuste a busca ou os filtros de categoria, kit e medalha."
          actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <>
          <DataTable>
            <DataTableHead>
              <DataTableRow>
                <DataTableHeaderCell>Participante</DataTableHeaderCell>
                <DataTableHeaderCell>Time / Apelido</DataTableHeaderCell>
                <DataTableHeaderCell>Box</DataTableHeaderCell>
                <DataTableHeaderCell>Categoria</DataTableHeaderCell>
                <DataTableHeaderCell>Medalha</DataTableHeaderCell>
                <DataTableHeaderCell>Kit</DataTableHeaderCell>
                <DataTableHeaderCell />
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {results.map((participant) => (
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
                  <DataTableCell className="py-4">{participant.affiliation || '—'}</DataTableCell>
                  <DataTableCell className="py-4">{participant.category.name}</DataTableCell>
                  <DataTableCell className="py-4">
                    <PickupBadge takenBy={participant.medalTakenBy} />
                  </DataTableCell>
                  <DataTableCell className="py-4">
                    <PickupBadge takenBy={participant.kitTakenBy} />
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
      )}
    </div>
  );
};

export default ListParticipants;
