export interface IChampionship {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  accessCode: string;
  banner: File;
  resultType: string;
  address: string;
  description: string;
  isActive: boolean;
}

export interface ChampionshipDTO {
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  accessCode: string;
  banner: File | FileList;
  resultType: string;
  address: string;
  description: string;
}

export interface IChampionshipEditDTO {
  championshipId: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  accessCode: string;
  address: string;
  description: string;
  banner?: File;
}
