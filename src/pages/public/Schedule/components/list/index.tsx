import { Badge } from '@/components/ui/Badge';
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/components/ui/DataTable';
import useScheduleData from '@/hooks/useScheduleData';
import { formatDate } from '@/utils/formatDate';
import { ArrowDown } from 'react-feather';

const ListTablePublicSchedule = () => {
  const { schedules } = useScheduleData();

  return (
    <DataTable>
      <DataTableHead>
        <DataTableRow>
          <DataTableHeaderCell>Data</DataTableHeaderCell>
          <DataTableHeaderCell>Horário</DataTableHeaderCell>
          <DataTableHeaderCell>Categoria</DataTableHeaderCell>
          <DataTableHeaderCell>Prova</DataTableHeaderCell>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {schedules?.map((schedule) => (
          <DataTableRow key={schedule.id}>
            <DataTableCell className="py-4">
              <div className="flex items-center gap-2">
                <ArrowDown size={16} aria-hidden />
                <span>{formatDate(`${schedule.date}`)}</span>
              </div>
            </DataTableCell>
            <DataTableCell className="py-4">{schedule.hour}</DataTableCell>
            <DataTableCell className="py-4">
              <Badge tone="primary">{schedule.category.name}</Badge>
            </DataTableCell>
            <DataTableCell className="py-4">{schedule.workout.name}</DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
};

export default ListTablePublicSchedule;
