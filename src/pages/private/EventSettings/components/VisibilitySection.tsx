import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useToast } from '@/components/ui/Toast';
import { ExternalLink } from 'react-feather';

import { Button } from '@/components/ui/Button';
import { IChampionship } from '@/data/interfaces/championship';
import { championshipMessages } from '@/utils/messages';
import { SettingsSection } from './SettingsSection';

type VisibilitySectionProps = {
  championship: IChampionship;
  isLoading?: boolean;
  onToggleVisibility: () => void;
};

export function VisibilitySection({
  championship,
  isLoading,
  onToggleVisibility,
}: VisibilitySectionProps) {
  const toast = useToast();
  const inscriptionUrl = `${import.meta.env.VITE_BASE_WODFUL_SITE}/event/${championship.accessCode}`;

  return (
    <SettingsSection description="Controle se o evento aparece publicamente e compartilhe os links.">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                'inline-flex rounded-chip px-2.5 py-0.5 text-xs font-semibold',
                championship.isActive
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 text-gray-700',
              ].join(' ')}
            >
              {championship.isActive ? 'Público' : 'Privado'}
            </span>
            <span className="text-sm text-gray-500">
              Código · {championship.accessCode}
            </span>
          </div>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            isLoading={isLoading}
            onClick={onToggleVisibility}
          >
            {championship.isActive ? 'Tornar privado' : 'Tornar público'}
          </Button>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row">
          <CopyToClipboard
            text={inscriptionUrl}
            onCopy={() =>
              toast({
                title: championshipMessages['success_copy_link'],
                status: 'success',
                isClosable: true,
              })
            }
          >
            <Button variant="secondary" className="w-full flex-1">
              Copiar link de inscrição
            </Button>
          </CopyToClipboard>
          <a
            href={inscriptionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-control border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 no-underline transition hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
          >
            Abrir página pública
            <ExternalLink size={14} aria-hidden />
          </a>
        </div>
      </div>
    </SettingsSection>
  );
}
