import type { GamePlayerEntity } from '../game-player-entity.js';

export function getRandomNeighbor(
  player: GamePlayerEntity,
  players: GamePlayerEntity[],
  distance = 1,
) {
  const adjacentPlayers = getAdjacentPlayers(player, players, distance);
  if (adjacentPlayers.length === 0) {
    return;
  }
  return adjacentPlayers[Math.floor(Math.random() * adjacentPlayers.length)]!;
}

export function getAdjacentPlayers(
  player: GamePlayerEntity,
  players: GamePlayerEntity[],
  distance = 1,
) {
  const neighbors = player.getNeighborCells(undefined, distance);
  return players.filter(p => {
    if (p.getId() === player.getId()) {
      return false;
    }
    const pos = p.getPosition();
    return neighbors.some(n => n.x === pos.x && n.y === pos.y);
  });
}
