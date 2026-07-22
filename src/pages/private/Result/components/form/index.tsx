import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ICreateResultRequestDTO } from '@/data/interfaces/result';
import useCategoryData from '@/hooks/useCategoryData';
import useResultData from '@/hooks/useResultData';
import useSubscriptionData from '@/hooks/useSubscriptionData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { validationMessages } from '@/utils/messages';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface IFormResultProps {
  onClose: () => void;
  oldResultId?: string;
}

const ResultForm = ({ onClose, oldResultId }: IFormResultProps) => {
  const { categories } = useCategoryData();
  const { ListAllByCategory, subscriptions } = useSubscriptionData();
  const { workouts, ListByCategory } = useWorkoutData();
  const [isTeam, setIsTeam] = useState(false);
  const [workoutType, setWorkoutType] = useState('AMRAP');
  const { Create, Get, result, Edit } = useResultData();
  const [alreadyCallOldResult, setAlreadyCallOldResult] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ICreateResultRequestDTO>({
    mode: 'onChange',
  });
  const selectedCategoryId = watch('categoryId');
  const selectedWorkoutId = watch('workoutId');
  useEffect(() => {
    if (oldResultId && !alreadyCallOldResult) {
      Get(oldResultId);
      setAlreadyCallOldResult(true);
    }
  }, [Get, alreadyCallOldResult, oldResultId, result]);

  useEffect(() => {
    if (oldResultId) {
      reset({
        categoryId: result.Workout?.Category?.id,
        result: result.result,
        workoutId: result.Workout?.id,
        subscriptionId: result.Subscription?.id,
      });
      setWorkoutType(result.Workout?.workoutType || 'AMRAP');
    }
  }, [result, reset, oldResultId]);

  const onSubmit: SubmitHandler<ICreateResultRequestDTO> = async (resultData) => {
    if (oldResultId) {
      await Edit({
        id: oldResultId,
        result: resultData.result,
        categoryId: resultData.categoryId,
      });
      onClose();
      return;
    }
    await Create(resultData);

    // Mantem categoria/prova para acelerar lancamentos em lote.
    if (selectedCategoryId && selectedWorkoutId) {
      await ListAllByCategory(selectedCategoryId, selectedWorkoutId);
    }
    setValue('subscriptionId', '');
    setValue('result', '');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6 pb-4">
      {oldResultId && (
        <>
          <div>
            <p className="font-bold text-slate-900">Categoria</p>
            <p className="mt-2 text-slate-700">{result.Workout?.Category?.name}</p>
          </div>
          <div>
            <p className="font-bold text-slate-900">Prova</p>
            <p className="mt-2 text-slate-700">{result.Workout?.name}</p>
          </div>
          <div>
            <p className="font-bold text-slate-900">{!isTeam ? 'Apelido' : 'Time'}</p>
            <p className="mt-2 text-slate-700">{result.Subscription?.nickname}</p>
          </div>
        </>
      )}
      {!oldResultId && (
        <>
          <FormField id="categoryId" label="Categoria" error={errors.categoryId?.message}>
            <Select
              id="categoryId"
              invalid={!!errors.categoryId}
              {...register('categoryId', {
                required: validationMessages['required'],
                onChange: (e) => {
                  setIsTeam(
                    categories.find((selected) => selected.id === e.target.value)?.isTeam ||
                      false,
                  );
                  setValue('workoutId', '');
                  setValue('subscriptionId', '');
                  ListAllByCategory(e.target.value);
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
              invalid={!!errors.workoutId}
              {...register('workoutId', {
                required: validationMessages['required'],
                onChange: (event) => {
                  setWorkoutType(
                    workouts.find((selected) => selected.id === event.target.value)
                      ?.workoutType || 'AMRAP',
                  );
                  setValue('subscriptionId', '');
                  if (selectedCategoryId) {
                    ListAllByCategory(selectedCategoryId, event.target.value);
                  }
                },
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
          <FormField
            id="subscriptionId"
            label={isTeam ? 'Equipe' : 'Atleta'}
            error={errors.subscriptionId?.message}
          >
            <Select
              id="subscriptionId"
              invalid={!!errors.subscriptionId}
              {...register('subscriptionId', {
                required: validationMessages['required'],
              })}
            >
              <option value="">
                {isTeam ? 'Selecione uma equipe' : 'Selecione um atleta'}
              </option>
              {subscriptions?.map((subscription) => (
                <option key={subscription.id} value={subscription.id}>
                  {subscription.nickname}
                </option>
              ))}
            </Select>
            {!errors.subscriptionId && selectedCategoryId && selectedWorkoutId && (
              <p className="mt-2 text-sm text-slate-500">
                Pendentes: {subscriptions?.length || 0}
              </p>
            )}
            {!errors.subscriptionId &&
              selectedCategoryId &&
              selectedWorkoutId &&
              subscriptions?.length === 0 && (
                <p className="mt-2 text-sm text-slate-500">
                  Todos {isTeam ? 'as equipes' : 'os atletas'} ja tem resultado nesta prova.
                </p>
              )}
          </FormField>
        </>
      )}
      <FormField id="result" label="Resultado" error={errors.result?.message}>
        <Input
          id="result"
          type={`${workoutType !== 'FORTIME' ? 'number' : 'time'}`}
          placeholder="Resultado"
          invalid={!!errors.result}
          {...register('result', {
            required: validationMessages['required'],
          })}
        />
      </FormField>

      <Button type="submit" variant="primary" disabled={!isValid} className="mt-2 w-full">
        {oldResultId ? 'Editar' : 'Adicionar'}
      </Button>
    </form>
  );
};

export default ResultForm;
