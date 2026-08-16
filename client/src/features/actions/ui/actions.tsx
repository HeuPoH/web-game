import {
  BicepsFlexed,
  Box,
  GitCompareArrows,
  Pickaxe,
  Speech,
  SportShoe,
  Wind
} from 'lucide-react';
import ArrowDownOutlined from '@ant-design/icons/ArrowDownOutlined';
import ArrowLeftOutlined from '@ant-design/icons/ArrowLeftOutlined';
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';
import type { ActionType } from '@game/shared-types';

import type { InteractionMode, InteractionOwner } from '../interaction-mode/interaction';
import { BuildWallMode } from '../interaction-mode/build-wall-mode';
import { DestroyWallMode } from '../interaction-mode/destroy-wall-mode';

import classes from './style.module.css';

export type ActionItem = {
  title: string;
  icon: React.ReactNode;
  className: string;
  desc: string;
  createMode?: (owner: InteractionOwner) => InteractionMode;
};

const ACTION_REGISTRY: Record<ActionType, ActionItem> = {
  step_up: {
    title: 'Шаг вверх',
    icon: <ArrowUpOutlined />,
    className: classes.actionForward,
    desc: 'Персонаж услышал, что на севере раздают бесплатные печеньки, и делает шаг туда. Кто откажется от печенек?'
  },
  step_down: {
    title: 'Шаг вниз',
    icon: <ArrowDownOutlined />,
    className: classes.actionBackward,
    desc: 'Ноги сами несут на юг — видимо, там финиш, а может, просто магнитное поле. Не сопротивляйся!'
  },
  step_left: {
    title: 'Шаг влево',
    icon: <ArrowLeftOutlined />,
    className: classes.actionTurnLeft,
    desc: 'Левая сторона всегда кажется короче. Персонаж шагает туда, надеясь на чудо. Чуда нет, но шаг засчитан.'
  },
  step_right: {
    title: 'Шаг вправо',
    icon: <ArrowRightOutlined />,
    className: classes.actionTurnRight,
    desc: 'Правая сторона — место для манёвра. Там, говорят, и стены мягче, и соперники добрее. Проверим?'
  },
  shove: {
    title: 'Толчок пузом',
    icon: <Wind />,
    className: classes.actionShove,
    desc: 'Твой персонаж расправляет пузо, точно медведь перед броском, и мощным выдохом отправляет соперника в случайном направлении. Главное – не лопнуть от натуги!'
  },
  throw: {
    title: 'Бросок',
    icon: <BicepsFlexed />,
    className: classes.actionThrow,
    desc: 'Напрягая бицепс, ты играючи перекидываешь врага через плечо, словно мешок с картошкой. Куда приземлится – не твоя забота!'
  },
  jump: {
    title: 'Прыжок',
    icon: <SportShoe />,
    className: classes.actionJump,
    desc: 'Волшебные ботинки-скороходы позволяют тебе перепрыгнуть через две клетки, даже если за спиной назревает катастрофа. Не забудь разбег!'
  },
  pull: {
    title: 'Притяжение',
    icon: <Speech />,
    className: classes.actionPull,
    desc: 'Ты рассказываешь такую аппетитную историю о еде, что противник невольно делает шаг к тебе, истекая слюной. Сила убеждения – страшная вещь!'
  },
  swap: {
    title: 'Обмен',
    icon: <GitCompareArrows />,
    className: classes.actionSwap,
    desc: 'Ты быстро меняешься местами с соседом, используя древнюю технику "ой, смотри, что там сзади!". Пока он оборачивается – ты уже на его месте!'
  },
  build_wall: {
    title: 'Стена',
    icon: <Box />,
    className: classes.actionBuildWall,
    desc: 'Ты достаёшь из кармана карманную стену (да, у всех есть такая) и ставишь её перед собой. Откуда она? Лучше не спрашивай.',
    createMode: (owner: InteractionOwner) => new BuildWallMode(owner),
  },
  destroy_wall: {
    title: 'Разрушить',
    icon: <Pickaxe />,
    className: classes.actionDestroyWall,
    desc: 'Персонаж вспоминает, что эта стена строилась без разрешения, и с чистой совестью сносит её. Если есть кирка, почему бы и нет?',
    createMode: (owner: InteractionOwner) => new DestroyWallMode(owner)
  },
};

export function getAllActions(): Record<ActionType, ActionItem> {
  return ACTION_REGISTRY;
}

export function createActionItem(type: ActionType): ActionItem {
  return ACTION_REGISTRY[type] ?? { title: type, icon: null, className: '', desc: '' };
}

export function getActionIcon(type: ActionType): React.ReactNode {
  return createActionItem(type).icon;
}

export function getClassNameForAction(type: ActionType): string {
  return createActionItem(type).className;
}

export function getInteractionModeFactory(type: ActionType): ActionItem['createMode'] {
  return createActionItem(type).createMode;
}
