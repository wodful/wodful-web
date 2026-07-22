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
    <div className="flex w-full flex-col gap-5 pb-2">
      <p className="text-sm text-slate-700">Tem certeza que deseja remover {removedData}</p>
      <div className="flex flex-col gap-2">
        <Button variant="danger" className="w-full" onClick={deleteData}>
          Remover
        </Button>
        <Button variant="secondary" className="w-full" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default DeleteData;
