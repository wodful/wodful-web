import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import ShirtSizeManager from '@/components/Tag/ShirtSizeManager';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { IConfiguration } from '@/data/interfaces/configuration';
import useChampionshipData from '@/hooks/useChampionshipData';

export interface IConfigurationForm {
  hasTshirt: string;
  hasNameInTshirt: string;
  tShirtSizes: string[];
  isAutoSchedule: string;
}

export type ConfigurationMode = 'kit' | 'schedule' | 'all';

type FormConfigurationProps = {
  onClose?: () => void;
  champId: string;
  mode?: ConfigurationMode;
};

const boolString = (value: boolean) => (value ? 'true' : 'false');

const FormConfiguration = ({
  onClose,
  champId,
  mode = 'all',
}: FormConfigurationProps) => {
  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<IConfigurationForm>({
    mode: 'all',
    defaultValues: {
      hasTshirt: 'false',
      hasNameInTshirt: 'false',
      isAutoSchedule: 'false',
    },
  });
  const [sizes, setSizes] = useState<string[]>([]);
  const [tab, setTab] = useState<'kit' | 'schedule'>('kit');
  const { GetConfiguration, CreateConfiguration } = useChampionshipData();

  const hasTshirt = watch('hasTshirt') === 'true';
  const hasNameInTshirt = watch('hasNameInTshirt') === 'true';
  const isAutoSchedule = watch('isAutoSchedule') === 'true';

  useEffect(() => {
    GetConfiguration(champId).then((conf) => {
      const config = conf as IConfiguration;
      if (config?.configuration?.id) {
        reset({
          hasNameInTshirt: String(config.configuration.tShirtFlags.hasNameInTshirt),
          hasTshirt: String(config.configuration.tShirtFlags.hasTshirt),
          isAutoSchedule: String(config.configuration.isAutoSchedule),
        });
        setSizes(config.configuration.tShirtFlags.tShirtSizes ?? []);
      }
    });
  }, [GetConfiguration, champId, reset]);

  const onSubmit: SubmitHandler<IConfigurationForm> = async (data) => {
    await CreateConfiguration(champId, {
      ...data,
      hasNameInTshirt: data.hasTshirt === 'true' ? data.hasNameInTshirt : 'false',
      tShirtSizes: data.hasTshirt === 'true' ? sizes : [],
    });
    onClose?.();
  };

  const showKit = mode === 'kit' || (mode === 'all' && tab === 'kit');
  const showSchedule = mode === 'schedule' || (mode === 'all' && tab === 'schedule');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {mode === 'all' ? (
        <div
          className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'kit'}
            onClick={() => setTab('kit')}
            className={[
              'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition',
              tab === 'kit'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-800',
            ].join(' ')}
          >
            Camisetas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'schedule'}
            onClick={() => setTab('schedule')}
            className={[
              'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition',
              tab === 'schedule'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-800',
            ].join(' ')}
          >
            Cronograma
          </button>
        </div>
      ) : null}

      {showKit ? (
        <div className="flex flex-col gap-3">
          <Toggle
            id="cfg-has-tshirt"
            label="Camiseta para atletas"
            description="Disponibiliza a seleção de camiseta na inscrição."
            checked={hasTshirt}
            onChange={(checked) => {
              setValue('hasTshirt', boolString(checked), { shouldDirty: true });
              if (!checked) {
                setValue('hasNameInTshirt', 'false', { shouldDirty: true });
              }
            }}
          />

          {hasTshirt ? (
            <>
              <Toggle
                id="cfg-name-tshirt"
                label="Nome na camiseta"
                description="Campo opcional de personalização no formulário de inscrição."
                checked={hasNameInTshirt}
                onChange={(checked) =>
                  setValue('hasNameInTshirt', boolString(checked), { shouldDirty: true })
                }
              />
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5">
                <ShirtSizeManager sizes={sizes} setSizes={setSizes} />
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {showSchedule ? (
        <Toggle
          id="cfg-auto-schedule"
          label="Ordenação automática"
          description="Ordena atletas nas baias pelo ranking, do último ao primeiro colocado."
          checked={isAutoSchedule}
          onChange={(checked) =>
            setValue('isAutoSchedule', boolString(checked), { shouldDirty: true })
          }
        />
      ) : null}

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <Button
          type="submit"
          variant="primary"
          className="w-full sm:w-auto"
          isLoading={isSubmitting}
        >
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default FormConfiguration;
