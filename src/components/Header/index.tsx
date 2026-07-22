import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '@/assets/icons/wodful-white-logo.svg';
import useApp from '@/hooks/useApp';
import useAuth from '@/hooks/useAuth';

function getInitials(name?: string) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase() || '?';
}

function shouldShowEventTitle(pathname: string) {
  if (pathname === '/championships' || pathname === '/login' || pathname === '/') {
    return false;
  }
  return pathname.startsWith('/championships/');
}

export const Header = () => {
  const { Logout, user } = useAuth();
  const { pathname } = useLocation();
  const { currentChampionship } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const showTitle = shouldShowEventTitle(pathname);
  const eventTitle = currentChampionship?.name;

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-blue-dark">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          to="/championships"
          className="flex min-w-0 items-center gap-2 text-white no-underline"
        >
          <img src={Logo} alt="Wodful" className="h-8 w-8 shrink-0" />
          <span className="hidden text-sm font-semibold sm:inline">Wodful</span>
        </Link>

        <p className="min-w-0 flex-1 truncate text-center text-sm font-medium capitalize text-white sm:text-base">
          {showTitle ? eventTitle : null}
        </p>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-semibold text-white transition hover:bg-white/10"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-controls={menuId}
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
              aria-hidden
            >
              {getInitials(user?.name)}
            </span>
            <span className="hidden sm:inline">Conta</span>
          </button>

          {menuOpen ? (
            <div
              id={menuId}
              role="menu"
              className="absolute right-0 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-card"
            >
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                onClick={() => {
                  setMenuOpen(false);
                  Logout();
                }}
              >
                Sair
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
