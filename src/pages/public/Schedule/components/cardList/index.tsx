import { PublicModal } from '@/components/ui/PublicModal';
import { IPublicSchedule } from '@/data/interfaces/schedule';
import useScheduleData from '@/hooks/useScheduleData';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { incrementAndFormatDate } from '@/utils/formatDate';
import { useCallback, useState } from 'react';
import { ChevronDown, Clipboard } from 'react-feather';

const ListCardPublicSchedule = () => {
  const { schedules } = useScheduleData();
  const { isMobile } = useWindowDimensions();
  const [activity, setActivity] = useState<IPublicSchedule | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleParticipantsClick = useCallback(
    (schedule: IPublicSchedule) => {
      if (!isMobile) {
        setActivity(schedule);
        return;
      }
      setExpandedId((current) => (current === schedule.id ? null : schedule.id));
    },
    [isMobile],
  );

  if (!schedules.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center">
        <Clipboard size={56} className="text-gray-700" aria-hidden />
        <p className="font-semibold text-primary">Cronograma sem atividades!</p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
        {schedules.map((schedule) => {
          const isExpanded = expandedId === schedule.id;
          const countBaias = schedule.subscriptions?.length ?? 0;

          return (
            <li key={schedule.id} className="list-none">
              <div
                className={
                  schedule.isLive
                    ? 'schedule-card-live'
                    : 'rounded-xl border border-gray-200 bg-white shadow-sm'
                }
              >
                <article
                  className={
                    schedule.isLive
                      ? 'schedule-card-live-inner flex flex-col gap-3'
                      : 'flex flex-col gap-3 p-4'
                  }
                >
                  <div>
                    <p className="text-xs text-gray-500">
                      {incrementAndFormatDate(schedule.date, 'dd/MM')}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {schedule.hour}
                      </h2>
                      {schedule.isLive ? (
                        <span className="schedule-live-badge" aria-label="Ao vivo">
                          <span className="schedule-live-dot" aria-hidden />
                          Live
                        </span>
                      ) : null}
                      <span className="ml-auto inline-flex rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold capitalize text-white">
                        {schedule.category.name}
                      </span>
                    </div>
                    <p className="mt-2 text-sm capitalize text-gray-600">
                      {schedule.workout.name}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-gray-800 transition hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      aria-expanded={isMobile ? isExpanded : undefined}
                      onClick={() => handleParticipantsClick(schedule)}
                    >
                      {isMobile && isExpanded ? 'Esconder' : 'Mostrar'} participantes
                      {isMobile ? (
                        <ChevronDown
                          size={16}
                          className={`transition ${isExpanded ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      ) : null}
                    </button>

                    {isMobile && isExpanded ? (
                      <ul className="list-none space-y-2 border-t border-gray-100 p-0 py-3">
                        {schedule.subscriptions?.map((subscription, index) => (
                          <li
                            key={`${schedule.id}-${subscription.nickname}-${index}`}
                            className="flex list-none items-center justify-between gap-3 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="truncate text-sm font-semibold text-gray-600">
                              {subscription.nickname}
                            </span>
                            <span className="shrink-0 text-xs text-gray-500">
                              Baia {Math.abs(index - countBaias)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              </div>
            </li>
          );
        })}
      </ul>

      <PublicModal
        isOpen={Boolean(activity)}
        title="Detalhes"
        onClose={() => setActivity(null)}
      >
        {activity ? (
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">{activity.hour}</h3>
                {activity.isLive ? (
                  <span className="schedule-live-badge" aria-label="Ao vivo">
                    <span className="schedule-live-dot" aria-hidden />
                    Live
                  </span>
                ) : null}
                <span className="ml-auto inline-flex rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold capitalize text-white">
                  {activity.category?.name}
                </span>
              </div>
              <p className="mt-3 capitalize text-gray-700">{activity.workout?.name}</p>
            </div>

            <ul className="list-none divide-y divide-gray-100 border-t border-gray-100 p-0">
              {activity.subscriptions?.map((team, index) => (
                <li
                  key={`${activity.id}-${team.nickname}-${index}`}
                  className="flex list-none items-center justify-between gap-3 py-2.5"
                >
                  <span className="truncate text-sm font-semibold text-gray-600">
                    {index + 1}. {team.nickname}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {team.ranking}º Lugar
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </PublicModal>
    </>
  );
};

export default ListCardPublicSchedule;
