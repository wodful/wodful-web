import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ISubscriptionForm } from '@/data/interfaces/subscription';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import useTicketData from '@/hooks/useTicketData';
import { regexOnlyNumber } from '@/utils/documentVerification';
import { validationMessages } from '@/utils/messages';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface CreateModalProps {
  id: string;
  openFormParticipants: (step: number, participantsNumber: number) => void;
}

const FormSubscription = ({ id, openFormParticipants }: CreateModalProps) => {
  const [formatDisplayPhone, setFormatDisplayPhone] = useState<string>('');
  const { setSubscriptionForm } = useSubscriptionData();
  const { ListEnabled, tickets } = useTicketData();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ISubscriptionForm>({
    mode: 'onChange',
  });

  useEffect(() => {
    ListEnabled(id);
  }, [ListEnabled, id]);

  function onSubmit(subscription: ISubscriptionForm) {
    subscription.ticketId = tickets[subscription.ticketIndex as number].id;
    setSubscriptionForm(subscription as ISubscriptionForm);
    openFormParticipants(1, tickets[subscription.ticketIndex as number].category?.members);
  }

  const formatPhone = (phoneNumber: string) => {
    phoneNumber = regexOnlyNumber(phoneNumber);
    setFormatDisplayPhone(phoneNumber);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-4">
      <p className="font-bold text-slate-900">Dados do responsável</p>
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
          value={formatDisplayPhone}
          invalid={!!errors.responsiblePhone}
          {...register('responsiblePhone', {
            required: validationMessages['required'],
            minLength: { value: 10, message: validationMessages['minLength'] },
            maxLength: { value: 15, message: validationMessages['maxLengthSm'] },
            onChange(event) {
              formatPhone(event.target.value);
            },
          })}
        />
      </FormField>

      <FormField id="members" label="Ticket" error={errors.ticketIndex?.message}>
        <Select
          id="members"
          invalid={!!errors.ticketIndex}
          {...register('ticketIndex', {
            required: validationMessages['required'],
          })}
        >
          <option value="">Selecione o ticket da categoria</option>
          {tickets?.map((ticket, index) => (
            <option key={ticket.id} value={index}>
              {ticket.name}
            </option>
          ))}
        </Select>
      </FormField>
      <Button type="submit" variant="primary" disabled={!isValid} className="w-full">
        Próximo
      </Button>
    </form>
  );
};

export default FormSubscription;
