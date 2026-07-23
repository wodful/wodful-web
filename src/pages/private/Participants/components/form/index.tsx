import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IParticipants } from '@/data/interfaces/participant';
import useParticipantData from '@/hooks/useParticipantData';
import { ChampionshipService } from '@/services/Championship';
import { isValidDocument, regexOnlyNumber } from '@/utils/documentVerification';
import { validationMessages } from '@/utils/messages';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

type EditParticipantForm = {
  id: string;
  name: string;
  identificationCode: string;
  affiliation: string;
  city: string;
  tShirtSize: string;
};

interface EditModalProps {
  oldParticipant?: IParticipants;
  onClose: () => void;
}

const axios = new AxiosAdapter();
const championshipService = new ChampionshipService(axios);

function normalizeAffiliation(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function resolveAffiliation(value: string, options: string[]) {
  const normalized = normalizeAffiliation(value);
  if (!normalized) return normalized;
  const match = options.find(
    (option) => option.toLowerCase() === normalized.toLowerCase(),
  );
  return match ?? normalized;
}

function formatDocumentDisplay(value: string) {
  const digits = regexOnlyNumber(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

const FormParticipant = ({ onClose, oldParticipant }: EditModalProps) => {
  const { id } = useParams();
  const { Edit } = useParticipantData();
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [hasTshirt, setHasTshirt] = useState(false);
  const [tShirtSizes, setTShirtSizes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<EditParticipantForm>({
    mode: 'onChange',
    defaultValues: {
      affiliation: oldParticipant?.affiliation,
      city: oldParticipant?.city,
      id: oldParticipant?.id,
      identificationCode: oldParticipant?.identificationCode
        ? formatDocumentDisplay(oldParticipant.identificationCode)
        : '',
      name: oldParticipant?.name,
      tShirtSize: oldParticipant?.tShirtSize,
    },
  });

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    championshipService
      .listAffiliations(id)
      .then((items) => {
        if (!cancelled) setAffiliations(items);
      })
      .catch(() => {
        if (!cancelled) setAffiliations([]);
      });

    championshipService
      .getTshirts(id)
      .then((tshirts) => {
        if (cancelled) return;
        setHasTshirt(tshirts.hasTshirt);
        setTShirtSizes(tshirts.tShirtSizes ?? []);
        if (!tshirts.hasTshirt) {
          setValue('tShirtSize', 'Sem camiseta', { shouldValidate: true });
        } else if (
          oldParticipant?.tShirtSize &&
          tshirts.tShirtSizes.includes(oldParticipant.tShirtSize)
        ) {
          setValue('tShirtSize', oldParticipant.tShirtSize, { shouldValidate: true });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setHasTshirt(false);
        setTShirtSizes([]);
        setValue('tShirtSize', 'Sem camiseta', { shouldValidate: true });
      });

    return () => {
      cancelled = true;
    };
  }, [id, oldParticipant?.tShirtSize, setValue]);

  function onSubmit(participant: EditParticipantForm) {
    Edit(
      {
        ...participant,
        identificationCode: regexOnlyNumber(participant.identificationCode),
        affiliation: resolveAffiliation(participant.affiliation ?? '', affiliations),
        tShirtSize: hasTshirt ? participant.tShirtSize : 'Sem camiseta',
      },
      id!,
    );
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {(oldParticipant?.nickname || oldParticipant?.category?.name) && (
        <div className="rounded-surface border border-slate-200 bg-slate-50 px-3.5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Inscrição
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {oldParticipant.nickname || '—'}
            {oldParticipant.category?.name ? (
              <span className="font-normal text-slate-500">
                {' '}
                · {oldParticipant.category.name}
              </span>
            ) : null}
          </p>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Dados pessoais</h3>
        <div className="space-y-5">
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
          <FormField
            id="identificationCode"
            label="Documento"
            error={errors.identificationCode?.message}
          >
            <Input
              id="identificationCode"
              placeholder="000.000.000-00"
              invalid={!!errors.identificationCode}
              {...register('identificationCode', {
                required: validationMessages['required'],
                validate: (value) =>
                  isValidDocument(value) || validationMessages['invalidCode'],
                onChange(event) {
                  setValue('identificationCode', formatDocumentDisplay(event.target.value), {
                    shouldValidate: true,
                  });
                },
              })}
            />
          </FormField>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Dados do evento</h3>
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField id="tShirtSize" label="Camiseta" error={errors.tShirtSize?.message}>
            <Select
              id="tShirtSize"
              invalid={!!errors.tShirtSize}
              disabled={!hasTshirt}
              {...register('tShirtSize', {
                required: hasTshirt ? validationMessages['required'] : false,
              })}
            >
              {hasTshirt ? (
                <>
                  <option value="">Selecione um tamanho</option>
                  {tShirtSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                  {oldParticipant?.tShirtSize &&
                  !tShirtSizes.includes(oldParticipant.tShirtSize) ? (
                    <option value={oldParticipant.tShirtSize}>
                      {oldParticipant.tShirtSize} (atual)
                    </option>
                  ) : null}
                </>
              ) : (
                <option value="Sem camiseta">Sem camiseta</option>
              )}
            </Select>
          </FormField>
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
          <div className="sm:col-span-2">
            <FormField id="affiliation" label="Box" error={errors.affiliation?.message}>
              <Controller
                name="affiliation"
                control={control}
                rules={{
                  required: validationMessages['required'],
                  minLength: { value: 3, message: validationMessages['minLength'] },
                  maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
                }}
                render={({ field }) => (
                  <Combobox
                    id="affiliation"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    options={affiliations}
                    placeholder="Busque ou digite o box"
                    invalid={!!errors.affiliation}
                    resolveCanonical={(value, options) => resolveAffiliation(value, options)}
                  />
                )}
              />
            </FormField>
          </div>
        </div>
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

export default FormParticipant;
