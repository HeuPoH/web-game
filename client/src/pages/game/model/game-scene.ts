import Phaser from 'phaser';
import type { GameEvent, GamePlayerRenderData, Tile } from '@game/shared-types';

import type { GameStore } from '../../../entities/game';
import type { InteractionMode } from '../../../features/actions/interaction-mode/interaction';
import {
  CELL_SIZE,
  HALF_CELL_SIZE,
  PLAYER_FRAMES,
  FRAMES,
} from '../../../entities/game/model/world-manager';
import type { ScreenEffectsController } from '../../../features/screen-effects-controller';

const GAME_ATLAS = 'game-atlas';
const GAME_SCENE = 'game-scene';

export class GameScene extends Phaser.Scene {
  private currentInteractionMode?: InteractionMode;
  private playerSprites!: Map<string, Phaser.GameObjects.Sprite>;
  private prevPlayerState!: Map<string, { x: number; y: number; direction: string }>;
  private gameStore: GameStore;
  private tileSprites: { sprite: Phaser.GameObjects.Sprite; col: number; row: number }[] = [];
  private dynamicSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private fogRadius: number = 3;
  private blendRadius: number = 0.5;
  private playerId: string;

  private skipMovementFor: Set<string> = new Set();
  private animatingPlayers: Set<string> = new Set();

  private spriteOriginalScales: Map<string, { scaleX: number; scaleY: number }> = new Map();

  private centerButton?: Phaser.GameObjects.Container;

  // ---------- Drag-to-pan ----------
  private readonly DRAG_THRESHOLD = 8;
  private readonly MAX_SCROLL_CHANGE = 10;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private dragStartCamScrollX: number = 0;
  private dragStartCamScrollY: number = 0;

  private readonly floorFrames: Record<number, string> = {
    0: 'ground.png',
    1: 'ground_01.png',
    2: 'ground_02.png',
  };

  private readonly wallFrame = 'brick-wall.png';

  constructor(
    playerId: string,
    gameStore: GameStore,
    private effectController: ScreenEffectsController,
  ) {
    super(GAME_SCENE);
    this.playerId = playerId;
    this.gameStore = gameStore;
  }

  preload() {
    this.load.atlas(GAME_ATLAS, '/assets/game-atlas.png', '/assets/game-atlas.json');
  }

