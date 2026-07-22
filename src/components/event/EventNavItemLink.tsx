import { NavLink } from 'react-router-dom';
import type { EventNavItem } from '@/constants/eventNav';
import { eventPath } from '@/constants/eventNav';
import useTheme from '@/hooks/useTheme';

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
  const { isDark } = useTheme();
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
            ? isDark
              ? 'bg-primary/20 text-primary'
              : 'bg-primary/10 text-primary'
            : isDark
              ? 'text-white/65 hover:bg-white/10 hover:text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        ].join(' ')
      }
    >
      <item.Icon size={16} className="shrink-0 opacity-80" aria-hidden />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}
