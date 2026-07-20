import useLeaderboardData from '@/hooks/useLeaderboardData';
import { useCallback, useId, useState } from 'react';
import { ChevronDown, Info } from 'react-feather';

const ListPublicLeaderboard = () => {
  const { publicLeaderboards } = useLeaderboardData();
  const isScore = useCallback((value: string) => value.includes(':'), []);

  if (!publicLeaderboards?.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
        <p className="font-medium text-gray-800">Nenhum atleta nesta categoria</p>
        <p className="mt-1 text-sm text-gray-500">
          Os resultados aparecem aqui assim que forem publicados.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
      {publicLeaderboards.map((leaderboard, index) => (
        <LeaderboardCard
          key={`${leaderboard.nickname}-${index}`}
          leaderboard={leaderboard}
          isScore={isScore}
        />
      ))}
    </ul>
  );
};

type LeaderboardCardProps = {
  leaderboard: {
    ranking: number;
    nickname: string;
    generalScore: number;
    category: { name: string };
    participants: Array<{ name: string; affiliation: string }>;
    results: Array<{
      result: string;
      points: number;
      classification: number;
      workout: { name: string };
    }>;
  };
  isScore: (value: string) => boolean;
};

function LeaderboardCard({ leaderboard, isScore }: LeaderboardCardProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const infoId = useId();
  const resultsId = useId();

  const participantNames = leaderboard.participants
    .map((participant) => {
      const splitName = participant.name.split(' ');
      return splitName.length > 1
        ? `${splitName[0]} ${splitName[splitName.length - 1]}`
        : splitName[0];
    })
    .join(' · ');

  const affiliations = leaderboard.participants
    .map((participant) => participant.affiliation)
    .join(' · ');

  return (
    <li className="flex list-none flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        {leaderboard.ranking === 0 ? (
          <p className="text-base font-semibold text-gray-900">Sem resultados</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-sm font-bold text-primary">
              {leaderboard.ranking}º
            </span>
            <span className="text-base font-semibold text-gray-900">Lugar geral</span>
          </div>
        )}
        <p className="shrink-0 text-sm tabular-nums text-gray-600">
          {leaderboard.generalScore}{' '}
          {leaderboard.generalScore === 1 ? 'ponto' : 'pontos'}
        </p>
      </div>

      <div className="px-4 pt-3">
        <button
          type="button"
          className="group flex w-full min-w-0 items-center gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-expanded={showInfo}
          aria-controls={infoId}
          onClick={() => setShowInfo((open) => !open)}
        >
          <span className="truncate text-sm font-bold capitalize text-gray-800">
            {leaderboard.nickname}
          </span>
          <Info
            size={16}
            className={`shrink-0 ${showInfo ? 'text-gray-500' : 'text-primary'}`}
            aria-hidden
          />
          <span className="sr-only">
            {showInfo ? 'Ocultar detalhes do atleta' : 'Mostrar detalhes do atleta'}
          </span>
        </button>

        {showInfo ? (
          <div id={infoId} className="mt-2 space-y-0.5 text-sm capitalize text-gray-600">
            <p>{participantNames}</p>
            <p>{affiliations}</p>
          </div>
        ) : null}

        <p className="mt-1 text-sm text-gray-500">{leaderboard.category.name}</p>
      </div>

      <div className="mt-3 border-t border-gray-100">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
          aria-expanded={showResults}
          aria-controls={resultsId}
          onClick={() => setShowResults((open) => !open)}
        >
          {showResults ? 'Esconder' : 'Mostrar'} resultados
          <ChevronDown
            size={16}
            className={`transition ${showResults ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {showResults ? (
          <div id={resultsId} className="space-y-3 border-t border-gray-100 px-4 py-3">
            {!leaderboard.results.length ? (
              <p className="text-sm font-medium text-gray-500">Sem resultados</p>
            ) : (
              leaderboard.results.map((content, resultIndex) => (
                <div key={`${content.workout.name}-${resultIndex}`} className="space-y-0.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-700">
                      {content.workout.name}
                    </p>
                    <p className="shrink-0 text-xs tabular-nums text-gray-600">
                      {content.points} {content.points === 1 ? 'ponto' : 'pontos'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {content.classification}º lugar — {content.result}
                    {isScore(content.result) ? ' min' : ' reps'}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export default ListPublicLeaderboard;
