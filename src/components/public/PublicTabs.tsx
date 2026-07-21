import { NavLink, useParams, useSearchParams } from 'react-router-dom';
import { Award, Calendar, Clipboard } from 'react-feather';

const tabs = [
  {
    identifier: 'leaderboards',
    label: 'Ranking',
    shortLabel: 'Ranking',
    pathSuffix: 'leaderboards',
    Icon: Award,
  },
  {
    identifier: 'schedules',
    label: 'Cronograma',
    shortLabel: 'Agenda',
    pathSuffix: 'schedules',
    Icon: Calendar,
  },
  {
    identifier: 'workouts',
    label: 'Provas',
    shortLabel: 'Provas',
    pathSuffix: 'workouts',
    Icon: Clipboard,
  },
] as const;

export const PublicTabs = () => {
  const { code } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const querySuffix = query ? `?${query}` : '';

  return (
    <nav
      className="border-b border-gray-200 bg-white"
      aria-label="Navegação do campeonato"
    >
      <div className="mx-auto flex h-11 max-w-7xl items-stretch px-1 sm:justify-center sm:gap-1 sm:px-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.identifier}
            to={`/access/${code}/${tab.pathSuffix}${querySuffix}`}
            title={tab.label}
            className={({ isActive }) =>
              [
                'inline-flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-b-2 px-1 text-[11px] font-semibold transition sm:flex-none sm:flex-row sm:gap-1.5 sm:px-5 sm:text-sm',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800',
              ].join(' ')
            }
          >
            <tab.Icon size={16} className="shrink-0 opacity-80" aria-hidden />
            <span className="truncate sm:hidden">{tab.shortLabel}</span>
            <span className="hidden truncate sm:inline">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
