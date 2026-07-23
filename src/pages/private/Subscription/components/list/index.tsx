import ComponentModal from '@/components/ComponentModal';
import DeleteData from '@/components/Delete';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
import type {
  ISubscription,
  SubscriptionPaymentOrigin,
} from '@/data/interfaces/subscription';
import useCategoryData from '@/hooks/useCategoryData';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import { formatDate } from '@/utils/formatDate';
import {
  getSubscriptionAmountDisplay,
  getSubscriptionOriginDisplay,
  getSubscriptionStatusDisplay,
  toDisplayName,
} from '@/utils/subscriptionDisplay';
import { useEffect, useState, type ReactNode } from 'react';

interface IListSubscription {
  id: string;
  onEdit: (subscriptionId: string) => void;
  emptyFallback?: ReactNode;
}

const ORIGIN_OPTIONS: { value: SubscriptionPaymentOrigin | ''; label: string }[] = [
  { value: '', label: 'Todas as origens' },
  { value: 'MERCADO_PAGO', label: 'Online' },
  { value: 'MANUAL', label: 'Interna' },
  { value: 'COMPLIMENTARY', label: 'Isenta' },
  { value: 'NONE', label: 'Aguardando' },
];

const ListSubscription = ({ id, onEdit, emptyFallback }: IListSubscription) => {
  const [currentTotal, setCurrentTotal] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResendOpen, setIsResendOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [isPaymentLinkOpen, setIsPaymentLinkOpen] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const {
    ListPaginated,
    subscriptionsPages,
    page,
    limit,
    setLimit,
    setPage,
    originFilter,
    setOriginFilter,
    isLoading,
    Delete,
    UpdateStatus,
    SetComplimentary,
    CreatePaymentLink,
    ResendApprovedEmail,
  } = useSubscriptionData();
  const { categories } = useCategoryData();

  useEffect(() => {
    const next = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearchQuery((prev) => {
        if (prev === next) return prev;
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, setPage]);

  useEffect(() => {
    ListPaginated(id, categoryId, originFilter, searchQuery);
  }, [ListPaginated, id, categoryId, originFilter, searchQuery]);

  useEffect(() => {
    setCurrentTotal(subscriptionsPages.results?.length ?? 0);
  }, [subscriptionsPages.results?.length]);

  const useCategoryChips = categories.length > 1 && categories.length <= 8;
  const totalCount = subscriptionsPages.count ?? 0;
  const hasActiveFilters = Boolean(categoryId || originFilter || searchQuery);
  const results = subscriptionsPages.results ?? [];

  const openDelete = (subId: string) => {
    setSubscriptionId(subId);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    Delete(subscriptionId);
  };

  const changeSubscriptionStatus = (subId: string, status: string) => {
    UpdateStatus(subId, status);
  };

  const openResendEmail = (subId: string) => {
    setSubscriptionId(subId);
    setIsResendOpen(true);
  };

  const confirmResendEmail = () => {
    ResendApprovedEmail(subscriptionId);
    setIsResendOpen(false);
  };

  const handlePaymentLink = async (subId: string) => {
    const result = await CreatePaymentLink(subId);
    if (!result?.paymentUrl) return;
    setPaymentLink(result.paymentUrl);
    setCopyDone(false);
    setIsPaymentLinkOpen(true);
  };

  const copyPaymentLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopyDone(true);
    } catch {
      setCopyDone(false);
    }
  };

  const canGeneratePaymentLink = (subscription: ISubscription) =>
    subscription.status === 'WAITING' &&
    !subscription.isComplimentary &&
    !subscription.paidOnline;

  const clearFilters = () => {
    setCategoryId('');
    setOriginFilter('');
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const setCategory = (next: string) => {
    setPage(1);
    setCategoryId(next);
  };

  const setOrigin = (next: SubscriptionPaymentOrigin | '') => {
    setPage(1);
    setOriginFilter(next);
  };

  return (
    <div className="space-y-4">
      <ComponentModal
        modalHeader="Remover inscrição"
        size="sm"
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      >
        <DeleteData
          onClose={() => setIsDeleteOpen(false)}
          removedData="a inscrição"
          confirmDelete={confirmDelete}
        />
      </ComponentModal>
      <ComponentModal
        modalHeader="Reenviar e-mail"
        size="sm"
        isOpen={isResendOpen}
        onClose={() => setIsResendOpen(false)}
      >
        <div className="flex flex-col gap-5 pb-4">
          <p className="text-sm text-slate-700">
            Deseja reenviar o e-mail de confirmação para o responsável desta inscrição?
          </p>
          <Button variant="primary" className="w-full" onClick={confirmResendEmail}>
            Reenviar e-mail
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => setIsResendOpen(false)}>
            Cancelar
          </Button>
        </div>
      </ComponentModal>
      <ComponentModal
        modalHeader="Link de pagamento"
        size="sm"
        isOpen={isPaymentLinkOpen}
        onClose={() => setIsPaymentLinkOpen(false)}
      >
        <div className="flex flex-col gap-4 pb-4">
          <p className="text-sm text-slate-700">
            Envie este link para o atleta concluir o pagamento online.
          </p>
          <a
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm font-medium text-primary hover:underline"
          >
            {paymentLink}
          </a>
          <Button variant="primary" className="w-full" onClick={copyPaymentLink}>
            {copyDone ? 'Copiado' : 'Copiar link'}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setIsPaymentLinkOpen(false)}
          >
            Fechar
          </Button>
        </div>
      </ComponentModal>

      <div className="space-y-3 rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por responsável ou participante…"
            aria-label="Buscar inscrições"
            className="min-w-0 flex-1"
          />
          <Select
            className="sm:w-48"
            value={originFilter}
            onChange={(e) => setOrigin(e.target.value as SubscriptionPaymentOrigin | '')}
            aria-label="Filtrar por origem"
          >
            {ORIGIN_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
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
          {totalCount} {totalCount === 1 ? 'inscrição' : 'inscrições'}
          {hasActiveFilters ? ' · filtros ativos' : ''}
        </p>
      </div>

      {!isLoading && totalCount === 0 ? (
        emptyFallback && !hasActiveFilters ? (
          emptyFallback
        ) : (
          <EmptyState
            title="Nenhuma inscrição encontrada"
            description="Ajuste a busca ou os filtros de categoria e origem."
            actionLabel={hasActiveFilters ? 'Limpar filtros' : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        )
      ) : isLoading && totalCount === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">Carregando inscrições…</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-surface border border-slate-200 bg-white shadow-sm">
            <DataTable containerClassName="!rounded-none !border-0 !shadow-none">
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeaderCell>Responsável</DataTableHeaderCell>
                  <DataTableHeaderCell>Participante</DataTableHeaderCell>
                  <DataTableHeaderCell>Categoria</DataTableHeaderCell>
                  <DataTableHeaderCell>Status</DataTableHeaderCell>
                  <DataTableHeaderCell>Origem</DataTableHeaderCell>
                  <DataTableHeaderCell>Valor</DataTableHeaderCell>
                  <DataTableHeaderCell>Criada em</DataTableHeaderCell>
                  <DataTableHeaderCell className="text-right">
                    <span className="sr-only">Ações</span>
                  </DataTableHeaderCell>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                {results.map((subscription) => {
                  const statusDisplay = getSubscriptionStatusDisplay(subscription);
                  const originDisplay = getSubscriptionOriginDisplay(subscription);
                  const amountDisplay = getSubscriptionAmountDisplay(subscription);
                  const isComplimentary =
                    subscription.isComplimentary ||
                    subscription.paymentOrigin === 'COMPLIMENTARY';

                  const menuActions = [
                    ...(subscription.status !== 'APPROVED'
                      ? [
                          {
                            label: 'Aprovar no painel',
                            onClick: () => changeSubscriptionStatus(subscription.id, 'approve'),
                          },
                        ]
                      : []),
                    ...(subscription.status !== 'DECLINED'
                      ? [
                          {
                            label: 'Recusar',
                            onClick: () => changeSubscriptionStatus(subscription.id, 'decline'),
                          },
                        ]
                      : []),
                    ...(!isComplimentary && !subscription.paidOnline
                      ? [
                          {
                            label: 'Marcar como isenta',
                            onClick: () => SetComplimentary(subscription.id, true),
                          },
                        ]
                      : []),
                    ...(isComplimentary
                      ? [
                          {
                            label: 'Remover isenção',
                            onClick: () => SetComplimentary(subscription.id, false),
                          },
                        ]
                      : []),
                    ...(canGeneratePaymentLink(subscription)
                      ? [
                          {
                            label: 'Gerar link de pagamento',
                            onClick: () => handlePaymentLink(subscription.id),
                          },
                        ]
                      : []),
                    ...(subscription.status === 'APPROVED'
                      ? [
                          {
                            label: 'Reenviar e-mail',
                            onClick: () => openResendEmail(subscription.id),
                          },
                        ]
                      : []),
                  ];

                  return (
                    <DataTableRow key={subscription.id}>
                      <DataTableCell>
                        {toDisplayName(subscription.responsibleName)}
                      </DataTableCell>
                      <DataTableCell>{toDisplayName(subscription.nickname)}</DataTableCell>
                      <DataTableCell>{subscription.category.name}</DataTableCell>
                      <DataTableCell>
                        <Badge tone={statusDisplay.tone}>{statusDisplay.label}</Badge>
                      </DataTableCell>
                      <DataTableCell>
                        {originDisplay ? (
                          <Badge tone={originDisplay.tone}>{originDisplay.label}</Badge>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </DataTableCell>
                      <DataTableCell>
                        <span
                          className="text-sm font-medium text-slate-900"
                          title={amountDisplay.title}
                        >
                          {amountDisplay.label}
                        </span>
                      </DataTableCell>
                      <DataTableCell>
                        {formatDate(subscription.createdAt, 'dd/MM/yyyy HH:mm')}
                      </DataTableCell>
                      <DataTableCell className="text-right">
                        <RowActions
                          entityLabel={subscription.nickname}
                          onEdit={() => onEdit(subscription.id)}
                          onDelete={() => openDelete(subscription.id)}
                          menuActions={menuActions}
                        />
                      </DataTableCell>
                    </DataTableRow>
                  );
                })}
              </DataTableBody>
            </DataTable>
          </div>

          <PaginationBar
            page={page}
            limit={limit}
            count={totalCount}
            currentTotal={currentTotal}
            hasPrevious={!!subscriptionsPages.previous}
            hasNext={!!subscriptionsPages.next}
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

export default ListSubscription;
