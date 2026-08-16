import type { GameAction } from '@game/shared-types';

import { BaseActionEnt } from './base-action-entity.js';
import { getRandomNeighbor } from './helper.js';
import type { IActionContext } from './types.js';

export class SwapPlayer extends BaseActionEnt {
  override readonly category = 'trick';
  override readonly priority = 1;

  override execute(cmd: GameAction, context: IActionContext): void {
    const player = context.initiator;
    const playerPos = player.getPosition();

    const targetPlayer = getRandomNeighbor(player, context.getPlayers(), 2);
    if (!targetPlayer) {
      return;
    }

    const targetPlayerPos = targetPlayer.getPosition();

    player.setPosition(targetPlayerPos);
    targetPlayer.setPosition(playerPos);

    context.emitEvent({
      type: 'SWAP',
      playerId1: player.getId(),
      playerId2: targetPlayer.getId(),
      pos1: playerPos,
      pos2: targetPlayerPos,
    });
  }

  override getColdown(): number {
    return 4;
  }
}
