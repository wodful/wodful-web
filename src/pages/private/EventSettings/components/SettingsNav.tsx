import type { SettingsTab, SettingsTabId } from '../settingsNav';

type SettingsNavProps = {
  tabs: SettingsTab[];
  active: SettingsTabId;
  onChange: (id: SettingsTabId) => void;
};

/** In-page section switcher — underline tabs, not a second sidebar. */
export function SettingsNav({ tabs, active, onChange }: SettingsNavProps) {
  return (
    <nav
      className="-mx-1 overflow-x-auto overflow-y-hidden border-b border-slate-200 px-1"
      aria-label="Seções de configuração"
    >
      <div className="flex gap-0.5" role="tablist">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={[
                '-mb-px shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
