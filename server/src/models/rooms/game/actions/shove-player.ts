import type { GameAction, Position } from '@game/shared-types';

import { BaseActionEnt } from './base-action-entity.js';
import { getRandomNeighbor } from './helper.js';
import type { IActionContext } from './types.js';

export class ShovePlayer extends BaseActionEnt {
  override readonly category = 'trick';
  override readonly priority = 1;

  override execute(cmd: GameAction, context: IActionContext): void {
    const player = context.initiator;
    const playerPos = player.getPosition();

    const targetPlayer = getRandomNeighbor(player, context.getPlayers());
    if (!targetPlayer) {
      return;
    }

    const targetPos = targetPlayer.getPosition();
    const dx = targetPos.x - playerPos.x;
    const dy = targetPos.y - playerPos.y;

    // Если цель на той же клетке, выбираем случайное направление пинка
    let pushDx: number;
    let pushDy: number;

    if (dx === 0 && dy === 0) {
      const directions = [
        { dx: 0, dy: -1 }, // вверх
        { dx: 0, dy: 1 }, // вниз
        { dx: -1, dy: 0 }, // влево
        { dx: 1, dy: 0 }, // вправо
      ];
      const chosen = directions[Math.floor(Math.random() * directions.length)]!;
      pushDx = chosen.dx;
      pushDy = chosen.dy;
    } else {
      pushDx = dx;
      pushDy = dy;
    }

    const newTargetPos: Position = {
      x: targetPos.x + pushDx,
      y: targetPos.y + pushDy,
    };

    if (!context.isWalkable(newTargetPos)) {
      return;
    }

    player.setDirectionByCoords(targetPos);
    targetPlayer.setPosition(newTargetPos);
    context.emitEvent({
      type: 'SHOVE',
      sourceId: player.getId(),
      targetId: targetPlayer.getId(),
      from: targetPos,
      to: newTargetPos,
    });
  }

  override getColdown(): number {
    return 3;
  }
}
