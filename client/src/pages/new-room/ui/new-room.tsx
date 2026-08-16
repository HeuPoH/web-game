import React from 'react';
import { useNavigate } from 'react-router';
import { Button, Card, Flex, Input } from 'antd';
import { ArrowLeft, ArrowRight, Dices, MapPin, Swords, Zap } from 'lucide-react';

import { PageTitle, PageContainer, PinkGradientButton } from '../../../shared/ui';
import { LevelSelect, type LevelType } from '../../../features/level-select';
import { roomsAPI } from '../../../entities/rooms';
import { cn } from '../../../shared/utils';

import animations from '../../../shared/ui/styles/animations.module.css';
import colorClasses from '../../../shared/ui/styles/color.module.css';
import classes from './style.module.css';

const RANDOM_NAMES = [
  'Великая толкотня',
  'Пузо-баталия',
  'Замес века',
  'Танцы на костях',
  'Коварный лабиринт',
  'Яма удачи',
  'Стена позора',
  'Бег с препятствиями',
  'Толчок судьбы',
  'Лига пузатых',
  'Где мой финиш?',
  'Пинательная вечеринка',
  'Скользкий замес',
  'Бодалки-догонялки',
  'Забег обиженных',
  'Толкотня на выживание',
  'Пузатый спринт',
  'Лабиринт смеха',
  'Кто последний — тот прав',
  'Месиво года',
];

type State = {
  name: string;
  level: LevelType;
  maxPlayers: number;
  maxCommandsPerPlayer: number;
};

export const NewRoom: React.FC = () => {
  const navigate = useNavigate();

  const [isCreating, setIsCreating] = React.useState(false);
  const [roomSettings, setRoomSettings] = React.useState<State>(() => ({
    name: '',
    level: 'maze',
    maxPlayers: 8,
    maxCommandsPerPlayer: 5
  }));

  const updateSettings = function <K extends keyof State>(key: K, value: State[K]) {
    setRoomSettings(prev => ({ ...prev, [key]: value }));
  };

  const generateRandomName = () => {
    const usedNames = new Set([roomSettings.name]);
    const availableNames = RANDOM_NAMES.filter(n => !usedNames.has(n));
    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)] ?? RANDOM_NAMES[0];
    updateSettings('name', randomName);
  };

  const canCreateRoom = () => roomSettings.name && roomSettings.level;

  const onCreateRoom = async () => {
    try {
      setIsCreating(true);
      const { roomId } = await roomsAPI().create(roomSettings);
      navigate(`/room/${roomId}/lobby`);
    } catch (error) {
      console.error('Не удалось создать комнату. Попробуйте позже.', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle
        title={
          <div className={classes.title}>
            <Swords className={cn(colorClasses.purpleColor, classes.titleIcon)} />
            <h3>Создать комнату</h3>
          </div>
        }
      />
      <Flex gap='large' vertical>
        <div className={classes.field}>
          <Flex gap={8} align='center' className={classes.fieldLabel}>
            <Zap className={colorClasses.yellowColor} size={18} />
            <span>Название комнаты</span>
            <Dices
              className={classes.diceBtn}
              onClick={generateRandomName}
              size={20}
            />
          </Flex>
          <Flex gap={8}>
            <Input
              placeholder='Введите название...'
              value={roomSettings.name}
              onChange={e => updateSettings('name', e.target.value)}
              required
              className={classes.input}
            />
          </Flex>
          {roomSettings.name && (
            <span className={classes.fieldHint}>
              Отлично! «{roomSettings.name}» звучит как место, где будут месить.
            </span>
          )}
        </div>
        <div className={classes.field}>
          <Flex gap={8} align='center' className={classes.fieldLabel}>
            <MapPin size={18} className={colorClasses.greenColor} />
            <span>Арена</span>
          </Flex>
          <LevelSelect
            value={roomSettings.level}
            onChange={v => updateSettings('level', v)}
          />
          <span className={classes.fieldHint}>
            {roomSettings.level === 'maze'
              ? 'Лабиринт — классика жанра. Стены, ямы и тупики.'
              : 'Выбранная арена готова к замесу!'}
          </span>
        </div>
        <Card className={classes.previewCard} size='small'>
          <Flex gap={12} align='center'>
            <div className={classes.previewIcon}>
              <Swords size={24} className={colorClasses.purpleColor} />
            </div>
            <div>
              <div className={classes.previewTitle}>
                {roomSettings.name || 'Безымянный замес'}
              </div>
              <div className={classes.previewMeta}>
                {roomSettings.level === 'maze' ? 'Лабиринт' : roomSettings.level}
              </div>
            </div>
          </Flex>
        </Card>
      </Flex>
      <Flex gap='middle' className={classes.buttons}>
        <Button
          type='default'
          size='large'
          style={{ flex: 1 }}
          onClick={() => navigate('/')}
          icon={<ArrowLeft size={16} />}
        >
          Отмена
        </Button>
        <PinkGradientButton
          type='primary'
          variant='solid'
          icon={<ArrowRight size={16} />}
          size='large'
          style={{ flex: 1 }}
          loading={isCreating}
          disabled={!canCreateRoom() || isCreating}
          onClick={onCreateRoom}
          iconPlacement='end'
          className={cn(canCreateRoom() ? animations.pulseReady : '')}
        >
          Создать
        </PinkGradientButton>
      </Flex>
    </PageContainer>
  );
};
