import type { NextFunction } from 'express';

import type { APIRequest, APIResponse } from '~/api/types/api.js';
import { getUserDataFromToken, verifyToken } from '~/services/jwt-token.js';

export function validateToken(
  req: APIRequest,
  res: APIResponse,
  next: NextFunction,
) {
  const token = req.cookies?.['token'];
  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  if (!verifyToken(token)) {
    return res.status(400).json({ error: 'Неверный токен' });
  }

  const userData = getUserDataFromToken(token);
  if (!userData) {
    res.status(401).send({ error: 'Невалидный токен' });
    return;
  }

  next();
}
