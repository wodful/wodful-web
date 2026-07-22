import ComponentModal from '@/components/ComponentModal';
import { EmptyList } from '@/components/EmptyList';
import { Button } from '@/components/ui/Button';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { Select } from '@/components/ui/Select';
import useCoupon from '@/hooks/useCoupon';
import { ICoupon } from '@/data/interfaces/coupon';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MoreHorizontal } from 'react-feather';
import { useParams } from 'react-router-dom';

const Coupons = () => {
  const { id } = useParams();
  const {
    couponsPages,
    ListPaginated,
    Create,
    Update,
    Delete,
    isLoading,
    limit,
    setLimit,
    page,
    setPage,
  } = useCoupon();

  const [currentTotal, setCurrentTotal] = useState<number>(0);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ICoupon | null>(null);

  useEffect(() => {
    if (id) {
      ListPaginated(id);
    }
  }, [id, ListPaginated]);

  useEffect(() => {
    setCurrentTotal(couponsPages.results?.length ?? 0);
  }, [couponsPages.results?.length]);

  if (!id) return null;

  const hasElements = useMemo(
    () => (couponsPages.count ?? 0) > 0,
    [couponsPages.count],
  );

  const previousPage = useCallback(() => {
    setPage(page - 1);
  }, [page, setPage]);

  const nextPage = useCallback(() => {
    setPage(page + 1);
  }, [page, setPage]);

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

  return (
    <div className="flex w-full flex-col items-center p-6">
      <div className="flex w-full justify-between">
        {hasElements && (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Gestão de cupons</h1>
            <Button variant="primary" className="w-auto" onClick={openCreate}>
              Adicionar cupom
            </Button>
          </>
        )}
      </div>

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

      {!hasElements && (
        <EmptyList
          text="Você não possui cupons ainda!"
          contentButton="Crie um cupom"
          onClose={openCreate}
        />
      )}

      {hasElements && (
        <div className="mt-6 w-full">
          <DataTable>
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
              {couponsPages.results?.map((coupon) => (
                <DataTableRow key={coupon.id}>
                  <DataTableCell className="py-4">{coupon.code}</DataTableCell>
                  <DataTableCell className="py-4">{coupon.description}</DataTableCell>
                  <DataTableCell className="py-4">
                    {coupon.type === 'PERCENTAGE' ? 'Porcentagem' : 'Fixo'}
                  </DataTableCell>
                  <DataTableCell className="py-4 text-right">
                    {Number(coupon.value).toString()}
                  </DataTableCell>
                  <DataTableCell className="py-4 text-right">
                    {coupon.maxRedemptions ?? '-'}
                  </DataTableCell>
                  <DataTableCell className="py-4">
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
                  <DataTableCell className="py-4">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuButton aria-label="Opções">
                          <MoreHorizontal size={18} />
                        </DropdownMenuButton>
                        <DropdownMenuList side="top">
                          <DropdownMenuItem onClick={() => openEdit(coupon)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            danger
                            onClick={() => Delete(coupon.id, coupon.championshipId)}
                          >
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuList>
                      </DropdownMenu>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
          <PaginationBar
            page={page}
            limit={limit}
            count={couponsPages.count ?? 0}
            currentTotal={currentTotal}
            hasPrevious={!!couponsPages.previous}
            hasNext={!!couponsPages.next}
            isLoading={isLoading}
            onLimitChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
            onPrevious={previousPage}
            onNext={nextPage}
          />
        </div>
      )}
    </div>
  );
};

export default Coupons;
