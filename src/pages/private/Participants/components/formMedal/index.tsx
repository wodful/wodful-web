import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import useParticipantData from '@/hooks/useParticipantData';
import { validationMessages } from '@/utils/messages';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

interface EditMedalProps {
  idParticipant: string;
  onClose: () => void;
}

const FormMedal = ({ onClose, idParticipant }: EditMedalProps) => {
  const { id } = useParams();
  const { PatchMedal } = useParticipantData();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{ medalTakenBy: string }>({
    mode: 'onChange',
  });

  function onSubmit(form: { medalTakenBy: string }) {
    PatchMedal(idParticipant, form.medalTakenBy, id!);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-4">
      <FormField id="medalTakenBy" label="Nome" error={errors.medalTakenBy?.message}>
        <Input
          id="medalTakenBy"
          placeholder="Responsável pela retirada"
          invalid={!!errors.medalTakenBy}
          {...register('medalTakenBy', {
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

export default FormMedal;
