import { HttpClient, HttpRequest, HttpResponse, HttpStatusCode } from '@/data/interfaces/http';
import wodfulApiPrivate from '@/services';
import { AxiosResponse } from 'axios';

export class AxiosAdapter implements HttpClient {
  async request(params: HttpRequest): Promise<HttpResponse<any>> {
    let httpResponse: AxiosResponse<any> | undefined;

    try {
      httpResponse = await wodfulApiPrivate.request({
        url: params.url,
        method: params.method,
        data: params.body,
        headers: params.headers,
      });
    } catch (error: any) {
      httpResponse = error?.response;
    }

    if (!httpResponse) {
      return {
        statusCode: HttpStatusCode.serverError,
        body: undefined,
      };
    }

    return {
      statusCode: httpResponse.status,
      body: httpResponse.data,
      headers: httpResponse.headers,
    };
  }
}
