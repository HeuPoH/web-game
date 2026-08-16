import { Button } from 'antd';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';

import { defer } from '../../../shared/utils';
import { customHistory } from '../../../shared/lib';
import { MenuList } from './menu-list';
import type { RoomStore } from '../../../entities/rooms';
import { openPlayerList } from '../model/open-player-list';

export const MenuButton: React.FC<{ roomStore: RoomStore }> = ({ roomStore }) => {
  const openMenu = () => {
    defer<void>(
      (res, container) => (
        <MenuList
          container={container}
          menuHandlers={{
            continue: res,
            exit: () => {
              roomStore.leaveGame();
              res();
              customHistory.push('/');
            },
            openPlayerList: () => {
              res();
              openPlayerList(roomStore.getHostId());
            }
          }}
        />
      ));
  };

  return (
    <Button
      type='default'
      variant='solid'
      onClick={openMenu}
    >
      <MenuUnfoldOutlined size={16} />
    </Button>
  );
};
