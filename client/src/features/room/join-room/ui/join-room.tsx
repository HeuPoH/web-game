import { Flex, Modal } from 'antd';
import Text from 'antd/es/typography/Text';
import type { RoomPreview } from '@game/shared-types';

import { defer } from '../../../../shared/utils';

export function openJoinRoom(roomPreview: RoomPreview, signal: AbortSignal) {
  if (signal.aborted) {
    return;
  }

  return defer<boolean>(
    (res, container) => (
      <JoinRoomModal
        onClose={res} 
        container={container}
        roomPreview={roomPreview}
      />
    ), signal);
}

type Props = {
  roomPreview: RoomPreview;
  onClose(join: boolean): void;
  container: HTMLElement;
};

const JoinRoomModal: React.FC<Props> = ({ roomPreview, onClose, container }) => {
  return (
    <Modal
      open={true}
      getContainer={container}
      style={{ borderWidth: 1, borderStyle: 'solid' }}
      cancelText='Отмена'
      okText='Войти'
      onCancel={() => onClose(false)}
      onOk={() => onClose(true)}
      closable={false}
      title={(
        <Flex style={{ justifyContent: 'center' }}>
          <Text type='secondary'>
            Вход в комнату
          </Text>
        </Flex>
      )}
      centered
    >
      <JoinRoom
        container={container}
        roomPreview={roomPreview}
        onClose={onClose}
      />
    </Modal>
  );
};

const JoinRoom: React.FC<Props> = ({ roomPreview }) => {
  return (
    <Flex gap={10} orientation='vertical'>
      <div>
        <div>
          <Text>Комната: </Text>
          <Text type='secondary'>{roomPreview.settings.name}</Text>
        </div>
        <div>
          <Text>Игроки: </Text>
          <Text type='secondary'>{roomPreview.playersCount} / {roomPreview.settings.maxPlayers}</Text>
        </div>
        <div>
          <Text>Тип уровня: </Text>
          <Text type='secondary'>{roomPreview.settings.level}</Text>
        </div>
      </div>
    </Flex>
  );
};
