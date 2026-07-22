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
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import { PaginationBar } from '@/components/ui/PaginationBar';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import { formatDate } from '@/utils/formatDate';
import { subscriptionStatus } from '@/utils/messages';
import { useEffect, useState } from 'react';
import { MoreHorizontal } from 'react-feather';

interface IListSubscription {
  id: string;
  categoryId: string;
  onEdit: (subscriptionId: string) => void;
}

const statusTone: Record<string, 'success' | 'danger' | 'warning'> = {
  APPROVED: 'success',
  DECLINED: 'danger',
};

const ListSubscription = ({ id, categoryId, onEdit }: IListSubscription) => {
  const [currentTotal, setCurrentTotal] = useState<number>(0);
  const [subscriptionId, setSubscriptionId] = useState<string>('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResendOpen, setIsResendOpen] = useState(false);

  const {
    ListPaginated,
    subscriptionsPages,
    page,
    limit,
    setLimit,
    setPage,
    isLoading,
    Delete,
    UpdateStatus,
    ResendApprovedEmail,
  } = useSubscriptionData();

  useEffect(() => {
    ListPaginated(id, categoryId);
  }, [ListPaginated, id, categoryId]);

  useEffect(() => {
    setCurrentTotal(subscriptionsPages.results?.length ?? 0);
  }, [subscriptionsPages.results?.length]);

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

  return (
    <>
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
      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeaderCell>Responsável</DataTableHeaderCell>
            <DataTableHeaderCell>Participante</DataTableHeaderCell>
            <DataTableHeaderCell>Categoria</DataTableHeaderCell>
            <DataTableHeaderCell>Status</DataTableHeaderCell>
            <DataTableHeaderCell>Criada em</DataTableHeaderCell>
            <DataTableHeaderCell />
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {subscriptionsPages.results?.length === 0 && (
            <DataTableRow>
              <DataTableCell colSpan={6} className="py-6 text-center text-slate-500">
                Busque por uma categoria
              </DataTableCell>
            </DataTableRow>
          )}
          {subscriptionsPages.results?.map((subscription) => (
            <DataTableRow key={subscription.id}>
              <DataTableCell className="py-4 capitalize">{subscription.responsibleName}</DataTableCell>
              <DataTableCell className="py-4 capitalize">{subscription.nickname}</DataTableCell>
              <DataTableCell className="py-4 capitalize">{subscription.category.name}</DataTableCell>
              <DataTableCell className="py-4">
                <Badge
                  tone={statusTone[subscription.status] ?? 'warning'}
                  className="capitalize"
                >
                  {subscriptionStatus[subscription.status]}
                </Badge>
              </DataTableCell>
              <DataTableCell className="py-4">
                {formatDate(subscription.createdAt, 'dd/MM/yyyy HH:mm')}
              </DataTableCell>
              <DataTableCell className="py-4">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuButton aria-label="Opções">
                      <MoreHorizontal size={18} />
                    </DropdownMenuButton>
                    <DropdownMenuList side="top">
                      <DropdownMenuItem
                        onClick={() => changeSubscriptionStatus(subscription.id, 'approve')}
                      >
                        Aprovar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => changeSubscriptionStatus(subscription.id, 'decline')}
                      >
                        Recusar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(subscription.id)}>Editar</DropdownMenuItem>
                      {subscription.status === 'APPROVED' && (
                        <DropdownMenuItem onClick={() => openResendEmail(subscription.id)}>
                          Reenviar e-mail
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem danger onClick={() => openDelete(subscription.id)}>
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
        count={subscriptionsPages.count ?? 0}
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
  );
};

export default ListSubscription;
