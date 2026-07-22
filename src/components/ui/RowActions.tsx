import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import type { ReactNode } from 'react';
import { Edit2, MoreHorizontal, Trash2 } from 'react-feather';

export type RowMenuAction = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

type RowActionsProps = {
  /** Accessible name of the row entity (e.g. ticket name). */
  entityLabel: string;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Extra actions beyond edit/delete. When present, the ⋯ menu is shown. */
  menuActions?: RowMenuAction[];
  /** Optional custom controls rendered before the standard icons. */
  leading?: ReactNode;
};

/**
 * Table row actions:
 * - Only edit/delete → pencil + trash icons
 * - Extra actions → pencil + trash icons + ⋯ menu with the extras only
 */
export function RowActions({
  entityLabel,
  onEdit,
  onDelete,
  menuActions = [],
  leading,
}: RowActionsProps) {
  const extras = menuActions.filter(Boolean);
  const showMenu = extras.length > 0;

  return (
    <div className="flex items-center justify-end gap-1">
      {leading}
      {onEdit ? (
        <Button
          variant="icon"
          className="!w-9"
          aria-label={`Editar ${entityLabel}`}
          onClick={onEdit}
        >
          <Edit2 size={15} aria-hidden />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          variant="icon"
          className="!w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
          aria-label={`Remover ${entityLabel}`}
          onClick={onDelete}
        >
          <Trash2 size={15} aria-hidden />
        </Button>
      ) : null}
      {showMenu ? (
        <DropdownMenu>
          <DropdownMenuButton aria-label={`Mais opções de ${entityLabel}`}>
            <MoreHorizontal size={18} />
          </DropdownMenuButton>
          <DropdownMenuList side="top">
            {extras.map((action) => (
              <DropdownMenuItem
                key={action.label}
                danger={action.danger}
                onClick={action.onClick}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuList>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
