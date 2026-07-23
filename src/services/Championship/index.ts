import {
  ChampionshipDTO,
  IChampionship,
  IChampionshipEditDTO,
} from '@/data/interfaces/championship';
import { ChampionshipAnalytics } from '@/data/interfaces/analytics';
import { HttpClient, HttpStatusCode } from '@/data/interfaces/http';
import { IPageResponse } from '@/data/interfaces/pageResponse';

export class ChampionshipService {
  constructor(
    private readonly httpClient: HttpClient<
      IChampionship | IChampionship[] | ChampionshipAnalytics
    >,
    private readonly path = '/championships',
  ) {}

  async getAnalytics(championshipId: string): Promise<ChampionshipAnalytics> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: `${this.path}/${championshipId}/analytics`,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as ChampionshipAnalytics;
      default:
        throw new Error();
    }
  }

  async listAffiliations(championshipId: string, query?: string): Promise<string[]> {
    const search = new URLSearchParams();
    if (query?.trim()) search.set('q', query.trim());
    const qs = search.toString();
    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: `${this.path}/${championshipId}/affiliations${qs ? `?${qs}` : ''}`,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return (body as unknown as string[]) ?? [];
      default:
        throw new Error();
    }
  }

  async getTshirts(championshipId: string): Promise<{
    hasTshirt: boolean;
    hasNameInTshirt: boolean;
    tShirtSizes: string[];
  }> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: `${this.path}/${championshipId}/tshirts`,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body as unknown as {
          hasTshirt: boolean;
          hasNameInTshirt: boolean;
          tShirtSizes: string[];
        };
      default:
        throw new Error();
    }
  }

  async create({
    name,
    startDate,
    endDate,
    accessCode,
    banner,
    resultType,
    address,
    description,
  }: ChampionshipDTO): Promise<IChampionship> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'post',
      url: this.path,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: {
        name,
        startDate,
        endDate,
        accessCode,
        banner,
        resultType,
        address,
        description,
      },
    });

    switch (statusCode) {
      case HttpStatusCode.created:
        return body! as IChampionship;
      default:
        throw new Error();
    }
  }

  async edit({
    championshipId,
    name,
    startDate,
    endDate,
    accessCode,
    address,
    description,
  }: IChampionshipEditDTO): Promise<IChampionship> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'put',
      url: this.path,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        championshipId,
        name,
        startDate,
        endDate,
        accessCode: accessCode.toUpperCase(),
        address,
        description,
      },
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IChampionship;
      default:
        throw new Error();
    }
  }

  async delete(id: string): Promise<IChampionship> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'delete',
      url: `${this.path}/${id}`,
    });

    switch (statusCode) {
      case HttpStatusCode.noContent:
        return body! as IChampionship;
      default:
        throw new Error();
    }
  }

  async activate(id: string): Promise<IChampionship> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'patch',
      url: `${this.path}/${id}/activate`,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IChampionship;
      default:
        throw new Error();
    }
  }

  async deactivate(id: string): Promise<IChampionship> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'patch',
      url: `${this.path}/${id}/deactivate`,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IChampionship;
      default:
        throw new Error();
    }
  }

  async getById(id: string): Promise<IChampionship> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: `${this.path}/${id}`,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IChampionship;
      default:
        throw new Error();
    }
  }

  async listAll(
    limit?: number,
    page?: number,
  ): Promise<IPageResponse<IChampionship> | IChampionship[]> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: `${this.path}/${limit && page && `?limit=${limit}&page=${page}`}`,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IPageResponse<IChampionship> | IChampionship[];
      default:
        throw new Error();
    }
  }
}
