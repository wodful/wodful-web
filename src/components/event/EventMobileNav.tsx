import {
  EVENT_NAV_ITEMS,
} from '@/constants/eventNav';
import { EventNavItemLink } from './EventNavItemLink';

type EventMobileNavProps = {
  championshipId: string;
};

/** Compact horizontal nav for small screens. Drawer comes in a follow-up. */
export function EventMobileNav({ championshipId }: EventMobileNavProps) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-2 py-2"
      aria-label="Navegação do evento"
    >
      {EVENT_NAV_ITEMS.map((item) => (
        <div key={item.id} className="shrink-0">
          <EventNavItemLink
            item={item}
            championshipId={championshipId}
            compact
          />
        </div>
      ))}
    </nav>
  );
}
