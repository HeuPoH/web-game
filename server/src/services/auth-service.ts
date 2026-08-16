import { createDecorator, type IContainer } from '~/lib/container.js';
import { generatePassword } from '~/lib/generate-password.js';
import type { PublicUser, UserRegistrationData } from '~/models/users/types.js';

import { generateToken, getUserDataFromToken } from './jwt-token.js';
import { IUserService } from './users-service.js';

type AuthorizationResult = {
  user: PublicUser; // данные пользователя (публичные)
  token: string; // JWT-токен для последующих запросов
};

type QuickRegistrationResult = {
  user: PublicUser & { password: string }; // данные пользователя + сгенерированный пароль
  token: string; // JWT-токен
};

export interface IAuthService {
  authenticate(login: string, password: string): Promise<AuthorizationResult>;
  quickRegister(login: string): Promise<QuickRegistrationResult>;
  checkAuthorization(token: string): Promise<PublicUser | undefined>;
}

export class AuthService implements IAuthService {
  constructor(private di: IContainer) {}

  async authenticate(login: string, password: string) {
    const usersService = this.di.getSilent(IUserService);
    const publicUserData = await usersService.getUserByCredentials(
      login,
      password,
    );

    if (!publicUserData) {
      throw new Error('Пользователь не найден');
    }

    return {
      user: publicUserData,
      token: generateToken(publicUserData, '1d'),
    };
  }

  async quickRegister(login: string) {
    const userData: UserRegistrationData = {
      login,
      nickname: '',
      password: generatePassword(),
    };

    const usersService = this.di.getSilent(IUserService);
    const publicUserData = await usersService.addUser(userData);
    if (!publicUserData) {
      throw new Error('Не удалось зарегистрироваться');
    }

    const token = generateToken(publicUserData, '1d');
    return {
      user: { ...publicUserData, password: userData.password },
      token,
    };
  }

  async checkAuthorization(token: string) {
    const usersService = this.di.getSilent(IUserService);
    const publicUser = getUserDataFromToken(token);
    return publicUser ? usersService.getUserById(publicUser.id) : undefined;
  }
}

export const IAuthService = createDecorator<IAuthService>('IAuthService');
