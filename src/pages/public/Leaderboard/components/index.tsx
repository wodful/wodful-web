import useLeaderboardData from '@/hooks/useLeaderboardData';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ChevronDown } from 'react-feather';

type ListPublicLeaderboardProps = {
  search?: string;
};

type LeaderboardEntry = {
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

function entryMatches(entry: LeaderboardEntry, query: string) {
  if (!query) return false;
  const nick = entry.nickname.toLowerCase();
  const names = entry.participants
    .map((participant) => participant.name.toLowerCase())
    .join(' ');
  return nick.includes(query) || names.includes(query);
}

const ListPublicLeaderboard = ({ search = '' }: ListPublicLeaderboardProps) => {
  const { publicLeaderboards } = useLeaderboardData();
  const isScore = useCallback((value: string) => value.includes(':'), []);
  const firstMatchRef = useRef<HTMLLIElement | null>(null);

  const query = search.trim().toLowerCase();

  const sorted = useMemo(() => {
    return [...(publicLeaderboards ?? [])].sort((a, b) => {
      if (a.ranking === 0 && b.ranking !== 0) return 1;
      if (b.ranking === 0 && a.ranking !== 0) return -1;
      if (a.ranking !== b.ranking) return a.ranking - b.ranking;
      return a.nickname.localeCompare(b.nickname);
    });
  }, [publicLeaderboards]);

  const firstMatchIndex = useMemo(() => {
    if (!query) return -1;
    return sorted.findIndex((entry) => entryMatches(entry, query));
  }, [sorted, query]);

  useEffect(() => {
    if (firstMatchIndex < 0) return;
    const frame = window.requestAnimationFrame(() => {
      firstMatchRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [firstMatchIndex, query]);

  if (!publicLeaderboards?.length) {
    return (
      <div className="rounded-surface border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
        <p className="font-medium text-gray-800">Nenhum atleta nesta categoria</p>
        <p className="mt-1 text-sm text-gray-500">
          Os resultados aparecem aqui assim que forem publicados.
        </p>
      </div>
    );
  }

  if (query && firstMatchIndex < 0) {
    return (
      <div className="rounded-surface border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
        <p className="font-medium text-gray-800">Nenhum resultado para a busca</p>
        <p className="mt-1 text-sm text-gray-500">
          Tente outro nome de atleta ou time.
        </p>
      </div>
    );
  }

  return (
    <ul className="list-none divide-y divide-gray-100 overflow-hidden rounded-surface border border-gray-200 bg-white p-0">
      {sorted.map((leaderboard, index) => {
        const isMatch = entryMatches(leaderboard, query);
        const isFirstMatch = index === firstMatchIndex;

        return (
          <LeaderboardRow
            key={`${leaderboard.nickname}-${leaderboard.ranking}-${index}`}
            ref={isFirstMatch ? firstMatchRef : undefined}
            leaderboard={leaderboard}
            isScore={isScore}
            highlighted={isMatch}
            defaultExpanded={isFirstMatch}
            expandKey={query}
          />
        );
      })}
    </ul>
  );
};

type LeaderboardRowProps = {
  leaderboard: LeaderboardEntry;
  isScore: (value: string) => boolean;
  highlighted?: boolean;
  defaultExpanded?: boolean;
  expandKey?: string;
};

function podiumClass(ranking: number) {
  if (ranking === 1) return 'bg-amber-100 text-amber-800';
  if (ranking === 2) return 'bg-slate-200 text-slate-700';
  if (ranking === 3) return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-600';
}

const LeaderboardRow = forwardRef<HTMLLIElement, LeaderboardRowProps>(
  function LeaderboardRow(
    {
      leaderboard,
      isScore,
      highlighted = false,
      defaultExpanded = false,
      expandKey = '',
    },
    ref,
  ) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const detailsId = useId();

    useEffect(() => {
      setExpanded(defaultExpanded);
    }, [defaultExpanded, expandKey]);

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
      .filter(Boolean)
      .join(' · ');

    return (
      <li
        ref={ref}
        className={`list-none ${
          highlighted ? 'bg-primary/[0.06]' : 'bg-white'
        }`}
      >
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setExpanded((open) => !open)}
        >
          {leaderboard.ranking === 0 ? (
            <span className="inline-flex h-8 w-10 shrink-0 items-center justify-center rounded-control bg-gray-100 text-xs font-semibold text-gray-500">
              —
            </span>
          ) : (
            <span
              className={`inline-flex h-8 w-10 shrink-0 items-center justify-center rounded-control text-sm font-bold tabular-nums ${podiumClass(
                leaderboard.ranking,
              )}`}
            >
              {leaderboard.ranking}º
            </span>
          )}

          <span className="min-w-0 flex-1 truncate text-sm font-semibold capitalize text-gray-900">
            {leaderboard.nickname}
          </span>

          <span className="shrink-0 text-sm font-semibold tabular-nums text-gray-700">
            {leaderboard.generalScore}
            <span className="ml-1 text-xs font-medium text-gray-400">
              {leaderboard.generalScore === 1 ? 'pt' : 'pts'}
            </span>
          </span>

          <ChevronDown
            size={16}
            className={`shrink-0 text-gray-400 transition ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {expanded ? (
          <div id={detailsId} className="border-t border-gray-100 bg-white px-4 py-3">
            {(participantNames || affiliations) && (
              <div className="mb-3 space-y-0.5 text-xs capitalize text-gray-500">
                {participantNames ? <p>{participantNames}</p> : null}
                {affiliations ? <p>{affiliations}</p> : null}
              </div>
            )}

            {!leaderboard.results.length ? (
              <p className="text-sm font-medium text-gray-500">Sem resultados</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[18rem] border-collapse text-left text-xs">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="pb-2 pr-3 font-semibold">Prova</th>
                      <th className="pb-2 pr-3 font-semibold">Col.</th>
                      <th className="pb-2 pr-3 font-semibold">Resultado</th>
                      <th className="pb-2 text-right font-semibold">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leaderboard.results.map((content, resultIndex) => (
                      <tr key={`${content.workout.name}-${resultIndex}`}>
                        <td className="max-w-[9rem] truncate py-2 pr-3 font-semibold text-gray-800">
                          {content.workout.name}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-gray-600">
                          {content.classification}º
                        </td>
                        <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-gray-600">
                          {content.result}
                          {isScore(content.result) ? ' min' : ' reps'}
                        </td>
                        <td className="whitespace-nowrap py-2 text-right font-semibold tabular-nums text-gray-700">
                          {content.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </li>
    );
  },
);

export default ListPublicLeaderboard;
