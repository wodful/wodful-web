export function paginateItems<T>(items: T[], page: number, limit: number) {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * limit;
  const results = items.slice(start, start + limit);
  const count = items.length;
  return {
    results,
    count,
    previous: safePage > 1,
    next: start + limit < count,
  };
}

/** Janela/estoque — independente do toggle manual. */
export type TicketWindowStatus = 'on_sale' | 'scheduled' | 'ended' | 'sold_out';

export function getTicketWindowStatus(ticket: {
  startDate: Date | string;
  endDate: Date | string;
  quantity: number;
  inUse: number;
}): TicketWindowStatus {
  const remaining = ticket.quantity - ticket.inUse;
  if (remaining <= 0) return 'sold_out';

  const now = Date.now();
  const start = new Date(ticket.startDate).getTime();
  const end = new Date(ticket.endDate).getTime();

  if (Number.isFinite(start) && now < start) return 'scheduled';
  if (Number.isFinite(end) && now > end) return 'ended';
  return 'on_sale';
}

/** Status operacional completo (inclui desativado manual). */
export type TicketSaleStatus = TicketWindowStatus | 'disabled';

export function getTicketSaleStatus(ticket: {
  startDate: Date | string;
  endDate: Date | string;
  quantity: number;
  inUse: number;
  enabled?: boolean;
}): TicketSaleStatus {
  const window = getTicketWindowStatus(ticket);
  if (window === 'sold_out') return 'sold_out';
  if (ticket.enabled === false) return 'disabled';
  return window;
}

export const ticketWindowStatusLabel: Record<TicketWindowStatus, string> = {
  on_sale: 'À venda',
  scheduled: 'Agendado',
  ended: 'Encerrado',
  sold_out: 'Esgotado',
};

export const ticketWindowStatusTone: Record<
  TicketWindowStatus,
  'success' | 'neutral' | 'warning' | 'danger'
> = {
  on_sale: 'success',
  scheduled: 'neutral',
  ended: 'warning',
  sold_out: 'danger',
};

export const ticketSaleStatusLabel: Record<TicketSaleStatus, string> = {
  ...ticketWindowStatusLabel,
  disabled: 'Desativado',
};

export const ticketSaleStatusTone: Record<
  TicketSaleStatus,
  'success' | 'neutral' | 'warning' | 'danger'
> = {
  ...ticketWindowStatusTone,
  disabled: 'neutral',
};
