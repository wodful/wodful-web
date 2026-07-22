import type { ReactNode } from 'react';
import { PublicSearchField } from '@/components/public/PublicSearchField';
import { useEffect, useState } from 'react';
import { RefreshCw, Search, X } from 'react-feather';

const iconButtonClass =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control border border-gray-300 bg-white text-gray-600 transition hover:border-gray-400 hover:text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60';

type PublicFilterBarProps = {
  categoryControl: ReactNode;
  searchId: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  updatedLabel?: string;
  secondsSinceUpdate?: number;
};

export const PublicFilterBar = ({
  categoryControl,
  searchId,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  searchLabel = 'Buscar',
  onRefresh,
  isRefreshing = false,
  updatedLabel = '',
  secondsSinceUpdate = 0,
}: PublicFilterBarProps) => {
  const [searchOpen, setSearchOpen] = useState(Boolean(searchValue));

  useEffect(() => {
    if (searchValue) setSearchOpen(true);
  }, [searchValue]);

  const showSearch = searchOpen || Boolean(searchValue);
  const showUpdatedLabel =
    Boolean(onRefresh) && (isRefreshing || secondsSinceUpdate >= 20);

  const handleToggleSearch = () => {
    if (searchOpen && !searchValue) {
      setSearchOpen(false);
      return;
    }
    if (searchOpen && searchValue) {
      onSearchChange('');
      setSearchOpen(false);
      return;
    }
    setSearchOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 sm:max-w-xs">{categoryControl}</div>

        {onRefresh ? (
          <button
            type="button"
            className={iconButtonClass}
            aria-label="Atualizar"
            aria-busy={isRefreshing || undefined}
            disabled={isRefreshing}
            onClick={onRefresh}
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? 'animate-spin' : undefined}
              aria-hidden
            />
          </button>
        ) : null}

        <button
          type="button"
          className={`${iconButtonClass} sm:hidden ${
            showSearch ? '!border-primary/40 !bg-primary/5 !text-primary' : ''
          }`}
          aria-expanded={showSearch}
          aria-controls={searchId}
          aria-label={showSearch ? 'Fechar busca' : searchLabel}
          onClick={handleToggleSearch}
        >
          {showSearch ? (
            <X size={16} aria-hidden />
          ) : (
            <Search size={16} aria-hidden />
          )}
        </button>

        <div className="hidden min-w-0 flex-1 sm:block">
          <PublicSearchField
            id={`${searchId}-desktop`}
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            label={searchLabel}
            compact
          />
        </div>
      </div>

      <div className={showSearch ? 'block sm:hidden' : 'hidden'}>
        <PublicSearchField
          id={searchId}
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          label={searchLabel}
          compact
        />
      </div>

      {onRefresh ? (
        <p
          className={`text-xs text-gray-400 transition-opacity ${
            showUpdatedLabel
              ? 'opacity-100'
              : 'pointer-events-none h-0 overflow-hidden opacity-0'
          }`}
          aria-live="polite"
        >
          {isRefreshing ? 'Atualizando…' : updatedLabel}
        </p>
      ) : null}
    </div>
  );
};
