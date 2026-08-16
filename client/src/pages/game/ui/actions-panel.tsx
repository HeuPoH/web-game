import { Button } from 'antd';
import type { ActionBarSlot, ActionType, MoveAction, TrickAction } from '@game/shared-types';

import { cn } from '../../../shared/utils';
import { createActionItem } from '../../../features/actions';

import classes from './actions-panel-style.module.css';

type BaseProps = {
  onActionClick(action: ActionType): void;
};

export const MoveActionPanel: React.FC<BaseProps & { actions: ActionBarSlot<MoveAction>[]; }> = ({ actions, onActionClick }) => {
  return (
    <section className={classes.actionsPanel}>
      {actions.map(c => {
        const { icon, className } = createActionItem(c.type);
        return (
          <Button
            key={c.type}
            className={cn(classes.actionPanelItem, className)}
            onClick={() => onActionClick(c.type)}
          >
            {icon}
          </Button>
        );
      })}
    </section>
  );
};

export const TrickActionPanel: React.FC<BaseProps & { actions: ActionBarSlot<TrickAction>[];}> = ({ actions, onActionClick }) => {
  return (
    <section className={classes.actionsPanel}>
      {actions.map(c => {
        const { icon, className } = createActionItem(c.type);
        return (
          <Button
            key={c.type}
            className={cn(classes.actionPanelItem, className)}
            onClick={() => onActionClick(c.type)}
            disabled={Boolean(c.coldown)}
          >
            {icon}
            {c.coldown && (
              <span className={classes.coldown}>{c.coldown}</span>
            )}
          </Button>
        );
      })}
    </section>
  );
};
