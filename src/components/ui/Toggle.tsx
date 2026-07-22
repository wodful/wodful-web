import { FieldHint } from './FieldHint';

type ToggleProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  hint?: string;
  disabled?: boolean;
};

export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
  hint,
  disabled,
}: ToggleProps) {
  return (
    <div
      className={[
        'flex items-start justify-between gap-4 rounded-surface border border-slate-200 bg-slate-50/80 px-4 py-3.5',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <label htmlFor={id} className="text-sm font-medium text-slate-800">
            {label}
          </label>
          {hint ? <FieldHint text={hint} /> : null}
        </div>
        {description ? (
          <p className="mt-1 text-sm leading-snug text-slate-500">{description}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
          checked ? 'bg-primary' : 'bg-slate-300',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span
          aria-hidden
          className={[
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  );
}
