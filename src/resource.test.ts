import { describe, it, expect, vi, beforeEach } from 'vitest';
import { takeout } from './takeout';
import { Resource } from './resource';

// Mock IndexedDBHelper to avoid using browser indexedDB in Node
vi.mock('./indexeddb', () => {
  return {
    IndexedDBHelper: vi.fn().mockImplementation(() => ({
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue(undefined)
    }))
  };
});

describe('Resource', () => {
  const posts = [
    { id: 1, title: 'First Post' },
    { id: 2, title: 'Second Post' }
  ];
  const uri = '/posts';
  let resource: Resource;

  beforeEach(() => {
    // @ts-ignore
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(posts)
      })
    );
    resource = takeout(uri, {});
  });

  it('can create a resource with /posts and read() returns the expected posts', async () => {
    const collection = await resource.read();
    expect(collection.length).toBe(posts.length);
    const items = Array.from(collection);
    expect(items).toEqual(posts);
  });
});
