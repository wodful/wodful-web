import { Link } from 'react-router-dom';
import { ChevronLeft } from 'react-feather';
import {
  EVENT_NAV_GROUPS,
  EVENT_NAV_ITEMS,
  getEventNavItemsByGroup,
} from '@/constants/eventNav';
import { EventNavGroupSection } from './EventNavGroupSection';
import { EventNavItemLink } from './EventNavItemLink';

type EventSidebarProps = {
  championshipId: string;
};

export function EventSidebar({ championshipId }: EventSidebarProps) {
  const homeItem = EVENT_NAV_ITEMS.find((item) => item.id === 'home');

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

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4" aria-label="Navegação do evento">
        {homeItem ? (
          <EventNavItemLink item={homeItem} championshipId={championshipId} />
        ) : null}

        {EVENT_NAV_GROUPS.map((group) => (
          <EventNavGroupSection
            key={group.id}
            group={group}
            items={getEventNavItemsByGroup(group.id)}
            championshipId={championshipId}
          />
        ))}
      </nav>
    </aside>
  );
}
