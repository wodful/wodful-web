import { Outlet, useParams } from 'react-router-dom';
import { EventMobileNav } from './EventMobileNav';
import { EventSidebar } from './EventSidebar';

export function EventShell() {
  const { id } = useParams();

  if (!id) return null;

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-slate-50 text-gray-900">
      <div className="sticky top-0 hidden h-[calc(100vh-72px)] md:block">
        <EventSidebar championshipId={id} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10 md:hidden">
          <EventMobileNav championshipId={id} />
        </div>
        <main className="min-w-0 flex-1 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
