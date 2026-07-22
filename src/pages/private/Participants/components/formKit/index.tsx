import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import useParticipantData from '@/hooks/useParticipantData';
import { validationMessages } from '@/utils/messages';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

interface EditKitProps {
  idParticipant: string;
  onClose: () => void;
}

const FormKit = ({ onClose, idParticipant }: EditKitProps) => {
  const { id } = useParams();
  const { PatchKit } = useParticipantData();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{ kitTakenBy: string }>({
    mode: 'onChange',
  });

  function onSubmit(form: { kitTakenBy: string }) {
    PatchKit(idParticipant, form.kitTakenBy, id!);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-4">
      <FormField id="kitTakenBy" label="Nome" error={errors.kitTakenBy?.message}>
        <Input
          id="kitTakenBy"
          placeholder="Responsável pela retirada"
          invalid={!!errors.kitTakenBy}
          {...register('kitTakenBy', {
            required: validationMessages['required'],
            minLength: { value: 4, message: validationMessages['minLength'] },
            maxLength: { value: 250, message: validationMessages['maxLengthSm'] },
          })}
        />
      </FormField>
      <Button type="submit" variant="primary" disabled={!isValid} className="sticky bottom-0 w-full">
        Salvar
      </Button>
    </form>
  );
};

export default FormKit;
