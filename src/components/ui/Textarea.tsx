import * as React from 'react';
import { fieldInputClass } from './FormField';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  tone?: 'light' | 'dark';
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', invalid, tone = 'light', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`${fieldInputClass(invalid, tone)} min-h-[7rem] resize-y ${className}`}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';
