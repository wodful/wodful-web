import ComponentModal from '@/components/ComponentModal';
import DeleteData from '@/components/Delete';
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
import { ITicket } from '@/data/interfaces/ticket';
import useTicketData from '@/hooks/useTicketData';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import {
  getTicketWindowStatus,
  paginateItems,
  ticketWindowStatusLabel,
  ticketWindowStatusTone,
  type TicketWindowStatus,
} from '@/utils/setupList';
import { useEffect, useMemo, useState } from 'react';

interface IListTicketProps {
  openEdit: (ticket: ITicket) => void;
}

type EnabledFilter = 'all' | 'active' | 'inactive';

const windowFilters: Array<{ value: '' | TicketWindowStatus; label: string }> = [
  { value: '', label: 'Todas' },
  { value: 'on_sale', label: 'À venda' },
  { value: 'scheduled', label: 'Agendado' },
  { value: 'ended', label: 'Encerrado' },
  { value: 'sold_out', label: 'Esgotado' },
];

function formatSaleWindow(start: Date | string, end: Date | string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '—';

  const sameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  if (sameDay) {
    return `${formatDate(startDate, 'dd/MM HH:mm')} → ${formatDate(endDate, 'HH:mm')}`;
  }

  return `${formatDate(startDate, 'dd/MM HH:mm')} → ${formatDate(endDate, 'dd/MM HH:mm')}`;
}

function sortTickets(a: ITicket, b: ITicket) {
  const rank = (ticket: ITicket) => {
    if (!ticket.enabled) return 5;
    const window = getTicketWindowStatus(ticket);
    if (window === 'on_sale') return 0;
    if (window === 'scheduled') return 1;
    if (window === 'ended') return 2;
    return 3;
  };

  const diff = rank(a) - rank(b);
  if (diff !== 0) return diff;
  return a.name.localeCompare(b.name, 'pt-BR');
}

