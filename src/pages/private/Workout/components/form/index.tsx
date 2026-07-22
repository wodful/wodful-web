import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { IWorkoutDTO } from '@/data/interfaces/workout';
import useCategoryData from '@/hooks/useCategoryData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { validationMessages } from '@/utils/messages';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface IFormChampionshipProps {
  id: string;
  onClose: () => void;
  showHalfPointsOption?: boolean;
}

const FormWorkout = ({ id, onClose, showHalfPointsOption = false }: IFormChampionshipProps) => {
  const { Create } = useWorkoutData();
  const { List, categories } = useCategoryData();

  useEffect(() => {
    List(id);
  }, [List, id]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IWorkoutDTO>({
    mode: 'onChange',
    defaultValues: { worthHalfPoints: false },
  });

  function onSubmit(workout: IWorkoutDTO) {
    workout.championshipId = id;
    if (!showHalfPointsOption) workout.worthHalfPoints = false;
    else workout.worthHalfPoints = !!workout.worthHalfPoints;
    Create(workout);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-4">
      <FormField id="workout-name" label="Nome" error={errors.name?.message}>
        <Input
          id="workout-name"
          placeholder="Nome"
          invalid={!!errors.name}
          {...register('name', {
            required: validationMessages['required'],
            minLength: { value: 4, message: validationMessages['minLength'] },
            maxLength: { value: 50, message: validationMessages['maxLengthSm'] },
          })}
        />
      </FormField>

      <FormField id="workout-description" label="Descrição" error={errors.description?.message}>
        <Textarea
          id="workout-description"
          placeholder="Descrição"
          invalid={!!errors.description}
          {...register('description', {
            required: validationMessages['required'],
            minLength: { value: 4, message: validationMessages['minLength'] },
            maxLength: { value: 1400, message: validationMessages['maxLengthSm'] },
          })}
        />
      </FormField>

      <FormField id="workout-category" label="Categoria" error={errors.categoryId?.message}>
        <Select
          id="workout-category"
          invalid={!!errors.categoryId}
          {...register('categoryId', {
            required: validationMessages['required'],
          })}
        >
          <option value="">Selecione a categoria</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id="workout-type" label="Tipo" error={errors.workoutType?.message}>
        <Select
          id="workout-type"
          invalid={!!errors.workoutType}
          {...register('workoutType', {
            required: validationMessages['required'],
          })}
        >
          <option value="">Selecione o tipo</option>
          <option value="EMOM">EMOM</option>
          <option value="FORTIME">FORTIME</option>
          <option value="AMRAP">AMRAP</option>
          <option value="PR">PR</option>
        </Select>
      </FormField>

      {showHalfPointsOption ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="worthHalfPoints" className="flex cursor-pointer items-start gap-2.5">
            <input
              id="worthHalfPoints"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/25"
              {...register('worthHalfPoints')}
            />
            <span className="text-sm text-slate-700">Vale metade da pontuação (50 pts)</span>
          </label>
          <p className="text-xs text-slate-500">
            Aplica-se apenas no padrão de pontuação (SCORE). Quando marcado, a prova vale 50 pontos.
          </p>
        </div>
      ) : null}

      <Button type="submit" variant="primary" disabled={!isValid} className="mt-2 w-full">
        Adicionar
      </Button>
    </form>
  );
};

export default FormWorkout;
