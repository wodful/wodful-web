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

export interface ISubscriptionParticipant {
  id: string;
  name: string;
  identificationCode: string;
  affiliation: string;
  city: string;
  tShirtSize: string;
  tShirtName?: string | null;
}

export interface ITransferSubscriptionDTO {
  toCategoryId: string;
  removeParticipantIds?: string[];
  addParticipants?: IParticipantDTO[];
  adjustmentAmount?: number;
}

export interface ITransferSubscriptionResponse {
  subscriptionId: string;
  category: {
    id: string;
    name: string;
  };
  paymentUrl: string | null;
}

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
  transferredAt?: Date | string | null;
  transferredFromName?: string | null;
  hasResults?: boolean;
  couponCode?: string | null;
  ticket?: {
    id: string;
    name: string;
  } | null;
  participants?: ISubscriptionParticipant[];
  category: {
    id?: string;
    name: string;
    members?: number;
  };
}

export interface UpdateSubscriptionDTO {
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
  nickname: string;
}
