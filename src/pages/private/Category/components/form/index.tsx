import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ICategory, ICategoryDTO } from '@/data/interfaces/category';
import useCategoryData from '@/hooks/useCategoryData';
import { validationMessages } from '@/utils/messages';
import { SubmitHandler, useForm } from 'react-hook-form';

interface IFormChampionshipProps {
  id: string;
  onClose: () => void;
  oldCategory?: ICategory;
  resetCategory: () => void;
}

const FormCategory = ({ id, onClose, oldCategory, resetCategory }: IFormChampionshipProps) => {
  const { Create, Edit } = useCategoryData();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ICategoryDTO>({
    mode: 'onChange',
    defaultValues: {
      name: oldCategory?.name,
      description: oldCategory?.description,
      members: oldCategory?.members,
    },
  });

  const onSubmit: SubmitHandler<ICategoryDTO> = async (category) => {
    category.championshipId = id;
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-4">
      <FormField id="cat-name" label="Nome" error={errors.name?.message}>
        <Input
          id="cat-name"
          placeholder="Nome da categoria"
          invalid={!!errors.name}
          {...register('name', {
            required: validationMessages['required'],
            minLength: { value: 4, message: validationMessages['minLength'] },
            maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
          })}
        />
      </FormField>
      <FormField id="cat-description" label="Descrição" error={errors.description?.message}>
        <Textarea
          id="cat-description"
          placeholder="Descrição da categoria"
          invalid={!!errors.description}
          {...register('description', {
            minLength: { value: 4, message: validationMessages['minLength'] },
            maxLength: { value: 250, message: validationMessages['maxLengthSm'] },
          })}
        />
      </FormField>
      <FormField id="cat-members" label="Membros" error={errors.members?.message}>
        <Select
          id="cat-members"
          disabled={!!oldCategory}
          invalid={!!errors.members}
          {...register('members', { required: validationMessages['required'] })}
        >
          <option value="">Selecione o número de membros</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </Select>
      </FormField>
      <Button type="submit" variant="primary" disabled={!isValid} className="w-full">
        {oldCategory ? 'Editar' : 'Adicionar'}
      </Button>
    </form>
  );
};

export default FormCategory;
