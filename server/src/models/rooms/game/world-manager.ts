import type { DynamicObject, Field, Position } from '@game/shared-types';
import { v4 } from 'uuid';

import { DynamicObjectEntity } from './dynamic-object-entity.js';
import type { ISerializable } from './serializable.js';

export class WorldManager implements ISerializable<{
  field: Field;
  dynamicObjects: DynamicObject[];
}> {
  private dynamicObjects: DynamicObjectEntity[] = [];
  private field: Field = [];

  setField(field: Field): void {
    this.field = field;
  }

  getField(): Field {
    return this.field;
  }

  isWalkable(pos: Position): boolean {
    const cell = this.field[pos.y]?.[pos.x];
    return (
      cell !== undefined &&
      cell.type !== 'wall' &&
      !this.getDynamicObjectAt(pos)
    );
  }

  buildDynamicObject(obj: DynamicObjectEntity): void {
    this.dynamicObjects.push(obj);
  }

  removeDynamicObject(pos: Position): void {
    this.dynamicObjects = this.dynamicObjects.filter(d => !d.occupiesCell(pos));
  }

  generateId(): string {
    return v4();
  }

  getDynamicObjects(): DynamicObjectEntity[] {
    return this.dynamicObjects;
  }

  serialize() {
    return {
      dynamicObjects: this.dynamicObjects.map(d => d.serialize()),
      field: this.field,
    };
  }

  private getDynamicObjectAt(pos: Position): DynamicObjectEntity | undefined {
    return this.dynamicObjects.find(d => d.occupiesCell(pos));
  }
}
