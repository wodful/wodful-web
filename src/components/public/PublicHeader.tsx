import useApp from '@/hooks/useApp';
import useAuth from '@/hooks/useAuth';
import Logo from '@/assets/icons/wodful-white-logo.svg';
import { useNavigate } from 'react-router-dom';

export const PublicHeader = () => {
  const { Reset } = useAuth();
  const { publicChampionshipName } = useApp();
  const navigate = useNavigate();

  const handleExit = () => {
    Reset();
    navigate('/access');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-gray-800">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <img src={Logo} alt="Wodful" className="h-9 w-9 shrink-0" />
          <span className="hidden text-sm font-semibold text-white sm:inline">
            Wodful
          </span>
        </div>

        <h1 className="min-w-0 truncate text-center text-sm font-medium capitalize text-white sm:text-base">
          {publicChampionshipName || 'Campeonato'}
        </h1>

        <button
          type="button"
          onClick={handleExit}
          className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Sair
        </button>
      </div>
    </header>
  );
};
