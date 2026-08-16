/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useParams, useSearchParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { useRootStore } from '../../app/providers/store-provider';
import { SimpleError, FullPageSpinner } from '../../shared/ui';
import { openJoinRoom } from '../../features/room';
import { useJoinRoom } from './lib/use-join-room';
import { useFetchPreview } from './lib/use-fetch-preview';

type ErrorState = {
  code: string;
  message: string;
};

export const RoomEntry: React.FC = observer(() => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  const navigate = useNavigate();
  const rootStore = useRootStore();

  const { joinRoom } = useJoinRoom({ errorBubble: true });
  const { fetchPreview } = useFetchPreview({ errorBubble: true });

  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    (async () => {
      try {
        const roomId = params.id;
        if (!roomId) {
          throw new Error('ID комнаты не найден');
        }

        const preview = (await fetchPreview(roomId, abortController.signal))?.room;
        if (!preview) {
          throw new Error('Комната не найдена');
        }

        if (preview.status === 'game' && !preview.isMember) {
          throw new Error('Игра уже началась, присоединиться нельзя');
        }

        if (!preview.isMember) {
          if (searchParams[0].get('ok') !== 'true') {
            const isOk = await openJoinRoom(preview, abortController.signal);
            if (!isOk) {
              navigate('/');
              return;
            }
          }

          await joinRoom(roomId);
        }

        if (abortController.signal.aborted) {
          return;
        }

        const roomStore = rootStore.createRoomStore(preview);
        await roomStore.initSocket();

        const target = preview.status === 'game' ? 'game' : 'lobby';
        navigate(`/room/${roomId}/${target}`, { replace: true });
      } catch (error: any) {
        if (abortController.signal.aborted) {
          return;
        }

        setError({ code: '', message: error.message });
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      abortControllerRef.current?.abort();
      rootStore.clearRoomStore();
    };
  }, [params.id]);

  if (loading) {
    return <FullPageSpinner />;
  }

  if (error) {
    return (
      <SimpleError
        icon='⚠️'
        code={error.code}
        message={error.message}
      />
    );
  }

  const currentRoom = rootStore.getRoomStore()?.getCurrentRoom();
  if (!currentRoom) {
    return null;
  }

  return <Outlet />;
});
