import type { ChatMessage, GameSettings, Room, RoomPreview } from '@game/shared-types';
import { API } from '../../shared/api';

const PREFIX = 'rooms';

export interface RoomsAPI {
  create(settings: GameSettings, signal?: AbortSignal): Promise<{ roomId: string }>;
  fetchPreview(roomId: string, signal?: AbortSignal): Promise<{ room: RoomPreview } | undefined>;
  join(roomId: string, signal?: AbortSignal): Promise<{ room: Room } | undefined>;
  fetchAllPreview(signal?: AbortSignal): Promise<{ rooms: RoomPreview[] }>;
  fetchChatMessages(roomId: string, signal?: AbortSignal): Promise<{ messages: ChatMessage[] }>;
}

export function roomsAPI(): RoomsAPI {
  return {
    create: (settings: GameSettings, signal?: AbortSignal) => {
      return API().post<{ roomSettings: GameSettings }, { roomId: string }>(`${PREFIX}/create`, { roomSettings: settings }, { signal });
    },
    fetchPreview: (roomId: string, signal?: AbortSignal) => {
      return API().get<{ room: RoomPreview } | undefined>(`${PREFIX}/${roomId}/preview`, { signal });
    },
    join: (roomId: string, signal?: AbortSignal) => {
      return API().get<{ room: Room } | undefined>(`${PREFIX}/${roomId}/join`, { signal });
    },
    fetchAllPreview: async (signal?: AbortSignal) => {
      const rooms = await API().get<{ rooms: RoomPreview[] }>(`${PREFIX}/all`, { signal });
      return rooms ?? { rooms: [] };
    },
    fetchChatMessages: async (roomId: string, signal?: AbortSignal) => {
      const result = await API().get<{ messages: ChatMessage []}>(`${PREFIX}/${roomId}/chat`, { signal });
      return { messages: result?.messages ?? [] };
    },
  };
}
