import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'react-feather';
import LogoBlack from '@/assets/icons/wodful-black-logo.svg';
import LogoWhite from '@/assets/icons/wodful-white-logo.svg';
import useApp from '@/hooks/useApp';
import useAuth from '@/hooks/useAuth';
import useTheme from '@/hooks/useTheme';

function getInitials(name?: string) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
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
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const showTitle = shouldShowEventTitle(pathname);
  const eventTitle = currentChampionship?.name?.trim();

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
    <header
      className={
        isDark
          ? 'sticky top-0 z-30 border-b border-white/10 bg-blue-dark'
          : 'sticky top-0 z-30 border-b border-slate-200 bg-white'
      }
    >
      <div className="h-0.5 w-full bg-primary" aria-hidden />
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          to="/championships"
          className={
            isDark
              ? 'flex min-w-0 shrink-0 items-center gap-2 text-white no-underline'
              : 'flex min-w-0 shrink-0 items-center gap-2 text-slate-900 no-underline'
          }
        >
          <img src={isDark ? LogoWhite : LogoBlack} alt="" className="h-8 w-8 shrink-0" />
          <span className="text-sm font-semibold tracking-tight">Wodful</span>
        </Link>

        {showTitle && eventTitle ? (
          <>
            <span
              className={isDark ? 'h-5 w-px shrink-0 bg-white/15' : 'h-5 w-px shrink-0 bg-slate-200'}
              aria-hidden
            />
            <p
              className={
                isDark
                  ? 'min-w-0 flex-1 truncate text-sm font-medium text-white/70'
                  : 'min-w-0 flex-1 truncate text-sm font-medium text-slate-600'
              }
              title={eventTitle}
            >
              {eventTitle}
            </p>
          </>
        ) : (
          <div className="flex-1" />
        )}

        <button
          type="button"
          onClick={toggleTheme}
          className={
            isDark
              ? 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
              : 'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
          }
          aria-label={isDark ? 'Usar chrome claro' : 'Usar chrome escuro'}
          title={isDark ? 'Chrome claro' : 'Chrome escuro'}
        >
          {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
        </button>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={
              isDark
                ? 'inline-flex items-center rounded-full p-0.5 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                : 'inline-flex items-center rounded-full p-0.5 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
            }
            aria-label="Abrir menu da conta"
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
          </button>

          {menuOpen ? (
            <div
              id={menuId}
              role="menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-surface border border-slate-200 bg-white py-1 shadow-sm"
            >
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name?.trim() || 'Conta'}
                </p>
                {user?.email ? (
                  <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
                ) : null}
              </div>
              <button
                type="button"
                role="menuitem"
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
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
