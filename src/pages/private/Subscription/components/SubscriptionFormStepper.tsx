type SubscriptionFormStepperProps = {
  step: 1 | 2;
};

const STEPS = [
  { id: 1, label: 'Responsável' },
  { id: 2, label: 'Atleta' },
] as const;

export function SubscriptionFormStepper({ step }: SubscriptionFormStepperProps) {
  return (
    <nav aria-label="Etapas da inscrição" className="mb-5">
      <ol className="flex items-center gap-2">
        {STEPS.map((item, index) => {
          const active = item.id === step;
          const done = item.id < step;
          return (
            <li key={item.id} className="flex min-w-0 items-center gap-2">
              {index > 0 ? (
                <span className="h-px w-4 shrink-0 bg-slate-200 sm:w-6" aria-hidden />
              ) : null}
              <span
                className={[
                  'inline-flex items-center gap-2 rounded-chip px-2.5 py-1 text-xs font-semibold',
                  active
                    ? 'bg-primary/10 text-primary'
                    : done
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-slate-50 text-slate-400',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                    active
                      ? 'bg-primary text-white'
                      : done
                        ? 'bg-slate-300 text-slate-700'
                        : 'bg-slate-200 text-slate-500',
                  ].join(' ')}
                >
                  {item.id}
                </span>
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-slate-500">Etapa {step} de 2</p>
    </nav>
  );
}
