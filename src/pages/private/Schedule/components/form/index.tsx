import { AxiosAdapter } from '@/adapters/AxiosAdapter';
import { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ICreateScheduleRequestDTO } from '@/data/interfaces/schedule';
import { IWorkout } from '@/data/interfaces/workout';
import useCategoryData from '@/hooks/useCategoryData';
import useScheduleData from '@/hooks/useScheduleData';
import { WorkoutService } from '@/services/Workout';
import { toDateOnlyString } from '@/utils/formatDate';
import { validationMessages } from '@/utils/messages';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

interface IFormScheduleProps {
  onClose: () => void;
}

type SegmentForm = {
  categoryId: string;
  workoutId: string;
  heat: number;
  laneQuantity: number;
};

type ScheduleFormValues = {
  date: string;
  hour: string;
  segments: SegmentForm[];
};

const NUMBERS_1_TO_15 = Array.from({ length: 15 }, (_, index) => index + 1);
const axios = new AxiosAdapter();

const emptySegment = (): SegmentForm => ({
  categoryId: '',
  workoutId: '',
  heat: 1,
  laneQuantity: 1,
});

function bayRange(segments: SegmentForm[], index: number) {
  let start = 1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    start += Number(segments[cursor]?.laneQuantity) || 0;
  }
  const quantity = Number(segments[index]?.laneQuantity) || 0;
  if (!quantity) return '';
  const end = start + quantity - 1;
  return start === end ? `Baia ${start}` : `Baias ${start}–${end}`;
}

const ScheduleForm = ({ onClose }: IFormScheduleProps) => {
  const { List, categories } = useCategoryData();
  const { Create } = useScheduleData();
  const { id } = useParams();
  const [workoutsBySegment, setWorkoutsBySegment] = useState<Record<string, IWorkout[]>>({});

  useEffect(() => {
    List(id as string);
  }, [List, id]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ScheduleFormValues>({
    mode: 'onChange',
    defaultValues: {
      segments: [emptySegment()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'segments',
  });

  const segments = watch('segments');
  const selectedCategoryIds = new Set(
    (segments ?? []).map((segment) => segment.categoryId).filter(Boolean),
  );

  async function loadWorkouts(fieldId: string, categoryId: string) {
    const result = await new WorkoutService(axios).listByCategory(categoryId);
    const list = Array.isArray(result) ? result : result.results ?? [];
    setWorkoutsBySegment((current) => ({ ...current, [fieldId]: list }));
  }

  function onSubmit(values: ScheduleFormValues) {
    const payload: ICreateScheduleRequestDTO = {
      date: toDateOnlyString(values.date),
      hour: values.hour,
      segments: values.segments.map((segment) => ({
        categoryId: segment.categoryId,
        workoutId: segment.workoutId,
        heat: Number(segment.heat),
        laneQuantity: Number(segment.laneQuantity),
      })),
    };
    Create(payload);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField id="schedule-date" label="Data de início" error={errors.date?.message}>
          <Input
            id="schedule-date"
            type="date"
            placeholder="DD/MM/AAAA"
            invalid={!!errors.date}
            {...register('date', { required: validationMessages['required'] })}
          />
        </FormField>

        <FormField id="schedule-hour" label="Horário de início" error={errors.hour?.message}>
          <Input
            id="schedule-hour"
            type="time"
            placeholder="HH:MM"
            invalid={!!errors.hour}
            {...register('hour', { required: validationMessages['required'] })}
          />
        </FormField>
      </div>

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const segmentErrors = errors.segments?.[index];
          const workouts = workoutsBySegment[field.id] ?? [];
          const range = bayRange(segments ?? [], index);
          const currentCategoryId = segments?.[index]?.categoryId;

          return (
            <fieldset
              key={field.id}
              className="flex flex-col gap-4 rounded-surface border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">
                  {fields.length > 1 ? `Categoria ${index + 1}` : 'Categoria'}
                  {range ? <span className="ml-2 font-medium text-slate-500">{range}</span> : null}
                </p>
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="!min-h-8 !px-2 !py-1 !text-xs"
                    onClick={() => remove(index)}
                  >
                    Remover
                  </Button>
                ) : null}
              </div>

              <FormField
                id={`schedule-category-${field.id}`}
                label="Categoria"
                error={segmentErrors?.categoryId?.message}
              >
                <Select
                  id={`schedule-category-${field.id}`}
                  invalid={!!segmentErrors?.categoryId}
                  {...register(`segments.${index}.categoryId`, {
                    required: validationMessages['required'],
                    onChange: (event) => {
                      const categoryId = event.target.value;
                      setValue(`segments.${index}.workoutId`, '', { shouldValidate: true });
                      if (!categoryId) {
                        setWorkoutsBySegment((current) => ({ ...current, [field.id]: [] }));
                        return;
                      }
                      loadWorkouts(field.id, categoryId);
                    },
                  })}
                >
                  <option value="">Selecione a categoria</option>
                  {categories?.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      disabled={
                        selectedCategoryIds.has(category.id) && category.id !== currentCategoryId
                      }
                    >
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                id={`schedule-workout-${field.id}`}
                label="Nome da Prova"
                error={segmentErrors?.workoutId?.message}
              >
                <Select
                  id={`schedule-workout-${field.id}`}
                  invalid={!!segmentErrors?.workoutId}
                  disabled={!workouts.length}
                  {...register(`segments.${index}.workoutId`, {
                    required: validationMessages['required'],
                  })}
                >
                  <option value="">Selecione a prova</option>
                  {workouts.map((workout) => (
                    <option key={workout.id} value={workout.id}>
                      {workout.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  id={`schedule-heat-${field.id}`}
                  label="Bateria"
                  error={segmentErrors?.heat?.message}
                >
                  <Select
                    id={`schedule-heat-${field.id}`}
                    invalid={!!segmentErrors?.heat}
                    {...register(`segments.${index}.heat`, {
                      required: validationMessages['required'],
                    })}
                  >
                    {NUMBERS_1_TO_15.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  id={`schedule-lanes-${field.id}`}
                  label="Número de baias"
                  error={segmentErrors?.laneQuantity?.message}
                >
                  <Select
                    id={`schedule-lanes-${field.id}`}
                    invalid={!!segmentErrors?.laneQuantity}
                    {...register(`segments.${index}.laneQuantity`, {
                      required: validationMessages['required'],
                    })}
                  >
                    {NUMBERS_1_TO_15.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
            </fieldset>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full sm:w-auto"
        onClick={() => append(emptySegment())}
        disabled={!!categories?.length && fields.length >= categories.length}
      >
        Adicionar categoria neste horário
      </Button>
      <p className="text-xs text-slate-500">
        A ordem dos blocos define as baias. O primeiro ocupa as primeiras baias e o seguinte
        continua a numeração.
      </p>

      <ModalFooter>
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" className="w-full sm:w-auto" disabled={!isValid}>
          Adicionar
        </Button>
      </ModalFooter>
    </form>
  );
};

export default ScheduleForm;
