import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IParticipantDTO } from '@/data/interfaces/participant';
import { IParticipantForm } from '@/data/interfaces/subscription';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import useTicketData from '@/hooks/useTicketData';
import { ChampionshipService } from '@/services/Championship';
import { isValidDocument, regexOnlyNumber } from '@/utils/documentVerification';
import { validationMessages } from '@/utils/messages';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SubscriptionFormStepper } from '../SubscriptionFormStepper';

interface CreateModalProps {
  participantsNumber: number;
  onClose: () => void;
  resetStep: (step: number, participantsNumber: number) => void;
}

type ApprovalMode = 'internal' | 'complimentary' | 'waiting';

const APPROVAL_OPTIONS: {
  value: ApprovalMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'internal',
    label: 'Interna (já pago)',
    description: 'Pagamento recebido fora do site. Aprova agora.',
  },
  {
    value: 'complimentary',
    label: 'Isenta',
    description: 'Sem cobrança. Conta nas métricas como isenta.',
  },
  {
    value: 'waiting',
    label: 'Aguardar pagamento',
    description: 'Fica pendente até o pagamento online.',
  },
];

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

const FormSubscriptionParticipants = ({
  participantsNumber,
  onClose,
  resetStep,
}: CreateModalProps) => {
  const { id: championshipId } = useParams();
  const { Create, subscriptionForm } = useSubscriptionData();
  const { tickets } = useTicketData();
  const [indexes, setIndexes] = useState<number[]>([]);
  const [approvalMode, setApprovalMode] = useState<ApprovalMode>('internal');
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [hasTshirt, setHasTshirt] = useState(false);
  const [tShirtSizes, setTShirtSizes] = useState<string[]>([]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === subscriptionForm?.ticketId),
    [tickets, subscriptionForm?.ticketId],
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<IParticipantForm>({
    mode: 'onChange',
  });

  useEffect(() => {
    setIndexes(Array.from({ length: participantsNumber }, (_, index) => index));
  }, [participantsNumber]);

  useEffect(() => {
    if (!championshipId) return;

    let cancelled = false;
    championshipService
      .listAffiliations(championshipId)
      .then((items) => {
        if (!cancelled) setAffiliations(items);
      })
      .catch(() => {
        if (!cancelled) setAffiliations([]);
      });

    championshipService
      .getTshirts(championshipId)
      .then((tshirts) => {
        if (cancelled) return;
        setHasTshirt(tshirts.hasTshirt);
        setTShirtSizes(tshirts.tShirtSizes ?? []);
        if (!tshirts.hasTshirt) {
          for (let index = 0; index < participantsNumber; index++) {
            setValue(`participants.${index}.tShirtSize`, 'Sem camiseta', {
              shouldValidate: true,
            });
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        setHasTshirt(false);
        setTShirtSizes([]);
        for (let index = 0; index < participantsNumber; index++) {
          setValue(`participants.${index}.tShirtSize`, 'Sem camiseta', {
            shouldValidate: true,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [championshipId, participantsNumber, setValue]);

  function removeIdCodePoints(participants: IParticipantDTO[]) {
    return participants.map((participant) => ({
      ...participant,
      identificationCode: regexOnlyNumber(participant.identificationCode),
      affiliation: resolveAffiliation(participant.affiliation ?? '', affiliations),
      tShirtSize: hasTshirt ? participant.tShirtSize : 'Sem camiseta',
    }));
  }

  function onSubmit(subscription: IParticipantForm) {
    subscription.participants = removeIdCodePoints(subscription.participants);
    Create({
      ...subscription,
      approveManually: approvalMode === 'internal',
      isComplimentary: approvalMode === 'complimentary',
    });
    onClose();
    resetStep(0, 0);
  }

  const formatDocument = (document: string, index: number) => {
    document = document.replace(/[^0-9]/g, '').trim();
    setValue(`participants.${index}.identificationCode`, document);
  };

  const submitLabel =
    approvalMode === 'complimentary'
      ? 'Adicionar isenta'
      : approvalMode === 'internal'
        ? 'Adicionar e aprovar'
        : 'Adicionar e aguardar';

  const isTeam = indexes.length > 1;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <SubscriptionFormStepper step={2} />

      {selectedTicket ? (
        <div className="rounded-surface border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">
            {selectedTicket.category?.name ?? 'Categoria'}
          </span>
          <span className="text-slate-400"> · </span>
          <span>{selectedTicket.name}</span>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          {isTeam ? 'Dados do time' : 'Identificação'}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {isTeam
            ? 'Nome do time e dados de cada atleta.'
            : 'Como o atleta aparece na inscrição e no leaderboard.'}
        </p>
      </div>

      <FormField
        id="nickname"
        label={isTeam ? 'Nome do time' : 'Apelido'}
        error={errors.nickname?.message}
      >
        <Input
          id="nickname"
          placeholder={isTeam ? 'Informe o nome do time' : 'Apelido do participante'}
          invalid={!!errors.nickname}
          {...register('nickname', {
            required: validationMessages['required'],
            minLength: { value: 4, message: validationMessages['minLength'] },
            maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
          })}
        />
      </FormField>

      {indexes.map((index) => {
        const participants = `participants[${index}]`;
        return (
          <div key={index} className="flex w-full flex-col gap-5">
            {isTeam ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Atleta {index + 1}
              </p>
            ) : null}

            <FormField
              id={`${participants}.name`}
              label="Nome"
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

            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Dados do evento</h3>
              <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  id={`${participants}.tShirtSize`}
                  label="Camiseta"
                  error={errors.participants?.[index]?.tShirtSize?.message}
                >
                  <Select
                    id={`${participants}.tShirtSize`}
                    invalid={!!errors.participants?.[index]?.tShirtSize}
                    disabled={!hasTshirt}
                    {...register(`participants.${index}.tShirtSize`, {
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
                      </>
                    ) : (
                      <option value="Sem camiseta">Sem camiseta</option>
                    )}
                  </Select>
                </FormField>
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
                <div className="sm:col-span-2">
                  <FormField
                    id={`${participants}.affiliation`}
                    label="Box"
                    error={errors.participants?.[index]?.affiliation?.message}
                  >
                    <Controller
                      name={`participants.${index}.affiliation`}
                      control={control}
                      rules={{
                        required: validationMessages['required'],
                        minLength: { value: 3, message: validationMessages['minLength'] },
                        maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
                      }}
                      render={({ field }) => (
                        <Combobox
                          id={`${participants}.affiliation`}
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          options={affiliations}
                          placeholder="Busque ou digite o box"
                          invalid={!!errors.participants?.[index]?.affiliation}
                          resolveCanonical={(value, options) =>
                            resolveAffiliation(value, options)
                          }
                        />
                      )}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {index + 1 != indexes.length && <hr className="border-slate-200" />}
          </div>
        );
      })}

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-slate-900">Como aprovar?</legend>
        <p className="text-xs text-slate-500">Escolha o status inicial desta inscrição.</p>
        <div className="space-y-2 pt-1">
          {APPROVAL_OPTIONS.map((option) => {
            const active = approvalMode === option.value;
            return (
              <label
                key={option.value}
                className={[
                  'flex cursor-pointer items-start gap-3 rounded-surface border px-3.5 py-3 transition',
                  active
                    ? 'border-primary/40 bg-primary/[0.04]'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="approvalMode"
                  className="mt-1 h-4 w-4 border-slate-300 text-primary focus:ring-primary/25"
                  checked={active}
                  onChange={() => setApprovalMode(option.value)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <ModalFooter>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => resetStep(0, participantsNumber)}
        >
          Voltar
        </Button>
        <Button type="submit" variant="primary" disabled={!isValid} className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </ModalFooter>
    </form>
  );
};

export default FormSubscriptionParticipants;
