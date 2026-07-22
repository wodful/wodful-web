import type { Icon } from 'react-feather';
import {
  Award,
  Calendar,
  Clipboard,
  CreditCard,
  Home,
  Tag,
  Percent,
  Users,
  UserCheck,
  List,
  Settings,
} from 'react-feather';

export type EventNavGroupId = 'overview' | 'live' | 'setup' | 'people' | 'event';

export type EventNavItemId =
  | 'home'
  | 'schedules'
  | 'results'
  | 'leaderboards'
  | 'categories'
  | 'workouts'
  | 'tickets'
  | 'coupons'
  | 'subscriptions'
  | 'participants'
  | 'settings';

export type EventNavItem = {
  id: EventNavItemId;
  label: string;
  description: string;
  pathSegment: string;
  Icon: Icon;
  group: EventNavGroupId;
  featured?: boolean;
};

export type EventNavGroup = {
  id: EventNavGroupId;
  label: string;
};

export const EVENT_NAV_GROUPS: EventNavGroup[] = [
  { id: 'live', label: 'Ao vivo' },
  { id: 'setup', label: 'Setup' },
  { id: 'people', label: 'Pessoas' },
  { id: 'event', label: 'Evento' },
];

export const EVENT_NAV_ITEMS: EventNavItem[] = [
  {
    id: 'home',
    label: 'Visão geral',
    description: 'Atalhos e resumo do evento',
    pathSegment: '',
    Icon: Home,
    group: 'overview',
  },
  {
    id: 'schedules',
    label: 'Cronograma',
    description: 'Baterias, horários e status ao vivo',
    pathSegment: 'schedules',
    Icon: Calendar,
    group: 'live',
    featured: true,
  },
  {
    id: 'results',
    label: 'Resultados',
    description: 'Lançamento e liberação de resultados',
    pathSegment: 'results',
    Icon: List,
    group: 'live',
    featured: true,
  },
  {
    id: 'leaderboards',
    label: 'Leaderboard',
    description: 'Placar geral por categoria',
    pathSegment: 'leaderboards',
    Icon: Award,
    group: 'live',
    featured: true,
  },
  {
    id: 'categories',
    label: 'Categorias',
    description: 'Divisões e regras do evento',
    pathSegment: 'categories',
    Icon: Tag,
    group: 'setup',
  },
  {
    id: 'workouts',
    label: 'Provas',
    description: 'WODs e pontuação',
    pathSegment: 'workouts',
    Icon: Clipboard,
    group: 'setup',
  },
  {
    id: 'tickets',
    label: 'Tickets',
    description: 'Ingressos e valores',
    pathSegment: 'tickets',
    Icon: CreditCard,
    group: 'setup',
  },
  {
    id: 'coupons',
    label: 'Cupons',
    description: 'Descontos de inscrição',
    pathSegment: 'coupons',
    Icon: Percent,
    group: 'setup',
  },
  {
    id: 'subscriptions',
    label: 'Inscrições',
    description: 'Inscrições e pagamentos',
    pathSegment: 'subscriptions',
    Icon: UserCheck,
    group: 'people',
  },
  {
    id: 'participants',
    label: 'Participantes',
    description: 'Atletas e kits',
    pathSegment: 'participants',
    Icon: Users,
    group: 'people',
  },
  {
    id: 'settings',
    label: 'Configurações',
    description: 'Dados do evento, visibilidade, camisetas e cronograma',
    pathSegment: 'settings',
    Icon: Settings,
    group: 'event',
  },
];

export function eventPath(championshipId: string, pathSegment: string) {
  const base = `/championships/${championshipId}`;
  return pathSegment ? `${base}/${pathSegment}` : base;
}

export function getEventNavItemsByGroup(groupId: EventNavGroupId) {
  return EVENT_NAV_ITEMS.filter((item) => item.group === groupId);
}
