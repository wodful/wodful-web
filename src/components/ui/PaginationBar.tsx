import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { ChevronLeft, ChevronRight } from 'react-feather';

type PaginationBarProps = {
  page: number;
  limit: number;
  count: number;
  currentTotal: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isLoading?: boolean;
  limitOptions?: number[];
  onLimitChange: (limit: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  colSpan?: number;
};

export function PaginationBar({
  page,
  limit,
  count,
  currentTotal,
  hasPrevious,
  hasNext,
  isLoading,
  limitOptions = [5, 10, 20],
  onLimitChange,
  onPrevious,
  onNext,
}: PaginationBarProps) {
  const from = page * limit - (limit - 1);
  const to = page === 1 ? page * limit : page * limit - limit + currentTotal;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span>Linhas por página</span>
        <Select
          className="!min-h-9 w-[75px] !py-1.5"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        >
          {limitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex items-center justify-end gap-2 text-sm text-slate-600">
        <span>
          {from} - {to} de {count}
        </span>
        <Tooltip label="Página anterior">
          <Button
            variant="icon"
            className="!w-9"
            disabled={!hasPrevious || isLoading}
            onClick={onPrevious}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} aria-hidden />
          </Button>
        </Tooltip>
        <Tooltip label="Próxima página">
          <Button
            variant="icon"
            className="!w-9"
            disabled={!hasNext || isLoading}
            onClick={onNext}
            aria-label="Próxima página"
          >
            <ChevronRight size={16} aria-hidden />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
