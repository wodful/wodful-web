import { Button } from '@/components/ui/Button';
import { SettingsSection } from './SettingsSection';

type DangerSectionProps = {
  onDelete: () => void;
};

export function DangerSection({ onDelete }: DangerSectionProps) {
  return (
    <SettingsSection
      title="Zona de perigo"
      description="A exclusão remove o evento de forma permanente."
      tone="danger"
    >
      <Button
        variant="secondary"
        className="w-full border-red-200 text-red-700 hover:border-red-300 hover:text-red-800 sm:w-auto"
        onClick={onDelete}
      >
        Excluir evento
      </Button>
    </SettingsSection>
  );
}
