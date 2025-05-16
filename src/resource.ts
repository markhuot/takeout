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

  constructor(uri: string, options: { [key: string]: any }) {
    this.uri = uri;
    this.options = options;
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
    const method = options.method || 'POST';
    const fetchInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(options.fetchInit?.headers || {})
      },
      body: JSON.stringify(data),
      ...options.fetchInit,
    };
    const resourceUri = options.uri || this.uri;
    const response = await fetch(resourceUri, fetchInit);
    if (!response.ok) {
      throw new Error(`Failed to create resource: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async read(options: ResourceReadOptions = {}): Promise<any> {
    const { fetchInit, key = 'id', uri } = options;
    const resourceUri = uri || this.uri;
    const response = await fetch(resourceUri, fetchInit);
    const data = await response.json();

    if (!Array.isArray(data) || !data.every(item => typeof item === 'object')) {
      throw new Error('Returned data is not an array of objects');
    }

    // Sync each object into IndexedDB, keyed by uri and the specified key
    const dbHelper = new IndexedDBHelper();
    await Promise.all(
      data.map((obj: any) => {
        if (obj[key] === undefined) {
          throw new Error(`Each object must have a ${key} property to be stored in IndexedDB`);
        }
        return dbHelper.put(resourceUri, obj);
      })
    );

    const collection = new Collection(data);
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
