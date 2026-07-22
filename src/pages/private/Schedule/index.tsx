import ComponentModal from '@/components/ComponentModal';
import { EmptyList } from '@/components/EmptyList';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuButton,
  DropdownMenuItem,
  DropdownMenuList,
} from '@/components/ui/DropdownMenu';
import { Tooltip } from '@/components/ui/Tooltip';
import { CategoryProvider } from '@/contexts/category';
import { ChampionshipProvider } from '@/contexts/championship';
import { ScheduleProvider } from '@/contexts/schedule';
import { WorkoutProvider } from '@/contexts/workout';
import { IConfiguration } from '@/data/interfaces/configuration';
import useChampionshipData from '@/hooks/useChampionshipData';
import useScheduleData from '@/hooks/useScheduleData';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Circle, Menu as MenuIcon } from 'react-feather';
import { useParams } from 'react-router-dom';
import ScheduleForm from './components/form';
import ListSchedule from './components/list';

const ScheduleWithProvider = () => (
  <ScheduleProvider onClose={() => undefined}>
    <ChampionshipProvider onClose={() => undefined}>
      <CategoryProvider>
        <WorkoutProvider>
          <Schedule />
        </WorkoutProvider>
      </CategoryProvider>
    </ChampionshipProvider>
  </ScheduleProvider>
);

const Schedule = () => {
  const { id } = useParams();

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenOption, setIsOpenOption] = useState<boolean>(false);
  const [isAuto, setIsAuto] = useState('false');

  const { schedulePages } = useScheduleData();
  const { GetConfiguration, PatchIsAutoSchedule } = useChampionshipData();

  const hasElements: boolean = useMemo(() => schedulePages.count !== 0, [schedulePages]);

  const handleToggleIsAutomatic = useCallback(
    (value: string) => {
      let key = 'true';
      if (value === 'true') key = 'false';
      if (id) {
        PatchIsAutoSchedule(id, key).then(() => {
          setIsAuto(key);
          setIsOpenOption(false);
        });
      }
    },
    [PatchIsAutoSchedule, id],
  );

  useEffect(() => {
    if (id) {
      GetConfiguration(id).then((conf) => {
        const config = conf as IConfiguration;
        setIsAuto(config.configuration.isAutoSchedule);
      });
    }
  }, [GetConfiguration, id]);

  return (
    <Suspense fallback={<Loader title='Carregando ...' />}>
      <main className='flex w-full flex-col items-center p-6' role='main'>
        {hasElements && (
          <>
            <section className='flex w-full items-center justify-between gap-3' role='textbox'>
              <article className='flex flex-col gap-3' role='textbox'>
                <h1 className='text-2xl font-bold text-slate-900' role='heading'>
                  Cronograma
                </h1>
              </article>
              <article className='flex items-center gap-4'>
                <DropdownMenu>
                  <DropdownMenuButton
                    aria-label='Opções'
                    className='!h-auto !w-auto min-w-0 gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:border-primary/40 hover:text-primary'
                  >
                    <MenuIcon size={20} />
                    Opções
                  </DropdownMenuButton>
                  <DropdownMenuList align='right'>
                    <DropdownMenuItem onClick={() => setIsOpenOption(true)}>
                      <span className='flex items-center gap-2'>
                        {isAuto === 'true' ? (
                          <Tooltip label='Ativada'>
                            <Circle fill='#E53E3E' size={12} color='#E53E3E' />
                          </Tooltip>
                        ) : null}
                        Ordenação automática
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuList>
                </DropdownMenu>
                <Button variant='primary' className='min-w-[170px] w-auto' onClick={() => setIsOpen(true)}>
                  Adicionar atividade
                </Button>
              </article>
            </section>

            <section className='mt-6 w-full'>
              <ListSchedule championshipId={id as string} />
            </section>
          </>
        )}

        <ComponentModal
          modalHeader={`${isAuto === 'false' ? 'Ativar' : 'Desativar'} ordenação automática`}
          size='sm'
          isOpen={isOpenOption}
          onClose={() => setIsOpenOption(false)}
        >
          <div className='flex w-full flex-col gap-6 pb-4'>
            <p className='text-sm text-slate-700'>
              {`Tem certeza que deseja ${
                isAuto === 'false' ? 'ativar' : 'desativar'
              } a ordenação automática do cronograma?`}
            </p>
            <Button
              variant='primary'
              className='mt-4 w-full'
              onClick={() => handleToggleIsAutomatic(isAuto)}
            >
              {`${isAuto === 'false' ? 'Ativar' : 'Desativar'}`}
            </Button>
          </div>
        </ComponentModal>

        <ComponentModal
          modalHeader='Adicionar atividade ao cronograma'
          size='lg'
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <ScheduleForm onClose={() => setIsOpen(false)} />
        </ComponentModal>

        {!hasElements && (
          <EmptyList
            text='Você não possui um cronograma ainda!'
            contentButton='Crie um cronograma'
            onClose={() => setIsOpen(true)}
          />
        )}
      </main>
    </Suspense>
  );
};

export default ScheduleWithProvider;
