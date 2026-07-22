import { type ReactNode } from 'react';

type SettingsSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  tone?: 'default' | 'danger';
};

export function SettingsSection({
  title,
  description,
  children,
  tone = 'default',
}: SettingsSectionProps) {
  return (
    <section
      className={[
        'rounded-surface border bg-white p-5 shadow-sm sm:p-6',
        tone === 'danger' ? 'border-red-200' : 'border-gray-200',
      ].join(' ')}
    >
      {title || description ? (
        <header className="mb-4">
          {title ? (
            <h2
              className={[
                'text-base font-semibold',
                tone === 'danger' ? 'text-red-700' : 'text-gray-900',
              ].join(' ')}
            >
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className={`text-sm text-gray-500 ${title ? 'mt-1' : ''}`}>
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
