import { HttpClient, HttpStatusCode } from '@/data/interfaces/http';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import { IParticipant, IParticipants, PickupStatusFilter } from '@/data/interfaces/participant';

interface DownloadLink {
  downloadUrl: string;
}

export type ListParticipantsParams = {
  championshipId: string | null;
  limit?: number;
  page?: number;
  search?: string | null;
  categoryId?: string;
  kitStatus?: PickupStatusFilter;
  medalStatus?: PickupStatusFilter;
};

export class ParticipantsService {
  constructor(
    private readonly httpClient: HttpClient<
      IPageResponse<IParticipants> | IParticipants[] | IParticipant | DownloadLink
    >,
    private readonly path = '/participants/',
  ) {}

  async listAll({
    championshipId,
    limit,
    page,
    search,
    categoryId,
    kitStatus,
    medalStatus,
  }: ListParticipantsParams): Promise<IPageResponse<IParticipants> | IParticipants[]> {
    const params = new URLSearchParams();
    if (limit && page) {
      params.set('limit', String(limit));
      params.set('page', String(page));
    }
    if (search?.trim()) params.set('search', search.trim());
    if (categoryId) params.set('categoryId', categoryId);
    if (kitStatus) params.set('kitStatus', kitStatus);
    if (medalStatus) params.set('medalStatus', medalStatus);

    const query = params.toString();
    const url = `championships/${championshipId}${this.path}${query ? `?${query}` : ''}`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IPageResponse<IParticipants> | IParticipants[];
      default:
        throw new Error();
    }
  }

  async patchMedal(idParticipant: string, medalTakenBy: string | null): Promise<IParticipant> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'patch',
      url: `${this.path}${idParticipant}/medals`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        medalTakenBy,
      },
    });

    switch (statusCode) {
      case HttpStatusCode.noContent:
        return body! as IParticipant;
      default:
        throw new Error();
    }
  }

  async patchKit(idParticipant: string, kitTakenBy: string | null): Promise<IParticipant> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'patch',
      url: `${this.path}${idParticipant}/kits`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        kitTakenBy,
      },
    });

    switch (statusCode) {
      case HttpStatusCode.noContent:
        return body! as IParticipant;
      default:
        throw new Error();
    }
  }

  async edit({
    id,
    affiliation,
    city,
    identificationCode,
    name,
    tShirtSize,
  }: IParticipant): Promise<IParticipant> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'put',
      url: this.path,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        id,
        affiliation,
        city,
        identificationCode,
        name,
        tShirtSize,
      },
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IParticipant;
      default:
        throw new Error();
    }
  }

  async exportToCsv(champID: string): Promise<DownloadLink> {
    const url = `${this.path}${champID}/exports`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as DownloadLink;
      default:
        throw new Error();
    }
  }

  async exportContactsToCsv(champID: string): Promise<DownloadLink> {
    const url = `${this.path}${champID}/exports/contacts`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as DownloadLink;
      default:
        throw new Error();
    }
  }
}
