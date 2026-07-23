import { Outlet, useParams } from 'react-router-dom';
import { EventMobileNav } from './EventMobileNav';
import { EventSidebar } from './EventSidebar';

export function EventShell() {
  const { id } = useParams();

  if (!id) return null;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-slate-50 text-gray-900">
      <div className="sticky top-14 z-20 hidden h-[calc(100vh-3.5rem)] shrink-0 self-start md:block">
        <EventSidebar championshipId={id} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-14 z-10 md:hidden">
          <EventMobileNav championshipId={id} />
        </div>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
