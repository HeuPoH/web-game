/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from '~/lib/logger.js';
import type { PublicUser } from '~/models/users/types.js';

import type { IAuthService } from '../../services/auth-service.js';
import type { APIRequest, APIResponse } from '../types/api.js';

export const TOKEN_KEY = 'token';

interface IAuthController {
  quickRegister(
    req: APIRequest<{ login: string }>,
    res: APIResponse<{ user: PublicUser & { password: string } }>,
  ): Promise<void>;
  authorization(
    req: APIRequest<{ login: string; password: string }>,
    res: APIResponse<{ user: PublicUser }>,
  ): Promise<void>;
  checkAuthorization(
    req: APIRequest,
    res: APIResponse<{ user: PublicUser }>,
  ): Promise<void>;
  logout(req: APIRequest, res: APIResponse): void;
}

export class AuthController implements IAuthController {
  private service: IAuthService;

  constructor(service: IAuthService) {
    this.service = service;
  }

  /**
   * Настройки для httpOnly cookie, в которой хранится токен.
   * - httpOnly: true — защита от XSS
   * - sameSite: 'strict' в production, иначе 'lax' для удобства разработки
   * - secure: true только в production (требуется HTTPS)
   * - maxAge: 24 часа в миллисекундах
   */
  private cookieOptions = {
    httpOnly: true,
    sameSite:
      process.env.NODE_ENV === 'production'
        ? ('strict' as const)
        : ('lax' as const),
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 часа
  };

  quickRegister = async (
    req: APIRequest<{ login: string }>,
    res: APIResponse<{ user: PublicUser & { password: string } }>,
  ) => {
    const login = req.body.login;

    try {
      const result = await this.service.quickRegister(login);
      res.cookie(TOKEN_KEY, result.token, this.cookieOptions);
      res.send({ user: result.user });
    } catch (error: any) {
      logger.warn({ err: error, login }, 'Quick registration failed');
      res.status(400).json({ error: error.message });
    }
  };

  authorization = async (
    req: APIRequest<{ login: string; password: string }>,
    res: APIResponse<{ user: PublicUser }>,
  ) => {
    const { login, password } = req.body;

    try {
      const result = await this.service.authenticate(login, password);
      res.cookie(TOKEN_KEY, result.token, this.cookieOptions);
      res.send({ user: result.user });
    } catch (error: any) {
      logger.warn({ err: error, login }, 'Authentication failed');
      res.status(400).json({ error: error.message });
    }
  };

  checkAuthorization = async (
    req: APIRequest,
    res: APIResponse<{ user: PublicUser }>,
  ) => {
    try {
      const token = req.cookies[TOKEN_KEY];
      const user = await this.service.checkAuthorization(token);
      if (!user) {
        res.sendStatus(401);
        return;
      }

      res.send({ user });
    } catch (error: any) {
      logger.warn({ err: error }, 'Authorization check failed');
      res.status(400).json({ error: error.message });
    }
  };

  logout = (_: APIRequest, res: APIResponse) => {
    try {
      res.clearCookie(TOKEN_KEY, this.cookieOptions);
      res.send();
    } catch (error: any) {
      logger.warn({ err: error }, 'Logout failed');
      res.status(400).json({ error: error.message });
    }
  };
}
