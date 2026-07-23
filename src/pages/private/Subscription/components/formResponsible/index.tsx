import { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { UpdateSubscriptionDTO } from '@/data/interfaces/subscription';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import { regexOnlyNumber } from '@/utils/documentVerification';
import { validationMessages } from '@/utils/messages';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface UpdateModalProps {
  subId: string;
  onClose: () => void;
}

const FormResponsible = ({ subId, onClose }: UpdateModalProps) => {
  const [formatDisplayPhone, setFormatDisplayPhone] = useState<string>('');
  const { Get, subscription, Update } = useSubscriptionData();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<UpdateSubscriptionDTO>({
    mode: 'onChange',
  });

  function onSubmit(responsibleData: UpdateSubscriptionDTO) {
    Update(subId, responsibleData).then(() => onClose());
  }

  const formatPhone = (phoneNumber: string) => {
    phoneNumber = regexOnlyNumber(phoneNumber);
    setValue('responsiblePhone', phoneNumber);
  };

  useEffect(() => {
    if (subId) {
      Get(subId).then(() => {
        setValue('nickname', subscription.nickname);
        setValue('responsibleEmail', subscription.responsibleEmail!);
        setValue('responsibleName', subscription.responsibleName);
        setValue('responsiblePhone', subscription.responsiblePhone!);
        setFormatDisplayPhone(subscription.responsiblePhone!);
      });
    }
  }, [
    Get,
    setValue,
    subId,
    subscription.nickname,
    subscription?.responsibleEmail,
    subscription.responsibleName,
    subscription.responsiblePhone,
  ]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Dados do responsável</h3>
        <div className="space-y-5">
          <FormField id="responsibleName" label="Nome" error={errors.responsibleName?.message}>
            <Input
              id="responsibleName"
              placeholder="Nome do responsável"
              invalid={!!errors.responsibleName}
              {...register('responsibleName', {
                required: validationMessages['required'],
                minLength: { value: 4, message: validationMessages['minLength'] },
                maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
              })}
            />
          </FormField>
          <FormField id="responsibleEmail" label="E-mail" error={errors.responsibleEmail?.message}>
            <Input
              id="responsibleEmail"
              placeholder="E-mail do responsável"
              invalid={!!errors.responsibleEmail}
              {...register('responsibleEmail', {
                required: validationMessages['required'],
                minLength: { value: 4, message: validationMessages['minLength'] },
                maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: validationMessages['invalidField'],
                },
              })}
            />
          </FormField>
          <FormField id="responsiblePhone" label="Telefone" error={errors.responsiblePhone?.message}>
            <Input
              id="responsiblePhone"
              placeholder="Telefone do responsável"
              invalid={!!errors.responsiblePhone}
              {...register('responsiblePhone', {
                required: validationMessages['required'],
                minLength: { value: 10, message: validationMessages['minLength'] },
                maxLength: { value: 15, message: validationMessages['maxLengthSm'] },
                value: formatDisplayPhone,
                onChange(event) {
                  formatPhone(event.target.value);
                },
              })}
            />
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Dados do atleta</h3>
        <FormField id="nickname" label="Nome do time ou apelido" error={errors.nickname?.message}>
          <Input
            id="nickname"
            placeholder="Informe o nome do time ou apelido"
            invalid={!!errors.nickname}
            {...register('nickname', {
              required: validationMessages['required'],
              minLength: { value: 4, message: validationMessages['minLength'] },
              maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
            })}
          />
        </FormField>
      </div>

      <ModalFooter>
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={!isValid} className="w-full sm:w-auto">
          Salvar
        </Button>
      </ModalFooter>
    </form>
  );
};

export default FormResponsible;
