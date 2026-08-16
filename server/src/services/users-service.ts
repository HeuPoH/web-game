import { createDecorator } from '~/lib/container.js';
import type { PublicUser, UserRegistrationData } from '~/models/users/types.js';
import type { IUsersModel } from '~/models/users/users.js';

export interface IUserService {
  /**
   * Возвращает публичные данные пользователя по его идентификатору.
   * @param id - идентификатор пользователя
   * @returns объект PublicUser или undefined, если пользователь не найден
   */
  getUserById(id: string): PublicUser | undefined;

  /**
   * Ищет пользователя по логину и паролю.
   * @param login - логин пользователя
   * @param password - пароль в открытом виде
   * @returns публичные данные пользователя при успешной проверке, иначе undefined
   */
  getUserByCredentials(
    login: string,
    password: string,
  ): Promise<PublicUser | undefined>;

  /**
   * Добавляет нового пользователя в хранилище.
   * @param user - регистрационные данные (login, password, nickname)
   * @returns публичные данные созданного пользователя или undefined, если логин занят
   */
  addUser(user: UserRegistrationData): Promise<PublicUser | undefined>;
}

export class UserService implements IUserService {
  constructor(private usersModel: IUsersModel) {}

  getUserById(id: string): PublicUser | undefined {
    return this.usersModel.getUserById(id);
  }

  getUserByCredentials(
    login: string,
    password: string,
  ): Promise<PublicUser | undefined> {
    return this.usersModel.getUserByCredentials(login, password);
  }

  addUser(user: UserRegistrationData): Promise<PublicUser | undefined> {
    return this.usersModel.addUser(user);
  }
}

export const IUserService = createDecorator<IUserService>('IUserService');
