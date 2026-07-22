export interface ILeaderboardResult {
  result: string;
  points: number;
  classification: number;
  isReleased?: boolean;
  workout: {
    name: string;
  };
}

export interface ILeaderboard {
  ranking: number;
  nickname: string;
  generalScore: number;
  category: {
    name: string;
  };
  results: ILeaderboardResult[];
}

export interface IPublicLeaderboard {
  nickname: string;
  generalScore: number;
  category: {
    name: string;
  };
  participants: Array<{
    name: string;
    affiliation: string;
  }>;
  ranking: number;
  results: Array<{
    result: string;
    points: number;
    classification: number;
    workout: {
      name: string;
    };
  }>;
}
