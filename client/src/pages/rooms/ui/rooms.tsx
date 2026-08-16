import React from 'react';
import { Button, Flex } from 'antd';
import { useNavigate } from 'react-router';
import { House, RefreshCw } from 'lucide-react';
import type { RoomPreview } from '@game/shared-types';

import { roomsAPI } from '../../../entities/rooms';
import { Rooms as RoomList } from '../../../features/rooms';
import { FullPageSpinner, PageContainer } from '../../../shared/ui';

export const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = React.useState<RoomPreview[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const { rooms } = await roomsAPI().fetchAllPreview();
      setRooms(rooms);
    } catch {
      console.log('Не удалось загрузить комнаты');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRooms();
  }, []);

  return (
    <PageContainer style={{ height: '100vh' }}>
      <Flex align='center' justify='space-between'>
        <h2>Комнаты</h2>
        <Flex gap={10} wrap>
          <Button
            variant='outlined'
            style={{ boxShadow: 'none' }}
            onClick={loadRooms}
            icon={<RefreshCw size={16} />}
          />
          <Button
            onClick={() => navigate('/')}
            icon={<House size={16} />}
          />
          {rooms.length > 0 && (
            <Button
              type='primary'
              variant='solid'
              color='purple'
              style={{ boxShadow: 'none' }}
              onClick={() => navigate('/new-room')}
            >
            Создать
            </Button>
          )}
        </Flex>
      </Flex>
      {loading ? <FullPageSpinner /> : <RoomList rooms={rooms} />}
    </PageContainer>
  );
};
