import { Link } from 'react-router-dom';
import type { EventNavItem } from '@/constants/eventNav';
import { eventPath } from '@/constants/eventNav';

type EventShortcutCardProps = {
  item: EventNavItem;
  championshipId: string;
};

export function EventShortcutCard({ item, championshipId }: EventShortcutCardProps) {
  const to = eventPath(championshipId, item.pathSegment);

  return (
    <Link
      to={to}
      className={[
        'group flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm transition',
        'hover:border-primary/40 hover:shadow-card',
        item.featured
          ? 'border-primary/20 ring-1 ring-primary/10'
          : 'border-gray-200',
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={[
            'inline-flex h-9 w-9 items-center justify-center rounded-lg',
            item.featured
              ? 'bg-primary/10 text-primary'
              : 'bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary',
          ].join(' ')}
        >
          <item.Icon size={18} aria-hidden />
        </span>
        <span className="font-semibold text-gray-900">{item.label}</span>
      </div>
      <p className="text-sm text-gray-500">{item.description}</p>
    </Link>
  );
}
