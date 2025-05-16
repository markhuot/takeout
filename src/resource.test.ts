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

  it('calls fetch with POST and correct body when create is called', async () => {
    const newPost = { title: 'New Post' };
    const mockResponse = { id: 3, title: 'New Post' };
    const fetchMock = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    }));
    // @ts-ignore
    global.fetch = fetchMock;
    const result = await resource.create(newPost);
    expect(fetchMock).toHaveBeenCalledWith(
      uri,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newPost),
        headers: expect.objectContaining({ 'Content-Type': 'application/json' })
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('calls fetch with the uri option if provided to create()', async () => {
    const newPost = { title: 'Another Post' };
    const customUri = '/custom-posts';
    const mockResponse = { id: 99, title: 'Another Post' };
    const fetchMock = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    }));
    // @ts-ignore
    global.fetch = fetchMock;
    await resource.create(newPost, { uri: customUri });
    expect(fetchMock).toHaveBeenCalledWith(
      customUri,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(newPost),
        headers: expect.objectContaining({ 'Content-Type': 'application/json' })
      })
    );
  });

  it('prepends multiple optimistic resources to the read() results', async () => {
    // Arrange: mock fetch for read to always return the original posts
    const posts = [
      { id: 1, title: 'First Post' },
      { id: 2, title: 'Second Post' }
    ];
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(posts)
    }));
    resource = takeout(uri, {});

    // Mock fetch for create to return a new post with an id
    const createResponses = [
      { id: 10, title: 'Optimistic 1' },
      { id: 11, title: 'Optimistic 2' }
    ];
    let createCall = 0;
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(createResponses[createCall++])
    }));

    // Act: create two resources optimistically
    await resource.create({ title: 'Optimistic 1' });
    await resource.create({ title: 'Optimistic 2' });

    // Now mock fetch for read again to return the original posts
    // @ts-ignore
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(posts)
    }));

    // Act: call read
    const collection = await resource.read();
    const items = Array.from(collection);

    // Assert: the two optimistic resources are prepended in order of creation (most recent first)
    expect(items[0]).toEqual({ id: 11, title: 'Optimistic 2' });
    expect(items[1]).toEqual({ id: 10, title: 'Optimistic 1' });
    expect(items.slice(2)).toEqual(posts);
    expect(collection.length).toBe(4);
  });
});
