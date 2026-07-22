import * as React from 'react';
import { FieldHint } from './FieldHint';

const lightInputBase =
  'min-h-11 min-w-0 w-full rounded-control border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-slate-400 transition hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60';

const darkInputBase =
  'min-h-[48px] min-w-0 w-full rounded-control border border-white/12 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/35 transition focus:border-primary focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60';

const lightInvalid = 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/15';
const darkInvalid = 'border-red-400/70 focus:border-red-400 focus:ring-red-400/20';

export function fieldInputClass(
  invalid?: boolean,
  tone: 'light' | 'dark' = 'light',
) {
  if (tone === 'dark') {
    return `${darkInputBase} ${invalid ? darkInvalid : ''}`;
  }
  return `${lightInputBase} ${invalid ? lightInvalid : ''}`;
}

type FormFieldProps = {
  id?: string;
  label?: string;
  hint?: string;
  error?: string;
  errorId?: string;
  errorDataCy?: string;
  tone?: 'light' | 'dark';
  children: React.ReactNode;
};

export const FormField = ({
  id,
  label,
  hint,
  error,
  errorId,
  errorDataCy,
  tone = 'light',
  children,
}: FormFieldProps) => {
  const resolvedErrorId = errorId ?? (id ? `${id}-error` : undefined);

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label ? (
        <div className="flex items-center gap-1.5">
          <label
            htmlFor={id}
            className={`text-sm font-medium ${
              tone === 'dark' ? 'text-gray-200' : 'text-slate-700'
            }`}
          >
            {label}
          </label>
          {hint ? <FieldHint text={hint} /> : null}
        </div>
      ) : null}
      {children}
      {error ? (
        <span
          id={resolvedErrorId}
          className={
            tone === 'dark'
              ? 'rounded-control border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200'
              : 'text-xs font-medium text-red-600'
          }
          role="alert"
          data-cy={errorDataCy}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
};
