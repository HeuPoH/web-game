import type {
  ActionType,
  GameEvent,
  LobbyPlayer,
  Position,
  Winner,
} from '@game/shared-types';

import { generateMaze } from '~/lib/maze-generator.js';

import { createAction } from '../actions/registry.js';
import type { IActionContext } from '../actions/types.js';
import { GameEntity } from '../game-entity.js';
import { GamePlayerEntity } from '../game-player-entity.js';

export class MazeEntity extends GameEntity {
  private finishPos: Position = { x: 0, y: 0 };

  override initialize(players: LobbyPlayer[]): void {
    const { maze, start, finish } = generateMaze(10, 10);
    this.players = players.map(
      p =>
        new GamePlayerEntity(
          {
            userId: p.userId,
            login: p.login,
            connected: false,
            color: p.color,
          },
          {
            getQueueLimit: () =>
              this.gameOwner.getGameSettings().maxCommandsPerPlayer,
          },
          [
            'step_left',
            'step_up',
            'step_down',
            'step_right',
            'destroy_wall',
            ...this.getRandomSkills(),
          ],
        ),
    );

    this.worldManager.setField(maze);
    this.finishPos = finish;
    // eslint-disable-next-line unicorn/no-array-for-each
    this.players.forEach(p => p.setPosition(start));
  }

  protected override processTickImpl(): void {
    this.pendingEvents = [];
    const queue = this.players.toSorted((a, b) => {
      const nextA = a.getNextAction();
      const nextB = b.getNextAction();

      const priorityA = nextA
        ? (createAction(nextA.type)?.priority ?? 999)
        : 999;
      const priorityB = nextB
        ? (createAction(nextB.type)?.priority ?? 999)
        : 999;

      // Сначала сортируем по приоритету
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Если приоритеты равны — сортируем по времени добавления (раньше — первее)
      const timestampA = nextA?.timestamp ?? Infinity;
      const timestampB = nextB?.timestamp ?? Infinity;
      return timestampA - timestampB;
    });

    // 1. Выполняем первые команды игроков
    for (const player of queue) {
      const context: IActionContext = {
        initiator: player,
        isWalkable: pos => this.worldManager.isWalkable(pos),
        buildDynamicObject: obj => this.worldManager.buildDynamicObject(obj),
        getPlayers: () => this.players,
        emitEvent: (event: GameEvent) => this.pendingEvents.push(event),
        removeDynamicObject: pos => {
          this.worldManager.removeDynamicObject(pos);
        },
      };

      player.tick(context);
    }

    // 2. Проверка финиша
    const winners: Winner[] = [];
    for (const player of this.players) {
      if (this.isPlayerFinished(player.getPosition())) {
        const p = player.serialize();
        winners.push({
          userId: p.identity.userId,
          color: p.identity.color,
          login: p.identity.login,
        });
      }
    }

    // 3. Отправляем пакеты
    this.emitter.emit('tickProcessed', this.getTickState());

    // 4. Если есть победители – завершаем игру
    if (winners.length > 0) {
      this.updateGameStatus({ status: 'finished', winners });
    }
  }

  private isPlayerFinished(pos: Position): boolean {
    return pos.x === this.finishPos.x && pos.y === this.finishPos.y;
  }

  private getRandomSkills(): ActionType[] {
    const skills: ActionType[] = [
      'build_wall',
      'shove',
      'throw',
      'jump',
      'pull',
      'swap',
    ];

    const shuffled = skills.toSorted(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }
}
