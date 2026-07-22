import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, Edit2, Lock } from 'react-feather';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ChampionshipDTO, IChampionship } from '@/data/interfaces/championship';
import useChampionshipData from '@/hooks/useChampionshipData';
import { validationMessages } from '@/utils/messages';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const RESULT_TYPE_LABEL: Record<string, string> = {
  SCORE: 'Pontuação',
  RANKING: 'Colocação',
};

type FormChampionshipProps = {
  onClose?: () => void;
  oldChampionship?: IChampionship;
  resetChampionship: () => void;
  onSaved?: (next: IChampionship) => void;
};

function FieldGroup({
  title,
  description,
  children,
  asCard,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  asCard: boolean;
}) {
  if (!asCard) {
    return <div className="flex flex-col gap-4">{children}</div>;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        ) : null}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

const FormChampionship = ({
  onClose,
  oldChampionship,
  resetChampionship,
  onSaved,
}: FormChampionshipProps) => {
  const { Create, Edit } = useChampionshipData();
  const [file, setFile] = useState('');
  const [descriptionOpen, setDescriptionOpen] = useState(!oldChampionship);
  const [codeEditing, setCodeEditing] = useState(!oldChampionship);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ChampionshipDTO>({ mode: 'onChange' });

  const isEdit = !!oldChampionship;
  const lockedResultType = oldChampionship?.resultType;
  const descriptionValue = watch('description') ?? '';
  const accessCodeValue = watch('accessCode') ?? '';

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (next) setFile(URL.createObjectURL(next));
  };

  useEffect(() => {
    const startDate = oldChampionship?.startDate + '';
    const endDate = oldChampionship?.endDate + '';
    if (oldChampionship?.startDate && oldChampionship?.endDate) {
      reset({
        startDate: startDate.substring(0, 10),
        endDate: endDate.substring(0, 10),
        accessCode: oldChampionship?.accessCode,
        name: oldChampionship?.name,
        address: oldChampionship?.address,
        resultType: oldChampionship?.resultType,
        description: oldChampionship.description,
      });
      setCodeEditing(false);
      setDescriptionOpen(false);
    }
  }, [oldChampionship, reset]);

  const onSubmit: SubmitHandler<ChampionshipDTO> = async (championship) => {
    if (oldChampionship) {
      await Edit({
        championshipId: oldChampionship.id,
        name: championship.name,
        startDate: championship.startDate,
        endDate: championship.endDate,
        accessCode: championship.accessCode,
        address: championship.address,
        description: championship.description,
      });

      const next: IChampionship = {
        ...oldChampionship,
        name: championship.name,
        startDate: championship.startDate as IChampionship['startDate'],
        endDate: championship.endDate as IChampionship['endDate'],
        accessCode: championship.accessCode.toUpperCase(),
        address: championship.address,
        description: championship.description,
      };

      reset({
        startDate: championship.startDate,
        endDate: championship.endDate,
        accessCode: next.accessCode,
        name: championship.name,
        address: championship.address,
        resultType: oldChampionship.resultType,
        description: championship.description,
      });
      setCodeEditing(false);
      setDescriptionOpen(false);
      onSaved?.(next);
      resetChampionship();
      onClose?.();
      return;
    }

    const banner = championship.banner as FileList;
    championship.banner = banner[0];
    championship.accessCode = championship.accessCode.toUpperCase();
    await Create(championship);
    onClose?.();
  };

  const nameField = (
    <FormField id="champ-name" label="Nome" error={errors.name?.message}>
      <Input
        id="champ-name"
        placeholder="Wodful games"
        invalid={!!errors.name}
        {...register('name', {
          required: validationMessages['required'],
          minLength: { value: 4, message: validationMessages['minLength'] },
          maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
        })}
      />
    </FormField>
  );

  const descriptionField = (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="champ-description" className="text-sm font-medium text-slate-700">
          Descrição
        </label>
        {isEdit ? (
          <button
            type="button"
            onClick={() => setDescriptionOpen((open) => !open)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
          >
            {descriptionOpen ? 'Recolher' : descriptionValue ? 'Ver mais' : 'Adicionar'}
            {descriptionOpen ? (
              <ChevronUp size={14} aria-hidden />
            ) : (
              <ChevronDown size={14} aria-hidden />
            )}
          </button>
        ) : null}
      </div>

      {descriptionOpen || !isEdit ? (
        <FormField id="champ-description" error={errors.description?.message}>
          <Textarea
            id="champ-description"
            rows={isEdit ? 6 : 4}
            placeholder="Descrição do evento"
            invalid={!!errors.description}
            {...register('description', {
              required: validationMessages['required'],
              minLength: { value: 4, message: validationMessages['minLength'] },
              maxLength: { value: 1500, message: validationMessages['maxLengthSm'] },
            })}
          />
        </FormField>
      ) : (
        <>
          <input type="hidden" {...register('description')} />
          <button
            type="button"
            onClick={() => setDescriptionOpen(true)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-left transition hover:border-primary/30"
          >
            {descriptionValue ? (
              <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {descriptionValue}
              </p>
            ) : (
              <p className="text-sm text-slate-400">Nenhuma descrição — clique para editar.</p>
            )}
          </button>
        </>
      )}
    </div>
  );

  const datesField = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField id="champ-start" label="Data de início" error={errors.startDate?.message}>
        <Input
          id="champ-start"
          type="date"
          invalid={!!errors.startDate}
          {...register('startDate', { required: validationMessages['required'] })}
        />
      </FormField>
      <FormField id="champ-end" label="Data de encerramento" error={errors.endDate?.message}>
        <Input
          id="champ-end"
          type="date"
          invalid={!!errors.endDate}
          {...register('endDate', { required: '* Campo obrigatório' })}
        />
      </FormField>
    </div>
  );

  const addressField = (
    <FormField id="champ-address" label="Local" error={errors.address?.message}>
      <Input
        id="champ-address"
        placeholder="Rua wodful, 10 - Jardim wodful"
        invalid={!!errors.address}
        {...register('address', {
          required: validationMessages['required'],
          minLength: { value: 4, message: validationMessages['minLength'] },
          maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
        })}
      />
    </FormField>
  );

  const accessCodeField = (
    <FormField
      id="champ-code"
      label="Código do campeonato"
      hint="Usado no acesso público e no link de inscrição."
      error={errors.accessCode?.message}
    >
      {isEdit && !codeEditing ? (
        <div className="flex items-center gap-2">
          <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5">
            <Lock size={14} className="shrink-0 text-slate-400" aria-hidden />
            <span className="truncate font-mono text-sm font-semibold uppercase tracking-wide text-slate-800">
              {accessCodeValue || '—'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setCodeEditing(true)}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
          >
            <Edit2 size={14} aria-hidden />
            Alterar
          </button>
          <input type="hidden" {...register('accessCode')} />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Input
            id="champ-code"
            placeholder="WODFULGAMES"
            invalid={!!errors.accessCode}
            className="uppercase tracking-wide"
            {...register('accessCode', {
              required: validationMessages['required'],
              minLength: { value: 4, message: validationMessages['minLength'] },
              maxLength: { value: 20, message: validationMessages['maxLengthSm'] },
            })}
          />
          {isEdit ? (
            <p className="text-xs leading-snug text-amber-700">
              Alterar o código invalida links antigos de inscrição e acesso público.
            </p>
          ) : null}
        </div>
      )}
    </FormField>
  );

  const resultTypeField = lockedResultType ? (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">Tipo de resultado</span>
      <div className="flex min-h-11 flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-800">
          {RESULT_TYPE_LABEL[lockedResultType] ?? lockedResultType}
        </span>
      </div>
      <p className="text-xs text-slate-500">Não pode ser alterado após a criação do evento.</p>
      <input type="hidden" {...register('resultType')} />
    </div>
  ) : (
    <FormField id="champ-result" label="Tipo de resultado" error={errors.resultType?.message}>
      <Select
        id="champ-result"
        invalid={!!errors.resultType}
        {...register('resultType', { required: validationMessages['required'] })}
      >
        <option value="">Selecione o tipo</option>
        <option value="SCORE">Pontuação</option>
        <option value="RANKING">Colocação</option>
      </Select>
    </FormField>
  );

  const bannerField = !lockedResultType ? (
    <FormField
      id="champ-banner"
      label="Capa do campeonato"
      hint="Resolução ideal 880×360."
      error={errors.banner?.message as string | undefined}
    >
      <Input
        id="champ-banner"
        type="file"
        accept="image/png, image/jpeg"
        invalid={!!errors.banner}
        className="py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary"
        {...register('banner', {
          required: validationMessages['required'],
          onChange: handleChange,
        })}
      />
      {file ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
          <img src={file} alt="Preview do banner" className="max-h-40 w-full object-cover" />
        </div>
      ) : null}
    </FormField>
  ) : null;

  const saveFooter = (
    <div
      className={[
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        isEdit
          ? 'sticky bottom-3 z-[1] rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur'
          : 'border-t border-slate-100 pt-4',
      ].join(' ')}
    >
      <div className="min-h-5 text-sm">
        {isEdit && isDirty ? (
          <span className="font-medium text-amber-700">Alterações não salvas</span>
        ) : isEdit ? (
          <span className="text-slate-400">Nenhuma alteração</span>
        ) : null}
      </div>
      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        disabled={isEdit && !isDirty}
        className="w-full sm:w-auto"
      >
        {!oldChampionship ? 'Adicionar' : 'Salvar alterações'}
      </Button>
    </div>
  );

  if (!isEdit) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {nameField}
        {datesField}
        {addressField}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {accessCodeField}
          {resultTypeField}
        </div>
        {descriptionField}
        {bannerField}
        {saveFooter}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup
        asCard
        title="Identidade"
        description="Nome e descrição públicos do evento"
      >
        {nameField}
        {descriptionField}
      </FieldGroup>

      <FieldGroup
        asCard
        title="Quando e onde"
        description="Datas e local do campeonato"
      >
        {datesField}
        {addressField}
      </FieldGroup>

      <FieldGroup
        asCard
        title="Acesso"
        description="Código público e tipo de resultado"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {accessCodeField}
          {resultTypeField}
        </div>
      </FieldGroup>

      {saveFooter}
    </form>
  );
};

export default FormChampionship;
