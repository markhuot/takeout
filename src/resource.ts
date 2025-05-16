import { Collection } from './collection';
import { IndexedDBHelper } from './indexeddb';

// Define the options type for read()
export interface ResourceReadOptions {
  fetchInit?: RequestInit;
  key?: string; // The primary key field name (default: 'id')
  uri?: string; // Optional override for the resource URI
}

export class Resource {
  private uri: string;
  private options: { [key: string]: any };
  private _optimisticResources: any[] = []; // Store multiple optimistic resources

  constructor(uri: string, options: { [key: string]: any }) {
    this.uri = uri;
    this.options = options;
  }

  /**
   * Internal helper to compose and execute fetch requests.
   */
  private async _doFetch(
    uri: string,
    options: {
      method?: string;
      body?: any;
      headers?: Record<string, string>;
      fetchInit?: RequestInit;
    } = {}
  ): Promise<Response> {
    const method = options.method || 'GET';
    let headers = { ...(this.options.headers || {}), ...(options.headers || {}) };
    let body = options.body;
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      body = JSON.stringify(body);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    const fetchInit: RequestInit = {
      method,
      headers,
      body,
      ...options.fetchInit,
    };
    return fetch(uri, fetchInit);
  }

  /**
   * Create a new resource by making a network request.
   * @param data The data to send in the request body
   * @param options Optional options object. You can specify the HTTP method (default: 'POST'), fetch options, and an optional uri override.
   *   - method: HTTP method (default: 'POST')
   *   - fetchInit: Additional fetch options
   *   - uri: Optional URI to use for the request (defaults to this.uri)
   */
  async create(
    data: any,
    options: { method?: string; fetchInit?: RequestInit; uri?: string } = {}
  ): Promise<any> {
    this._optimisticResources.unshift({ ...data });
    const resourceUri = options.uri || this.uri;
    const response = await this._doFetch(resourceUri, {
      method: options.method || 'POST',
      body: data,
      fetchInit: options.fetchInit,
    });
    if (!response.ok) {
      this._optimisticResources = this._optimisticResources.filter(item => item !== data);
      throw new Error(`Failed to create resource: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    const optimisticIdx = this._optimisticResources.findIndex(
      item => item === data || JSON.stringify(item) === JSON.stringify(data)
    );
    if (optimisticIdx !== -1) {
      this._optimisticResources[optimisticIdx] = result;
    } else {
      this._optimisticResources.unshift(result);
    }
    return result;
  }

  async read(options: ResourceReadOptions = {}): Promise<any> {
    const { fetchInit, key = 'id', uri } = options;
    const resourceUri = uri || this.uri;
    const response = await this._doFetch(resourceUri, { fetchInit });
    const data = await response.json();

    if (!Array.isArray(data) || !data.every(item => typeof item === 'object')) {
      throw new Error('Returned data is not an array of objects');
    }

    // Prepend all optimistic resources not already present in the data
    let items = data;
    if (this._optimisticResources.length > 0) {
      const existingKeys = new Set(items.map((item: any) => item[key]));
      const optimisticToAdd = this._optimisticResources.filter(
        (item: any) => item[key] === undefined || !existingKeys.has(item[key])
      );
      items = [...optimisticToAdd, ...items];
    }

    // Sync each object into IndexedDB, keyed by uri and the specified key
    const dbHelper = new IndexedDBHelper();
    await Promise.all(
      items.map((obj: any) => {
        if (obj[key] === undefined) {
          throw new Error(`Each object must have a ${key} property to be stored in IndexedDB`);
        }
        return dbHelper.put(resourceUri, obj);
      })
    );

    const collection = new Collection(items);
    return collection;
  }

  update(data: any): Promise<any> {
    // Implement the update method
    return new Promise((resolve, reject) => {
      // Simulate an asynchronous operation
      setTimeout(() => {
        resolve({ message: 'Resource updated', data });
      }, 1000);
    });
  }

  delete(): Promise<any> {
    // Implement the delete method
    return new Promise((resolve, reject) => {
      // Simulate an asynchronous operation
      setTimeout(() => {
        resolve({ message: 'Resource deleted' });
      }, 1000);
    });
  }
}
