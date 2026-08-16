/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ChatMessage,
  GameSettings,
  Room,
  RoomPreview,
} from '@game/shared-types';

import { assert } from '~/lib/assert.js';
import { logger } from '~/lib/logger.js';

import { getUserDataFromToken } from '../../services/jwt-token.js';
import type { IRoomsService } from '../../services/rooms-service.js';
import type { APIRequest, APIResponse } from '../types/api.js';

interface IRoomsController {
  create(
    req: APIRequest<{ roomSettings: GameSettings }>,
    res: APIResponse<{ roomId: string }>,
  ): void;
  join(
    req: APIRequest<undefined, { id: string }>,
    res: APIResponse<{ room: Room }>,
  ): void;
  get(
    req: APIRequest<undefined, { id: string }>,
    res: APIResponse<{ room: Room }>,
  ): void;
  roomPreview(
    req: APIRequest<undefined, { id: string }>,
    res: APIResponse<{ room: RoomPreview }>,
  ): void;
  getAllRoomPreviews(req: APIRequest, res: APIResponse): void;
  chatHistory(
    req: APIRequest<undefined, { id: string }>,
    res: APIResponse<{ messages: ChatMessage[] }>,
  ): void;
}

export class RoomsController implements IRoomsController {
  constructor(private roomsService: IRoomsService) {}

  create = (
    req: APIRequest<{ roomSettings: GameSettings }>,
    res: APIResponse<{ roomId: string }>,
  ) => {
    const token = req.cookies['token'];
    const userData = getUserDataFromToken(token);

    try {
      const { id } = this.roomsService.create(
        userData!.id,
        req.body.roomSettings,
      );
      logger.info(
        { userId: userData?.id, roomId: id, settings: req.body.roomSettings },
        'Room was created',
      );
      res.status(200).json({ roomId: id });
    } catch (error: any) {
      logger.warn({ err: error, userId: userData?.id }, 'Room create failed');
      res
        .status(400)
        .json({ error: error.message || 'Ошибка создания комнаты' });
    }
  };

  join = (
    req: APIRequest<undefined, { id: string }>,
    res: APIResponse<{ room: Room }>,
  ) => {
    const token = req.cookies['token'];
    const userData = getUserDataFromToken(token);

    try {
      const room = this.roomsService.get(req.params.id);
      if (!room) {
        throw new Error('Комната не найдена');
      }

      const lobby = room.getLobby();
      lobby.join({ userId: userData!.id, login: userData!.login });
      logger.info(
        { userId: userData?.id, roomId: room.getId() },
        'Player joined',
      );

      res.status(200).json({ room: room.getState() });
    } catch (error: any) {
      logger.warn(
        { err: error, roomId: req.params.id, userId: userData?.id },
        'Room join failed',
      );
      res.status(400).json({ error: error.message || 'Ошибка присоединения' });
    }
  };

  get = (
    req: APIRequest<undefined, { id: string }>,
    res: APIResponse<{ room: Room }>,
  ) => {
    try {
      const room = this.roomsService.get(req.params.id);
      const roomState = room?.getState();
      if (!roomState) {
        throw new Error('Комната не найдена');
      }

      res.status(200).json({ room: roomState });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Комната не найдена' });
    }
  };

  getAllRoomPreviews = (req: APIRequest, res: APIResponse) => {
    const token = req.cookies['token'];
    const userData = getUserDataFromToken(token);

    try {
      const rooms = this.roomsService.getAllPreviews(userData!.id);
      res.status(200).json({ rooms });
    } catch (error: any) {
      logger.warn(
        { err: error, userId: userData?.id },
        'Room previews fetch failed',
      );
      res.status(400).json({ error: error.message });
    }
  };

  roomPreview = (
    req: APIRequest<undefined, { id: string }>,
    res: APIResponse<{ room: RoomPreview }>,
  ) => {
    const token = req.cookies['token'];
    const userData = getUserDataFromToken(token);

    try {
      const roomPreview = this.roomsService.getPreview(
        req.params.id,
        assert(userData).id,
      );

      if (!roomPreview) {
        throw new Error('Комната не найдена');
      }

      res.status(200).json({ room: roomPreview });
    } catch (error: any) {
      logger.warn(
        { err: error, roomId: req.params.id, userId: userData?.id },
        'Room preview fetch failed',
      );
      res.status(400).json({ error: error.message || 'Комната не найдена' });
    }
  };

  chatHistory = (
    req: APIRequest<undefined, { id: string }>,
    res: APIResponse,
  ) => {
    try {
      const room = this.roomsService.get(req.params.id);
      if (!room) {
        throw new Error('Комната не найдена');
      }

      const token = req.cookies['token'];
      const userData = getUserDataFromToken(token);
      if (!userData) {
        throw new Error('Не валидный токен');
      }

      if (!room.isMember(userData.id)) {
        throw new Error('Вы не состоите в комнате');
      }

      const messages = room.getChat().getAll();
      res.status(200).json({ messages });
    } catch (error: any) {
      res
        .status(400)
        .json({ error: error.message || 'Ошибка получения истории чата' });
    }
  };
}
