import { HttpClient, HttpStatusCode } from '@/data/interfaces/http';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import { ITicket, TicketDTO } from '@/data/interfaces/ticket';

export class TicketService {
  constructor(
    private readonly httpClient: HttpClient<IPageResponse<ITicket> | ITicket[] | ITicket>,
    private readonly path = '/tickets',
  ) {}

  async create({
    name,
    description,
    startDate,
    endDate,
    price,
    quantity,
    categoryId,
    paymentLink,
  }: TicketDTO): Promise<ITicket> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'post',
      url: this.path,
      body: { name, description, startDate, endDate, price, quantity, categoryId, paymentLink },
    });

    switch (statusCode) {
      case HttpStatusCode.created:
        return body! as ITicket;
      default:
        throw new Error();
    }
  }

  async edit({
    id,
    name,
    description,
    startDate,
    endDate,
    price,
    quantity,
    categoryId,
    paymentLink,
  }: TicketDTO): Promise<ITicket> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'put',
      url: this.path,
      headers: {
        'Content-Type': 'application/json',
      },
      body: { id, name, description, startDate, endDate, price, quantity, categoryId, paymentLink },
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as ITicket;
      default:
        throw new Error();
    }
  }

  async delete(id: string): Promise<ITicket> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'delete',
      url: `${this.path}/${id}`,
    });

    switch (statusCode) {
      case HttpStatusCode.noContent:
        return body! as ITicket;
      default:
        throw new Error();
    }
  }

  async listAll(
    id: string,
    limit?: number,
    page?: number,
  ): Promise<IPageResponse<ITicket> | ITicket[]> {
    let url = `${this.path}/${id}`;

    if (limit && page) url = `${url}?limit=${limit}&page=${page}`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IPageResponse<ITicket> | ITicket[];
      default:
        throw new Error();
    }
  }
  async listEnabled(id: string): Promise<ITicket[]> {
    const url = `${this.path}/${id}/enabled`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as ITicket[];
      default:
        throw new Error();
    }
  }

  async setEnabled(id: string, enabled: boolean): Promise<ITicket> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'patch',
      url: `${this.path}/${id}/status`,
      body: { enabled },
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as ITicket;
      default:
        throw new Error();
    }
  }
}
