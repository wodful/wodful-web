import { HttpClient, HttpStatusCode } from '@/data/interfaces/http';
import { IPageResponse } from '@/data/interfaces/pageResponse';
import { IPublicWorkout, IUpdateWorkoutDTO, IWorkout, IWorkoutDTO } from '@/data/interfaces/workout';

export class WorkoutService {
  constructor(
    private readonly httpClient: HttpClient<
      IPageResponse<IWorkout> | IWorkout[] | IWorkout | IPublicWorkout[]
    >,
    private readonly path = '/workouts',
  ) { }

  async create({
    name,
    description,
    workoutType,
    championshipId,
    categoryId,
    worthHalfPoints,
  }: IWorkoutDTO): Promise<IWorkout> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'post',
      url: this.path,
      body: { name, description, workoutType, championshipId, categoryId, worthHalfPoints },
    });

    switch (statusCode) {
      case HttpStatusCode.created:
        return body! as IWorkout;
      default:
        throw new Error();
    }
  }

  async listByChampionship(
    id: string,
    limit?: number,
    page?: number,
  ): Promise<IPageResponse<IWorkout> | IWorkout[]> {
    let url = `championships/${id}${this.path}`;

    if (limit !== undefined && page !== undefined) url = `${url}?limit=${limit}&page=${page}`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IPageResponse<IWorkout> | IWorkout[];
      default:
        throw new Error();
    }
  }

  async listByCategory(
    id: string,
    limit?: number,
    page?: number,
  ): Promise<IPageResponse<IWorkout> | IWorkout[]> {
    let url = `categories/${id}${this.path}`;

    if (limit && page) url = `${url}?limit=${limit}&page=${page}`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IPageResponse<IWorkout> | IWorkout[];
      default:
        throw new Error();
    }
  }

  async publicListByCategory(categoryId: string): Promise<IPublicWorkout[]> {
    const url = `public/categories/${categoryId}${this.path}`;

    const { statusCode, body } = await this.httpClient.request({
      method: 'get',
      url: url,
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IPublicWorkout[];
      default:
        throw new Error();
    }
  }

  async update({
    id,
    name,
    description,
    workoutType,
    worthHalfPoints,
  }: IUpdateWorkoutDTO): Promise<IWorkout> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'put',
      url: `${this.path}/${id}`,
      body: { name, description, workoutType, worthHalfPoints },
    });

    switch (statusCode) {
      case HttpStatusCode.ok:
        return body! as IWorkout;
      default:
        throw new Error();
    }
  }

  async delete(id: string): Promise<IWorkout> {
    const { statusCode, body } = await this.httpClient.request({
      method: 'delete',
      url: `${this.path}/${id}`,
    });

    switch (statusCode) {
      case HttpStatusCode.noContent:
        return body! as IWorkout;
      default:
        throw new Error();
    }
  }
}
