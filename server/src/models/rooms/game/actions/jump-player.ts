import type { GameAction } from '@game/shared-types';

import { BaseActionEnt } from './base-action-entity.js';
import type { IActionContext } from './types.js';

export class JumpPlayer extends BaseActionEnt {
  override readonly category = 'trick';
  override readonly priority = 1;

  override execute(cmd: GameAction, context: IActionContext): void {
    const player = context.initiator;
    const nextFirstCell = player.getNextCell();
    if (!context.isWalkable(nextFirstCell)) {
      return;
    }

    const currentPlayerPos = player.getPosition();
    const nextSecondCell = player.getNextCell(undefined, 2);
    if (!context.isWalkable(nextSecondCell)) {
      player.setPosition(nextFirstCell);
      context.emitEvent({
        type: 'JUMP',
        playerId: player.getId(),
        from: currentPlayerPos,
        to: nextFirstCell,
      });
      return;
    }

    player.setPosition(nextSecondCell);
    context.emitEvent({
      type: 'JUMP',
      playerId: player.getId(),
      from: currentPlayerPos,
      to: nextSecondCell,
    });
  }

  override getColdown(): number {
    return 5;
  }
}
