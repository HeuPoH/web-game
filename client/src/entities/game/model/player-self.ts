import { makeAutoObservable, runInAction } from 'mobx';
import type { GameAction, ActionBarState, ActionType } from '@game/shared-types';
import type { PlayerSocketController } from './player-socket-controller';

export class PlayerSelf {
  private queue: GameAction[] = [];
  private slots: ActionBarState = { trick: [], move: [] };

  constructor(
    private playerId: string,
    private socketController: PlayerSocketController
  ) {
    makeAutoObservable(this);
  }

  getId() {
    return this.playerId;
  }

  registerSocketHandles() {
    this.socketController.registerHandlers({
      selfPlayerUpdated: this.selfPlayerUpdated
    });
  }

  unregisterSocketHandles() {
    this.socketController.unregisterHandlers();
  }

  deleteActions(ids: string[]) {
    this.socketController.sendDeleteActions(ids);
  }

  addAction(type: ActionType, params?: { x: number; y: number }) {
    this.socketController.sendAddAction(type, params);
  }

  getQueueAction() {
    return this.queue;
  }

  getMaxActions() {
    return 999;
  }

  getSlots() {
    return this.slots;
  }

  selfPlayerUpdated = (data: { queue: GameAction[]; slots: ActionBarState }) => {
    runInAction(() => {
      this.queue = data.queue;
      this.slots = data.slots;
    });
  };
}
