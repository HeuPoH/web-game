export interface FactoryItem {
  label: string;
  type: string;
}

export interface IFactory<T extends FactoryItem = FactoryItem> {
  register(type: string, item: T): void;
  getRegistered(type: string): T | undefined;
  getAllRegistered(): T[];
  getFirstRegisteredItem(): T | undefined;
}

export class Factory<
  T extends FactoryItem = FactoryItem,
> implements IFactory<T> {
  private items = new Map<string, T>();

  register(type: string, item: T): void {
    if (this.items.has(type)) {
      throw new Error(`${type} уже зарегистрирован'`);
    }

    this.items.set(type, item);
  }

  getRegistered(type: string): T | undefined {
    const regItem = this.items.get(type);
    if (!regItem) {
      throw new Error(`${type} не зарегистрирован`);
    }

    return regItem;
  }

  getAllRegistered(): T[] {
    return [...this.items.values()];
  }

  getFirstRegisteredItem(): T | undefined {
    return this.items.values().next().value;
  }
}
