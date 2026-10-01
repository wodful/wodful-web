import { ISimpleSubscription } from '../subscription';

export interface ISchedule {
  id: string;
  schedule: string;
  laneQuantity: number;
  date: Date;
  hour: string;
  heat: number;
  isLive: boolean;
  isOver: boolean;
  slotId?: string | null;
  slotOrder?: number;
  category: {
    name: string;
  };
  workout: {
    name: string;
  };
  subscriptions?: {
    ranking: number;
    nickname: string;
    generalScore?: number;
  }[];
}

export interface IPublicSchedule {
  id: string;
  schedule: string;
  date: Date;
  hour: string;
  heat: number;
  isLive: boolean;
  isOver: boolean;
  laneQuantity?: number;
  slotId?: string | null;
  slotOrder?: number;
  /** Later workouts hide names until the previous one for the category is closed. */
  showAthletes?: boolean;
  category: {
    name: string;
  };
  workout: {
    name: string;
  };
  subscriptions: (ISimpleSubscription & { place?: number })[];
}

export interface IScheduleSegmentRequest {
  categoryId: string;
  workoutId: string;
  heat: number;
  laneQuantity: number;
}

export interface ICreateScheduleRequestDTO {
  date: string;
  hour: string;
  categoryId?: string;
  workoutId?: string;
  heat?: number;
  laneQuantity?: number;
  segments?: IScheduleSegmentRequest[];
}

export interface IIsLiveDTO {
  championshipId: string;
  activityId: string;
  isLive: boolean;
}
export interface IIsOverDTO {
  championshipId: string;
  activityId: string;
  isOver: boolean;
}
