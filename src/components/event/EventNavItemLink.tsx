import { NavLink } from 'react-router-dom';
import type { EventNavItem } from '@/constants/eventNav';
import { eventPath } from '@/constants/eventNav';

type EventNavItemLinkProps = {
  item: EventNavItem;
  championshipId: string;
  compact?: boolean;
  onNavigate?: () => void;
};

export function EventNavItemLink({
  item,
  championshipId,
  compact = false,
  onNavigate,
}: EventNavItemLinkProps) {
  const to = eventPath(championshipId, item.pathSegment);
  const end = item.pathSegment === '';

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center gap-2.5 rounded-control text-sm font-medium transition',
          compact ? 'px-2.5 py-2' : 'px-3 py-2',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        ].join(' ')
      }
    >
      <item.Icon size={16} className="shrink-0 opacity-80" aria-hidden />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}
