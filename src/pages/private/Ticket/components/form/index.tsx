import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ITicket, TicketDTO } from '@/data/interfaces/ticket';
import useCategoryData from '@/hooks/useCategoryData';
import useTicketData from '@/hooks/useTicketData';
import { validationMessages } from '@/utils/messages';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

interface IFormChampionshipProps {
  onClose: () => void;
  oldTicket?: ITicket;
  resetTicket: () => void;
}

const FormTicket = ({ onClose, oldTicket, resetTicket }: IFormChampionshipProps) => {
  const { List, categories } = useCategoryData();
  const { Create, Edit } = useTicketData();
  const { id } = useParams();

  const parsePriceBR = (value: unknown) => {
    if (value === null || value === undefined) return undefined;
    const raw = String(value).trim();
    if (!raw) return undefined;

    const normalized = raw.replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    if (!Number.isFinite(num)) return undefined;
    return num;
  };

  const formatDateTimeLocal = (value?: Date | string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const tzOffsetMs = date.getTimezoneOffset() * 60000;
    const localTime = new Date(date.getTime() - tzOffsetMs);
    return localTime.toISOString().slice(0, 16);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TicketDTO>({
    mode: 'onChange',
    defaultValues: {
      categoryId: oldTicket?.category.id,
      name: oldTicket?.name,
      description: oldTicket?.description,
      paymentLink: oldTicket?.paymentLink,
      price: oldTicket?.price,
      quantity: oldTicket?.quantity,
      endDate: formatDateTimeLocal(oldTicket?.endDate),
      startDate: formatDateTimeLocal(oldTicket?.startDate),
    },
  });

  const onSubmit: SubmitHandler<TicketDTO> = async (ticket) => {
    ticket.price = Number(ticket.price);
    ticket.quantity = Number(ticket.quantity);

    if (oldTicket) {
      const editedTicket = {
        id: oldTicket?.id,
        name: ticket.name,
        description: ticket.description,
        price: ticket.price,
        quantity: ticket.quantity,
        endDate: ticket.endDate,
        startDate: ticket.startDate,
        categoryId: ticket.categoryId,
        paymentLink: ticket.paymentLink,
      };
      await Edit(editedTicket);
      resetTicket();
      onClose();
      return;
    }

    await Create(ticket);
    onClose();
  };

  useEffect(() => {
    List(id as string);
  }, [List, id]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-6">
      <FormField id="ticket-category" label="Categoria" error={errors.categoryId?.message}>
        <Select
          id="ticket-category"
          disabled={!!oldTicket?.category.id}
          invalid={!!errors.categoryId}
          {...register('categoryId', { required: validationMessages['required'] })}
        >
          <option value="">Selecione a categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id="ticket-name" label="Nome" error={errors.name?.message}>
        <Input
          id="ticket-name"
          placeholder="Nome do ticket"
          invalid={!!errors.name}
          {...register('name', {
            required: validationMessages['required'],
            minLength: { value: 4, message: validationMessages['minLength'] },
            maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
          })}
        />
      </FormField>

      <FormField id="ticket-description" label="Descrição" error={errors.description?.message}>
        <Textarea
          id="ticket-description"
          placeholder="Descrição do ticket"
          invalid={!!errors.description}
          {...register('description', {
            minLength: { value: 4, message: validationMessages['minLength'] },
            maxLength: { value: 250, message: validationMessages['maxLengthSm'] },
          })}
        />
      </FormField>

      <FormField id="ticket-payment-link" label="Link de pagamento" error={errors.paymentLink?.message}>
        <Input
          id="ticket-payment-link"
          placeholder="https://mpago.la/seu_link"
          invalid={!!errors.paymentLink}
          {...register('paymentLink')}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="ticket-price" label="Valor" error={errors.price?.message}>
          <Input
            id="ticket-price"
            type="text"
            inputMode="decimal"
            placeholder="Valor do ticket (ex.: 289,90)"
            invalid={!!errors.price}
            {...register('price', {
              required: validationMessages['required'],
              setValueAs: parsePriceBR,
              validate: (v) =>
                typeof v === 'number' && Number.isFinite(v) && v >= 0
                  ? true
                  : validationMessages['invalidField'],
            })}
          />
        </FormField>

        <FormField id="ticket-quantity" label="Quantidade máxima" error={errors.quantity?.message}>
          <Input
            id="ticket-quantity"
            type="number"
            placeholder="Quantidade de tickets"
            invalid={!!errors.quantity}
            {...register('quantity', {
              required: validationMessages['required'],
              minLength: { value: 1, message: validationMessages['minLength'] },
              maxLength: { value: 5, message: validationMessages['maxLengthSm'] },
            })}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="ticket-start-date" label="Data e hora de início" error={errors.startDate?.message}>
          <Input
            id="ticket-start-date"
            type="datetime-local"
            placeholder="DD/MM/AAAA HH:mm"
            invalid={!!errors.startDate}
            {...register('startDate', {
              required: validationMessages['required'],
            })}
          />
        </FormField>

        <FormField id="ticket-end-date" label="Data e hora de encerramento" error={errors.endDate?.message}>
          <Input
            id="ticket-end-date"
            type="datetime-local"
            placeholder="DD/MM/AAAA HH:mm"
            invalid={!!errors.endDate}
            {...register('endDate', {
              required: validationMessages['required'],
            })}
          />
        </FormField>
      </div>

      <Button type="submit" variant="primary" disabled={!isValid} className="mt-2 w-full">
        {oldTicket ? 'Editar' : 'Criar'}
      </Button>
    </form>
  );
};

export default FormTicket;
