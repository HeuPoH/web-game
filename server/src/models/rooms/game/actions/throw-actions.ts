import type { GameAction, Position } from '@game/shared-types';

import { BaseActionEnt } from './base-action-entity.js';
import { getRandomNeighbor } from './helper.js';
import type { IActionContext } from './types.js';

export class ThrowPlayer extends BaseActionEnt {
  override readonly category = 'trick';
  override readonly priority = 1;

  override execute(cmd: GameAction, context: IActionContext): void {
    const player = context.initiator;
    const targetPlayer = getRandomNeighbor(player, context.getPlayers());
    if (!targetPlayer) {
      return;
    }

    const targetPos = targetPlayer.getPosition();
    const playerPos = player.getPosition();

    let behindCell: Position;
    // eslint-disable-next-line unicorn/prefer-ternary
    if (targetPos.x === playerPos.x && targetPos.y === playerPos.y) {
      // Если цель на той же клетке – бросаем строго за спину (противоположно взгляду)
      behindCell = player.getBehindCell();
    } else {
      // Иначе перекидываем через инициатора в противоположную сторону
      behindCell = {
        x: 2 * playerPos.x - targetPos.x,
        y: 2 * playerPos.y - targetPos.y,
      };
    }

    if (!context.isWalkable(behindCell)) {
      return;
    }

    player.setDirectionByCoords(targetPos);
    targetPlayer.setPosition(behindCell);
    context.emitEvent({
      type: 'THROW',
      sourceId: player.getId(),
      targetId: targetPlayer.getId(),
      from: targetPos,
      to: behindCell,
    });
  }

  override getColdown(): number {
    return 3;
  }
}
