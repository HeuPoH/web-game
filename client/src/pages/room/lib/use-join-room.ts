import React from 'react';
import { roomsAPI } from '../../../entities/rooms';

type Config = {
  errorBubble?: boolean;
};

export const useJoinRoom = (config: Config) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const joinRoom = async (roomId: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      await roomsAPI().join(roomId, signal);
    } catch {
      const errorMsg = 'Не удалось войти в комнату';
      if (config.errorBubble) {
        throw new Error(errorMsg);
      } else {
        setError('errorMsg');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    joinRoom,
    loading,
    error
  };
};
