import * as React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'link';

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
    className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
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
