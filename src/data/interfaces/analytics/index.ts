export type ChampionshipAnalyticsSummary = {
  athletes: number;
  subscriptionsApproved: number;
  subscriptionsWaiting: number;
  subscriptionsDeclined: number;
  subscriptionsOnline: number;
  subscriptionsOutside: number;
  subscriptionsComplimentary: number;
  ticketsSold: number;
  ticketsCapacity: number;
  revenueApproximate: number;
  revenuePaid: number;
  revenueEstimated: number;
  couponsRedeemed: number;
  discountTotal: number;
  kitsTaken: number;
  medalsTaken: number;
};

export type ChampionshipAnalyticsByCategory = {
  categoryId: string;
  name: string;
  athletes: number;
  subscriptions: number;
};

export type ChampionshipAnalyticsByBox = {
  affiliation: string;
  athletes: number;
};

export type ChampionshipAnalyticsByCity = {
  city: string;
  athletes: number;
};

export type ChampionshipAnalyticsByShirtSize = {
  size: string;
  athletes: number;
};

export type ChampionshipAnalyticsByCoupon = {
  couponId: string;
  code: string;
  redemptions: number;
  discountTotal: number;
};

export type ChampionshipAnalyticsTimelinePoint = {
  date: string;
  count: number;
  approvedCount: number;
};

export type ChampionshipAnalyticsTicketFill = {
  ticketId: string;
  name: string;
  categoryName: string;
  quantity: number;
  sold: number;
};

export type ChampionshipAnalytics = {
  summary: ChampionshipAnalyticsSummary;
  byCategory: ChampionshipAnalyticsByCategory[];
  byBox: ChampionshipAnalyticsByBox[];
  byCity: ChampionshipAnalyticsByCity[];
  byShirtSize: ChampionshipAnalyticsByShirtSize[];
  byCoupon: ChampionshipAnalyticsByCoupon[];
  registrationsOverTime: ChampionshipAnalyticsTimelinePoint[];
  ticketFill: ChampionshipAnalyticsTicketFill[];
};
