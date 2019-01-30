interface APIData<D extends {}> {
    data: D;
  }
  
  interface APIResponse<T> {
    response: T;
  }
  
  export namespace Method {
    export interface GET<R = unknown> {
      GET: APIResponse<R>;
    }
  
    export interface POST<R = unknown, D = unknown> {
      POST: APIData<D> & APIResponse<R>;
    }
  
    export interface DELETE<R = unknown, D = unknown> {
      DELETE: APIResponse<R>;
    }
  
    export interface PUT<R = unknown, D = unknown> {
      PUT: APIResponse<R>;
    }
  }
  
  export type Method = Method.GET | Method.POST | Method.DELETE | Method.PUT;
  