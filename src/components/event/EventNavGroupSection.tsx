import type { EventNavGroup, EventNavItem } from '@/constants/eventNav';
import { EventNavItemLink } from './EventNavItemLink';

type EventNavGroupSectionProps = {
  group: EventNavGroup;
  items: EventNavItem[];
  championshipId: string;
};

export function EventNavGroupSection({
  group,
  items,
  championshipId,
}: EventNavGroupSectionProps) {
  if (!items.length) return null;

  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
        {group.label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <EventNavItemLink item={item} championshipId={championshipId} />
          </li>
        ))}
      </ul>
    </div>
  );
}
