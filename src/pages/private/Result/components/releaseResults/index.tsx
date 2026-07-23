import { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import useCategoryData from '@/hooks/useCategoryData';
import useResultData from '@/hooks/useResultData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { validationMessages } from '@/utils/messages';
import { ChangeEvent, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface IFormResultProps {
  onClose: () => void;
}

export interface IReleaseResultsFormRequestDTO {
  workoutId: string;
  categoryId: string;
}

const ReleaseResultsForm = ({ onClose }: IFormResultProps) => {
  const { categories } = useCategoryData();
  const { workouts, ListByCategory } = useWorkoutData();
  const { GetIsReleasedResult, UpdateReleaseResult } = useResultData();

  const [alertMessage, setAlertMessage] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setError,
  } = useForm<IReleaseResultsFormRequestDTO>({
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<IReleaseResultsFormRequestDTO> = async (resultData) => {
    const isRelease = alertMessage ? false : true;
    await UpdateReleaseResult({
      workoutId: resultData.workoutId,
      release: isRelease,
      categoryId: resultData.categoryId,
    });
    setAlertMessage(isRelease);
  };

  const handleIsResultReleased = (event: ChangeEvent<HTMLSelectElement>) => {
    GetIsReleasedResult(event.target.value)
      .catch(() => {
        setError('workoutId', { message: 'Resultados não encontrados!' }), setAlertMessage(false);
      })
      .then((data: any) => {
        if (data?.isReleased) {
          setAlertMessage(true);
          return;
        }
        setAlertMessage(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
      <FormField id="categoryId" label="Categoria" error={errors.categoryId?.message}>
        <Select
          id="categoryId"
          invalid={!!errors.categoryId}
          {...register('categoryId', {
            required: validationMessages['required'],
            onChange: (e) => {
              ListByCategory(e.target.value);
            },
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
      <FormField id="workoutId" label="Prova" error={errors.workoutId?.message}>
        <Select
          id="workoutId"
          disabled={!watch('categoryId')}
          invalid={!!errors.workoutId}
          {...register('workoutId', {
            required: validationMessages['required'],
            onChange: (event) => handleIsResultReleased(event),
          })}
        >
          <option value="">Selecione a prova</option>
          {workouts?.map((workout) => (
            <option key={workout.id} value={workout.id}>
              {workout.name}
            </option>
          ))}
        </Select>
      </FormField>

      {alertMessage && (
        <div
          className="flex gap-3 rounded-surface border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          <p>
            Os resultados desta prova já estão disponíveis para os atletas, deseja
            <strong> ocultar </strong>
            novamente?
          </p>
        </div>
      )}

      <ModalFooter>
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={!isValid} className="w-full sm:w-auto">
          {!alertMessage ? 'Liberar' : 'Ocultar'}
        </Button>
      </ModalFooter>
    </form>
  );
};

export default ReleaseResultsForm;
