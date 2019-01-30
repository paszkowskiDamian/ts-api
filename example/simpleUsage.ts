import axios from 'axios';

import { REST } from '../source';

export type API = {
    '/accounts-list': {
      POST: {
        data: {
          offset: number;
          limit: number;
        };
        response: {
          data: Record<string, string>;
          limit: number;
          offset: number;
          total: number;
        };
      };
    };
}

const api = new REST<API>("http://example.com", axios);

api.POST('/accounts-list')
