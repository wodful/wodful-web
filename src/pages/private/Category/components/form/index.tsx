import { ModalFooter } from '@/components/ComponentModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ICategory, ICategoryDTO } from '@/data/interfaces/category';
import useCategoryData from '@/hooks/useCategoryData';
import { categoryFormatMeta } from '@/utils/categoryFormat';
import { validationMessages } from '@/utils/messages';
import { useMemo } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';

interface IFormChampionshipProps {
  id: string;
  onClose: () => void;
  oldCategory?: ICategory;
  resetCategory: () => void;
}

function validateCategoryName(value: string) {
  const name = value.trim();
  if (!name) return validationMessages.required;
  if (name.length < 3) return 'Use pelo menos 3 caracteres (ex.: RX Feminino)';
  if (name.length > 50) return validationMessages.maxLengthSm;
  if (!/[a-zA-ZÀ-ÿ]/.test(name)) return 'Inclua pelo menos uma letra no nome';
  if (/^(.)\1+$/.test(name)) return 'Escolha um nome mais descritivo';
  return true;
}

const FormCategory = ({ id, onClose, oldCategory, resetCategory }: IFormChampionshipProps) => {
  const { Create, Edit, isLoading } = useCategoryData();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<ICategoryDTO>({
    mode: 'onChange',
    defaultValues: {
      name: oldCategory?.name ?? '',
      description: oldCategory?.description ?? '',
      members: oldCategory?.members,
    },
  });

  const members = useWatch({ control, name: 'members' });
  const nameValue = useWatch({ control, name: 'name' });

  const formatPreview = useMemo(() => {
    const count = Number(members);
    if (!Number.isFinite(count) || count < 1) return null;
    return categoryFormatMeta[count] ?? { label: `${count} membros`, tone: 'neutral' as const };
  }, [members]);

  const onSubmit: SubmitHandler<ICategoryDTO> = async (category) => {
    category.championshipId = id;
    category.name = category.name.trim();
    category.description = (category.description ?? '').trim();
    category.members = Number(category.members);

    if (oldCategory) {
      await Edit({
        id: oldCategory.id,
        name: category.name,
        description: category.description,
        members: oldCategory.members,
        championshipId: category.championshipId,
        isTeam: oldCategory.isTeam,
      });
      resetCategory();
      onClose();
      return;
    }
    await Create(category);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormField id="cat-name" label="Nome" error={errors.name?.message}>
        <Input
          id="cat-name"
          placeholder="Ex.: RX Feminino, Scaled Masculino"
          invalid={!!errors.name}
          {...register('name', {
            validate: validateCategoryName,
          })}
        />
        {!errors.name && nameValue?.trim() ? (
          <p className="mt-1.5 text-xs text-slate-500">Assim a categoria aparece na inscrição e no ranking.</p>
        ) : null}
      </FormField>

      <FormField
        id="cat-description"
        label="Descrição"
        error={errors.description?.message}
      >
        <Textarea
          id="cat-description"
          placeholder="Opcional — regras, quem pode se inscrever, observações…"
          invalid={!!errors.description}
          className="min-h-[5.5rem]"
          {...register('description', {
            validate: (value) => {
              const text = (value ?? '').trim();
              if (!text) return true;
              if (text.length < 4) return 'Se preencher, use pelo menos 4 caracteres';
              if (text.length > 250) return validationMessages.maxLengthSm;
              return true;
            },
          })}
        />
      </FormField>

      <FormField id="cat-members" label="Formato" error={errors.members?.message}>
        <Select
          id="cat-members"
          disabled={!!oldCategory}
          invalid={!!errors.members}
          {...register('members', { required: 'Selecione o formato da categoria' })}
        >
          <option value="">Selecione o formato</option>
          <option value={1}>Individual (1 atleta)</option>
          <option value={2}>Dupla (2 atletas)</option>
          <option value={3}>Trio (3 atletas)</option>
          <option value={4}>Time (4 atletas)</option>
          <option value={5}>Time (5 atletas)</option>
        </Select>
        {oldCategory ? (
          <p className="mt-1.5 text-xs text-slate-500">
            O formato não pode ser alterado depois de criar a categoria.
          </p>
        ) : null}
      </FormField>

      {formatPreview ? (
        <div className="flex items-center gap-2 rounded-surface bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
          <span className="text-xs font-medium text-slate-500">Prévia</span>
          <span className="text-sm font-semibold text-slate-900">
            {(nameValue ?? '').trim() || 'Nome da categoria'}
          </span>
          <Badge tone={formatPreview.tone}>{formatPreview.label}</Badge>
        </div>
      ) : null}

      <ModalFooter>
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!isValid}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {oldCategory ? 'Salvar' : 'Adicionar'}
        </Button>
      </ModalFooter>
    </form>
  );
};

export default FormCategory;
