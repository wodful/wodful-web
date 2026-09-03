import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import ComponentModal, { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { ICategory } from '@/data/interfaces/category';
import type { IParticipantDTO } from '@/data/interfaces/participant';
import type { IParticipantForm, ISubscription } from '@/data/interfaces/subscription';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import { ChampionshipService } from '@/services/Championship';
import { SubscriptionService } from '@/services/Subscription';
import { categoryFormatLabel } from '@/utils/categoryFormat';
import { isValidDocument, regexOnlyNumber } from '@/utils/documentVerification';
import { formatDate } from '@/utils/formatDate';
import { validationMessages } from '@/utils/messages';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

const axios = new AxiosAdapter();
const championshipService = new ChampionshipService(axios);
const subscriptionService = new SubscriptionService(axios);

type TransferModalProps = {
  isOpen: boolean;
  subscriptionId: string;
  categories: ICategory[];
  onClose: () => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function parseAmount(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.includes(',')
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

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

function emptyAthlete(): IParticipantDTO {
  return {
    name: '',
    identificationCode: '',
    affiliation: '',
    city: '',
    tShirtSize: '',
  };
}

const TransferSubscriptionModal = ({
  isOpen,
  subscriptionId,
  categories,
  onClose,
}: TransferModalProps) => {
  const { id: championshipId } = useParams();
  const { Transfer, isLoading } = useSubscriptionData();
  const [detail, setDetail] = useState<ISubscription | null>(null);
  const [loadError, setLoadError] = useState('');
  const [toCategoryId, setToCategoryId] = useState('');
  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const [adjustmentRaw, setAdjustmentRaw] = useState('');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [affiliations, setAffiliations] = useState<string[]>([]);
  const [hasTshirt, setHasTshirt] = useState(false);
  const [tShirtSizes, setTShirtSizes] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<IParticipantForm>({
    mode: 'onChange',
    defaultValues: { nickname: '', participants: [] },
  });

  const destCategory = useMemo(
    () => categories.find((category) => category.id === toCategoryId),
    [categories, toCategoryId],
  );

  const currentMembers = detail?.participants?.length ?? detail?.category.members ?? 0;
  const destMembers = destCategory?.members ?? 0;
  const removeNeeded = destCategory ? Math.max(0, currentMembers - destMembers) : 0;
  const addNeeded = destCategory ? Math.max(0, destMembers - currentMembers) : 0;
  const sameSize = Boolean(destCategory && removeNeeded === 0 && addNeeded === 0);

  useEffect(() => {
    if (!isOpen || !subscriptionId) return;

    let cancelled = false;
    setLoadError('');
    setDetail(null);
    setToCategoryId('');
    setRemoveIds([]);
    setAdjustmentRaw('');
    setPaymentUrl(null);
    setCopied(false);
    reset({ nickname: '', participants: [] });

    subscriptionService
      .get(subscriptionId)
      .then((subscription) => {
        if (!cancelled) setDetail(subscription);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Não foi possível carregar a inscrição.');
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, reset, subscriptionId]);

  useEffect(() => {
    if (!isOpen || !championshipId) return;

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
      })
      .catch(() => {
        if (cancelled) return;
        setHasTshirt(false);
        setTShirtSizes([]);
      });

    return () => {
      cancelled = true;
    };
  }, [championshipId, isOpen]);

  useEffect(() => {
    setRemoveIds([]);
    reset({
      nickname: '',
      participants: Array.from({ length: addNeeded }, () => emptyAthlete()),
    });
    if (!hasTshirt && addNeeded > 0) {
      for (let index = 0; index < addNeeded; index++) {
        setValue(`participants.${index}.tShirtSize`, 'Sem camiseta', {
          shouldValidate: true,
        });
      }
    }
  }, [addNeeded, hasTshirt, reset, setValue, toCategoryId]);

  const destinationOptions = categories.filter(
    (category) => category.id !== detail?.category.id,
  );

  const paidLabel = detail
    ? detail.isComplimentary
      ? 'Isenta'
      : detail.amountPaid != null
        ? formatCurrency(detail.amountPaid)
        : formatCurrency(detail.amountEstimated ?? detail.ticketPrice ?? 0)
    : '—';

  const canSubmit =
    Boolean(detail && destCategory && !detail.hasResults) &&
    removeIds.length === removeNeeded &&
    (addNeeded === 0 || addNeeded === (getValues('participants')?.length ?? 0));

  const toggleRemove = (participantId: string) => {
    setRemoveIds((current) => {
      if (current.includes(participantId)) {
        return current.filter((id) => id !== participantId);
      }
      if (current.length >= removeNeeded) return current;
      return [...current, participantId];
    });
  };

  const formatDocument = (value: string, index: number) => {
    setValue(`participants.${index}.identificationCode`, regexOnlyNumber(value), {
      shouldValidate: true,
    });
  };

  const submitTransfer = async (form?: IParticipantForm) => {
    if (!detail || !destCategory) return;

    const addParticipants =
      addNeeded > 0
        ? (form?.participants ?? []).slice(0, addNeeded).map((participant) => ({
            ...participant,
            identificationCode: regexOnlyNumber(participant.identificationCode),
            affiliation: normalizeAffiliation(participant.affiliation),
          }))
        : [];

    const extra = parseAmount(adjustmentRaw);

    try {
      const result = await Transfer(detail.id, {
        toCategoryId: destCategory.id,
        removeParticipantIds: removeIds,
        addParticipants,
        adjustmentAmount: extra > 0 ? extra : undefined,
      });

      if (result.paymentUrl) {
        setPaymentUrl(result.paymentUrl);
        return;
      }

      onClose();
    } catch {
      return;
    }
  };

  const onFormSubmit = handleSubmit(async (form) => {
    await submitTransfer(form);
  });

  const copyLink = async () => {
    if (!paymentUrl) return;
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <ComponentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Transferir inscrição"
      description="A categoria competitiva muda. Lote, cupom e valores já pagos permanecem iguais."
      size="lg"
      footer={
        paymentUrl ? (
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            <Button type="button" variant="primary" onClick={() => window.open(paymentUrl, '_blank')}>
              Abrir pagamento
            </Button>
          </ModalFooter>
        ) : (
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              isLoading={isLoading}
              disabled={!canSubmit || isLoading || !detail}
              onClick={addNeeded > 0 ? onFormSubmit : () => submitTransfer()}
            >
              Transferir
            </Button>
          </ModalFooter>
        )
      }
    >
      {loadError ? <p className="text-sm text-red-600">{loadError}</p> : null}

      {!detail && !loadError ? (
        <p className="text-sm text-slate-500">Carregando inscrição…</p>
      ) : null}

      {paymentUrl ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Transferência concluída. Envie este link para o responsável pagar o valor extra.
          </p>
          <div className="break-all rounded-surface border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            {paymentUrl}
          </div>
          <Button type="button" variant="secondary" onClick={copyLink}>
            {copied ? 'Link copiado' : 'Copiar link'}
          </Button>
        </div>
      ) : null}

      {detail && !paymentUrl ? (
        <div className="space-y-5">
          <dl className="grid gap-3 rounded-surface border border-slate-200 bg-slate-50/80 p-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Equipe
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">{detail.nickname}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Categoria atual
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">{detail.category.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lote original
              </dt>
              <dd className="mt-0.5 font-medium text-slate-900">{detail.ticket?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Valor</dt>
              <dd className="mt-0.5 font-medium text-slate-900">
                {paidLabel}
                {detail.couponCode ? (
                  <span className="ml-1.5 text-xs font-normal text-slate-500">
                    cupom {detail.couponCode}
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>

          {detail.hasResults ? (
            <p className="rounded-surface border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Esta inscrição já tem resultado lançado. Remova o resultado antes de transferir.
            </p>
          ) : null}

          <FormField id="toCategoryId" label="Nova categoria">
            <Select
              id="toCategoryId"
              value={toCategoryId}
              onChange={(event) => setToCategoryId(event.target.value)}
              disabled={Boolean(detail.hasResults)}
            >
              <option value="">Selecione a categoria</option>
              {destinationOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} · {categoryFormatLabel(category.members)}
                </option>
              ))}
            </Select>
          </FormField>

          {removeNeeded > 0 ? (
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-slate-900">
                Quem sai ({removeIds.length}/{removeNeeded})
              </legend>
              <p className="text-xs text-slate-500">
                A categoria destino tem menos atletas. Escolha quem deixar a inscrição.
              </p>
              <div className="space-y-2">
                {(detail.participants ?? []).map((participant) => {
                  const checked = removeIds.includes(participant.id);
                  return (
                    <label
                      key={participant.id}
                      className={[
                        'flex cursor-pointer items-start gap-3 rounded-surface border px-3.5 py-3 transition',
                        checked
                          ? 'border-primary/40 bg-primary/[0.04]'
                          : 'border-slate-200 bg-white hover:border-slate-300',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 border-slate-300 text-primary focus:ring-primary/25"
                        checked={checked}
                        onChange={() => toggleRemove(participant.id)}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900">
                          {participant.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {participant.affiliation}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {addNeeded > 0 ? (
            <form className="space-y-5" onSubmit={onFormSubmit}>
              <p className="text-sm font-semibold text-slate-900">
                Novos atletas ({addNeeded})
              </p>
              {Array.from({ length: addNeeded }, (_, index) => (
                <div key={index} className="flex w-full flex-col gap-5">
                  {addNeeded > 1 ? (
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Atleta {index + 1}
                    </p>
                  ) : null}
                  <FormField
                    id={`add-name-${index}`}
                    label="Nome"
                    error={errors.participants?.[index]?.name?.message}
                  >
                    <Input
                      id={`add-name-${index}`}
                      placeholder="Nome do participante"
                      invalid={!!errors.participants?.[index]?.name}
                      {...register(`participants.${index}.name`, {
                        required: validationMessages.required,
                        minLength: { value: 4, message: validationMessages.minLength },
                      })}
                    />
                  </FormField>
                  <FormField
                    id={`add-doc-${index}`}
                    label="Documento"
                    error={errors.participants?.[index]?.identificationCode?.message}
                  >
                    <Input
                      id={`add-doc-${index}`}
                      placeholder="Informe o CPF"
                      invalid={!!errors.participants?.[index]?.identificationCode}
                      {...register(`participants.${index}.identificationCode`, {
                        required: validationMessages.required,
                        validate: (value) =>
                          isValidDocument(value) || validationMessages.invalidCode,
                        onChange(event) {
                          formatDocument(event.target.value, index);
                        },
                      })}
                    />
                  </FormField>
                  <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField
                      id={`add-shirt-${index}`}
                      label="Camiseta"
                      error={errors.participants?.[index]?.tShirtSize?.message}
                    >
                      <Select
                        id={`add-shirt-${index}`}
                        invalid={!!errors.participants?.[index]?.tShirtSize}
                        disabled={!hasTshirt}
                        {...register(`participants.${index}.tShirtSize`, {
                          required: hasTshirt ? validationMessages.required : false,
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
                      id={`add-city-${index}`}
                      label="Cidade"
                      error={errors.participants?.[index]?.city?.message}
                    >
                      <Input
                        id={`add-city-${index}`}
                        placeholder="Cidade do participante"
                        invalid={!!errors.participants?.[index]?.city}
                        {...register(`participants.${index}.city`, {
                          required: validationMessages.required,
                          minLength: { value: 4, message: validationMessages.minLength },
                        })}
                      />
                    </FormField>
                    <div className="sm:col-span-2">
                      <FormField
                        id={`add-box-${index}`}
                        label="Box"
                        error={errors.participants?.[index]?.affiliation?.message}
                      >
                        <Controller
                          name={`participants.${index}.affiliation`}
                          control={control}
                          rules={{
                            required: validationMessages.required,
                            minLength: { value: 3, message: validationMessages.minLength },
                          }}
                          render={({ field }) => (
                            <Combobox
                              id={`add-box-${index}`}
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
                  {index + 1 !== addNeeded ? <hr className="border-slate-200" /> : null}
                </div>
              ))}
            </form>
          ) : null}

          {sameSize && destCategory ? (
            <p className="text-sm text-slate-600">
              O formato permanece o mesmo ({categoryFormatLabel(destMembers)}). Só a categoria
              competitiva muda.
            </p>
          ) : null}

          {destCategory && detail.status === 'APPROVED' && addNeeded > 0 ? (
            <FormField
              id="adjustmentAmount"
              label="Valor extra (opcional)"
              hint="Gera um link de pagamento no Mercado Pago. Deixe em branco se já foi acertado fora."
            >
              <Input
                id="adjustmentAmount"
                inputMode="decimal"
                placeholder="0,00"
                value={adjustmentRaw}
                onChange={(event) => setAdjustmentRaw(event.target.value)}
              />
            </FormField>
          ) : null}

          {detail.transferredAt ? (
            <p className="text-xs text-slate-500">
              Já transferida em {formatDate(detail.transferredAt, 'dd/MM/yyyy HH:mm')}
              {detail.transferredFromName ? ` a partir de ${detail.transferredFromName}` : ''}.
            </p>
          ) : null}
        </div>
      ) : null}
    </ComponentModal>
  );
};

export default TransferSubscriptionModal;
