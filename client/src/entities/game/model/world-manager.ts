import { makeAutoObservable, runInAction } from 'mobx';
import type {
  ClientGameState,
  DynamicObject,
  Field,
  GameEvent,
  GamePlayerRenderData,
  ServerPacket
} from '@game/shared-types';

export const CELL_SIZE = 32;
export const HALF_CELL_SIZE = CELL_SIZE / 2;

export const PLAYER_FRAMES: Record<string, string> = {
  up: 'player_up_01.png',
  down: 'player_down_01.png',
  left: 'player_left_01.png',
  right: 'player_right_01.png',
} as const;

export const FRAMES = {
  TARGET: 'target.png',
  WOOD_WALL: 'wood-wall.png',
  CREATE_WOOD_WALL: 'create-wall.png',
  BRICK_WALL: 'brick-wall.png',
  GROUND: 'ground.png',
} as const;

export type FrameKey = keyof typeof FRAMES;

export class WorldManager {
  private players: GamePlayerRenderData[] = [];
  private dynamicObjects: DynamicObject[] = [];
  private pendingEvents: GameEvent[] = [];
  private field: Field = [];

  constructor() {
    makeAutoObservable(this);
  }

  getPendingEventsOnce() {
    const events = this.pendingEvents;
    this.pendingEvents = [];
    return events;
  }

  getPlayersDataRender(): GamePlayerRenderData[] {
    return this.players;
  }

  getDynamicObjects(): DynamicObject[] {
    return this.dynamicObjects;
  }

  getField(): Field {
    return this.field;
  }

  isCellEmpty(x: number, y: number): boolean {
    const tile = this.field[y]?.[x];
    if (!tile) {
      return false;
    }

    if (tile.type === 'wall') {
      return false;
    }

    if (this.getDynamicObjectAt(x, y)) {
      return false;
    }

    if (this.getPlayerAt(x, y)) {
      return false;
    }

    return true;
  }

  getDynamicObjectAt(x: number, y: number): DynamicObject | undefined {
    return this.dynamicObjects.find(
      obj => obj.position.x === x && obj.position.y === y
    );
  }

  getPlayerAt(x: number, y: number): GamePlayerRenderData | undefined {
    return this.players.find(
      p => p.position.x === x && p.position.y === y
    );
  }

  getPlayersPositions(): Array<{ userId: string; position: { x: number; y: number } }> {
    return this.players.map(p => ({
      userId: p.userId,
      position: p.position,
    }));
  }

  initialized = (data: { game: ClientGameState }): void => {
    runInAction(() => {
      this.field = data.game.state.field;
      this.players = data.game.state.players;
      this.dynamicObjects = data.game.state.dynamicObjects;
    });
  };

  tickProcessed = (packet: ServerPacket): void => {
    runInAction(() => {
      this.players = packet.state.players;
      this.dynamicObjects = packet.state.dynamicObjects;
      if (packet.events) {
        this.pendingEvents = packet.events;
      }
    });
  };
}
