export class Collection {
  private items: object[];

  constructor(items: object[]) {
    this.items = items;
  }

  get length(): number {
    return this.items.length;
  }

  *[Symbol.iterator](): Iterator<object> {
    for (const item of this.items) {
      yield item;
    }
  }
}
