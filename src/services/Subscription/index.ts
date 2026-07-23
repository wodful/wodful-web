import { HttpClient, HttpStatusCode } from '@/data/interfaces/http';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import {
  ISubscription,
  ISubscriptionDTO,
  ISubscriptionPaymentLink,
  SubscriptionPaymentOrigin,
  UpdateSubscriptionDTO,
} from '@/data/interfaces/subscription';

export type SubscriptionListParams = {
  limit?: number;
  page?: number;
  categoryId?: string;
  origin?: SubscriptionPaymentOrigin | '';
  q?: string;
};

export class SubscriptionService {
  constructor(
    private readonly httpClient: HttpClient<
      | IPageResponse<ISubscription>
      | ISubscription
      | ISubscription[]
      | ISubscriptionPaymentLink
    >,
    private readonly path = '/subscriptions',
  ) {}

  async get(id: string): Promise<ISubscription> {
    const url = `${this.path}/${id}`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body as ISubscription;
      default:
        throw new Error();
    }
  }

  async create(subscription: ISubscriptionDTO): Promise<ISubscription> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'post',
      url: this.path,
      body: subscription,
    });

    switch (statusCode) {
      case HttpStatusCode.created:
        return body! as ISubscription;
      default:
        throw new Error();
    }
  }

  async listAll(
    id: string,
    params: SubscriptionListParams = {},
  ): Promise<IPageResponse<ISubscription> | ISubscription[]> {
    const search = new URLSearchParams();
    if (params.limit !== undefined && params.page !== undefined) {
      search.set('limit', String(params.limit));
      search.set('page', String(params.page));
    }
    if (params.categoryId) search.set('category', params.categoryId);
    if (params.origin) search.set('origin', params.origin);
    if (params.q?.trim()) search.set('q', params.q.trim());

    const query = search.toString();
    const url = `championships/${id}${this.path}${query ? `?${query}` : ''}`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IPageResponse<ISubscription> | ISubscription[];
      default:
        throw new Error();
    }
  }

  async delete(id: string): Promise<ISubscription> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'delete',
      url: `${this.path}/${id}`,
    });

    switch (statusCode) {
      case HttpStatusCode.noContent:
        return body! as ISubscription;
      default:
        throw new Error();
    }
  }

  async update(id: string, data: UpdateSubscriptionDTO): Promise<ISubscription> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'put',
      url: `${this.path}/${id}/`,
      body: data,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as ISubscription;
      default:
        throw new Error();
    }
  }

  async updateStatus(id: string, status: string): Promise<ISubscription> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'put',
      url: `${this.path}/${id}/${status}`,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as ISubscription;
      default:
        throw new Error();
    }
  }

  async setComplimentary(id: string, isComplimentary: boolean): Promise<void> {
    const { statusCode } = await this.httpClient.request({
      method: 'put',
      url: `${this.path}/${id}/complimentary`,
      body: { isComplimentary },
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return;
      default:
        throw new Error();
    }
  }

  async createPaymentLink(id: string): Promise<ISubscriptionPaymentLink> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'post',
      url: `${this.path}/${id}/payment-link`,
    });

    switch (statusCode) {
      case HttpStatusCode.created:
        return body! as ISubscriptionPaymentLink;
      default:
        throw new Error();
    }
  }

  async resendApprovedEmail(id: string): Promise<void> {
    const { statusCode } = await this.httpClient.request({
      method: 'post',
      url: `${this.path}/${id}/resend-approved-email`,
    });

    switch (statusCode) {
      case HttpStatusCode.noContent:
        return;
      default:
        throw new Error();
    }
  }

  async listAllByCategory(
    id: string,
    categoryId: string,
    workoutId?: string,
  ): Promise<IPageResponse<ISubscription> | ISubscription[]> {
    const search = new URLSearchParams({ category: categoryId });
    if (workoutId) search.set('workoutId', workoutId);
    const url = `championships/${id}${this.path}?${search.toString()}`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IPageResponse<ISubscription> | ISubscription[];
      default:
        throw new Error();
    }
  }
}
