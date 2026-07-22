import * as React from 'react';
import { ChevronDown } from 'react-feather';
import { fieldInputClass } from './FormField';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  tone?: 'light' | 'dark';
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', invalid, tone = 'light', children, ...props }, ref) => (
    <div className="relative min-w-0">
      <select
        ref={ref}
        className={`${fieldInputClass(invalid, tone)} appearance-none pr-10 ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
          tone === 'dark' ? 'text-white/50' : 'text-slate-400'
        }`}
        aria-hidden
      />
    </div>
  ),
);

Select.displayName = 'Select';
