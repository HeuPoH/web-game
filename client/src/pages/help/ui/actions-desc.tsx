import React from 'react';
import { cn } from '../../../shared/utils';
import { getAllActions, type ActionItem } from '../../../features/actions/ui/actions';

import classes from './actions-desc.module.css';

export const ActionsDesc: React.FC = () => {
  const actions = getAllActions();
  const entries = Object.entries(actions) as [string, ActionItem][];

  return (
    <div className={classes.container}>
      <div className={classes.list}>
        {entries.map(([type, item]) => {
          return (
            <div
              key={type}
              className={classes.card}
            >
              <div className={classes.cardIcon}>
                <div className={cn(item.className, classes.cardIcon)}>
                  {item.icon}
                </div>
              </div>
              <div className={classes.cardBody}>
                <span className={classes.cardName}>{item.title}</span>
                <p className={classes.cardDesc}>{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
