import {
  EVENT_NAV_GROUPS,
  getEventNavItemsByGroup,
} from '@/constants/eventNav';
import { EventShortcutCard } from './EventShortcutCard';

type EventShortcutGridProps = {
  championshipId: string;
};

export function EventShortcutGrid({ championshipId }: EventShortcutGridProps) {
  return (
    <div className="space-y-8">
      {EVENT_NAV_GROUPS.map((group) => {
        const items = getEventNavItemsByGroup(group.id);
        if (!items.length) return null;

        return (
          <section key={group.id} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <EventShortcutCard
                  key={item.id}
                  item={item}
                  championshipId={championshipId}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
