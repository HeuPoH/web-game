import type { GameAction } from '@game/shared-types';

import { BaseActionEnt } from './base-action-entity.js';
import type { IActionContext } from './types.js';

export class MoveUp extends BaseActionEnt {
  override readonly priority = 2;
  override readonly category = 'move';

  override execute(_: GameAction, context: IActionContext) {
    const player = context.initiator;
    const target = player.getNextCell('up');

    if (!context.isWalkable(target)) {
      return;
    }

    player.setPosition(target);
    player.setDirection('up');
    context.emitEvent({
      type: 'VOLUNTARY_MOVE',
      playerId: player.getId(),
      from: player.getPosition(),
      to: target,
    });
  }
}

export class MoveDown extends BaseActionEnt {
  override readonly priority = 2;
  override readonly category = 'move';

  override execute(_: GameAction, context: IActionContext) {
    const player = context.initiator;
    const target = player.getNextCell('down');

    if (!context.isWalkable(target)) {
      return;
    }

    player.setPosition(target);
    player.setDirection('down');
    context.emitEvent({
      type: 'VOLUNTARY_MOVE',
      playerId: player.getId(),
      from: player.getPosition(),
      to: target,
    });
  }
}

export class MoveLeft extends BaseActionEnt {
  override readonly priority = 2;
  override readonly category = 'move';

  override execute(_: GameAction, context: IActionContext) {
    const player = context.initiator;
    const target = player.getNextCell('left');

    if (!context.isWalkable(target)) {
      return;
    }

    player.setPosition(target);
    player.setDirection('left');
    context.emitEvent({
      type: 'VOLUNTARY_MOVE',
      playerId: player.getId(),
      from: player.getPosition(),
      to: target,
    });
  }
}

export class MoveRight extends BaseActionEnt {
  override readonly priority = 2;
  override readonly category = 'move';

  override execute(_: GameAction, context: IActionContext) {
    const player = context.initiator;
    const target = player.getNextCell('right');

    if (!context.isWalkable(target)) {
      return;
    }

    player.setPosition(target);
    player.setDirection('right');
    context.emitEvent({
      type: 'VOLUNTARY_MOVE',
      playerId: player.getId(),
      from: player.getPosition(),
      to: target,
    });
  }
}
