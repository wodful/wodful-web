import {
  EVENT_NAV_GROUPS,
  EVENT_NAV_ITEMS,
  getEventNavItemsByGroup,
} from '@/constants/eventNav';
import { EventNavGroupSection } from './EventNavGroupSection';
import { EventNavItemLink } from './EventNavItemLink';

type EventNavPanelProps = {
  championshipId: string;
  onNavigate?: () => void;
};

/** Shared nav body for sidebar and mobile drawer. */
export function EventNavPanel({ championshipId, onNavigate }: EventNavPanelProps) {
  const homeItem = EVENT_NAV_ITEMS.find((item) => item.id === 'home');

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4" aria-label="Navegação do evento">
      {homeItem ? (
        <EventNavItemLink
          item={homeItem}
          championshipId={championshipId}
          onNavigate={onNavigate}
        />
      ) : null}

      {EVENT_NAV_GROUPS.map((group) => (
        <EventNavGroupSection
          key={group.id}
          group={group}
          items={getEventNavItemsByGroup(group.id)}
          championshipId={championshipId}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
