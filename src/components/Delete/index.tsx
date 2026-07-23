import { ConfirmModal } from '@/components/ConfirmModal';

interface IDelete {
  removedData: string;
  onClose: () => void;
  confirmDelete: () => void;
  isOpen: boolean;
  title?: string;
}

/** Full-screen confirm modal for destructive removals. */
const DeleteData = ({
  onClose,
  removedData,
  confirmDelete,
  isOpen,
  title = 'Remover',
}: IDelete) => {
  const handleConfirm = () => {
    confirmDelete();
    onClose();
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={title}
      description={`Remover ${removedData}.`}
      confirmLabel="Remover"
      tone="danger"
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
};

export default DeleteData;
