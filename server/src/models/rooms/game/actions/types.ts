import type { GameAction, GameEvent, Position } from '@game/shared-types';

import type { DynamicObjectEntity } from '../dynamic-object-entity.js';
import type { GamePlayerEntity } from '../game-player-entity.js';

export interface IActionContext {
  /** Игрок, выполняющий действие */
  initiator: GamePlayerEntity;
  /** Список игроков */
  getPlayers: () => GamePlayerEntity[];
  /** Список событий для анимирования */
  emitEvent: (event: GameEvent) => void;
  /** Доступ к полю (для проверок проходимости) */
  isWalkable: (pos: Position) => boolean;
  /** Построить динамический объект (стена, яма) */
  buildDynamicObject: (obj: DynamicObjectEntity) => void;
  /** Удалить динамический объект по позиции */
  removeDynamicObject: (pos: Position) => void;
}

export interface IAction {
  execute(cmd: GameAction, context: IActionContext): void;
}
