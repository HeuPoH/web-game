import type { GameSettings } from '@game/shared-types';
import type { NextFunction } from 'express';

import type { APIRequest, APIResponse } from '~/api/types/api.js';
import { roomLevels } from '~/models/rooms/types.js';

export function validateCreateRoom(
  req: APIRequest<{ roomSettings?: Partial<GameSettings> }>,
  res: APIResponse<{ error: string }>,
  next: NextFunction,
) {
  const { roomSettings } = req.body ?? {};
  if (
    !roomSettings ||
    typeof roomSettings.name !== 'string' ||
    !roomSettings.name ||
    typeof roomSettings.level !== 'string' ||
    !roomSettings.level ||
    !roomLevels.includes(roomSettings.level)
  ) {
    return res.status(400).json({ error: 'Не корректные данные' });
  }
  next();
}

export function validateJoinRoom(
  req: APIRequest<undefined, { id: string }>,
  res: APIResponse,
  next: NextFunction,
) {
  const { id } = req.params ?? {};
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Не корректные данные' });
  }
  next();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateGetRoom<T = any>(
  req: APIRequest<undefined, { id: string }>,
  res: APIResponse<T>,
  next: NextFunction,
) {
  const { id } = req.params ?? {};
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Не корректные данные' });
  }
  next();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateGetChatMessages<T = any>(
  req: APIRequest<undefined, { id: string }>,
  res: APIResponse<T>,
  next: NextFunction,
) {
  const { id } = req.params ?? {};
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Не корректные данные' });
  }
  next();
}
