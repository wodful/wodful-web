import * as React from 'react';

const lightInputBase =
  'min-h-[48px] min-w-0 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60';

const darkInputBase =
  'min-h-[48px] min-w-0 w-full rounded-lg border border-white/12 bg-white/[0.04] px-4 py-3 text-[15px] text-white placeholder:text-white/35 transition focus:border-primary focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60';

const lightInvalid = 'border-red-400 focus:border-red-500 focus:ring-red-500/20';
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
  error?: string;
  errorId?: string;
  errorDataCy?: string;
  tone?: 'light' | 'dark';
  children: React.ReactNode;
};

export const FormField = ({
  id,
  label,
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
        <label
          htmlFor={id}
          className={`text-sm font-medium ${
            tone === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <span
          id={resolvedErrorId}
          className={
            tone === 'dark'
              ? 'rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200'
              : 'text-sm text-red-600'
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
