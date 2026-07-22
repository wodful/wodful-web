import { Button } from '@/components/ui/Button';

interface IDelete {
  removedData: string;
  onClose: () => void;
  confirmDelete: () => void;
}

const DeleteData = ({ onClose, removedData, confirmDelete }: IDelete) => {
  const deleteData = () => {
    confirmDelete();
    onClose();
  };

  return (
    <div className="flex w-full flex-col gap-6 pb-4">
      <p className="text-sm text-slate-700">Tem certeza que deseja remover {removedData}</p>
      <Button variant="primary" className="w-full" onClick={deleteData}>
        Remover
      </Button>
    </div>
  );
};

export default DeleteData;
