/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ServiceId<T> {
  name: string;
  type: T;
}

export type IContainer = Container;

export class Container {
  private holder = new Map<ServiceId<any>, any>();

  get<T>(id: ServiceId<T>): T | undefined {
    return this.holder.get(id);
  }

  getSilent<T>(id: ServiceId<T>): T {
    const service = this.get(id);
    if (!service) {
      throw new Error(`${id.name} is not registered`);
    }

    return service;
  }

  set<T>(id: ServiceId<T>, instance: T) {
    if (this.holder.has(id)) {
      return;
    }
    this.holder.set(id, instance);
  }
}

export function createDecorator<T>(name: string): ServiceId<T> {
  return { name } as ServiceId<T>;
}
