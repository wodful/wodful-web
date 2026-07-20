import { NavLink, useParams } from 'react-router-dom';

const tabs = [
  { identifier: 'leaderboards', label: 'Ranking', pathSuffix: 'leaderboards' },
  { identifier: 'schedules', label: 'Cronograma', pathSuffix: 'schedules' },
  { identifier: 'workouts', label: 'Provas', pathSuffix: 'workouts' },
] as const;

export const PublicTabs = () => {
  const { code } = useParams();

  return (
    <nav
      className="sticky top-16 z-10 border-b border-gray-200 bg-white"
      aria-label="Navegação do campeonato"
    >
      <div className="mx-auto flex h-12 max-w-7xl items-stretch justify-center gap-1 px-2 sm:gap-2 sm:px-6">
        {tabs.map((tab) => (
          <NavLink
            key={tab.identifier}
            to={`/access/${code}/${tab.pathSuffix}`}
            className={({ isActive }) =>
              [
                'inline-flex min-w-0 flex-1 items-center justify-center border-b-2 px-2 text-sm font-semibold transition sm:flex-none sm:px-5',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800',
              ].join(' ')
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
