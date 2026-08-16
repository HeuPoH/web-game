import type {
  ActionType,
  Direction,
  GameAction,
  GamePlayerIdentity,
  GamePlayerRenderData,
  Position,
} from '@game/shared-types';

import type { GamePlayerData, PrivatePlayerState } from '../types.js';
import { ActionManager } from './action-manager.js';
import type { IActionContext } from './actions/types.js';
import type { ISerializable } from './serializable.js';

type Owner = {
  getQueueLimit: () => number;
};

export class GamePlayerEntity implements ISerializable<{
  self: PrivatePlayerState;
  identity: GamePlayerIdentity;
  renderData: GamePlayerRenderData;
}> {
  private queue: GameAction[] = [];
  private direction: Direction = 'down';
  private position: Position = { x: 0, y: 0 };
  private actionManager: ActionManager;

  constructor(
    private playerData: GamePlayerData,
    private owner: Owner,
    availableActions: ActionType[],
  ) {
    this.actionManager = new ActionManager(availableActions);
  }

  isConnected() {
    return this.playerData.connected;
  }

  getId() {
    return this.playerData.userId;
  }

  setConnectedFlag(flag: boolean) {
    if (this.playerData.connected === flag) {
      return false;
    }

    this.playerData.connected = flag;
    return true;
  }

  deleteActions(actionIds: string[]) {
    const prevTotal = this.queue.length;
    this.queue = this.queue.filter(cmd => !actionIds.includes(cmd.id));
    return prevTotal !== this.queue.length;
  }

  addAction(action: GameAction) {
    if (this.queue.length >= this.owner.getQueueLimit()) {
      return false;
    }
    this.queue.push(action);
    return true;
  }

  setPosition(nextPosition: Position) {
    if (
      nextPosition.x === this.position.x &&
      nextPosition.y === this.position.y
    ) {
      return false;
    }

    this.position = nextPosition;
    return true;
  }

  getDirection() {
    return this.direction;
  }

  setDirection(direction: Direction) {
    this.direction = direction;
  }

  setDirectionByCoords(target: Position) {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    if (dy > 0) {
      this.direction = 'down';
    } else if (dy < 0) {
      this.direction = 'up';
    } else if (dx > 0) {
      this.direction = 'right';
    } else if (dx < 0) {
      this.direction = 'left';
    }
  }

  getPosition() {
    return this.position;
  }

  tick(context: IActionContext) {
    this.actionManager.tick();
    this.executeAction(context);
  }

  getNextCell(direction: Direction = this.direction, distance = 1) {
    const { x, y } = this.position;
    switch (direction) {
      case 'up': {
        return { x, y: y - distance };
      }
      case 'down': {
        return { x, y: y + distance };
      }
      case 'left': {
        return { x: x - distance, y };
      }
      case 'right': {
        return { x: x + distance, y };
      }
    }
  }

  getBehindCell(): Position {
    const { x, y } = this.position;
    switch (this.direction) {
      case 'up': {
        return { x, y: y + 1 };
      } // за спиной – вниз
      case 'down': {
        return { x, y: y - 1 };
      } // за спиной – вверх
      case 'left': {
        return { x: x + 1, y };
      } // за спиной – вправо
      case 'right': {
        return { x: x - 1, y };
      } // за спиной – влево
    }
  }

  getNeighborCells(sameCell = true, distance = 1) {
    const cells = [
      { x: this.position.x, y: this.position.y - distance }, // вверх
      { x: this.position.x, y: this.position.y + distance }, // вниз
      { x: this.position.x - distance, y: this.position.y }, // влево
      { x: this.position.x + distance, y: this.position.y }, // вправо
    ];

    if (sameCell) {
      cells.push({ x: this.position.x, y: this.position.y }); // та же клетка
    }

    return cells;
  }

  serialize() {
    return {
      self: {
        userId: this.playerData.userId,
        queue: this.queue,
        slots: this.actionManager.serialize(),
      },
      identity: {
        userId: this.playerData.userId,
        login: this.playerData.login,
        connected: this.playerData.connected,
        color: this.playerData.color,
      },
      renderData: {
        userId: this.playerData.userId,
        position: this.position,
        direction: this.direction,
      },
    };
  }

  getNextAction() {
    return this.queue[0];
  }

  private executeAction(context: IActionContext) {
    const cmd = this.queue.shift();
    if (cmd) {
      this.actionManager.useAction(cmd, context);
    }
  }
}
