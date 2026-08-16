/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { roomsAPI } from '../../../entities/rooms';

type Config = {
  errorBubble?: boolean;
};

export const useFetchPreview = (config: Config) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPreview = async (roomId: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      return await roomsAPI().fetchPreview(roomId, signal);
    } catch (e: any) {
      if (config.errorBubble) {
        throw new Error(e.message);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchPreview,
    loading,
    error
  };
};
