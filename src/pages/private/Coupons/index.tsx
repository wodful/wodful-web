import ComponentModal from '@/components/ComponentModal';
import { EmptyState } from '@/components/ui/EmptyState';
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
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { RowActions } from '@/components/ui/RowActions';
import { Select } from '@/components/ui/Select';
import { SetupPageShell } from '@/components/ui/SetupPageShell';
import useCoupon from '@/hooks/useCoupon';
import { ICoupon } from '@/data/interfaces/coupon';
import { formatCurrency } from '@/utils/formatCurrency';
import { paginateItems } from '@/utils/setupList';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

type ActiveFilter = 'all' | 'active' | 'inactive';

function formatCouponValue(coupon: ICoupon) {
  if (coupon.type === 'PERCENTAGE') {
    return `${Number(coupon.value)}%`;
  }
  return formatCurrency(Number(coupon.value));
}

const Coupons = () => {
  const { id } = useParams();
  const {
    coupons,
    List,
    Create,
    Update,
    Delete,
    isLoading,
    limit,
    setLimit,
    page,
    setPage,
  } = useCoupon();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);

  useEffect(() => {
    if (id) List(id);
  }, [id, List]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((coupon) => {
      if (activeFilter === 'active' && !coupon.isActive) return false;
      if (activeFilter === 'inactive' && coupon.isActive) return false;
      if (!q) return true;
      return (
        coupon.code.toLowerCase().includes(q) ||
        (coupon.description ?? '').toLowerCase().includes(q)
      );
    });
  }, [coupons, search, activeFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, activeFilter, setPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / limit) || 1);
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, limit, page, setPage]);

  const pageData = useMemo(() => paginateItems(filtered, page, limit), [filtered, page, limit]);
  const showPagination = pageData.count > limit;
  const hasElements = coupons.length > 0;

  if (!id) return null;

  const resetForm = () => {
    setCode('');
    setDescription('');
    setValue('');
    setMaxRedemptions('');
    setType('PERCENTAGE');
  };

  const handleSubmit = async () => {
    if (!code || !value) return;

    const payload = {
      code: code.toUpperCase().trim(),
      description,
      type,
      value: Number(value),
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
      championshipId: id,
    };

    if (editingCoupon) {
      await Update(editingCoupon.id, payload);
    } else {
      await Create(payload);
    }

    resetForm();
    setEditingCoupon(null);
    setIsOpen(false);
  };

  const openCreate = () => {
    resetForm();
    setEditingCoupon(null);
    setIsOpen(true);
  };

  const openEdit = (coupon: ICoupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code.toUpperCase());
    setDescription(coupon.description || '');
    setType(coupon.type);
    setValue(String(coupon.value));
    setMaxRedemptions(coupon.maxRedemptions ? String(coupon.maxRedemptions) : '');
    setIsOpen(true);
  };

  const activeFilters: Array<{ value: ActiveFilter; label: string }> = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' },
  ];

  return (
    <SetupPageShell
      title="Cupons"
      description="Códigos de desconto para as inscrições do evento."
      actionLabel="Adicionar cupom"
      onAction={openCreate}
    >
      <ComponentModal
        modalHeader={editingCoupon ? 'Editar cupom' : 'Adicionar cupom'}
        size="lg"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <form
          className="flex flex-col gap-4 pb-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <FormField id="coupon-code" label="Código">
            <Input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CUPOM10"
            />
          </FormField>
          <FormField id="coupon-description" label="Descrição">
            <Input
              id="coupon-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lote promocional"
            />
          </FormField>
          <div className="flex flex-wrap gap-4">
            <div className="min-w-[140px] flex-1">
              <FormField id="coupon-type" label="Tipo">
                <Select
                  id="coupon-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                >
                  <option value="PERCENTAGE">Porcentagem (%)</option>
                  <option value="FIXED">Valor fixo</option>
                </Select>
              </FormField>
            </div>
            <div className="min-w-[140px] flex-1">
              <FormField
                id="coupon-value"
                label={type === 'PERCENTAGE' ? 'Valor (%)' : 'Valor (R$)'}
              >
                <Input
                  id="coupon-value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </FormField>
            </div>
          </div>
          <FormField id="coupon-max" label="Qtd. máxima (opcional)">
            <Input
              id="coupon-max"
              type="number"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
            />
          </FormField>
          <Button type="submit" variant="primary" isLoading={isLoading} className="mt-2 w-full">
            {editingCoupon ? 'Salvar alterações' : 'Criar cupom'}
          </Button>
        </form>
      </ComponentModal>

      {!hasElements ? (
        <EmptyState
          title="Nenhum cupom ainda"
          description="Crie códigos de desconto para aplicar nas inscrições."
          actionLabel="Criar cupom"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-3 rounded-surface border border-slate-200 bg-white p-4 shadow-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código ou descrição…"
              aria-label="Buscar cupons"
              className="sm:max-w-sm"
            />
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtro de status">
              {activeFilters.map((option) => {
                const active = activeFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveFilter(option.value)}
                    className={[
                      'rounded-chip px-3 py-1.5 text-xs font-semibold transition',
                      active
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {pageData.count === 0 ? (
            <EmptyState
              title="Nenhum cupom encontrado"
              description="Ajuste a busca ou o filtro de status."
              actionLabel="Limpar filtros"
              onAction={() => {
                setSearch('');
                setActiveFilter('all');
              }}
            />
          ) : (
            <div className="overflow-hidden rounded-surface border border-slate-200 bg-white shadow-sm">
              <DataTable containerClassName="!rounded-none !border-0 !shadow-none">
                <DataTableHead>
                  <DataTableRow>
                    <DataTableHeaderCell>Código</DataTableHeaderCell>
                    <DataTableHeaderCell>Descrição</DataTableHeaderCell>
                    <DataTableHeaderCell>Tipo</DataTableHeaderCell>
                    <DataTableHeaderCell className="text-right">Valor</DataTableHeaderCell>
                    <DataTableHeaderCell className="text-right">Qtd. máx.</DataTableHeaderCell>
                    <DataTableHeaderCell>Ativo</DataTableHeaderCell>
                    <DataTableHeaderCell />
                  </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                  {pageData.results.map((coupon) => (
                    <DataTableRow key={coupon.id}>
                      <DataTableCell className="font-semibold tracking-wide text-slate-900">
                        {coupon.code}
                      </DataTableCell>
                      <DataTableCell className="text-slate-600">
                        {coupon.description || '—'}
                      </DataTableCell>
                      <DataTableCell>
                        <Badge tone="neutral">
                          {coupon.type === 'PERCENTAGE' ? 'Porcentagem' : 'Fixo'}
                        </Badge>
                      </DataTableCell>
                      <DataTableCell className="text-right tabular-nums font-medium">
                        {formatCouponValue(coupon)}
                      </DataTableCell>
                      <DataTableCell className="text-right tabular-nums">
                        {coupon.maxRedemptions ?? '—'}
                      </DataTableCell>
                      <DataTableCell>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={coupon.isActive}
                          aria-label={coupon.isActive ? 'Desativar cupom' : 'Ativar cupom'}
                          onClick={() =>
                            Update(coupon.id, {
                              isActive: !coupon.isActive,
                              championshipId: coupon.championshipId,
                            })
                          }
                          className={[
                            'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
                            coupon.isActive ? 'bg-primary' : 'bg-slate-300',
                          ].join(' ')}
                        >
                          <span
                            aria-hidden
                            className={[
                              'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                              coupon.isActive ? 'translate-x-5' : 'translate-x-0',
                            ].join(' ')}
                          />
                        </button>
                      </DataTableCell>
                      <DataTableCell>
                        <RowActions
                          entityLabel={coupon.code}
                          onEdit={() => openEdit(coupon)}
                          onDelete={() => Delete(coupon.id, coupon.championshipId)}
                        />
                      </DataTableCell>
                    </DataTableRow>
                  ))}
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
      )}
    </SetupPageShell>
  );
};

export default Coupons;
