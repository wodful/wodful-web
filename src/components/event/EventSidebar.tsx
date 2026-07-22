import { Link } from 'react-router-dom';
import { ChevronLeft } from 'react-feather';
import useTheme from '@/hooks/useTheme';
import { EventNavPanel } from './EventNavPanel';

type EventSidebarProps = {
  championshipId: string;
};

export function EventSidebar({ championshipId }: EventSidebarProps) {
  const { isDark } = useTheme();

  return (
    <aside
      className={
        isDark
          ? 'flex h-full w-56 shrink-0 flex-col border-r border-white/10 bg-blue-dark'
          : 'flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white'
      }
    >
      <div className={isDark ? 'border-b border-white/10 px-3 py-3' : 'border-b border-gray-100 px-3 py-3'}>
        <Link
          to="/championships"
          className={
            isDark
              ? 'inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white'
              : 'inline-flex items-center gap-1.5 rounded-control px-2 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900'
          }
        >
          <ChevronLeft size={16} aria-hidden />
          Seus eventos
        </Link>
      </div>

      <EventNavPanel championshipId={championshipId} />
    </aside>
  );
}
