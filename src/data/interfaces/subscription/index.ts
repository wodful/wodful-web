import { IParticipantDTO } from '../participant';

export interface ISubscriptionDTO {
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  nickname: string;
  ticketId: string;
  participants: IParticipantDTO[];
  /** Admin: approve immediately without Mercado Pago payment */
  approveManually?: boolean;
  /** Admin: fee waived by organizer */
  isComplimentary?: boolean;
}

export interface ISubscriptionForm {
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  ticketId: string;
  ticketIndex?: number;
}

export interface ISimpleSubscription {
  ranking: number;
  nickname: string;
}

export interface IParticipantForm {
  nickname: string;
  participants: IParticipantDTO[];
  approveManually?: boolean;
  isComplimentary?: boolean;
}

export type SubscriptionPaymentOrigin =
  | 'MERCADO_PAGO'
  | 'MANUAL'
  | 'COMPLIMENTARY'
  | 'NONE';

export interface ISubscription {
  id: string;
  responsibleName: string;
  responsibleEmail?: string;
  responsiblePhone?: string;
  nickname: string;
  status: 'APPROVED' | 'WAITING' | 'DECLINED';
  paidOnline?: boolean;
  isComplimentary?: boolean;
  paymentOrigin?: SubscriptionPaymentOrigin;
  ticketPrice?: number;
  amountPaid?: number | null;
  amountEstimated?: number;
  createdAt: Date | string;
  category: {
    name: string;
  };
}

export interface UpdateSubscriptionDTO {
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  nickname: string;
}

export interface ISubscriptionPaymentLink {
  paymentId: string;
  paymentUrl: string;
}
