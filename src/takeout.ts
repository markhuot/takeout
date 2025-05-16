import { Resource } from './resource';

interface Options {
  [key: string]: any;
}

export function takeout(uri: string, options: Options): Resource {
  return new Resource(uri, options);
}
