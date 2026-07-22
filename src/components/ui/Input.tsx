import * as React from 'react';
import { fieldInputClass } from './FormField';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  tone?: 'light' | 'dark';
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', invalid, tone = 'light', type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={`${fieldInputClass(invalid, tone)} ${className}`}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
