import * as React from 'react';
import { fieldInputClass } from './FormField';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = ({ className = '', invalid, children, ...props }: SelectProps) => (
  <select className={`${fieldInputClass(invalid)} ${className}`} {...props}>
    {children}
  </select>
);
