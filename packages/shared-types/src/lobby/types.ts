export interface LobbyPlayer {
  userId: string;
  login: string;
  isReady: boolean;
  color: number;
}

export interface LobbyState {
  players: LobbyPlayer[];
}
