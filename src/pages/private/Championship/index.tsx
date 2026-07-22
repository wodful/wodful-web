import { Suspense, lazy, useEffect, useRef, useState, type MutableRefObject } from 'react';

import ComponentModal from '@/components/ComponentModal';
import { EmptyList } from '@/components/EmptyList';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { ChampionshipProvider } from '@/contexts/championship';
import useChampionshipData from '@/hooks/useChampionshipData';

const ListChampionship = lazy(() => import('./components/list'));
const FormChampionship = lazy(() => import('./components/form'));

type ChampionshipViewProps = {
  closeModalRef: MutableRefObject<() => void>;
};

const ChampionshipView = ({ closeModalRef }: ChampionshipViewProps) => {
  const { championshipsPages, ListPaginated } = useChampionshipData();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    ListPaginated();
  }, [ListPaginated]);

  const hasLoaded =
    typeof championshipsPages.count === 'number' ||
    Array.isArray(championshipsPages.results);
  const hasElements = (championshipsPages.count ?? 0) > 0;

  const closeModal = () => setIsOpen(false);
  closeModalRef.current = closeModal;

  const openCreate = () => setIsOpen(true);

  return (
    <Suspense fallback={<Loader title="Carregando ..." />}>
      <main className="min-h-[calc(100vh-56px)] bg-slate-50" role="main">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {hasElements ? (
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Seus eventos
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Gerencie placar, cronograma e inscrições de cada campeonato.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={openCreate}
                className="w-full sm:w-auto"
              >
                Criar Evento
              </Button>
            </div>
          ) : null}

          <ComponentModal
            modalHeader="Novo Evento"
            size="xl"
            isOpen={isOpen}
            onClose={closeModal}
          >
            <FormChampionship
              onClose={closeModal}
              resetChampionship={() => undefined}
            />
          </ComponentModal>

          {!hasLoaded ? (
            <Loader title="Carregando ..." />
          ) : hasElements ? (
            <ListChampionship />
          ) : (
            <EmptyList
              text="Você não possui um campeonato ainda! Crie o primeiro e compartilhe o placar com atletas."
              contentButton="Crie um campeonato"
              onClose={openCreate}
            />
          )}
        </div>
      </main>
    </Suspense>
  );
};

const ChampionshipPage = () => {
  const closeModalRef = useRef<() => void>(() => undefined);

  return (
    <ChampionshipProvider onClose={() => closeModalRef.current()}>
      <ChampionshipView closeModalRef={closeModalRef} />
    </ChampionshipProvider>
  );
};

export default ChampionshipPage;
