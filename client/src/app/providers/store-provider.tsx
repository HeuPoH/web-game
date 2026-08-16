import { createContext, useContext } from 'react';
import { rootStore, RootStore } from '../store/root-store';
import { GameStore } from '../../entities/game';
import { LobbyStore } from '../../entities/lobby';

const StoreContext = createContext<RootStore>(rootStore);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => (
  <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
);

export const useStore = () => {
  return useContext(StoreContext);
};

export const useAuthStore = () => useStore().getAuthStore();
export const useUserStore = () => useStore().getUserStore();
export const useRoomStore = () => {
  const roomStore = useStore().getRoomStore();
  if (!roomStore) {
    throw new Error('Room store is not created');
  }

  return roomStore;
};
export const useGameStore = () => {
  const roomModeStore = useRoomStore()?.getCurrentModeStore();
  if (roomModeStore instanceof GameStore) {
    return roomModeStore;
  } else {
    throw new Error('GameStore is not found');
  }
};
export const useLobbyStore = () => {
  const roomModeStore = useRoomStore()?.getCurrentModeStore();
  if (roomModeStore instanceof LobbyStore) {
    return roomModeStore;
  }
};
export const useRootStore = () => useStore();
