import { Container, type IContainer } from './lib/container.js';
import { roomsModel } from './models/rooms/rooms.js';
import { usersModel } from './models/users/users.js';
import { AuthService, IAuthService } from './services/auth-service.js';
import { IRoomsService, RoomsService } from './services/rooms-service.js';
import { ISocketService, SocketService } from './services/socket-service.js';
import { IUserService, UserService } from './services/users-service.js';

let container: IContainer;
export function getContainer() {
  if (!container) {
    container = new Container();
  }

  return container;
}

export function init(container: IContainer) {
  const di = container;

  di.set(IAuthService, new AuthService(di));
  di.set(IRoomsService, new RoomsService(roomsModel, di));
  di.set(IUserService, new UserService(usersModel));
  di.set(ISocketService, new SocketService());
}
