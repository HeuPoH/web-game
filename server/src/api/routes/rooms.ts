import type { GameSettings } from '@game/shared-types';
import { type NextFunction, Router } from 'express';

import { validateToken } from '~/api/routes/middlewares/common.js';
import {
  validateCreateRoom,
  validateGetRoom,
  validateJoinRoom,
} from '~/api/routes/middlewares/rooms-validator.js';
import type { IContainer } from '~/lib/container.js';

import { IRoomsService } from '../../services/rooms-service.js';
import { RoomsController } from '../controllers/rooms-controller.js';
import type { APIRequest, APIResponse } from '../types/api.js';

export function createRoomsRouter(container: IContainer) {
  const router = Router();
  const roomsService = container.getSilent(IRoomsService);
  const controller = new RoomsController(roomsService);

  router.use(validateToken);
  router.post(
    '/create',
    validateCreateRoom,
    controller.create,
    correctRoomSettingsIfNeed,
  );
  router.get('/all', controller.getAllRoomPreviews);
  router.get('/:id/join', validateJoinRoom, controller.join);
  router.get('/:id/preview', validateGetRoom, controller.roomPreview);
  router.get('/:id/chat', controller.chatHistory);

  return router;
}

function correctRoomSettingsIfNeed(
  req: APIRequest<{ roomSettings: Partial<GameSettings> }>,
  _: APIResponse<{ error: string }>,
  next: NextFunction,
) {
  req.body.roomSettings.maxPlayers = 8;
  req.body.roomSettings.maxCommandsPerPlayer = 5;
  next();
}
