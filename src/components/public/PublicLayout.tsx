import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicTabs } from './PublicTabs';

export const PublicLayout = () => (
  <div className="flex min-h-screen flex-col bg-slate-50 text-gray-900">
    <PublicHeader />
    <PublicTabs />
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
      <Outlet />
    </main>
    <footer className="border-t border-gray-200 bg-white px-4 py-4 text-center text-xs text-gray-400">
      © {new Date().getFullYear()} Fortis CyberIntell. Todos os direitos
      reservados.
    </footer>
  </div>
);
