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
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { Tooltip } from '@/components/ui/Tooltip';
import { IIsLiveDTO, IIsOverDTO } from '@/data/interfaces/schedule';
import useScheduleData from '@/hooks/useScheduleData';
import { incrementAndFormatDate } from '@/utils/formatDate';
import { useEffect, useState } from 'react';
import { MoreHorizontal, Radio } from 'react-feather';

interface IListSchedule {
  championshipId: string;
}

const ListSchedule = ({ championshipId }: IListSchedule) => {
  const [currentTotal, setCurrentTotal] = useState<number>(0);

  const {
    ListPaginated,
    schedulePages,
    page,
    limit,
    setLimit,
    setPage,
    isLoading,
    Delete,
    IsLive,
    IsOver,
  } = useScheduleData();

  const [scheduleId, setScheduleId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const openDelete = (id: string) => {
    setScheduleId(id);
    setIsOpen(true);
  };

  const confirmDelete = () => {
    Delete(scheduleId);
  };

  useEffect(() => {
    ListPaginated(championshipId);
  }, [ListPaginated, championshipId]);

  useEffect(() => {
    setCurrentTotal(schedulePages.results?.length);
  }, [schedulePages.results?.length]);

  const previousPage = () => {
    setPage(page - 1);
  };

  const handleIsLive = (scheduleId: string, toggleInit: boolean) => {
    const isLivePayload: IIsLiveDTO = {
      championshipId: championshipId,
      activityId: scheduleId,
      isLive: toggleInit,
    };

    IsLive(isLivePayload);
  };

  const handleIsOver = (scheduleId: string, toggleInit: boolean) => {
    const isOverPayload: IIsOverDTO = {
      championshipId: championshipId,
      activityId: scheduleId,
      isOver: toggleInit,
    };

    IsOver(isOverPayload);
  };

  const nextPage = () => {
    setPage(page + 1);
  };

  return (
    <>
      <ComponentModal modalHeader='Remover cronograma' size='sm' isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <DeleteData onClose={() => setIsOpen(false)} removedData='o cronograma' confirmDelete={confirmDelete} />
      </ComponentModal>

      <DataTable className='text-sm text-slate-800'>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeaderCell>DATA</DataTableHeaderCell>
            <DataTableHeaderCell>HORÁRIO</DataTableHeaderCell>
            <DataTableHeaderCell>CATEGORIA</DataTableHeaderCell>
            <DataTableHeaderCell>PROVA</DataTableHeaderCell>
            <DataTableHeaderCell>BATERIA</DataTableHeaderCell>
            <DataTableHeaderCell>BAIA</DataTableHeaderCell>
            <DataTableHeaderCell />
          </DataTableRow>
        </DataTableHead>

        <DataTableBody>
          {schedulePages.results?.map((schedule) => (
            <DataTableRow key={schedule.id} className={schedule.isOver ? 'bg-slate-200' : ''}>
              <DataTableCell className='capitalize'>
                {schedule.isOver ? (
                  <del>{incrementAndFormatDate(schedule.date)}</del>
                ) : (
                  incrementAndFormatDate(schedule.date)
                )}
              </DataTableCell>

              <DataTableCell className='capitalize'>
                {schedule.isOver ? <del>{schedule.hour}</del> : schedule.hour}
              </DataTableCell>

              <DataTableCell className='capitalize'>
                {schedule.isOver ? <del>{schedule.category.name}</del> : schedule.category.name}
              </DataTableCell>

              <DataTableCell className='capitalize'>
                {schedule.isOver ? <del>{schedule.workout.name}</del> : schedule.workout.name}
              </DataTableCell>

              <DataTableCell className='capitalize'>
                {schedule.isOver ? <del>{schedule.heat}</del> : schedule.heat}
              </DataTableCell>

              <DataTableCell>
                {schedule.isOver ? <del>{schedule.laneQuantity}</del> : schedule.laneQuantity}
              </DataTableCell>

              <DataTableCell className='py-6'>
                <div className='flex items-center justify-end gap-1'>
                  {schedule.isLive && (
                    <Tooltip label='Ao vivo'>
                      <Badge tone='danger' className='gap-1 rounded-md px-1.5'>
                        <Radio size={12} />
                      </Badge>
                    </Tooltip>
                  )}
                  <DropdownMenu>
                    <DropdownMenuButton aria-label='Opções'>
                      <MoreHorizontal size={18} />
                    </DropdownMenuButton>
                    <DropdownMenuList>
                      {!schedule.isLive && !schedule.isOver && (
                        <>
                          <DropdownMenuItem onClick={() => handleIsLive(schedule.id, true)}>
                            Iniciar
                          </DropdownMenuItem>
                          <DropdownMenuItem danger onClick={() => openDelete(schedule.id)}>
                            Deletar
                          </DropdownMenuItem>
                        </>
                      )}

                      {schedule.isLive && (
                        <>
                          <DropdownMenuItem onClick={() => handleIsLive(schedule.id, false)}>
                            Parar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleIsOver(schedule.id, true)}>
                            Encerrar
                          </DropdownMenuItem>
                        </>
                      )}

                      {schedule.isOver && (
                        <DropdownMenuItem onClick={() => handleIsOver(schedule.id, false)}>
                          Reabrir
                        </DropdownMenuItem>
                      )}
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
        count={schedulePages.count ?? 0}
        currentTotal={currentTotal}
        hasPrevious={!!schedulePages.previous}
        hasNext={!!schedulePages.next}
        isLoading={isLoading}
        limitOptions={[5, 10, 20, 40]}
        onLimitChange={(next) => {
          setLimit(next);
          setPage(1);
        }}
        onPrevious={previousPage}
        onNext={nextPage}
      />
    </>
  );
};

export default ListSchedule;
