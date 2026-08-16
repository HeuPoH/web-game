import { Flex } from 'antd';
import { Activity, X } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import type { GameAction } from '@game/shared-types';

import { cn } from '../../../shared/utils';
import { createActionItem } from '../../actions/ui/actions';
import { usePlayerSelf } from '../../../entities/game/';
import { useGameStore } from '../../../app/providers/store-provider';

import classes from './style.module.css';

export const QueueActions: React.FC = observer(() => {
  const playerSelf = usePlayerSelf();
  const gameStore = useGameStore();
  const maxActions = Math.min(gameStore.getMaxActions(), playerSelf.getMaxActions());
  const actions = playerSelf.getQueueAction();
  return (
    <section className={classes.queueContainer}>
      <Flex align='center' gap={4}>
        <Activity size={16} style={{ color: 'var(--ant-pink)' }} />
        Очередь команд
        <span>{`( ${actions.length} / ${maxActions} )`}</span>
      </Flex>
      <div className={classes.queueActions}>
        {actions.length
          ? (
            <Actions
              actions={actions}
              onDelete={(id: string) => playerSelf.deleteActions([id])}
            />
          )
          : <EmptyListActions />}
      </div>
    </section>
  );
});

const Actions: React.FC<{ actions: GameAction[]; onDelete: (id: string) => void }> = ({ actions, onDelete }) => {
  return (
    actions.map((action) => {
      const { icon, className } = createActionItem(action.type);
      return (
        <div key={action.id} className={cn(classes.queueActionsItem, className)}> 
          {icon}
          <X 
            size={14}
            className={classes.deleteIcon}
            onClick={() => onDelete(action.id)}
          />
        </div>
      );
    })
  );
};

const EmptyListActions: React.FC = () => {
  return (
    <div className={classes.emptyActionList}>
      Добавьте команды ниже
    </div>
  );
};
