import useWorkoutData from '@/hooks/useWorkoutData';
import { useId, useMemo, useState } from 'react';
import { ChevronDown } from 'react-feather';

type ListPublicWorkoutsProps = {
  search?: string;
};

const ListPublicWorkouts = ({ search = '' }: ListPublicWorkoutsProps) => {
  const { publicWorkouts } = useWorkoutData();
  const showPontuacao = publicWorkouts?.[0]?.resultType !== 'RANKING';
  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    const list = publicWorkouts ?? [];
    if (!query) return list;
    return list.filter(
      (workout) =>
        workout.name.toLowerCase().includes(query) ||
        workout.workoutType.toLowerCase().includes(query) ||
        workout.description.toLowerCase().includes(query),
    );
  }, [publicWorkouts, query]);

  if (!publicWorkouts?.length) {
    return (
      <div className="rounded-surface border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
        <p className="font-medium text-gray-800">Nenhuma prova nesta categoria</p>
        <p className="mt-1 text-sm text-gray-500">
          As provas aparecem aqui quando forem liberadas pelo organizador.
        </p>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="rounded-surface border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
        <p className="font-medium text-gray-800">Nenhuma prova para a busca</p>
        <p className="mt-1 text-sm text-gray-500">
          Tente outro nome ou tipo de WOD.
        </p>
      </div>
    );
  }

  return (
    <ul className="list-none divide-y divide-gray-100 overflow-hidden rounded-surface border border-gray-200 bg-white p-0">
      {filtered.map((workout) => (
        <WorkoutRow
          key={workout.id}
          workout={workout}
          showPontuacao={showPontuacao}
        />
      ))}
    </ul>
  );
};

type WorkoutRowProps = {
  workout: {
    id: string;
    name: string;
    description: string;
    workoutType: string;
    worthHalfPoints?: boolean;
  };
  showPontuacao: boolean;
};

function WorkoutRow({ workout, showPontuacao }: WorkoutRowProps) {
  const [expanded, setExpanded] = useState(false);
  const descriptionId = useId();

  return (
    <li className="list-none bg-white">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        aria-expanded={expanded}
        aria-controls={descriptionId}
        onClick={() => setExpanded((open) => !open)}
      >
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-gray-900">
            {workout.name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex rounded-control bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {workout.workoutType}
            </span>
            {showPontuacao ? (
              <span className="inline-flex rounded-chip bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {workout.worthHalfPoints ? '50 pts' : '100 pts'}
              </span>
            ) : null}
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div id={descriptionId} className="border-t border-gray-100 bg-white px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
            {workout.description || 'Descrição não informada.'}
          </p>
        </div>
      ) : null}
    </li>
  );
}

export default ListPublicWorkouts;
