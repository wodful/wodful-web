export interface IWorkoutDTO {
  name: string;
  description: string;
  workoutType: string;
  championshipId: string;
  categoryId: string;
  worthHalfPoints?: boolean;
}
export interface IWorkout {
  id: string;
  name: string;
  workoutType: 'AMRAP' | 'EMOM' | 'FORTIME' | 'PR';
  categoryId?: string;
  categoryName: string;
  worthHalfPoints?: boolean;
}

export interface IPublicWorkout {
  id: string;
  name: string;
  workoutType: 'AMRAP' | 'EMOM' | 'FORTIME' | 'PR';
  description: string;
  worthHalfPoints?: boolean;
  resultType?: string;
}
