export interface ITicket {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  enabled: boolean;
  price: number;
  quantity: number;
  inUse: number;
  category: {
    id: string;
    members: number;
    name: string;
  };
}

export interface TicketDTO {
  id?: string;
  name: string;
  description: string;
  startDate: Date | string;
  endDate: Date | string;
  price: number;
  quantity: number;
  categoryId: string;
}
