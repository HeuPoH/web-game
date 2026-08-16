import type { NextFunction } from 'express';

import type { APIRequest, APIResponse } from '~/api/types/api.js';
import type { PublicUser } from '~/models/users/types.js';

export function validateQuickRegister(
  req: APIRequest<{ login: string }>,
  res: APIResponse<{ user: PublicUser & { password: string } }>,
  next: NextFunction,
) {
  const login = req.body.login;
  if (!login || typeof login !== 'string') {
    res.status(400).send({ error: 'Не корректные данные' });
    return;
  }

  next();
}

export function validateAuthorization(
  req: APIRequest<{ login: string; password: string }>,
  res: APIResponse<{ user: PublicUser }>,
  next: NextFunction,
) {
  const { login, password } = req.body ?? {};
  if (
    !login ||
    typeof login !== 'string' ||
    !password ||
    typeof password !== 'string'
  ) {
    res.status(400).send({ error: 'Не корректные данные' });
    return;
  }

  next();
}
