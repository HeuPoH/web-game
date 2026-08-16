import { Factory, type FactoryItem, type IFactory } from '~/lib/factory.js';

import type { GameEntity } from '../game-entity.js';
import type { GameOwner } from '../types.js';
import { MazeEntity } from './maze-entity.js';

type GameEntityFactoryItem = {
  entity: (gameOwner: GameOwner) => GameEntity;
} & FactoryItem;
type GameEntitiesFactory = IFactory<GameEntityFactoryItem>;

let factory: GameEntitiesFactory | undefined;
export function getGameEntitiesFactory() {
  if (!factory) {
    factory = new Factory<GameEntityFactoryItem>();
    registerGameEntities(factory);
  }

  return factory;
}

function registerGameEntities(factory: GameEntitiesFactory) {
  factory.register('maze', {
    label: 'Лабиринт',
    type: 'maze',
    entity: (gameOwner: GameOwner) => new MazeEntity(gameOwner),
  });
}
