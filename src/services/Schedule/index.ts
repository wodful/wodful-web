import { HttpClient, HttpStatusCode } from '@/data/interfaces/http';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import { ICreateScheduleRequestDTO, ISchedule } from '@/data/interfaces/schedule';

export class ScheduleService {
  constructor(
    private readonly httpClient: HttpClient<IPageResponse<ISchedule> | ISchedule[] | ISchedule>,
    private readonly path = '/schedules',
  ) {}

  async create(payload: ICreateScheduleRequestDTO): Promise<ISchedule> {
    const bodyPayload = payload.segments?.length
      ? {
          date: payload.date,
          hour: payload.hour,
          segments: payload.segments,
        }
      : payload;

    const { statusCode, body } = await this.httpClient.request({
      method: 'post',
      url: this.path,
      body: bodyPayload,
    });

    switch (statusCode) {
      case HttpStatusCode.created:
        return body! as ISchedule;
      default:
        throw new Error();
    }
  }

  async list(
    championshipId: string,
    limit: number,
    page: number,
  ): Promise<IPageResponse<ISchedule>> {
    let url = `${this.path}/${championshipId}`;

    if (limit && page) url = `${url}?limit=${limit}&page=${page}`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IPageResponse<ISchedule>;
      default:
        throw new Error();
    }
  }

  async delete(id: string): Promise<ISchedule> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'delete',
      url: `${this.path}/activities/${id}`,
    });

    switch (statusCode) {
      case HttpStatusCode.noContent:
        return body! as ISchedule;
      default:
        throw new Error();
    }
  }

  async isLive(championshipId: string, activityId: string, isLive: boolean): Promise<ISchedule> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'put',
      url: `${this.path}/activities/is-live`,
      body: {
        championshipId,
        activityId,
        isLive,
      },
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as ISchedule;
      default:
        throw new Error();
    }
  }

  async isOver(championshipId: string, activityId: string, isOver: boolean): Promise<ISchedule> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'put',
      url: `${this.path}/activities/is-over`,
      body: {
        championshipId,
        activityId,
        isOver,
      },
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as ISchedule;
      default:
        throw new Error();
    }
  }
}
