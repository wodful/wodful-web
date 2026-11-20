export type PickupStatusFilter = 'pending' | 'taken';

export interface IParticipants {
  id: string;
  name: string;
  identificationCode: string;
  affiliation: string;
  city: string;
  tShirtSize: string;
  includesTshirt?: boolean | null;
  medalTakenBy: string | null;
  kitTakenBy: string | null;
  nickname: string;
  category: {
    id: string;
    name: string;
  };
}

export interface IParticipantDTO {
  name: string;
  identificationCode: string;
  affiliation: string;
  city: string;
  tShirtSize: string;
}

export interface IParticipant {
  id: string;
  name: string;
  identificationCode: string;
  affiliation: string;
  city: string;
  tShirtSize: string;
}
