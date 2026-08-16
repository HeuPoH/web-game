import type { Position } from '@game/shared-types';
import { InteractionMode } from './interaction';
import { CELL_SIZE, FRAMES, HALF_CELL_SIZE } from '../../../entities/game';

export class BuildWallMode extends InteractionMode {
  private sprites: Phaser.GameObjects.Sprite[] = [];
  private allowedCells: Position[] = [];

  start(): void {
    const world = this.owner.getWorld();
    const playerSelf = this.owner.getPlayerSelf();
    const scene = this.owner.getGameScene();
    const player = world.getPlayersDataRender().find(p => p.userId === playerSelf.getId())!;
    const { x, y } = player.position;

    const aroundCells = [
      { x, y: y - 1 },
      { x: x + 1, y },
      { x, y: y + 1},
      { x: x - 1, y }
    ];

    aroundCells.forEach(a => {
      if (world.isCellEmpty(a.x, a.y)) {
        const sprite = scene.createSprite(
          a.x * CELL_SIZE + HALF_CELL_SIZE,
          a.y * CELL_SIZE + HALF_CELL_SIZE,
          FRAMES.CREATE_WOOD_WALL
        );
        sprite.setDisplaySize(CELL_SIZE, CELL_SIZE);
        this.sprites.push(sprite);
        this.allowedCells.push({ x: a.x, y: a.y });
      }
    });
  }

  processing() {
  }

  stop() {
    this.sprites.forEach(s => s.destroy());
  }

  onCellClick(x: number, y: number): void {
    const isAllowed = this.allowedCells.some(c => c.x === x && c.y === y);
    if (isAllowed) {
      this.owner.getPlayerSelf().addAction('build_wall', { x, y });
    }
  }
}