const ListTicket = ({ openEdit }: IListTicketProps) => {
  const [ticketId, setTicketId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [enabledFilter, setEnabledFilter] = useState<EnabledFilter>('all');
  const [windowFilter, setWindowFilter] = useState<'' | TicketWindowStatus>('');
  const [statusAnnounce, setStatusAnnounce] = useState('');

  const { tickets, page, limit, setLimit, setPage, isLoading, Delete, SetEnabled } =
    useTicketData();

  const windowCounts = useMemo(() => {
    const base = tickets.filter((ticket) => {
      if (enabledFilter === 'active' && !ticket.enabled) return false;
      if (enabledFilter === 'inactive' && ticket.enabled) return false;
      return true;
    });

    const counts: Record<TicketWindowStatus, number> = {
      on_sale: 0,
      scheduled: 0,
      ended: 0,
      sold_out: 0,
    };

    for (const ticket of base) {
      counts[getTicketWindowStatus(ticket)] += 1;
    }

    return counts;
  }, [tickets, enabledFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return tickets
      .filter((ticket) => {
        if (enabledFilter === 'active' && !ticket.enabled) return false;
        if (enabledFilter === 'inactive' && ticket.enabled) return false;

        const window = getTicketWindowStatus(ticket);
        if (windowFilter === 'on_sale') {
          if (!(ticket.enabled && window === 'on_sale')) return false;
        } else if (windowFilter && window !== windowFilter) {
          return false;
        }

        if (!q) return true;
        return (
          ticket.name.toLowerCase().includes(q) ||
          ticket.category?.name?.toLowerCase().includes(q)
        );
      })
      .sort(sortTickets);
  }, [tickets, search, enabledFilter, windowFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, enabledFilter, windowFilter, setPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / limit) || 1);
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, limit, page, setPage]);

  const pageData = useMemo(() => paginateItems(filtered, page, limit), [filtered, page, limit]);
  const showPagination = pageData.count > limit;
  const hasActiveFilters =
    !!search || enabledFilter !== 'all' || windowFilter !== '';

  const openDelete = (deleteId: string) => {
    setTicketId(deleteId);
    setIsOpen(true);
  };

  const toggleEnabled = async (ticket: ITicket) => {
    const next = !ticket.enabled;
    await SetEnabled(ticket.id, next);
    setStatusAnnounce(
      next ? `Ticket ${ticket.name} ativado` : `Ticket ${ticket.name} desativado`,
    );
  };

  return (
    <div className="space-y-4">
      <div className="sr-only" aria-live="polite">
        {statusAnnounce}
      </div>

      <ComponentModal
        modalHeader="Remover ingresso"
        size="sm"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DeleteData
          onClose={() => setIsOpen(false)}
          removedData="o ingresso"
          confirmDelete={() => Delete(ticketId)}
        />
      </ComponentModal>

      <div className="space-y-3 rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou categoria…"
            aria-label="Buscar tickets"
            className="min-w-0 flex-1"
          />
          <Select
            className="sm:w-44"
            value={enabledFilter}
            onChange={(e) => setEnabledFilter(e.target.value as EnabledFilter)}
            aria-label="Filtrar por ativação"
          >
            <option value="all">Todos os tickets</option>
            <option value="active">Somente ativos</option>
            <option value="inactive">Somente desativados</option>
          </Select>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtro de janela de venda">
          {windowFilters.map((option) => {
            const active = windowFilter === option.value;
            const count =
              option.value === ''
                ? Object.values(windowCounts).reduce((sum, n) => sum + n, 0)
                : windowCounts[option.value];

            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={active}
                onClick={() => setWindowFilter(option.value)}
                className={[
                  'rounded-chip px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  active
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {option.label}
                <span className={active ? 'ml-1.5 text-white/80' : 'ml-1.5 text-slate-400'}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {pageData.count === 0 ? (
        <EmptyState
          title="Nenhum ticket encontrado"
          description="Ajuste a busca ou os filtros."
          actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
          onAction={
            hasActiveFilters
              ? () => {
                  setSearch('');
                  setEnabledFilter('all');
                  setWindowFilter('');
                }
              : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-surface border border-slate-200 bg-white shadow-sm">
          <DataTable containerClassName="!rounded-none !border-0 !shadow-none">
            <DataTableHead>
              <DataTableRow>
                <DataTableHeaderCell>Ticket</DataTableHeaderCell>
                <DataTableHeaderCell>Status</DataTableHeaderCell>
                <DataTableHeaderCell>Valor</DataTableHeaderCell>
                <DataTableHeaderCell>Janela</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">Usados</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">
                  <span className="sr-only">Ações</span>
                </DataTableHeaderCell>
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {pageData.results.map((ticket) => {
                const window = getTicketWindowStatus(ticket);
                const windowLabel = ticketWindowStatusLabel[window];
                const rowLabel = [
                  ticket.name,
                  ticket.category?.name,
                  windowLabel,
                  ticket.enabled ? 'ativo' : 'desativado',
                ]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <DataTableRow
                    key={ticket.id}
                    className={!ticket.enabled ? 'opacity-60' : undefined}
                  >
                    <DataTableCell>
                      <div className="min-w-[10rem]">
                        <p className="font-medium text-slate-900">{ticket.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {ticket.category?.name ?? 'Sem categoria'}
                        </p>
                      </div>
                    </DataTableCell>
                    <DataTableCell>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <Badge
                          tone={ticketWindowStatusTone[window]}
                          aria-label={`Janela: ${windowLabel}`}
                        >
                          {windowLabel}
                        </Badge>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={ticket.enabled}
                          aria-label={
                            ticket.enabled
                              ? `Desativar ${ticket.name}`
                              : `Ativar ${ticket.name}`
                          }
                          disabled={isLoading}
                          onClick={() => void toggleEnabled(ticket)}
                          className={[
                            'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:opacity-60',
                            ticket.enabled ? 'bg-primary' : 'bg-slate-300',
                          ].join(' ')}
                        >
                          <span
                            aria-hidden
                            className={[
                              'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                              ticket.enabled ? 'translate-x-5' : 'translate-x-0',
                            ].join(' ')}
                          />
                        </button>
                      </div>
                    </DataTableCell>
                    <DataTableCell className="tabular-nums whitespace-nowrap">
                      {formatCurrency(ticket.price)}
                    </DataTableCell>
                    <DataTableCell>
                      <time
                        className="block whitespace-nowrap text-slate-600"
                        dateTime={new Date(ticket.startDate).toISOString()}
                        title={`${formatDate(ticket.startDate, 'dd/MM/yyyy HH:mm')} até ${formatDate(ticket.endDate, 'dd/MM/yyyy HH:mm')}`}
                      >
                        {formatSaleWindow(ticket.startDate, ticket.endDate)}
                      </time>
                    </DataTableCell>
                    <DataTableCell className="text-right tabular-nums">
                      <span aria-label={`${ticket.inUse} de ${ticket.quantity} usados`}>
                        {ticket.inUse}
                        <span className="text-slate-400"> / {ticket.quantity}</span>
                      </span>
                    </DataTableCell>
                    <DataTableCell aria-label={rowLabel}>
                      <RowActions
                        entityLabel={ticket.name}
                        onEdit={() => openEdit(ticket)}
                        onDelete={() => openDelete(ticket.id)}
                      />
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </DataTable>

          {showPagination ? (
            <PaginationBar
              page={page}
              limit={limit}
              count={pageData.count}
              currentTotal={pageData.results.length}
              hasPrevious={pageData.previous}
              hasNext={pageData.next}
              isLoading={isLoading}
              limitOptions={[10, 20, 50]}
              onLimitChange={(next) => {
                setLimit(next);
                setPage(1);
              }}
              onPrevious={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ListTicket;
