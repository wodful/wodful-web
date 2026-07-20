import useWorkoutData from '@/hooks/useWorkoutData';
import { useState } from 'react';
import { ChevronDown } from 'react-feather';

const ListPublicWorkouts = () => {
  const { publicWorkouts } = useWorkoutData();
  const showPontuacao = publicWorkouts?.[0]?.resultType !== 'RANKING';

  if (!publicWorkouts?.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
        <p className="font-medium text-gray-800">Nenhuma prova nesta categoria</p>
        <p className="mt-1 text-sm text-gray-500">
          As provas aparecem aqui quando forem liberadas pelo organizador.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
      {publicWorkouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          showPontuacao={showPontuacao}
        />
      ))}
    </ul>
  );
};

type WorkoutCardProps = {
  workout: {
    id: string;
    name: string;
    description: string;
    workoutType: string;
    worthHalfPoints?: boolean;
  };
  showPontuacao: boolean;
};

function WorkoutCard({ workout, showPontuacao }: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="flex list-none flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <h2 className="min-w-0 text-base font-semibold text-gray-900">{workout.name}</h2>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
            {workout.workoutType}
          </span>
          {showPontuacao ? (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                workout.worthHalfPoints
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {workout.worthHalfPoints ? '50 pts' : '100 pts'}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 border-t border-gray-100">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'Esconder' : 'Mostrar'}
          <ChevronDown
            size={16}
            className={`transition ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>

        {expanded ? (
          <div className="border-t border-gray-100 px-4 py-3">
            <p className="whitespace-pre-wrap text-center text-sm font-medium leading-relaxed text-gray-600">
              {workout.description}
            </p>
          </div>
        ) : null}
      </div>
    </li>
  );
}

export default ListPublicWorkouts;
