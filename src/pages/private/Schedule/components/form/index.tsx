import { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ICreateScheduleRequestDTO } from '@/data/interfaces/schedule';
import useCategoryData from '@/hooks/useCategoryData';
import useScheduleData from '@/hooks/useScheduleData';
import useWorkoutData from '@/hooks/useWorkoutData';
import { incrementAndFormatDate } from '@/utils/formatDate';
import { validationMessages } from '@/utils/messages';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

interface IFormScheduleProps {
  onClose: () => void;
}

const NUMBERS_1_TO_15 = Array.from({ length: 15 }, (_, index) => index + 1);

const ScheduleForm = ({ onClose }: IFormScheduleProps) => {
  const { List, categories } = useCategoryData();
  const { ListByCategory, workouts } = useWorkoutData();

  const { Create } = useScheduleData();
  const { id } = useParams();

  useEffect(() => {
    List(id as string);
  }, [List, id]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
  } = useForm<ICreateScheduleRequestDTO>({
    mode: 'onChange',
  });

  function onSubmit(schedule: ICreateScheduleRequestDTO) {
    schedule.date = incrementAndFormatDate(schedule.date, 'yyyy-MM-dd');
    schedule.heat = Number(schedule.heat);
    schedule.laneQuantity = Number(schedule.laneQuantity);
    Create(schedule);
    onClose();
  }

  const handleWorkout = (categoryId: string): any => {
    ListByCategory(categoryId as string);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormField id="schedule-category" label="Categoria" error={errors.categoryId?.message}>
        <Select
          id="schedule-category"
          invalid={!!errors.categoryId}
          {...register('categoryId', {
            required: validationMessages['required'],
            onChange: () => {
              handleWorkout(getValues('categoryId'));
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

      <FormField id="schedule-workout" label="Nome da Prova" error={errors.workoutId?.message}>
        <Select
          id="schedule-workout"
          invalid={!!errors.workoutId}
          disabled={!workouts.length}
          {...register('workoutId', { required: validationMessages['required'] })}
        >
          <option value="">Selecione a prova</option>
          {workouts?.map((workout) => (
            <option key={workout.id} value={workout.id}>
              {workout.name}
            </option>
          ))}
        </Select>
      </FormField>

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

      <FormField id="schedule-heat" label="Bateria" error={errors.heat?.message}>
        <Select
          id="schedule-heat"
          invalid={!!errors.heat}
          {...register('heat', { required: validationMessages['required'] })}
        >
          {NUMBERS_1_TO_15.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id="schedule-lanes" label="Número de baias" error={errors.laneQuantity?.message}>
        <Select
          id="schedule-lanes"
          invalid={!!errors.laneQuantity}
          {...register('laneQuantity', { required: validationMessages['required'] })}
        >
          {NUMBERS_1_TO_15.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </FormField>

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
