export type SettingsTabId =
  | 'general'
  | 'visibility'
  | 'kit'
  | 'schedule'
  | 'advanced';

export type SettingsTab = {
  id: SettingsTabId;
  label: string;
  description: string;
};

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id: 'general',
    label: 'Geral',
    description: 'Nome, datas, local, descrição e código',
  },
  {
    id: 'visibility',
    label: 'Visibilidade',
    description: 'Status público/privado e links',
  },
  {
    id: 'kit',
    label: 'Kit',
    description: 'Camisetas e tamanhos na inscrição',
  },
  {
    id: 'schedule',
    label: 'Cronograma',
    description: 'Ordenação automática das baterias',
  },
  {
    id: 'advanced',
    label: 'Avançado',
    description: 'Ações irreversíveis',
  },
];
