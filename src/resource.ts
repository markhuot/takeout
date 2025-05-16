import { Collection } from './collection';

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

  async read(): Promise<any> {
    const response = await fetch(this.uri, this.options);
    const data = await response.json();

    if (!Array.isArray(data) || !data.every(item => typeof item === 'object')) {
      throw new Error('Returned data is not an array of objects');
    }

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
