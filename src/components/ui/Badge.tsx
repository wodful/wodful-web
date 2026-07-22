import type { HTMLAttributes, ReactNode } from 'react';

type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
  ...props
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-chip px-2 py-0.5 text-xs font-semibold ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
