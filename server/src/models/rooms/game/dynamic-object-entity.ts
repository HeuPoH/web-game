import type { DynamicObject, Position } from '@game/shared-types';

import type { ISerializable } from './serializable.js';

export class DynamicObjectEntity implements ISerializable<DynamicObject> {
  constructor(private data: DynamicObject) {}

  serialize() {
    return this.data;
  }

  occupiesCell(pos: Position): boolean {
    return this.data.position.x === pos.x && this.data.position.y === pos.y;
  }
}
