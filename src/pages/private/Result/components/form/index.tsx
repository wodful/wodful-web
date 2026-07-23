import { ModalFooter } from '@/components/ComponentModal';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { IEditResultDTO } from '@/data/interfaces/result';
import useResultData from '@/hooks/useResultData';
import { validationMessages } from '@/utils/messages';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface IFormResultProps {
  onClose: () => void;
  oldResultId: string;
}

type EditFormValues = {
  result: string;
};

const ResultForm = ({ onClose, oldResultId }: IFormResultProps) => {
  const { Get, result, Edit, isLoading } = useResultData();
  const workoutType = result.Workout?.workoutType || 'AMRAP';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<EditFormValues>({
    mode: 'onChange',
  });

  useEffect(() => {
    void Get(oldResultId);
  }, [Get, oldResultId]);

  useEffect(() => {
    if (result?.id !== oldResultId) return;
    reset({ result: result.result });
  }, [oldResultId, reset, result]);

  const onSubmit: SubmitHandler<EditFormValues> = async ({ result: nextResult }) => {
    const payload: IEditResultDTO = {
      id: oldResultId,
      result: nextResult,
      categoryId: result.Workout?.Category?.id,
    };
    await Edit(payload);
    onClose();
  };

  const ready = result?.id === oldResultId;

  if (!ready) {
    return <p className="text-sm text-slate-500">Carregando resultado…</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5">
      <div className="space-y-3 rounded-surface border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</p>
          <p className="mt-0.5 font-medium text-slate-900">{result.Workout?.Category?.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prova</p>
          <p className="mt-0.5 font-medium text-slate-900">{result.Workout?.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Participante
          </p>
          <p className="mt-0.5 font-medium text-slate-900">{result.Subscription?.nickname}</p>
        </div>
      </div>

      <FormField id="result" label="Resultado" error={errors.result?.message}>
        <Input
          id="result"
          type={workoutType !== 'FORTIME' ? 'number' : 'time'}
          placeholder="Resultado"
          invalid={!!errors.result}
          autoFocus
          {...register('result', {
            required: validationMessages['required'],
          })}
        />
      </FormField>

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
          Salvar
        </Button>
      </ModalFooter>
    </form>
  );
};

export default ResultForm;
