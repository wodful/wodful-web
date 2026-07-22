import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { IParticipant } from '@/data/interfaces/participant';
import useParticipantData from '@/hooks/useParticipantData';
import { isValidDocument } from '@/utils/documentVerification';
import { validationMessages } from '@/utils/messages';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

interface EditModalProps {
  oldParticipant?: IParticipant;
  onClose: () => void;
}

const FormParticipant = ({ onClose, oldParticipant }: EditModalProps) => {
  const { id } = useParams();
  const { Edit } = useParticipantData();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<IParticipant>({
    mode: 'onChange',
    defaultValues: {
      affiliation: oldParticipant?.affiliation,
      city: oldParticipant?.city,
      id: oldParticipant?.id,
      identificationCode: oldParticipant?.identificationCode,
      name: oldParticipant?.name,
      tShirtSize: oldParticipant?.tShirtSize,
    },
  });

  function onSubmit(participant: IParticipant) {
    Edit(participant, id!);
    onClose();
  }

  const formatDocument = (document: string) => {
    document = document.replace(/[^0-9]/g, '').trim();
    setValue(`identificationCode`, document);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-4">
      <FormField id="name" label="Nome" error={errors.name?.message}>
        <Input
          id="name"
          placeholder="Nome do participante"
          invalid={!!errors.name}
          {...register('name', {
            required: validationMessages['required'],
            minLength: { value: 4, message: validationMessages['minLength'] },
            maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
          })}
        />
      </FormField>
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          id="identificationCode"
          label="Documento"
          error={errors.identificationCode?.message}
        >
          <Input
            id="identificationCode"
            placeholder="Informe o CPF"
            invalid={!!errors.identificationCode}
            {...register('identificationCode', {
              required: validationMessages['required'],
              minLength: { value: 9, message: validationMessages['minLength'] },
              maxLength: { value: 20, message: validationMessages['maxLengthSm'] },
              validate: (value) => isValidDocument(value) || validationMessages['invalidCode'],
              onChange(event) {
                formatDocument(event.target.value);
              },
            })}
          />
        </FormField>
        <FormField id="tShirtSize" label="Camiseta" error={errors.tShirtSize?.message}>
          <Input
            id="tShirtSize"
            placeholder="Tamanho"
            invalid={!!errors.tShirtSize}
            {...register('tShirtSize', {
              required: validationMessages['required'],
              minLength: { value: 1, message: validationMessages['minLength'] },
              maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
            })}
          />
        </FormField>
      </div>
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="city" label="Cidade" error={errors.city?.message}>
          <Input
            id="city"
            placeholder="Cidade do participante"
            invalid={!!errors.city}
            {...register('city', {
              required: validationMessages['required'],
              minLength: { value: 4, message: validationMessages['minLength'] },
              maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
            })}
          />
        </FormField>
        <FormField id="affiliation" label="Box" error={errors.affiliation?.message}>
          <Input
            id="affiliation"
            placeholder="Box do participante"
            invalid={!!errors.affiliation}
            {...register('affiliation', {
              required: validationMessages['required'],
              minLength: { value: 3, message: validationMessages['minLength'] },
              maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
            })}
          />
        </FormField>
      </div>
      <Button type="submit" variant="primary" disabled={!isValid} className="sticky bottom-0 w-full">
        Editar
      </Button>
    </form>
  );
};

export default FormParticipant;
