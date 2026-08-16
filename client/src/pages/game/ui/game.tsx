import React from 'react';
import Phaser from 'phaser';
import { Flex } from 'antd';
import { observer } from 'mobx-react-lite';
import type { ActionType } from '@game/shared-types';

import { GameScene } from '../model/game-scene';
import { QueueActions } from '../../../features/actions-queue';
import { GameHeader } from './game-header';
import { useGameStore, useUserStore } from '../../../app/providers/store-provider';
import { openWaitingPlayers } from '../../../features/waiting-players';
import { MoveActionPanel, TrickActionPanel } from './actions-panel';
import { createActionItem } from '../../../features/actions';
import { ScreenEffect, ScreenEffectsController } from '../../../features/screen-effects-controller';
import { CELL_SIZE } from '../../../entities/game';

import classes from './game.module.css';

export const Game: React.FC = observer(() => {
  const gameScene = React.useRef<GameScene | null>(null);
  const gameRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController>(null);
  const effectController = React.useMemo(() => new ScreenEffectsController(), []);

  const gameStore = useGameStore();
  const userStore = useUserStore();

  const gameStatus = gameStore.getStatus();
  const playerId = userStore.getUser()!.id;
  const playerSelf = gameStore.getPlayerSelf();

  React.useEffect(() => {
    abortControllerRef.current?.abort();
    if (gameStatus === 'waiting') {
      abortControllerRef.current = new AbortController();
      openWaitingPlayers(abortControllerRef.current.signal);
    } else if (gameStatus === 'playing') {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    }
  }, [gameStatus]);

  React.useEffect(() => {
    const gameElement = gameRef.current!;
    const scene = new GameScene(playerId, gameStore!, effectController);

    const sceneWidth = Math.min(CELL_SIZE * 21, gameElement.clientWidth);
    const sceneHeight = Math.min(CELL_SIZE * 21, gameElement.clientHeight);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: sceneWidth,
      height: sceneHeight,
      parent: gameRef.current!,
      scene: scene,
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      input: {
        keyboard: true,
      },
    };

    let game: Phaser.Game | null = null;
    let disposed = false;

    import('phaser').then(({ default: Phaser }) => {
      if (disposed) {
        return;
      }
      game = new Phaser.Game(config);
      gameScene.current = scene;
    });

    return () => {
      disposed = true;
      game?.destroy(true);
    };
  }, []);

  const addAction = React.useCallback((type: ActionType) => {
    if (!gameStore || !gameScene.current) {
      return;
    }

    if (playerSelf.getQueueAction().length >= gameStore.getMaxActions()) {
      return;
    }

    gameScene.current.setInteractionMode(undefined);
    const { createMode } = createActionItem(type);
    if (createMode) {
      const mode = createMode({
        getGameScene: () => gameScene.current!,
        getWorld: () => gameStore.getWorld(),
        getPlayerSelf: () => playerSelf
      });
      gameScene.current?.setInteractionMode(mode);
    } else {
      playerSelf.addAction(type);
    }
  }, []);

  return (
    <section className={classes.gameContainer}>
      <GameHeader />
      <QueueActions />
      <div className={classes.gameField} style={{ flex: 1 }}>
        <div ref={gameRef} className={classes.gameCanvas} />
      </div>
      <Flex orientation='vertical'>
        <TrickActions addAction={addAction} />
        <MoveActions addAction={addAction} />
      </Flex>
      <ScreenEffect
        ref={(elem) => {
          if (elem) {
            effectController.setContainer(elem);
          }
        }}
      />
    </section>
  );
});

type ActionsProps = {
  addAction(action: ActionType): void;
};

const MoveActions: React.FC<ActionsProps> = observer(({ addAction }) => {
  const gameStore = useGameStore();
  const playerSelf = gameStore.getPlayerSelf();
  const actionBar = playerSelf.getSlots();
  return <MoveActionPanel actions={actionBar.move} onActionClick={addAction} />;
});

const TrickActions: React.FC<ActionsProps> = observer(({ addAction }) => {
  const gameStore = useGameStore();
  const playerSelf = gameStore.getPlayerSelf();
  const actionBar = playerSelf.getSlots();
  return <TrickActionPanel actions={actionBar.trick} onActionClick={addAction} />;
});
