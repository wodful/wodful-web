import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { IParticipantDTO } from '@/data/interfaces/participant';
import { IParticipantForm } from '@/data/interfaces/subscription';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import { isValidDocument, regexOnlyNumber } from '@/utils/documentVerification';
import { validationMessages } from '@/utils/messages';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface CreateModalProps {
  participantsNumber: number;
  onClose: () => void;
  resetStep: (step: number, participantsNumber: number) => void;
}

const FormSubscriptionParticipants = ({
  participantsNumber,
  onClose,
  resetStep,
}: CreateModalProps) => {
  const { Create } = useSubscriptionData();
  const [indexes, setIndexes] = useState<number[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<IParticipantForm>({
    mode: 'onChange',
  });

  useEffect(() => {
    for (let index = 0; index < participantsNumber; index++) {
      setIndexes((indexes) => [...indexes, index]);
    }
  }, [participantsNumber]);

  function removeIdCodePoints(participants: IParticipantDTO[]) {
    return participants.map((participant) => ({
      ...participant,
      identificationCode: regexOnlyNumber(participant.identificationCode),
    }));
  }

  function onSubmit(subscription: IParticipantForm) {
    subscription.participants = removeIdCodePoints(subscription.participants);
    Create(subscription);
    onClose();
    resetStep(0, 0);
  }

  const formatDocument = (document: string, index: number) => {
    document = document.replace(/[^0-9]/g, '').trim();
    setValue(`participants.${index}.identificationCode`, document);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-4">
      <div className="flex w-full flex-col gap-5">
        {indexes.length == 1 && <p className="font-bold text-slate-900">Dados do participante</p>}
        <FormField id="nickname" label={indexes.length > 1 ? 'Nome do time' : 'Apelido'} error={errors.nickname?.message}>
          <Input
            id="nickname"
            placeholder={indexes.length > 1 ? 'Informe o nome do time' : 'Apelido do participante'}
            invalid={!!errors.nickname}
            {...register('nickname', {
              required: validationMessages['required'],
              minLength: { value: 4, message: validationMessages['minLength'] },
              maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
            })}
          />
        </FormField>
        {indexes.length > 1 && <p className="font-bold text-slate-900">Dados dos participantes</p>}
      </div>
      {indexes.map((index) => {
        const participants = `participants[${index}]`;
        return (
          <div key={index} className="flex w-full flex-col gap-5">
            <FormField
              id={`${participants}.name`}
              label={indexes.length > 1 ? `Atleta ${index + 1}` : 'Nome'}
              error={errors.participants?.[index]?.name?.message}
            >
              <Input
                id={`${participants}.name`}
                placeholder="Nome do participante"
                invalid={!!errors.participants?.[index]?.name}
                {...register(`participants.${index}.name`, {
                  required: validationMessages['required'],
                  minLength: { value: 4, message: validationMessages['minLength'] },
                  maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
                })}
              />
            </FormField>
            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                id={`${participants}.identificationCode`}
                label="Documento"
                error={errors.participants?.[index]?.identificationCode?.message}
              >
                <Input
                  id={`${participants}.identificationCode`}
                  placeholder="Informe o CPF"
                  invalid={!!errors.participants?.[index]?.identificationCode}
                  {...register(`participants.${index}.identificationCode`, {
                    required: validationMessages['required'],
                    minLength: { value: 9, message: validationMessages['minLength'] },
                    maxLength: { value: 20, message: validationMessages['maxLengthSm'] },
                    validate: (value) =>
                      isValidDocument(value) || validationMessages['invalidCode'],
                    onChange(event) {
                      formatDocument(event.target.value, index);
                    },
                  })}
                />
              </FormField>
              <FormField
                id={`${participants}.tShirtSize`}
                label="Camiseta"
                error={errors.participants?.[index]?.tShirtSize?.message}
              >
                <Input
                  id={`${participants}.tShirtSize`}
                  placeholder="Tamanho"
                  invalid={!!errors.participants?.[index]?.tShirtSize}
                  {...register(`participants.${index}.tShirtSize`, {
                    required: validationMessages['required'],
                    minLength: { value: 1, message: validationMessages['minLength'] },
                    maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
                  })}
                />
              </FormField>
            </div>
            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                id={`${participants}.city`}
                label="Cidade"
                error={errors.participants?.[index]?.city?.message}
              >
                <Input
                  id={`${participants}.city`}
                  placeholder="Cidade do participante"
                  invalid={!!errors.participants?.[index]?.city}
                  {...register(`participants.${index}.city`, {
                    required: validationMessages['required'],
                    minLength: { value: 4, message: validationMessages['minLength'] },
                    maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
                  })}
                />
              </FormField>
              <FormField
                id={`${participants}.affiliation`}
                label="Box"
                error={errors.participants?.[index]?.affiliation?.message}
              >
                <Input
                  id={`${participants}.affiliation`}
                  placeholder="Box do participante"
                  invalid={!!errors.participants?.[index]?.affiliation}
                  {...register(`participants.${index}.affiliation`, {
                    required: validationMessages['required'],
                    minLength: { value: 3, message: validationMessages['minLength'] },
                    maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
                  })}
                />
              </FormField>
            </div>

            {index + 1 != indexes.length && <hr className="border-slate-200" />}
          </div>
        );
      })}
      <Button type="submit" variant="primary" disabled={!isValid} className="sticky bottom-0 w-full">
        Adicionar
      </Button>
    </form>
  );
};

export default FormSubscriptionParticipants;
