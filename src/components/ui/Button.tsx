import * as React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'link' | 'ghost' | 'danger' | 'icon';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  secondary:
    'border border-gray-300 bg-white text-gray-800 hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary',
  link: 'bg-transparent text-primary shadow-none hover:text-primary-hover hover:underline',
  ghost:
    'bg-transparent text-slate-700 shadow-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary',
  danger:
    'border border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400',
  icon: 'h-9 w-9 min-h-0 rounded-lg bg-transparent p-0 text-slate-600 shadow-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-primary',
};

export const Button = ({
  variant = 'primary',
  isLoading = false,
  loadingLabel = 'Carregando…',
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    aria-busy={isLoading || undefined}
    className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
      variant === 'icon'
        ? ''
        : variant === 'link'
          ? 'min-h-0 px-0 py-0'
          : 'min-h-10 px-4 py-2'
    } ${variantClasses[variant]} ${className}`}
    {...props}
  >
    {isLoading ? (
      <>
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
        <span>{loadingLabel}</span>
      </>
    ) : (
      children
    )}
  </button>
);
