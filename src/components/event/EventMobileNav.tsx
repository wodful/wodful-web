import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Menu, X } from 'react-feather';
import useTheme from '@/hooks/useTheme';
import { EventNavPanel } from './EventNavPanel';

type EventMobileNavProps = {
  championshipId: string;
};

export function EventMobileNav({ championshipId }: EventMobileNavProps) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const titleId = useId();

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <div
        className={
          isDark
            ? 'flex items-center gap-2 border-b border-white/10 bg-blue-dark px-3 py-2.5'
            : 'flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2.5'
        }
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            isDark
              ? 'inline-flex h-9 w-9 items-center justify-center rounded-control text-white/80 transition hover:bg-white/10'
              : 'inline-flex h-9 w-9 items-center justify-center rounded-control text-gray-700 transition hover:bg-gray-100'
          }
          aria-expanded={open}
          aria-controls="event-mobile-drawer"
          aria-label="Abrir menu do evento"
        >
          <Menu size={20} aria-hidden />
        </button>

        <Link
          to="/championships"
          className={
            isDark
              ? 'inline-flex items-center gap-1 text-sm font-medium text-white/70 transition hover:text-white'
              : 'inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition hover:text-gray-900'
          }
        >
          <ChevronLeft size={16} aria-hidden />
          Seus eventos
        </Link>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar menu"
            onClick={close}
          />

          <aside
            id="event-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={
              isDark
                ? 'absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-blue-dark shadow-xl'
                : 'absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col bg-white shadow-xl'
            }
          >
            <div
              className={
                isDark
                  ? 'flex items-center justify-between border-b border-white/10 px-3 py-3'
                  : 'flex items-center justify-between border-b border-gray-100 px-3 py-3'
              }
            >
              <p
                id={titleId}
                className={
                  isDark ? 'text-sm font-semibold text-white' : 'text-sm font-semibold text-gray-900'
                }
              >
                Menu do evento
              </p>
              <button
                type="button"
                onClick={close}
                className={
                  isDark
                    ? 'inline-flex h-9 w-9 items-center justify-center rounded-control text-white/70 transition hover:bg-white/10'
                    : 'inline-flex h-9 w-9 items-center justify-center rounded-control text-gray-600 transition hover:bg-gray-100'
                }
                aria-label="Fechar menu"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <EventNavPanel championshipId={championshipId} onNavigate={close} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
