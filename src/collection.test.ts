import { describe, it, expect } from 'vitest';
import { Collection } from './collection';

describe('Collection', () => {
  it('should act as an array when instantiated with an array of objects', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const collection = new Collection(items);

    expect(collection.length).toBe(items.length);

    const collectionItems = [];
    for (const item of collection) {
      collectionItems.push(item);
    }

    expect(collectionItems).toEqual(items);
  });
});
