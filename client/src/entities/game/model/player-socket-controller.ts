import type { GameAction, ActionBarState, ActionType } from '@game/shared-types';
import type { TypedGameSocket } from '../../../shared/api';
import { SocketController } from '../../../shared/utils/socket-controller';

type Handlers = {
  selfPlayerUpdated: (data: { queue: GameAction[]; slots: ActionBarState }) => void;
};

export class PlayerSocketController extends SocketController<Handlers> {
  constructor(socket: TypedGameSocket) {
    super(socket);
  }

  sendAddAction(type: ActionType, params?: { x: number; y: number }): void {
    this.socket.emit('addCommand', { type, params });
  }

  sendDeleteActions(ids: string[]): void {
    this.socket.emit('deleteCommands', { commandIds: ids });
  }
}
