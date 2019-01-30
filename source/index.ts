import {
  AxiosInstance,
  AxiosPromise,
  AxiosStatic,
} from "axios";
import * as pathToRegexp from "path-to-regexp";

import { API } from "./api";
import { Method } from "./methods";

export const ResponseStatus: API.ResponseStatus = {
  FAILURE: "FAILURE",
  SUCCESS: "SUCCESS"
};

export class REST<RestAPI extends API> {
  constructor(
    baseURL: string,
    client: AxiosStatic,
    headers?: Record<string, string>,
  ) {
    this.httpClient = client.create({ baseURL, headers });
  }
  private static async getData<
    A extends API,
    M extends Method,
    Endpoint extends string
  >(
    request: AxiosPromise<API.EndpointResponse<A, M, Endpoint>>
  ): Promise<API.Response<A, M, Endpoint>> {
    try {
      const response = await request;

      return {
        data: response.data,
        status: ResponseStatus.SUCCESS,
        statusCode: response.status
      };
    } catch (error) {
      return {
        data: error.response.data,
        status: ResponseStatus.FAILURE,
        statusCode: error.response.status
      };
    }
  }

  private readonly httpClient: AxiosInstance;

  GET: API.Request<RestAPI, Method.GET> = <P extends string>(url: P) => async <
    Options extends API.RequestOptions
  >(
    options: Options
  ) =>
    REST.getData<RestAPI, Method.POST, P>(
      this.httpClient.request(
        Object.assign({}, options === undefined ? {} : options, {
          method: "get",
          params: "query" in options ? options.query : {},
          url:
            "pathParams" in options
              ? pathToRegexp.compile(url)(options.pathParams)
              : url
        })
      )
    );

  POST: API.Request<RestAPI, Method.POST> = <P extends string>(
    url: P
  ) => async <Options extends API.RequestOptions>(options: Options) =>
    REST.getData<RestAPI, Method.POST, P>(
      this.httpClient.request(
        Object.assign({}, options === undefined ? {} : options, {
          data: "data" in options ? options.data : {},
          method: "post",
          params: "query" in options ? options.query : {},
          url:
            "pathParams" in options
              ? pathToRegexp.compile(url)(options.pathParams)
              : url
        })
      )
    );

  PUT: API.Request<RestAPI, Method.PUT> = <P extends string>(url: P) => async <
    Options extends API.RequestOptions
  >(
    options: Options
  ) =>
    REST.getData<RestAPI, Method.PUT, P>(
      this.httpClient.request(
        Object.assign({}, options === undefined ? {} : options, {
          data: "data" in options ? options.data : {},
          method: "put",
          params: "query" in options ? options.query : {},
          url:
            "pathParams" in options
              ? pathToRegexp.compile(url)(options.pathParams)
              : url
        })
      )
    );

  DELETE: API.Request<RestAPI, Method.DELETE> = <P extends string>(
    url: P
  ) => async <Options extends API.RequestOptions>(options: Options) =>
    REST.getData<RestAPI, Method.DELETE, P>(
      this.httpClient.request(
        Object.assign({}, options === undefined ? {} : options, {
          data: "data" in options ? options.data : {},
          method: "delete",
          params: "query" in options ? options.query : {},
          url:
            "pathParams" in options
              ? pathToRegexp.compile(url)(options.pathParams)
              : url
        })
      )
    );

  updateHeaders(
    updateFn: (
      currentHeaders: Readonly<Record<string, string>>
    ) => Record<string, string>
  ): void {
    this.httpClient.defaults.headers = updateFn(
      this.httpClient.defaults.headers
    );
  }
}
