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

  create(data: any): Promise<any> {
    // Implement the create method
    return new Promise((resolve, reject) => {
      // Simulate an asynchronous operation
      setTimeout(() => {
        resolve({ message: 'Resource created', data });
      }, 1000);
    });
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
