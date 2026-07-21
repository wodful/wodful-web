import useApp from '@/hooks/useApp';
import useAuth from '@/hooks/useAuth';
import Logo from '@/assets/icons/wodful-white-logo.svg';
import { LogOut } from 'react-feather';
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
    <header className="border-b border-white/10 bg-blue-dark">
      <div className="mx-auto grid h-14 w-full max-w-7xl grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center justify-start">
          <img src={Logo} alt="Wodful" className="h-8 w-8 shrink-0" />
        </div>

        <p className="min-w-0 max-w-[min(52vw,20rem)] truncate text-center text-sm font-semibold capitalize text-white sm:max-w-md sm:text-base">
          {publicChampionshipName || 'Campeonato'}
        </p>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleExit}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <LogOut size={15} className="shrink-0 sm:hidden" aria-hidden />
            <span className="sr-only sm:not-sr-only">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
