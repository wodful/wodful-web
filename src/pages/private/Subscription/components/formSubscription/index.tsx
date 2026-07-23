import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ISubscriptionForm } from '@/data/interfaces/subscription';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import useTicketData from '@/hooks/useTicketData';
import { validationMessages } from '@/utils/messages';
import { formatPhoneDisplay, phoneDigitsOnly } from '@/utils/phone';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { SubscriptionFormStepper } from '../SubscriptionFormStepper';

interface CreateModalProps {
  id: string;
  openFormParticipants: (step: number, participantsNumber: number) => void;
  onCancel: () => void;
}

const FormSubscription = ({ id, openFormParticipants, onCancel }: CreateModalProps) => {
  const { setSubscriptionForm, subscriptionForm } = useSubscriptionData();
  const { ListEnabled, tickets } = useTicketData();

  const defaultTicketIndex = useMemo(() => {
    if (!subscriptionForm?.ticketId) return '';
    const index = tickets.findIndex((ticket) => ticket.id === subscriptionForm.ticketId);
    return index >= 0 ? String(index) : '';
  }, [subscriptionForm?.ticketId, tickets]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ISubscriptionForm>({
    mode: 'onChange',
    defaultValues: {
      responsibleName: subscriptionForm?.responsibleName ?? '',
      responsibleEmail: subscriptionForm?.responsibleEmail ?? '',
      responsiblePhone: subscriptionForm?.responsiblePhone ?? '',
      ticketIndex: defaultTicketIndex as unknown as number,
    },
  });

  const phoneValue = watch('responsiblePhone') ?? '';

  useEffect(() => {
    ListEnabled(id);
  }, [ListEnabled, id]);

  useEffect(() => {
    if (defaultTicketIndex !== '' && defaultTicketIndex !== undefined) {
      setValue('ticketIndex', Number(defaultTicketIndex), { shouldValidate: true });
    }
  }, [defaultTicketIndex, setValue]);

  function onSubmit(subscription: ISubscriptionForm) {
    const ticket = tickets[Number(subscription.ticketIndex)];
    subscription.ticketId = ticket.id;
    subscription.responsiblePhone = phoneDigitsOnly(subscription.responsiblePhone);
    setSubscriptionForm(subscription);
    openFormParticipants(1, ticket.category?.members);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-4">
      <SubscriptionFormStepper step={1} />

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Dados do responsável</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Quem receberá a confirmação e o contato da inscrição.
        </p>
      </div>

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
          type="email"
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
          type="tel"
          inputMode="numeric"
          placeholder="(11) 99999-9999"
          value={formatPhoneDisplay(phoneValue)}
          invalid={!!errors.responsiblePhone}
          {...register('responsiblePhone', {
            required: validationMessages['required'],
            validate: (value) => {
              const digits = phoneDigitsOnly(value);
              return digits.length >= 10 || validationMessages['minLength'];
            },
            onChange(event) {
              setValue('responsiblePhone', phoneDigitsOnly(event.target.value), {
                shouldValidate: true,
                shouldDirty: true,
              });
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
              {ticket.category?.name ? `${ticket.category.name} · ${ticket.name}` : ticket.name}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={!isValid} className="w-full sm:w-auto">
          Próximo
        </Button>
      </div>
    </form>
  );
};

export default FormSubscription;
