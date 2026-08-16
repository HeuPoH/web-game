import type { GameScene } from '../../../pages/game/model/game-scene';
import type { WorldManager } from '../../../entities/game/model/world-manager';
import type { PlayerSelf } from '../../../entities/game/model/player-self';

export abstract class InteractionMode {
  constructor(protected owner: InteractionOwner) {}
  /** Вызывается при входе в режим (активации скилла) */
  abstract start(): void;
  /** Вызывается каждый кадр в GameScene.update() — обновляет подсветку/индикаторы */
  abstract processing(): void;
  /** Вызывается при выходе из режима (отмена/завершение) */
  abstract stop(): void;
  /** Обработка клика по клетке */
  abstract onCellClick(x: number, y: number): void;
}

export type InteractionOwner = {
  getWorld(): WorldManager;
  getPlayerSelf(): PlayerSelf;
  getGameScene(): GameScene;
};
