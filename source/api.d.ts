import { AxiosPromise, AxiosRequestConfig } from 'axios';

import { Method } from './methods';

type ClearNever<T extends {}> = Pick<T, {[Key in keyof T]: T[Key] extends never ? never : Key}[keyof T]>;
type FlattAPI<A extends API, M extends Method> = {[Path in keyof A]: A[Path][Extract<keyof M, string>]};

type APIPaths<A extends API, M extends Method> = { [K in keyof A]: A[K] extends M ? K : never }[keyof A];
type APIRequest<T extends API, M extends Method> = Pick<T, APIPaths<T, M>>;

type PickPropertie<PathToPropertie extends Record<string, {}>, Propertie> = {
  [Path in keyof PathToPropertie]: PathToPropertie[Path] extends Propertie
    ? PathToPropertie[Path][keyof Propertie]
    : never
  };

type APIByMethod<A extends API, M extends Method> = Pick<A, APIPaths<A, M>>;
type PathToProperties<A extends API, M extends Method> = FlattAPI<APIByMethod<A, M>, M>;

interface API {
  [path: string]: Record<string, {response: unknown}>;
}

export namespace Status {
  type SUCCESS = 'SUCCESS';
  type FAILURE = 'FAILURE';
}

export namespace API {
  type GETPath<A extends API> = keyof APIRequest<A, Method.GET>;
  type POSTPath<A extends API> = keyof APIRequest<A, Method.POST>;
  type DELETEPath<A extends API> = keyof APIRequest<A, Method.DELETE>;
  type PUTPath<A extends API> = keyof APIRequest<A, Method.PUT>;

  type EndpointResponse<A extends API, M extends Method, Endpoint extends string> = Pick<
    PickPropertie<PathToProperties<A, M>, { 'response': unknown }> & {[path: string]: never}, Endpoint>[Endpoint];

  type EndpointQuery<A extends API, M extends Method, Endpoint extends string> = Pick<
    PickPropertie<PathToProperties<A, M>, {'query': unknown}> & {[path: string]: never}, Endpoint>[Endpoint];

  type EndpointPathParams<A extends API, M extends Method, Endpoint extends string> = Pick<
    PickPropertie<PathToProperties<A, M>, {'pathParams': unknown}> & {[path: string]: never}, Endpoint>[Endpoint];

  type EndpointData<A extends API, M extends Method, Endpoint extends string> = Pick<
    PickPropertie<PathToProperties<A, M>, {'data': unknown}> & {[path: string]: never}, Endpoint>[Endpoint];

  type EndpointErrorResponse<A extends API, M extends Method, Endpoint extends string> = Pick<
  PickPropertie<PathToProperties<A, M>, {'errorResponse': unknown}> & {[path: string]: never}, Endpoint>[Endpoint];

  interface ResponseStatus {
    SUCCESS: 'SUCCESS';
    FAILURE: 'FAILURE';
  }
  interface SuccessResponse<T> {
    status: Status.SUCCESS;
    statusCode: number;
    data: T;
  }

  interface FailedResponse<T> {
    status: Status.FAILURE;
    statusCode: number;
    data: T;
  }

  type Response<A extends API, M extends Method, Endpoint extends string> =
    | SuccessResponse<EndpointResponse<A, M, Endpoint>>
    | FailedResponse<EndpointErrorResponse<A, M, Endpoint>>;

  type ExtractSuccessResponse<T extends Response<any, any, any>> = T['status'] extends Status.SUCCESS ? T : never;
  type ExtractFailureResponse<T extends Response<any, any, any>> = T['status'] extends Status.FAILURE ? T : never;

  type RequestOptions = AxiosRequestConfig & {
    pathParams?: Record<string, string | number>;
    query?: Record<string, string | number | boolean>;
    data?: Record<string, unknown>;
  } | undefined;

  type Options<A extends API, M extends Method, Endpoint extends string> =
  ClearNever<{
    data: EndpointData<A, M, Endpoint>;
    pathParams: EndpointPathParams<A, M, Endpoint>;
    query: EndpointQuery<A, M, Endpoint>; }
  > & RequestOptions;

  type EndpointToOptions<A extends API, M extends Method> = {
    [Endpoint in keyof A]: Options<A, M, Extract<Endpoint, string>>
  };

  type EndpointWithOptions<A extends API, M extends Method> = {
    [Endpoint in keyof EndpointToOptions<A, M>]: EndpointToOptions<A, M>[Endpoint] extends
    { data: unknown } | { pathParams: unknown } | { query: unknown }
      ? Endpoint
      : never
  }[keyof A];

  type EndpointWithoutOptions<A extends API, M extends Method> = Exclude<APIPaths<A, M>, EndpointWithOptions<A, M>>;

  interface Request<A extends API, M extends Method> {
    <Endpoint extends EndpointWithoutOptions<A, M>>(endpoint: Endpoint):
      (options?: RequestOptions) => Promise<Response<A, M, Extract<Endpoint, string>>>;

    <Endpoint extends EndpointWithOptions<A, M>>(endpoint: Endpoint):
      (options: Options<A, M, Extract<Endpoint, string>>) => Promise<Response<A, M, Extract<Endpoint, string>>>;
  }
}
