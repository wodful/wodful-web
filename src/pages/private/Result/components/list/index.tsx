import { useMemo, useState } from 'react';
import { Edit2, EyeOff, MoreHorizontal } from 'react-feather';

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
import { EmptyState } from '@/components/ui/EmptyState';
import useResultData from '@/hooks/useResultData';

export type ReleaseFilter = 'all' | 'released' | 'hidden';

interface IListResultProps {
  openEdit: (id: string) => void;
  categoryId: string;
  releaseFilter: ReleaseFilter;
  workoutLabel?: string;
  showWorkoutColumn?: boolean;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (a + b).toUpperCase() || '?';
}

function rankTone(rank: number) {
  if (rank === 1) return 'bg-amber-100 text-amber-800 ring-amber-200';
  if (rank === 2) return 'bg-slate-200 text-slate-700 ring-slate-300';
  if (rank === 3) return 'bg-orange-100 text-orange-800 ring-orange-200';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

const ListResults = ({
  openEdit,
  categoryId,
  releaseFilter,
  workoutLabel,
  showWorkoutColumn = true,
}: IListResultProps) => {
  const { resultPages, Delete } = useResultData();
  const [resultId, setResultId] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    const rows = resultPages ?? [];
    if (releaseFilter === 'released') return rows.filter((r) => r.isReleased);
    if (releaseFilter === 'hidden') return rows.filter((r) => !r.isReleased);
    return rows;
  }, [releaseFilter, resultPages]);

  if (!resultPages?.length) {
    return (
      <EmptyState
        title={
          workoutLabel
            ? `Nenhum resultado em ${workoutLabel}`
            : 'Nenhum resultado nesta categoria'
        }
        description="Adicione um resultado ou escolha outra prova."
      />
    );
  }

  if (!filtered.length) {
    return (
      <EmptyState
        title={
          releaseFilter === 'hidden'
            ? 'Nenhum resultado oculto'
            : 'Nenhum resultado liberado'
        }
        description="Ajuste o filtro de status ou libere/oculte resultados."
      />
    );
  }

  return (
    <>
      <ComponentModal
        modalHeader="Remover resultado"
        size="sm"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DeleteData
          onClose={() => setIsOpen(false)}
          removedData="o resultado"
          confirmDelete={() => Delete(resultId, categoryId)}
        />
      </ComponentModal>

      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeaderCell className="w-14">#</DataTableHeaderCell>
            <DataTableHeaderCell>Participante</DataTableHeaderCell>
            {showWorkoutColumn ? (
              <DataTableHeaderCell>Prova</DataTableHeaderCell>
            ) : null}
            <DataTableHeaderCell>Resultado</DataTableHeaderCell>
            <DataTableHeaderCell className="text-right">Pontos</DataTableHeaderCell>
            <DataTableHeaderCell>Visibilidade</DataTableHeaderCell>
            <DataTableHeaderCell />
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {filtered.map((result) => {
            const rank = Number(result.classification) || 0;
            return (
              <DataTableRow key={result.id}>
                <DataTableCell className="py-3">
                  {rank > 0 ? (
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-1 ${rankTone(
                        rank,
                      )}`}
                    >
                      {rank}º
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </DataTableCell>
                <DataTableCell className="py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-white">
                      {initials(result.nickname)}
                    </span>
                    <span className="truncate font-medium capitalize text-slate-900">
                      {result.nickname}
                    </span>
                  </div>
                </DataTableCell>
                {showWorkoutColumn ? (
                  <DataTableCell className="py-3 text-slate-600">
                    {result.workout.name}
                  </DataTableCell>
                ) : null}
                <DataTableCell className="py-3 font-medium tabular-nums text-slate-900">
                  {result.result}
                </DataTableCell>
                <DataTableCell className="py-3 text-right tabular-nums font-semibold text-slate-900">
                  {Number(result.points) === 0
                    ? '—'
                    : `${Number(result.points)} ${Number(result.points) === 1 ? 'pt' : 'pts'}`}
                </DataTableCell>
                <DataTableCell className="py-3">
                  {result.isReleased ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                      Público
                    </span>
                  ) : (
                    <Badge tone="warning" className="gap-1">
                      <EyeOff size={12} aria-hidden />
                      Oculto
                    </Badge>
                  )}
                </DataTableCell>
                <DataTableCell className="py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="icon"
                      aria-label={`Editar ${result.nickname}`}
                      onClick={() => openEdit(result.id)}
                    >
                      <Edit2 size={15} aria-hidden />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuButton aria-label="Mais opções">
                        <MoreHorizontal size={18} />
                      </DropdownMenuButton>
                      <DropdownMenuList>
                        <DropdownMenuItem onClick={() => openEdit(result.id)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          danger
                          onClick={() => {
                            setResultId(result.id);
                            setIsOpen(true);
                          }}
                        >
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuList>
                    </DropdownMenu>
                  </div>
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>
    </>
  );
};

export default ListResults;
