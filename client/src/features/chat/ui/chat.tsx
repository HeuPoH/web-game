import { Button, Flex, Input } from 'antd';
import { Crown, Send } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';

import { useRoomStore } from '../../../app/providers/store-provider';
import { defer, toCssColor } from '../../../shared/utils';
import { Modal, PlayerAvatarDumb } from '../../../shared/ui';

import classes from './style.module.css';
import colorClasses from '../../../shared/ui/styles/color.module.css';

const Chat: React.FC = observer(() => {
  const roomStore = useRoomStore();
  const [inputValue, setInputValue] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const hostLogin = roomStore.getHostName();
  const messages = roomStore.getChatMessages();
  const players = roomStore.getCurrentModeStore()?.getPlayers();
  const getColor = (login: string) => {
    const color = players?.find(p => p.login === login)?.color;
    return toCssColor(color ?? 0x808080);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) {
      return;
    }
    roomStore.sendChatMessage(text);
    setInputValue('');
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    roomStore.setAllMessagesRead();
  }, [messages.length]);

  return (
    <Flex className={classes.chat} vertical>
      <div ref={listRef} className={classes.messages}>
        {messages.map((msg) => {
          const playerColor = getColor(msg.login);
          return (
            <Flex gap={6} orientation='horizontal'>
              <PlayerAvatarDumb
                style={{ background: playerColor, opacity: 0.6, color: '#414141', flexBasis: 56 }}
                nickname={msg.login}
              />
              <Flex orientation='vertical' className={classes.message}>
                <Flex style={{ paddingBottom: 6 }} gap={6} align='center'>
                  <span style={{ color: playerColor }}>
                    {msg.login}
                  </span>
                  {msg.login === hostLogin
                    ? <Crown className={colorClasses.orangeColor} size={16} />
                    : null}
                </Flex>
                <div className={classes.messageText}>
                  {msg.message}
                </div>
              </Flex>
            </Flex>
          );
        })}
      </div>
      <Flex orientation='horizontal' gap={6}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={classes.messageInput}
          placeholder='Введите сообщение...'
        />
        <div>
          <Button className={classes.sendButton} onClick={handleSend}>
            <Send size={16} />
          </Button>
        </div>
      </Flex>
    </Flex>
  );
});

export function openChat() {
  return defer((res, container) => {
    return (
      <Modal
        getContainer={container}
        onCancel={res}
        footer={null}
        styles={{ body: { height: 400 } }}
        title='Чат'
      >
        <Chat />
      </Modal>
    );
  });
}
