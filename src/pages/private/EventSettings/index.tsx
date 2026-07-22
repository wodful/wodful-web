import { useEffect, useId, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/Button';
import { ChampionshipProvider } from '@/contexts/championship';
import { IChampionship } from '@/data/interfaces/championship';
import useApp from '@/hooks/useApp';
import useChampionshipData from '@/hooks/useChampionshipData';
import FormChampionship from '@/pages/private/Championship/components/form';
import FormConfiguration from '@/pages/private/Configuration/form';
import { ChampionshipService } from '@/services/Championship';
import { DangerSection } from './components/DangerSection';
import { SettingsNav } from './components/SettingsNav';
import { SettingsSection } from './components/SettingsSection';
import { VisibilitySection } from './components/VisibilitySection';
import { SETTINGS_TABS, type SettingsTabId } from './settingsNav';

const axios = new AxiosAdapter();

function EventSettingsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const titleId = useId();
  const { currentChampionship, setCurrentChampionship } = useApp();
  const { Activate, Deactivate, Delete, isLoading } = useChampionshipData();

  const [championship, setChampionship] = useState<IChampionship | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SettingsTabId>('general');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (currentChampionship?.id === id) {
          if (!cancelled) {
            setChampionship(currentChampionship);
            setLoading(false);
          }
          return;
        }
        const data = await new ChampionshipService(axios).getById(id);
        if (!cancelled) {
          setChampionship(data);
          setCurrentChampionship(data);
        }
      } catch {
        if (!cancelled) setChampionship(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, currentChampionship, setCurrentChampionship]);

  useEffect(() => {
    if (!deleteOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDeleteOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [deleteOpen]);

  if (!id) return null;

  if (loading) {
    return (
      <div className="p-6">
        <Loader title="Carregando configurações..." />
      </div>
    );
  }

  if (!championship) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-gray-500">
        Não foi possível carregar este evento.
      </div>
    );
  }

  const toggleVisibility = async () => {
    if (championship.isActive) {
      await Deactivate(championship.id);
      const next = { ...championship, isActive: false };
      setChampionship(next);
      setCurrentChampionship(next);
      return;
    }
    await Activate(championship.id);
    const next = { ...championship, isActive: true };
    setChampionship(next);
    setCurrentChampionship(next);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await Delete(championship.id);
      setDeleteOpen(false);
      navigate('/championships');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Evento
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-1 text-sm text-gray-500">{championship.name}</p>
      </header>

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar"
            onClick={() => setDeleteOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-sm rounded-surface border border-gray-200 bg-white p-5 shadow-xl"
          >
            <h2 id={titleId} className="text-base font-semibold text-gray-900">
              Remover campeonato
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tem certeza que deseja remover o campeonato?
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant="danger"
                isLoading={deleting}
                onClick={() => void confirmDelete()}
              >
                Remover
              </Button>
              <Button
                variant="secondary"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <SettingsNav
          tabs={SETTINGS_TABS}
          active={activeTab}
          onChange={setActiveTab}
        />

        <div className="min-w-0">
          {activeTab === 'general' ? (
            <FormChampionship
              oldChampionship={championship}
              resetChampionship={() => undefined}
              onSaved={(next) => {
                setChampionship(next);
                setCurrentChampionship(next);
              }}
            />
          ) : null}

          {activeTab === 'visibility' ? (
            <VisibilitySection
              championship={championship}
              isLoading={isLoading}
              onToggleVisibility={() => void toggleVisibility()}
            />
          ) : null}

          {activeTab === 'kit' ? (
            <SettingsSection>
              <FormConfiguration champId={championship.id} mode="kit" />
            </SettingsSection>
          ) : null}

          {activeTab === 'schedule' ? (
            <SettingsSection>
              <FormConfiguration champId={championship.id} mode="schedule" />
            </SettingsSection>
          ) : null}

          {activeTab === 'advanced' ? (
            <DangerSection onDelete={() => setDeleteOpen(true)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

const EventSettings = () => (
  <ChampionshipProvider onClose={() => undefined}>
    <EventSettingsView />
  </ChampionshipProvider>
);

export default EventSettings;
