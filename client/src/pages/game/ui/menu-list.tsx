import { Button, Flex } from 'antd';
import { LogOutIcon, LucideChevronRightCircle, Users } from 'lucide-react';

import { Modal } from '../../../shared/ui';

type Props = {
  container: HTMLElement;
  menuHandlers: {
    continue: () => void;
    exit: () => void;
    openPlayerList: () => void;
  }
};

export const MenuList: React.FC<Props> = ({ container, menuHandlers }) => {
  const style: React.CSSProperties = { padding: '20px 0' };
  return (
    <Modal
      getContainer={container}
      width={300}
      closable={false}
      title={<span>Меню</span>}
      footer={null}
    >
      <Flex gap={14} orientation='vertical'>
        <Button
          type='primary'
          style={style}
          icon={<LucideChevronRightCircle size={16} />}
          onClick={menuHandlers.continue}
        >
          Продолжить
        </Button>
        <Button
          style={style}
          icon={<Users size={16} />}
          onClick={menuHandlers.openPlayerList}
        >
          Игроки
        </Button>
        <Button
          danger
          style={style}
          icon={<LogOutIcon size={16} />}
          onClick={menuHandlers.exit}
        >
          Покинуть игру
        </Button>
      </Flex>
    </Modal>
  );
};
