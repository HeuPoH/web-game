import React from 'react';
import { Card, Flex } from 'antd';

import { cn } from '../../../shared/utils';

import classes from './style.module.css';

export type LevelType = 'maze';

export type Level = {
  id: LevelType;
  title: string;
  description: string;
};

const levels:Level[] = [
  {
    id: 'maze',
    title: '🗺️ Лабиринт',
    description: 'Найти выход'
  }
];

type Props = {
  value?: LevelType;
  onChange?(value: LevelType): void;
};

export const LevelSelect: React.FC<Props> = (props) => {
  const [level, setLevel] = React.useState(props.value ?? levels[0].id);
  const onChange = (id: LevelType) => {
    setLevel(id);
    props.onChange?.(id);
  };

  return (
    <Flex gap={8} orientation='vertical'>
      {levels.map(l => (
        <Card
          key={l.id}
          hoverable
          className={cn(classes.card, l.id === level ? classes.selected : undefined)}
          onClick={() => onChange(l.id)}
        >
          <Card.Meta title={l.title} description={l.description} />
        </Card>
      ))}
    </Flex>
  );
};
