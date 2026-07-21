import { fieldInputClass } from '@/components/ui/FormField';
import { Search } from 'react-feather';

type PublicSearchFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  compact?: boolean;
};

export const PublicSearchField = ({
  id,
  value,
  onChange,
  placeholder = 'Buscar…',
  label = 'Buscar',
  compact = false,
}: PublicSearchFieldProps) => (
  <div className="relative min-w-0 w-full">
    <label htmlFor={id} className="sr-only">
      {label}
    </label>
    <Search
      size={16}
      className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${
        compact ? 'left-3' : 'left-3.5'
      }`}
      aria-hidden
    />
    <input
      id={id}
      type="search"
      value={value}
      placeholder={placeholder}
      autoComplete="off"
      className={`${fieldInputClass()} pl-10 ${
        compact ? '!min-h-11 !py-2 !text-sm' : ''
      }`}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);
