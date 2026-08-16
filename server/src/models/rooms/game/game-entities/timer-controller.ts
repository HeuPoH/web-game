import type { GameEntity } from '../game-entity.js';

export class TimerController {
  private game: GameEntity;
  private timer?: NodeJS.Timeout;

  constructor(game: GameEntity) {
    this.game = game;
  }

  startLoop(ms: number) {
    this.timer = setInterval(() => {
      try {
        if (this.game.getStatus() !== 'playing') {
          return;
        }
        this.game.processTick();
      } catch {
        /* empty */
      }
    }, ms);
  }

  stopLoop(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
