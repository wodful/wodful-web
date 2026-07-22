import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  menuId: string;
  triggerRef: RefObject<HTMLButtonElement>;
  menuRef: RefObject<HTMLDivElement>;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

const MENU_GAP = 6;
const MENU_MIN_WIDTH = 160;

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
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
    <DropdownMenuContext.Provider value={{ open, setOpen, menuId, triggerRef, menuRef }}>
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
  const { open, setOpen, menuId, triggerRef } = useDropdownMenu();
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      aria-label={ariaLabel}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-control text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${className}`}
      onClick={() => setOpen(!open)}
    >
      {children}
    </button>
  );
}

type MenuCoords = {
  top: number;
  left: number;
  ready: boolean;
};

export function DropdownMenuList({
  children,
  align = 'right',
  /** Prefer opening above the trigger (better inside short tables). */
  side = 'auto',
}: {
  children: ReactNode;
  align?: 'left' | 'right';
  side?: 'auto' | 'top' | 'bottom';
}) {
  const { open, menuId, triggerRef, menuRef } = useDropdownMenu();
  const [coords, setCoords] = useState<MenuCoords>({ top: 0, left: 0, ready: false });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const list = menuRef.current;
    if (!trigger || !list) return;

    const rect = trigger.getBoundingClientRect();
    const menuWidth = Math.max(list.offsetWidth || MENU_MIN_WIDTH, MENU_MIN_WIDTH);
    const menuHeight = list.offsetHeight || list.scrollHeight || 88;

    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const spaceAbove = rect.top - MENU_GAP;

    let placeTop = side === 'top';
    if (side === 'auto') {
      placeTop = spaceBelow < menuHeight && spaceAbove >= spaceBelow;
    } else if (side === 'bottom') {
      placeTop = false;
    }

    // When space is tight below (common with few table rows near page end), prefer top.
    if (side === 'auto' && spaceBelow < menuHeight + 8) {
      placeTop = true;
    }

    let top = placeTop ? rect.top - menuHeight - MENU_GAP : rect.bottom + MENU_GAP;
    top = Math.min(Math.max(8, top), window.innerHeight - menuHeight - 8);

    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    left = Math.min(Math.max(8, left), window.innerWidth - menuWidth - 8);

    setCoords({ top, left, ready: true });
  }, [align, menuRef, side, triggerRef]);

  useLayoutEffect(() => {
    if (!open) {
      setCoords({ top: 0, left: 0, ready: false });
      return;
    }

    updatePosition();
    const frame = requestAnimationFrame(() => {
      updatePosition();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, updatePosition, children]);

  useEffect(() => {
    if (!open) return;
    const onReposition = () => updatePosition();
    window.addEventListener('resize', onReposition);
    // capture: reposition when any scroll container moves
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, updatePosition]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        zIndex: 1000,
        minWidth: MENU_MIN_WIDTH,
        opacity: coords.ready ? 1 : 0,
        pointerEvents: coords.ready ? 'auto' : 'none',
      }}
      className="rounded-surface border border-slate-200 bg-white py-1 shadow-lg"
    >
      {children}
    </div>,
    document.body,
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
