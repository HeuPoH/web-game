import type { RoomPreview } from '@game/shared-types';
import { EmptyRooms } from './empty-rooms';
import { Room } from './room';

type Props = {
  rooms: RoomPreview[];
};

export const Rooms: React.FC<Props> = ({ rooms }) => {
  if (!rooms.length) {
    return <EmptyRooms />;
  }

  return rooms.map(room => <Room key={room.id} room={room} />);
};
