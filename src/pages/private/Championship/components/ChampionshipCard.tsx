import { ArrowRight } from 'react-feather';
import { Link } from 'react-router-dom';

import { IChampionship } from '@/data/interfaces/championship';
import useApp from '@/hooks/useApp';
import { incrementAndFormatDate } from '@/utils/formatDate';

type ChampionshipCardProps = {
  championship: IChampionship;
};

function getBannerUrl(championship: IChampionship) {
  const storageType = import.meta.env.VITE_STORAGE_TYPE;
  const baseUrl = import.meta.env.VITE_BASE_SERVER_URL;
  const awsBucketUrl = import.meta.env.VITE_AWS_PUBLIC_BUCKET;
  const bannerPath = `${championship.banner}`;

  return storageType === 'local'
    ? `${baseUrl}/${bannerPath}`
    : `${awsBucketUrl}/${championship.banner}`;
}

export function ChampionshipCard({ championship }: ChampionshipCardProps) {
  const { setCurrentChampionship } = useApp();
  const eventPath = `${championship.id}`;

  const openEvent = () => {
    setCurrentChampionship(championship);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card">
      <Link
        to={eventPath}
        onClick={openEvent}
        className="relative block aspect-[16/9] overflow-hidden bg-gray-100"
      >
        <img
          src={getBannerUrl(championship)}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <span
          className={[
            'absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm',
            championship.isActive
              ? 'bg-primary text-white'
              : 'bg-white/95 text-gray-700',
          ].join(' ')}
        >
          {championship.isActive ? 'Público' : 'Privado'}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <Link to={eventPath} onClick={openEvent} className="min-w-0 flex-1 no-underline">
          <h2 className="text-lg font-semibold capitalize leading-snug text-gray-900">
            {championship.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {incrementAndFormatDate(`${championship.startDate}`)} até{' '}
            {incrementAndFormatDate(`${championship.endDate}`)}
          </p>
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary/80 transition group-hover:text-primary">
            Abrir evento
            <ArrowRight size={14} aria-hidden />
          </p>
        </Link>

        <p className="truncate border-t border-gray-100 pt-3 text-xs text-gray-400">
          Código · {championship.accessCode}
        </p>
      </div>
    </article>
  );
}
