import type { LobbyEntity, LobbyState } from './lobby-entity.js';
import type { RoomEntity } from './room-entity.js';
import type { NewPlayer } from './types.js';

export type ILobbyFacade = {
  getEmitter: () => ReturnType<LobbyEntity['getEmitter']>;
  setReady: (playerId: string, ready: boolean) => void;
  join: (player: NewPlayer) => void;
  leave: (playerId: string) => void;
  isEmpty: () => boolean;
  isMember: (playerId: string) => boolean;
  getState: () => LobbyState;
};

const PLAYER_COLORS: number[] = [
  0x44_a5_ff, // синий
  0x44_ff_44, // зелёный
  0xff_d7_00, // золотой
  0xaa_44_ff, // фиолетовый
  0xff_88_00, // оранжевый
  0xff_66_b2, // розовый
  0x00_ce_d1, // бирюзовый
];

function getPlayerColor(totalPlayers: number) {
  const index = totalPlayers % PLAYER_COLORS.length;
  return PLAYER_COLORS[index]!;
}

export function createLobbyFacade(
  roomEnt: RoomEntity,
  lobby: LobbyEntity,
): ILobbyFacade {
  const owner = roomEnt.getOwner();
  return {
    getEmitter: () => {
      return lobby.getEmitter();
    },
    setReady: (playerId: string, ready: boolean) => {
      return lobby.setReadyFlag(playerId, ready);
    },
    join: (player: NewPlayer) => {
      const lobbyState = lobby.getState();
      const totalPlayers = lobbyState.players;
      const roomState = roomEnt.getState();

      if (lobbyState.players.length >= roomState.settings.maxPlayers) {
        throw new Error('Комната уже заполнена');
      }

      if (owner.isPlayerInAnyRoom(player.userId)) {
        throw new Error('Вы состоите в другой комнате');
      }

      if (lobby.isMember(player.userId)) {
        throw new Error('Вы уже вошли в комнату');
      }

      const lobbyPlayer = {
        ...player,
        isReady: false,
        color: getPlayerColor(totalPlayers.length),
      };
      lobby.join(lobbyPlayer);

      owner.registerPlayerRoom(player.userId, roomState.id);
    },
    leave: (playerId: string) => {
      if (!lobby.isMember(playerId)) {
        throw new Error('Вы не состоите в этой комнате');
      }

      // eslint-disable-next-line no-useless-assignment
      let playersToLeave: string[] = [];
      const roomState = roomEnt.getState();
      if (roomState.hostId === playerId) {
        playersToLeave = lobby.getState().players.map(p => p.userId);
        lobby.clear();
      } else {
        playersToLeave = [playerId];
        lobby.leave(playerId);
      }

      if (lobby.isEmpty()) {
        roomEnt.removeLobby();
      }

      for (const playerId of playersToLeave) {
        owner.unregisterPlayerRoom(playerId);
      }
    },
    isEmpty: () => {
      return lobby.isEmpty();
    },
    isMember: (playerId: string) => {
      return lobby.isMember(playerId);
    },
    getState: () => {
      return lobby.getState();
    },
  };
}
