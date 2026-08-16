import { v4 } from 'uuid';

import { passwordHash, verifyPassword } from '~/lib/generate-password.js';

import {
  type PublicUser,
  toPublicUser,
  type UserDTO,
  type UserRegistrationData,
} from './types.js';

export interface IUsersModel {
  /**
   * Добавляет нового пользователя в хранилище.
   * @param user - объект с полями login, password, nickname.
   * @returns публичные данные пользователя (PublicUser), если добавление успешно,
   *          и undefined, если пользователь с таким login уже существует или отсутствует login/password.
   */
  addUser(user: UserRegistrationData): Promise<PublicUser | undefined>;

  /**
   * Ищет пользователя по логину и проверяет пароль.
   * @param login - логин пользователя
   * @param password - пароль в открытом виде (будет захэширован для сравнения)
   * @returns объект PublicUser, если логин существует и пароль совпадает, иначе undefined
   */
  getUserByCredentials(
    login: string,
    password: string,
  ): Promise<PublicUser | undefined>;

  /**
   * Возвращает публичные данные пользователя по логину (без пароля).
   * @param login - логин пользователя
   * @returns публичные данные пользователя или undefined, если пользователь не найден
   */
  getUserByLogin(login: string): PublicUser | undefined;

  /**
   * Возвращает публичные данные пользователя по id (без пароля).
   * @param id - уникальный идентификатор пользователя
   * @returns публичные данные пользователя или undefined, если пользователь не найден
   */
  getUserById(id: string): PublicUser | undefined;
}

class UsersModel implements IUsersModel {
  /** Внутреннее хранилище пользователей: ключ - login, значение - объект UserDTO */
  private users = new Map<string, UserDTO>();

  /** Индекс для поиска по id: ключ - id, значение - login */
  private userIdIndex = new Map<string, string>();

  async getUserByCredentials(login: string, password: string) {
    if (!this.users.has(login)) {
      return;
    }

    const user = this.users.get(login)!;
    const isPasswordVerified = await verifyPassword(password, user.password);
    return isPasswordVerified ? toPublicUser(user) : undefined;
  }

  getUserByLogin(login: string): PublicUser | undefined {
    const user = this.users.get(login);
    return user ? toPublicUser(user) : undefined;
  }

  getUserById(id: string): PublicUser | undefined {
    const login = this.userIdIndex.get(id);
    return login ? this.getUserByLogin(login) : undefined;
  }

  async addUser(user: UserRegistrationData) {
    if (user.login === '' || user.password === '') {
      return;
    }

    if (this.users.has(user.login)) {
      return;
    }

    const userData = {
      ...user,
      id: v4(),
      password: await passwordHash(user.password),
    };

    this.users.set(userData.login, userData);
    this.userIdIndex.set(userData.id, userData.login);

    return toPublicUser(userData);
  }
}

export const usersModel = new UsersModel();
