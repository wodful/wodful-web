import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  menuId: string;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, menuId }}>
      <div ref={rootRef} className="relative inline-flex">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components require DropdownMenu root');
  return ctx;
}

export function DropdownMenuButton({
  children,
  className = '',
  'aria-label': ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  'aria-label'?: string;
}) {
  const { open, setOpen, menuId } = useDropdownMenu();
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      aria-label={ariaLabel}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${className}`}
      onClick={() => setOpen(!open)}
    >
      {children}
    </button>
  );
}

export function DropdownMenuList({
  children,
  align = 'right',
}: {
  children: ReactNode;
  align?: 'left' | 'right';
}) {
  const { open, menuId } = useDropdownMenu();
  if (!open) return null;
  return (
    <div
      id={menuId}
      role="menu"
      className={`absolute z-30 mt-1 min-w-[10rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg ${
        align === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  danger,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  const { setOpen } = useDropdownMenu();
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={`flex w-full items-center px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
      }`}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
