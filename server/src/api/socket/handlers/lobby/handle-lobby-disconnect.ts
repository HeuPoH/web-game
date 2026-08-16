import type { IContainer } from '~/lib/container.js';

import type { TypedLobbySocket } from '../../types.js';
import { handleLobbyLeave } from './handle-lobby-leave.js';

export function handleLobbyDisconnect(
  socket: TypedLobbySocket,
  container: IContainer,
) {
  return () => handleLobbyLeave(socket, container)();
}
