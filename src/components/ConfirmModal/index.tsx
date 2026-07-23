import ComponentModal, { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';

type ConfirmTone = 'primary' | 'danger';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <ComponentModal
      isOpen={isOpen}
      title={title}
      size="sm"
      onClose={onClose}
      footer={
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === 'danger' ? 'danger' : 'primary'}
            className="w-full sm:w-auto"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      }
    >
      <p className="text-sm leading-relaxed text-slate-700">{description}</p>
    </ComponentModal>
  );
}
