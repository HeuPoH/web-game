import { useGameStore } from '../../../app/providers/store-provider';

export function usePlayerSelf() {
  const gameStore = useGameStore();
  return gameStore.getPlayerSelf();
}

export function useWorldManager() {
  const gameStore = useGameStore();
  return gameStore.getWorld();
}
