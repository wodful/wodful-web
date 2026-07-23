import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ITicket, TicketDTO } from '@/data/interfaces/ticket';
import useCategoryData from '@/hooks/useCategoryData';
import useTicketData from '@/hooks/useTicketData';
import { datetimeLocalToIso, isoToDatetimeLocal } from '@/utils/datetimeLocal';
import { validationMessages } from '@/utils/messages';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

interface IFormChampionshipProps {
  formId: string;
  onClose: () => void;
  oldTicket?: ITicket;
  resetTicket: () => void;
  onValidityChange?: (isValid: boolean) => void;
}

const FormTicket = ({
  formId,
  onClose,
  oldTicket,
  resetTicket,
  onValidityChange,
}: IFormChampionshipProps) => {
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

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TicketDTO>({
    mode: 'onChange',
    defaultValues: {
      categoryId: oldTicket?.category?.id ?? '',
      name: oldTicket?.name ?? '',
      description: oldTicket?.description ?? '',
      paymentLink: oldTicket?.paymentLink ?? '',
      price: oldTicket?.price,
      quantity: oldTicket?.quantity,
      endDate: isoToDatetimeLocal(oldTicket?.endDate),
      startDate: isoToDatetimeLocal(oldTicket?.startDate),
    },
  });

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  const onSubmit: SubmitHandler<TicketDTO> = async (ticket) => {
    ticket.price = Number(ticket.price);
    ticket.quantity = Number(ticket.quantity);

    const startDate = datetimeLocalToIso(String(ticket.startDate));
    const endDate = datetimeLocalToIso(String(ticket.endDate));
    const categoryId = oldTicket?.category?.id ?? ticket.categoryId;
    const paymentLink = oldTicket?.paymentLink ?? '';

    if (oldTicket) {
      const editedTicket = {
        id: oldTicket?.id,
        name: ticket.name,
        description: ticket.description,
        price: ticket.price,
        quantity: ticket.quantity,
        endDate,
        startDate,
        categoryId,
        paymentLink,
      };
      await Edit(editedTicket);
      resetTicket();
      onClose();
      return;
    }

    await Create({ ...ticket, categoryId, startDate, endDate, paymentLink });
    onClose();
  };

  useEffect(() => {
    if (!oldTicket && id) List(id);
  }, [List, id, oldTicket]);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Lote</h3>
        <div className="space-y-5">
          <FormField id="ticket-category" label="Categoria" error={errors.categoryId?.message}>
            {oldTicket?.category ? (
              <Input
                id="ticket-category"
                value={oldTicket.category.name}
                disabled
                readOnly
                aria-label={`Categoria ${oldTicket.category.name}`}
              />
            ) : (
              <Select
                id="ticket-category"
                invalid={!!errors.categoryId}
                {...register('categoryId', { required: validationMessages['required'] })}
              >
                <option value="">Selecione</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField id="ticket-name" label="Nome" error={errors.name?.message}>
            <Input
              id="ticket-name"
              placeholder="Ex.: 1º lote"
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
              placeholder="Opcional"
              invalid={!!errors.description}
              {...register('description', {
                minLength: { value: 4, message: validationMessages['minLength'] },
                maxLength: { value: 250, message: validationMessages['maxLengthSm'] },
              })}
            />
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Venda</h3>
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="ticket-price" label="Valor" error={errors.price?.message}>
              <Input
                id="ticket-price"
                type="text"
                inputMode="decimal"
                placeholder="289,90"
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

            <FormField
              id="ticket-quantity"
              label="Quantidade máxima"
              error={errors.quantity?.message}
            >
              <Input
                id="ticket-quantity"
                type="number"
                placeholder="100"
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
            <FormField
              id="ticket-start-date"
              label="Início"
              error={errors.startDate?.message}
            >
              <Input
                id="ticket-start-date"
                type="datetime-local"
                invalid={!!errors.startDate}
                {...register('startDate', {
                  required: validationMessages['required'],
                })}
              />
            </FormField>

            <FormField
              id="ticket-end-date"
              label="Encerramento"
              error={errors.endDate?.message}
            >
              <Input
                id="ticket-end-date"
                type="datetime-local"
                invalid={!!errors.endDate}
                {...register('endDate', {
                  required: validationMessages['required'],
                })}
              />
            </FormField>
          </div>
        </div>
      </div>
    </form>
  );
};

export default FormTicket;
