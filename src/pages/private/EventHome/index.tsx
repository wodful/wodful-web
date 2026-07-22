import { ExternalLink } from 'react-feather';
import { useParams } from 'react-router-dom';
import useApp from '@/hooks/useApp';
import { EventShortcutGrid } from './components/EventShortcutGrid';

const EventHome = () => {
  const { id } = useParams();
  const { currentChampionship } = useApp();

  if (!id) return null;

  const accessCode = currentChampionship?.accessCode;
  const publicUrl = accessCode
    ? `${import.meta.env.VITE_BASE_WODFUL_SITE}/event/${accessCode}`
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão geral</h1>
          <p className="mt-1 text-sm text-slate-500">
            Escolha uma área para gerenciar o campeonato.
          </p>
        </div>

        {publicUrl ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline hover:underline"
          >
            Ver página pública
            <ExternalLink size={14} aria-hidden />
          </a>
        ) : null}
      </header>

      <EventShortcutGrid championshipId={id} />
    </div>
  );
};

export default EventHome;
