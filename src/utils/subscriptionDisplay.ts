import type { BadgeTone } from '@/components/ui/Badge';
import type { ISubscription } from '@/data/interfaces/subscription';

export function toDisplayName(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return trimmed;

  const letters = trimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  if (!letters) return trimmed;

  const upperCount = [...letters].filter(
    (char) => char === char.toUpperCase() && char !== char.toLowerCase(),
  ).length;

  if (upperCount / letters.length < 0.6) return trimmed;

  return trimmed
    .toLowerCase()
    .replace(/(^|[\s'-])(\S)/g, (_, boundary: string, char: string) => boundary + char.toUpperCase());
}

export function getSubscriptionStatusDisplay(subscription: ISubscription): {
  label: string;
  tone: BadgeTone;
} {
  if (subscription.status === 'DECLINED') {
    return { label: 'Recusada', tone: 'danger' };
  }

  if (subscription.status === 'WAITING') {
    return { label: 'Aguardando', tone: 'warning' };
  }

  if (
    subscription.isComplimentary ||
    subscription.paymentOrigin === 'COMPLIMENTARY'
  ) {
    return { label: 'Isenta', tone: 'neutral' };
  }

  if (subscription.paidOnline || subscription.paymentOrigin === 'MERCADO_PAGO') {
    return { label: 'Paga online', tone: 'success' };
  }

  return { label: 'Aprovada', tone: 'primary' };
}

export function getSubscriptionOriginDisplay(subscription: ISubscription): {
  label: string;
  tone: BadgeTone;
} | null {
  // Status already shows "Isenta" — avoid duplicating in Origem
  if (
    subscription.isComplimentary ||
    subscription.paymentOrigin === 'COMPLIMENTARY'
  ) {
    return null;
  }

  if (subscription.paymentOrigin === 'MERCADO_PAGO' || subscription.paidOnline) {
    return { label: 'Online', tone: 'success' };
  }

  if (subscription.paymentOrigin === 'MANUAL' || subscription.status === 'APPROVED') {
    return { label: 'Interna', tone: 'primary' };
  }

  if (subscription.status === 'WAITING') {
    return { label: 'Pendente', tone: 'neutral' };
  }

  return null;
}

export function getSubscriptionAmountDisplay(subscription: ISubscription): {
  label: string;
  title?: string;
} {
  if (
    subscription.isComplimentary ||
    subscription.paymentOrigin === 'COMPLIMENTARY'
  ) {
    return { label: 'Isenta', title: 'Inscrição liberada sem cobrança' };
  }

  const format = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (
    subscription.paidOnline ||
    subscription.paymentOrigin === 'MERCADO_PAGO'
  ) {
    const paid = subscription.amountPaid ?? subscription.ticketPrice ?? 0;
    return { label: format(paid), title: 'Pago online' };
  }

  const estimated =
    subscription.amountEstimated ?? subscription.ticketPrice ?? 0;

  if (subscription.status === 'APPROVED') {
    return { label: format(estimated), title: 'Valor estimado (pagamento interno)' };
  }

  if (subscription.status === 'WAITING') {
    return { label: format(estimated), title: 'Valor a pagar' };
  }

  return { label: '—' };
}
