import { Button } from 'antd';
import { observer } from 'mobx-react-lite';
import { Circle, MessageSquareMore } from 'lucide-react';

import { useGameStore, useRoomStore } from '../../../app/providers/store-provider';
import { openChat } from '../../../features/chat';
import { MenuButton } from './menu-button';

import classes from './game-header.module.css';

export const GameHeader: React.FC = observer(() => {
  const gameStore = useGameStore();
  const roomStore = useRoomStore();
  if (!gameStore || !roomStore) {
    return null;
  }

  const room = roomStore.getCurrentRoom();

  return (
    <div className={classes.gameHeader}>
      <MenuButton roomStore={roomStore} />
      <span className={classes.gameHeaderText}>{room.settings.name}</span>
      <ChatButton />
    </div>
  );
});

const ChatButton: React.FC = observer(() => {
  const roomStore = useRoomStore();
  const hasNewMessages = roomStore.hasNewMessages();
  return (
    <Button onClick={openChat}>
      <MessageSquareMore size={16} />
      {hasNewMessages && (
        <Circle
          fill='red'
          size={12}
          className={classes.chatButtonStatus}
        />
      )}
    </Button>
  );
});