  create() {
    const world = this.gameStore.getWorld();
    const field = world.getField();
    this.drawField(field);
    this.createPlayerAnimations();
    this.createPlayers();

    const mapWidth = field[0].length * CELL_SIZE;
    const mapHeight = field.length * CELL_SIZE;
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    if (!this.textures.exists('teleport-particle')) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0x44aaff, 1);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture('teleport-particle', 16, 16);
      graphics.destroy();
    }

    this.createClouds();
    this.createCenterButton();
    this.setupDragPan();
    this.updateFog();
    this.setupFieldClick();
  }

  update() {
    const world = this.gameStore.getWorld();
    const events = world.getPendingEventsOnce();
    if (events.length > 0) {
      this.processEvents(events);
    }

    this.updatePlayers();
    this.updateDynamicObjects();
    this.updateFog();
    this.currentInteractionMode?.processing();
  }

  createSprite(x: number, y: number, frame: string) {
    return this.add.sprite(x, y, GAME_ATLAS, frame);
  }

  setInteractionMode(mode?: InteractionMode) {
    if (this.currentInteractionMode) {
      this.currentInteractionMode.stop();
    }
    this.currentInteractionMode = mode;
    this.currentInteractionMode?.start();
  }

  getInteractionMode() {
    return this.currentInteractionMode;
  }

  private createCloudTexture() {
    if (this.textures.exists('cloud-sprite')) return;

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 10;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(80, 40, 55, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(80, 28, 48, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(80, 16, 38, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    const fluffs = [
      { x: 55, y: 30, w: 28, h: 11 },
      { x: 105, y: 28, w: 30, h: 12 },
      { x: 70, y: 18, w: 25, h: 10 },
      { x: 90, y: 16, w: 25, h: 11 },
      { x: 80, y: 10, w: 32, h: 10 },
    ];

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (const fluff of fluffs) {
      ctx.beginPath();
      ctx.ellipse(fluff.x, fluff.y, fluff.w, fluff.h, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    this.textures.addCanvas('cloud-sprite', canvas);
  }

  private createClouds() {
    this.createCloudTexture();
    for (let i = 0; i < 5; i++) {
      this.createSingleCloud(true);
    }
  }

  private createSingleCloud(randomDelay: boolean = false) {
    const world = this.gameStore.getWorld();
    const field = world.getField();
    const mapWidth = field[0].length * CELL_SIZE;
    const mapHeight = field.length * CELL_SIZE;

    const delay = randomDelay ? Phaser.Math.Between(0, 4000) : 0;

    this.time.delayedCall(delay, () => {
      const cloud = this.add.sprite(0, 0, 'cloud-sprite');

      const scaleX = Phaser.Math.FloatBetween(0.7, 1.4);
      const scaleY = Phaser.Math.FloatBetween(0.5, 0.9);
      cloud.setScale(scaleX, scaleY);
      cloud.setAlpha(Phaser.Math.FloatBetween(0.04, 0.07));
      cloud.setDepth(50);

      const goingRight = Math.random() > 0.5;
      const cloudWidth = 160 * scaleX;
      const startX = goingRight ? -cloudWidth : mapWidth + cloudWidth;
      const startY = Phaser.Math.Between(0, mapHeight - 64 * scaleY);
      cloud.setPosition(startX, startY);

      const speed = Phaser.Math.Between(8, 20);
      const targetX = goingRight ? mapWidth + cloudWidth : -cloudWidth;

      this.tweens.add({
        targets: cloud,
        x: targetX,
        duration: (Math.abs(targetX - startX) / speed) * 1000,
        ease: 'Linear',
        onComplete: () => {
          cloud.destroy();
          this.time.delayedCall(Phaser.Math.Between(5000, 12000), () => {
            this.createSingleCloud();
          });
        },
      });
    });
  }

  private createCenterButton() {
    const size = 30;
    const x = this.cameras.main.width - size * 0.6;
    const y = size * 0.6;

    this.centerButton = this.add.container(x, y)
      .setSize(size, size)
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0.4)
      .setInteractive();

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.3);
    bg.fillCircle(2, 2, size / 2);
    bg.fillStyle(0x111122, 0.8);
    bg.fillCircle(0, 0, size / 2);
    bg.lineStyle(2, 0x88aaff, 0.6);
    bg.strokeCircle(0, 0, size / 2);
    this.centerButton.add(bg);

    const icon = this.add.graphics();
    icon.lineStyle(2.5, 0xddeeff, 0.9);
    icon.strokeCircle(0, 0, 7);
    icon.beginPath();
    icon.moveTo(-4, 0); icon.lineTo(4, 0);
    icon.moveTo(0, -4); icon.lineTo(0, 4);
    icon.strokePath();
    this.centerButton.add(icon);

    this.centerButton.on('pointerover', () => {
      this.tweens.killTweensOf(this.centerButton!);
      this.tweens.add({ targets: this.centerButton, alpha: 1, scaleX: 1.1, scaleY: 1.1, duration: 100 });
    });
    this.centerButton.on('pointerout', () => {
      this.tweens.killTweensOf(this.centerButton!);
      this.tweens.add({ targets: this.centerButton, alpha: 0.4, scaleX: 1, scaleY: 1, duration: 100 });
    });
    this.centerButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      const playerSprite = this.playerSprites.get(this.playerId);
      if (playerSprite) {
        this.cameras.main.pan(playerSprite.x, playerSprite.y, 300);
        this.tweens.add({ targets: this.centerButton, alpha: 0.2, duration: 200 });
      }
    });
  }

  // ─── Анимационные события ─────────────────

  private processEvents(events: GameEvent[]): void {
    this.skipMovementFor.clear();

    for (const event of events) {
      switch (event.type) {
      case 'SHOVE': {
        const sourceSprite = this.playerSprites.get(event.sourceId);
        const targetSprite = this.playerSprites.get(event.targetId);

        if (sourceSprite) {
          this.tweens.killTweensOf(sourceSprite);
          this.animatingPlayers.add(event.sourceId);

          const originalX = sourceSprite.x;
          const originalY = sourceSprite.y;
          const origScale = this.spriteOriginalScales.get(event.sourceId)!;
          const dir = this.getShoveDirection(event.from, event.to);
          const lungeDistance = 10;

          let lungeX = 0, lungeY = 0;
          switch (dir) {
          case 'up':    lungeY = -lungeDistance; break;
          case 'down':  lungeY =  lungeDistance; break;
          case 'left':  lungeX = -lungeDistance; break;
          case 'right': lungeX =  lungeDistance; break;
          }

          sourceSprite.setFrame(PLAYER_FRAMES[dir]);

          this.tweens.add({
            targets: sourceSprite,
            x: originalX + lungeX,
            y: originalY + lungeY,
            scaleX: origScale.scaleX * 1.3,
            scaleY: origScale.scaleY,
            duration: 80,
            yoyo: true,
            ease: 'Sine.easeIn',
            onComplete: () => {
              sourceSprite.x = originalX;
              sourceSprite.y = originalY;
              sourceSprite.scaleX = origScale.scaleX;
              sourceSprite.scaleY = origScale.scaleY;
              sourceSprite.setFrame(PLAYER_FRAMES[dir]);
              this.animatingPlayers.delete(event.sourceId);
            },
          });

          this.prevPlayerState.set(event.sourceId, {
            x: event.from.x,
            y: event.from.y,
            direction: dir,
          });
        }

        if (targetSprite) {
          const startX = event.from.x * CELL_SIZE + HALF_CELL_SIZE;
          const startY = event.from.y * CELL_SIZE + HALF_CELL_SIZE;
          const endX = event.to.x * CELL_SIZE + HALF_CELL_SIZE;
          const endY = event.to.y * CELL_SIZE + HALF_CELL_SIZE;

          if (event.from.x === event.to.x && event.from.y === event.to.y) break;

          targetSprite.x = startX;
          targetSprite.y = startY;
          this.animatingPlayers.add(event.targetId);

          this.tweens.add({
            targets: targetSprite,
            x: endX,
            y: endY,
            duration: 350,
            ease: 'Cubic.easeOut',
            onUpdate: (tween) => {
              const progress = tween.progress;
              const arcHeight = 12;
              const yOffset = Math.sin(progress * Math.PI) * arcHeight;
              targetSprite.y = startY + (endY - startY) * progress - yOffset;
            },
            onComplete: () => {
              targetSprite.x = endX;
              targetSprite.y = endY;
              targetSprite.setFrame(PLAYER_FRAMES[this.getPlayerDirection(event.targetId)]);
              this.animatingPlayers.delete(event.targetId);
            },
          });

          this.prevPlayerState.set(event.targetId, {
            x: event.to.x,
            y: event.to.y,
            direction: this.prevPlayerState.get(event.targetId)?.direction ?? 'down',
          });
        }

        if (event.targetId === this.playerId) {
          this.effectController.applyEffect('SHOVE');
        }

        this.skipMovementFor.add(event.sourceId);
        this.skipMovementFor.add(event.targetId);
        break;
      }

      case 'THROW': {
        const sourceSprite = this.playerSprites.get(event.sourceId);
        const targetSprite = this.playerSprites.get(event.targetId);

        if (sourceSprite) {
          this.tweens.killTweensOf(sourceSprite);
          this.animatingPlayers.add(event.sourceId);

          const initiatorState = this.prevPlayerState.get(event.sourceId);
          const initiatorPos = initiatorState
            ? { x: initiatorState.x, y: initiatorState.y }
            : { x: event.from.x, y: event.from.y };

          const dirToTarget = this.getShoveDirection(initiatorPos, event.from);
          sourceSprite.setFrame(PLAYER_FRAMES[dirToTarget]);

          this.prevPlayerState.set(event.sourceId, {
            x: initiatorPos.x,
            y: initiatorPos.y,
            direction: dirToTarget,
          });

          this.tweens.add({
            targets: sourceSprite,
            angle: 15,
            duration: 100,
            yoyo: true,
            ease: 'Sine.easeIn',
            onComplete: () => {
              sourceSprite.angle = 0;
              sourceSprite.setFrame(PLAYER_FRAMES[dirToTarget]);
              this.animatingPlayers.delete(event.sourceId);
            },
          });
        }

        if (targetSprite) {
          const startX = event.from.x * CELL_SIZE + HALF_CELL_SIZE;
          const startY = event.from.y * CELL_SIZE + HALF_CELL_SIZE;
          const endX = event.to.x * CELL_SIZE + HALF_CELL_SIZE;
          const endY = event.to.y * CELL_SIZE + HALF_CELL_SIZE;

          targetSprite.x = startX;
          targetSprite.y = startY;
          this.animatingPlayers.add(event.targetId);

          this.tweens.add({
            targets: targetSprite,
            x: endX,
            y: endY,
            duration: 400,
            ease: 'Quad.easeOut',
            onUpdate: (tween) => {
              const progress = tween.progress;
              const arcHeight = 20;
              const yOffset = Math.sin(progress * Math.PI) * arcHeight;
              targetSprite.y = startY + (endY - startY) * progress - yOffset;
            },
            onComplete: () => {
              targetSprite.x = endX;
              targetSprite.y = endY;
              targetSprite.setFrame(PLAYER_FRAMES[this.getPlayerDirection(event.targetId)]);
              this.animatingPlayers.delete(event.targetId);
            },
          });

          this.prevPlayerState.set(event.targetId, {
            x: event.to.x,
            y: event.to.y,
            direction: this.prevPlayerState.get(event.targetId)?.direction ?? 'down',
          });
        }

        if (event.targetId === this.playerId) {
          this.effectController.applyEffect('THROW');
        }

        this.skipMovementFor.add(event.sourceId);
        this.skipMovementFor.add(event.targetId);
        break;
      }

      case 'JUMP': {
        const sprite = this.playerSprites.get(event.playerId);
        if (sprite) {
          const startX = event.from.x * CELL_SIZE + HALF_CELL_SIZE;
          const startY = event.from.y * CELL_SIZE + HALF_CELL_SIZE;
          const endX = event.to.x * CELL_SIZE + HALF_CELL_SIZE;
          const endY = event.to.y * CELL_SIZE + HALF_CELL_SIZE;

          sprite.x = startX;
          sprite.y = startY;
          this.animatingPlayers.add(event.playerId);

          this.tweens.add({
            targets: sprite,
            x: endX,
            y: endY,
            duration: 400,
            ease: 'Quad.easeOut',
            onUpdate: (tween) => {
              const progress = tween.progress;
              const arcHeight = 20;
              const yOffset = Math.sin(progress * Math.PI) * arcHeight;
              sprite.y = startY + (endY - startY) * progress - yOffset;
            },
            onComplete: () => {
              sprite.x = endX;
              sprite.y = endY;
              sprite.setFrame(PLAYER_FRAMES[this.getPlayerDirection(event.playerId)]);
              this.animatingPlayers.delete(event.playerId);
            },
          });

          this.prevPlayerState.set(event.playerId, {
            x: event.to.x,
            y: event.to.y,
            direction: this.prevPlayerState.get(event.playerId)?.direction ?? 'down',
          });
        }

        if (event.playerId === this.playerId) {
          this.effectController.applyEffect('JUMP');
        }

        this.skipMovementFor.add(event.playerId);
        break;
      }

      case 'PULL': {
        const sourceSprite = this.playerSprites.get(event.sourceId);
        const targetSprite = this.playerSprites.get(event.targetId);

        if (sourceSprite && targetSprite) {
          this.tweens.killTweensOf(sourceSprite);
          this.animatingPlayers.add(event.sourceId);
          this.animatingPlayers.add(event.targetId);

          const startX = event.from.x * CELL_SIZE + HALF_CELL_SIZE;
          const startY = event.from.y * CELL_SIZE + HALF_CELL_SIZE;
          const endX = event.to.x * CELL_SIZE + HALF_CELL_SIZE;
          const endY = event.to.y * CELL_SIZE + HALF_CELL_SIZE;

          const beams: Phaser.GameObjects.Graphics[] = [];
          for (let i = 0; i < 3; i++) {
            const beam = this.add.graphics();
            beam.setDepth(10);
            beams.push(beam);
          }

          const line = new Phaser.Geom.Line(sourceSprite.x, sourceSprite.y, startX, startY);
          const particles = this.add.particles(sourceSprite.x, sourceSprite.y, 'teleport-particle', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.4, end: 0 },
            lifespan: 400,
            frequency: 30,
            tint: 0x44aaff,
            emitZone: {
              type: 'random',
              source: line,
              quantity: 1,
            },
            emitting: true,
          });

          targetSprite.x = startX;
          targetSprite.y = startY;

          this.tweens.add({
            targets: targetSprite,
            x: endX,
            y: endY,
            duration: 300,
            ease: 'Quad.easeIn',
            onUpdate: (tween) => {
              const alpha = 0.9 * (1 - tween.progress);
              for (const beam of beams) {
                beam.clear();
                beam.lineStyle(6, 0x44aaff, alpha * 0.3);
                const offsetX = (Math.sin(tween.progress * 10 + beams.indexOf(beam)) * 4);
                const offsetY = (Math.cos(tween.progress * 10 + beams.indexOf(beam)) * 4);
                beam.beginPath();
                beam.moveTo(sourceSprite.x + offsetX, sourceSprite.y + offsetY);
                beam.lineTo(targetSprite.x + offsetX, targetSprite.y + offsetY);
                beam.strokePath();
                
                beam.lineStyle(2, 0x88ccff, alpha);
                beam.beginPath();
                beam.moveTo(sourceSprite.x + offsetX, sourceSprite.y + offsetY);
                beam.lineTo(targetSprite.x + offsetX, targetSprite.y + offsetY);
                beam.strokePath();
              }
            },
            onComplete: () => {
              particles.stop();
              this.tweens.add({
                targets: [particles, ...beams],
                alpha: 0,
                duration: 200,
                onComplete: () => {
                  particles.destroy();
                  beams.forEach(b => b.destroy());
                },
              });

              targetSprite.x = endX;
              targetSprite.y = endY;
              targetSprite.setFrame(PLAYER_FRAMES[this.getPlayerDirection(event.targetId)]);
              this.animatingPlayers.delete(event.targetId);
              this.animatingPlayers.delete(event.sourceId);
            },
          });

          this.prevPlayerState.set(event.targetId, {
            x: event.to.x,
            y: event.to.y,
            direction: this.prevPlayerState.get(event.targetId)?.direction ?? 'down',
          });
        }

        if (event.targetId === this.playerId) {
          this.effectController.applyEffect('PULL');
        }

        this.skipMovementFor.add(event.sourceId);
        this.skipMovementFor.add(event.targetId);
        break;
      }

      case 'SWAP': {
        const sprite1 = this.playerSprites.get(event.playerId1);
        const sprite2 = this.playerSprites.get(event.playerId2);

        if (sprite1 && sprite2) {
          const x1 = sprite1.x;
          const y1 = sprite1.y;
          const x2 = sprite2.x;
          const y2 = sprite2.y;

          this.animatingPlayers.add(event.playerId1);
          this.animatingPlayers.add(event.playerId2);

          if (this.textures.exists('teleport-particle')) {
            const particles1 = this.add.particles(x1, y1, 'teleport-particle', {
              speed: { min: 50, max: 100 },
              scale: { start: 1, end: 0 },
              lifespan: 300,
              quantity: 12,
              tint: 0x44aaff,
              emitting: false,
            });
            particles1.explode();

            const particles2 = this.add.particles(x2, y2, 'teleport-particle', {
              speed: { min: 50, max: 100 },
              scale: { start: 1, end: 0 },
              lifespan: 300,
              quantity: 12,
              tint: 0x44aaff,
              emitting: false,
            });
            particles2.explode();
          }

          this.tweens.add({
            targets: [sprite1, sprite2],
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 150,
            ease: 'Power1',
            onComplete: () => {
              sprite1.x = x2;
              sprite1.y = y2;
              sprite2.x = x1;
              sprite2.y = y1;

              if (this.textures.exists('teleport-particle')) {
                const particles3 = this.add.particles(sprite1.x, sprite1.y, 'teleport-particle', {
                  speed: { min: 50, max: 100 },
                  scale: { start: 0, end: 1 },
                  lifespan: 300,
                  quantity: 12,
                  tint: 0x44aaff,
                  emitting: false,
                });
                particles3.explode();

                const particles4 = this.add.particles(sprite2.x, sprite2.y, 'teleport-particle', {
                  speed: { min: 50, max: 100 },
                  scale: { start: 0, end: 1 },
                  lifespan: 300,
                  quantity: 12,
                  tint: 0x44aaff,
                  emitting: false,
                });
                particles4.explode();
              }

              this.tweens.add({
                targets: [sprite1, sprite2],
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Power1',
                onComplete: () => {
                  const origScale1 = this.spriteOriginalScales.get(event.playerId1);
                  const origScale2 = this.spriteOriginalScales.get(event.playerId2);
                  if (origScale1) {
                    sprite1.scaleX = origScale1.scaleX;
                    sprite1.scaleY = origScale1.scaleY;
                  }
                  if (origScale2) {
                    sprite2.scaleX = origScale2.scaleX;
                    sprite2.scaleY = origScale2.scaleY;
                  }
                  sprite1.setFrame(PLAYER_FRAMES[this.getPlayerDirection(event.playerId1)]);
                  sprite2.setFrame(PLAYER_FRAMES[this.getPlayerDirection(event.playerId2)]);
                  this.animatingPlayers.delete(event.playerId1);
                  this.animatingPlayers.delete(event.playerId2);
                },
              });
            },
          });

          this.prevPlayerState.set(event.playerId1, {
            x: event.pos2.x,
            y: event.pos2.y,
            direction: this.prevPlayerState.get(event.playerId1)?.direction ?? 'down',
          });
          this.prevPlayerState.set(event.playerId2, {
            x: event.pos1.x,
            y: event.pos1.y,
            direction: this.prevPlayerState.get(event.playerId2)?.direction ?? 'down',
          });
        }

        if (event.playerId1 === this.playerId || event.playerId2 === this.playerId) {
          this.effectController.applyEffect('SWAP');
        }

        this.skipMovementFor.add(event.playerId1);
        this.skipMovementFor.add(event.playerId2);
        break;
      }

      case 'WALL_BUILT':
      case 'WALL_DESTROYED':
      case 'VOLUNTARY_MOVE':
        break;
      }
    }
  }

  private getShoveDirection(from: { x: number; y: number }, to: { x: number; y: number }) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (dy < 0) return 'up';
    if (dy > 0) return 'down';
    if (dx < 0) return 'left';
    if (dx > 0) return 'right';
    return 'down';
  }

  private getPlayerDirection(playerId: string): string {
    return this.prevPlayerState.get(playerId)?.direction ?? 'down';
  }

  private updatePlayers() {
    const world = this.gameStore.getWorld();
    if (!this.playerSprites || !this.prevPlayerState) return;

    const players = world.getPlayersDataRender();
    const stateMap = new Map(players.map(p => [p.userId, p]));

    for (const player of players) {
      const sprite = this.playerSprites.get(player.userId);
      if (!sprite) {
        this.createPlayerSprite(player);
        continue;
      }

      if (this.animatingPlayers.has(player.userId)) {
        this.prevPlayerState.set(player.userId, {
          x: player.position.x,
          y: player.position.y,
          direction: player.direction,
        });
        continue;
      }

      if (this.skipMovementFor.has(player.userId)) {
        sprite.x = player.position.x * CELL_SIZE + HALF_CELL_SIZE;
        sprite.y = player.position.y * CELL_SIZE + HALF_CELL_SIZE;
        sprite.setFrame(PLAYER_FRAMES[player.direction]);
        this.prevPlayerState.set(player.userId, {
          x: player.position.x,
          y: player.position.y,
          direction: player.direction,
        });
        continue;
      }

      const prev = this.prevPlayerState.get(player.userId)!;
      const dx = player.position.x - prev.x;
      const dy = player.position.y - prev.y;
      const dirChanged = player.direction !== prev.direction;

      if (dx !== 0 || dy !== 0) {
        this.playMovementAnimation(sprite, dx, dy, player);
      } else if (dirChanged) {
        sprite.setFrame(PLAYER_FRAMES[player.direction]);
      }

      this.prevPlayerState.set(player.userId, {
        x: player.position.x,
        y: player.position.y,
        direction: player.direction,
      });
    }

    for (const [userId, sprite] of this.playerSprites.entries()) {
      if (!stateMap.has(userId)) {
        sprite.destroy();
        this.playerSprites.delete(userId);
        this.prevPlayerState.delete(userId);
        this.spriteOriginalScales.delete(userId);
      }
    }
  }

  private createPlayerSprite(player: GamePlayerRenderData) {
    const identity = this.gameStore.getPlayerIdentity(player.userId);
    const color = identity?.color ?? 0xffffff;

    const sprite = this.createSprite(
      player.position.x * CELL_SIZE + HALF_CELL_SIZE,
      player.position.y * CELL_SIZE + HALF_CELL_SIZE,
      PLAYER_FRAMES[player.direction]
    );
    sprite.setDisplaySize(CELL_SIZE, CELL_SIZE);
    sprite.setTint(color);
    this.playerSprites.set(player.userId, sprite);
    this.spriteOriginalScales.set(player.userId, {
      scaleX: sprite.scaleX,
      scaleY: sprite.scaleY,
    });
    this.prevPlayerState.set(player.userId, {
      x: player.position.x,
      y: player.position.y,
      direction: player.direction,
    });
  }

  private playMovementAnimation(
    sprite: Phaser.GameObjects.Sprite,
    dx: number,
    dy: number,
    player: GamePlayerRenderData
  ) {
    if (dy < 0) sprite.anims.play('walk-up', true);
    else if (dy > 0) sprite.anims.play('walk-down', true);
    else if (dx < 0) sprite.anims.play('walk-left', true);
    else if (dx > 0) sprite.anims.play('walk-right', true);

    this.tweens.add({
      targets: sprite,
      x: player.position.x * CELL_SIZE + HALF_CELL_SIZE,
      y: player.position.y * CELL_SIZE + HALF_CELL_SIZE,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        sprite.anims.stop();
        sprite.setFrame(PLAYER_FRAMES[player.direction]);
      },
    });
  }

  private updateDynamicObjects() {
    const world = this.gameStore.getWorld();
    const dynamicObjects = world.getDynamicObjects();
    const newIds = new Set(dynamicObjects.map(obj => obj.id));

    for (const obj of dynamicObjects) {
      if (!this.dynamicSprites.has(obj.id)) {
        const pixelX = obj.position.x * CELL_SIZE + HALF_CELL_SIZE;
        const pixelY = (obj.position.y + 1) * CELL_SIZE;

        const sprite = this.add.sprite(pixelX, pixelY, GAME_ATLAS, FRAMES.WOOD_WALL);
        sprite.setDisplaySize(CELL_SIZE, CELL_SIZE);
        sprite.setOrigin(0.5, 1);
        sprite.scaleY = 0;
        sprite.alpha = 0;

        this.tweens.add({
          targets: sprite,
          scaleY: 0.5,
          alpha: 1,
          duration: 300,
          ease: 'Back.easeOut',
        });

        this.dynamicSprites.set(obj.id, sprite);
        this.tileSprites.push({ sprite, col: obj.position.x, row: obj.position.y });
      }
    }

    for (const [id, sprite] of this.dynamicSprites.entries()) {
      if (!newIds.has(id)) {
        this.tileSprites = this.tileSprites.filter(t => t.sprite !== sprite);
        this.tweens.add({
          targets: sprite,
          scaleY: 0,
          alpha: 0,
          duration: 200,
          ease: 'Power1',
          onComplete: () => sprite.destroy(),
        });
        this.dynamicSprites.delete(id);
      }
    }
  }

  private drawField(field: Tile[][]) {
    for (let row = 0; row < field.length; row++) {
      for (let col = 0; col < field[row].length; col++) {
        const tile = field[row][col];
        const sId = tile.sId ?? 0;
        const floorFrame = this.floorFrames[sId] ?? this.floorFrames[0];
        this.createFloorTile(col, row, floorFrame);

        this.createFinishTile(col, row, field.length, field[row].length);

        if (tile.type === 'wall') {
          this.createWallTile(col, row, this.wallFrame);
        }
      }
    }
  }

  private createFloorTile(col: number, row: number, frame: string = 'ground.png') {
    const floor = this.add.sprite(
      col * CELL_SIZE + HALF_CELL_SIZE,
      row * CELL_SIZE + HALF_CELL_SIZE,
      GAME_ATLAS,
      frame
    );
    floor.setDisplaySize(CELL_SIZE, CELL_SIZE);
    this.tileSprites.push({ sprite: floor, col, row });
  }

  private createFinishTile(col: number, row: number, totalRows: number, totalCols: number) {
    if (row === totalRows - 2 && col === totalCols - 2) {
      const finish = this.add.sprite(
        col * CELL_SIZE + HALF_CELL_SIZE,
        row * CELL_SIZE + HALF_CELL_SIZE,
        GAME_ATLAS,
        FRAMES.TARGET
      );
      finish.setDisplaySize(CELL_SIZE, CELL_SIZE);
      this.tileSprites.push({ sprite: finish, col, row });
    }
  }

  private createWallTile(col: number, row: number, frame: string = 'brick-wall.png') {
    const wall = this.add.sprite(
      col * CELL_SIZE + HALF_CELL_SIZE,
      row * CELL_SIZE + HALF_CELL_SIZE,
      GAME_ATLAS,
      frame
    );
    wall.setDisplaySize(CELL_SIZE, CELL_SIZE);
    this.tileSprites.push({ sprite: wall, col, row });
  }

  private createPlayers() {
    this.playerSprites = new Map();
    this.prevPlayerState = new Map();
    this.spriteOriginalScales.clear();

    const players = this.gameStore.getWorld().getPlayersDataRender();
    for (const player of players) {
      this.createPlayerSprite(player);
    }
  }

  private createPlayerAnimations() {
    const dirs = ['up', 'down', 'left', 'right'] as const;
    for (const dir of dirs) {
      this.anims.create({
        key: `walk-${dir}`,
        frames: [
          { key: GAME_ATLAS, frame: `player_${dir}_01.png` },
          { key: GAME_ATLAS, frame: `player_${dir}_02.png` },
          { key: GAME_ATLAS, frame: `player_${dir}_03.png` },
        ],
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  private updateFog() {
    if (this.tileSprites.length === 0) return;

    const playerSprite = this.playerSprites.get(this.playerId);
    if (!playerSprite) {
      for (const { sprite } of this.tileSprites) sprite.setAlpha(1);
      for (const sprite of this.playerSprites.values()) sprite.setAlpha(1);
      return;
    }

    const pos = { x: playerSprite.x / CELL_SIZE, y: playerSprite.y / CELL_SIZE };
    const innerRadius = Math.max(0, this.fogRadius - this.blendRadius);

    for (const { sprite, col, row } of this.tileSprites) {
      const dist = Math.sqrt((pos.x - col) ** 2 + (pos.y - row) ** 2);
      let alpha = 1;
      if (dist <= innerRadius) alpha = 1;
      else if (dist >= this.fogRadius) alpha = 0;
      else alpha = 1 - (dist - innerRadius) / (this.fogRadius - innerRadius);
      sprite.setAlpha(alpha);
    }

    for (const [userId, sprite] of this.playerSprites) {
      if (userId === this.playerId) {
        sprite.setAlpha(1);
        continue;
      }
      const dx = (sprite.x - playerSprite.x) / CELL_SIZE;
      const dy = (sprite.y - playerSprite.y) / CELL_SIZE;
      const dist = Math.sqrt(dx * dx + dy * dy);
      sprite.setAlpha(dist <= this.fogRadius ? 1 : 0);
    }
  }

  private setupDragPan() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = false;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.dragStartCamScrollX = this.cameras.main.scrollX;
      this.dragStartCamScrollY = this.cameras.main.scrollY;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;

      const dx = pointer.x - this.dragStartX;
      const dy = pointer.y - this.dragStartY;
      if (!this.isDragging) {
        if (Math.abs(dx) < this.DRAG_THRESHOLD && Math.abs(dy) < this.DRAG_THRESHOLD) return;
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.dragStartCamScrollX = this.cameras.main.scrollX;
        this.dragStartCamScrollY = this.cameras.main.scrollY;
        return;
      }

      const targetX = this.dragStartCamScrollX - dx;
      const targetY = this.dragStartCamScrollY - dy;
      const curX = this.cameras.main.scrollX;
      const curY = this.cameras.main.scrollY;
      const deltaX = targetX - curX;
      const deltaY = targetY - curY;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (dist > this.MAX_SCROLL_CHANGE) {
        this.cameras.main.setScroll(
          curX + (deltaX / dist) * this.MAX_SCROLL_CHANGE,
          curY + (deltaY / dist) * this.MAX_SCROLL_CHANGE
        );
      } else {
        this.cameras.main.setScroll(targetX, targetY);
      }
    });

    this.input.on('pointerup', () => this.isDragging = false);
    this.input.on('gameout', () => this.isDragging = false);
  }

  private setupFieldClick() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.currentInteractionMode) return;

      if (this.centerButton) {
        const bounds = this.centerButton.getBounds();
        if (bounds.contains(pointer.x, pointer.y)) {
          return;
        }
      }

      const col = Math.floor((pointer.x + this.cameras.main.scrollX) / CELL_SIZE);
      const row = Math.floor((pointer.y + this.cameras.main.scrollY) / CELL_SIZE);

      this.currentInteractionMode.onCellClick(col, row);
      this.setInteractionMode(undefined);
    });
  }
}
