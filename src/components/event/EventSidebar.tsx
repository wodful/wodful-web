import { Link } from 'react-router-dom';
import { ChevronLeft } from 'react-feather';
import { EventNavPanel } from './EventNavPanel';

type EventSidebarProps = {
  championshipId: string;
};

export function EventSidebar({ championshipId }: EventSidebarProps) {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-3 py-3">
        <Link
          to="/championships"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <ChevronLeft size={16} aria-hidden />
          Seus eventos
        </Link>
      </div>

      <EventNavPanel championshipId={championshipId} />
    </aside>
  );
}
