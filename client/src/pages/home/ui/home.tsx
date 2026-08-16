/* eslint-disable react-hooks/purity */
import { memo, useMemo } from 'react';
import type { ActionType } from '@game/shared-types';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react-lite';
import { Button, Flex } from 'antd';
import { Circle, LogIn, LogOut, Map, Plus, SwordsIcon, Users } from 'lucide-react';

import { useAuthStore, useUserStore } from '../../../app/providers/store-provider';
import { openAuthForm } from '../../../features/auth';
import { getAllActions } from '../../../features/actions';
import { PinkGradientButton, OrangeGradientButton } from '../../../shared/ui';
import { cn } from '../../../shared/utils';
import { HomeTitle } from './home-title';

import classes from './home.module.css';

export const Home: React.FC = () => {
  return (
    <section className={classes.container}>
      <Background />
      <Flex gap={12} align='center'>
        <div className={classes.botIcon}>
          <Map size={30} />
        </div>
        <div className={classes.sparklesIcon}>
          <SwordsIcon size={30} />
        </div>
      </Flex>
      <HomeTitle />
      <Login />
      <GameMenu />
      <h6>v0.1.0 alpha</h6>
    </section>
  );
};

const Login: React.FC = observer(() => {
  const userStore = useUserStore();
  const login = userStore.getUser()?.login;
  if (!login) {
    return null;
  }

  return (
    <Flex className={classes.login} gap={6} align='center'>
      <Circle size={14} fill='green' color='green' />
      {login}
    </Flex>
  );
});

const HelpButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Button
      type='primary'
      variant='solid'
      onClick={() => navigate('help')}
      className={classes.btn}
    >
      Помощь
    </Button>
  );
};

const GameMenu: React.FC = observer(() => {
  const navigate = useNavigate();
  const userStore = useUserStore();
  const isAuth = userStore.isAuthenticated;

  return (
    <Flex
      gap='middle'
      className={classes.menu}
      vertical
    >
      {isAuth
        ? <ButtonsForAuthenticated />
        : <ButtonsForGuests navigate={navigate} />
      }
      <OrangeGradientButton
        className={cn(classes.btn, classes.btnPrimary)}
        variant='solid'
        onClick={() => navigate('new-room')}
        icon={<Plus />}
      >
        Создать комнату
      </OrangeGradientButton>
      <Button
        type='default'
        className={classes.btn}
        variant='solid'
        onClick={() => navigate('/rooms')}
        icon={<Users />}
      >
        Список комнат
      </Button>
      <HelpButton />
    </Flex>
  );
});

type ButtonsProps = {
  navigate: (path: string) => void;
};

const ButtonsForAuthenticated: React.FC = observer(() => {
  const authStore = useAuthStore();
  return (
    <PinkGradientButton
      type='primary'
      className={classes.btn}
      loading={authStore.isLoading}
      variant='solid'
      icon={<LogOut />}
      onClick={() => authStore.logout()}
    >
      Выйти
    </PinkGradientButton>
  );
});

const ButtonsForGuests: React.FC<ButtonsProps> = () => {
  return (
    <PinkGradientButton
      className={classes.btn}
      variant='solid'
      style={{ boxShadow: 'none' }}
      onClick={openAuthForm}
      icon={<LogIn />}
    >
      Вход / Регистрация
    </PinkGradientButton>
  );
};

const Background: React.FC = memo(() => {
  const actions = getAllActions();
  
  const drops = useMemo(() => {
    const actionTypes = Object.keys(actions) as ActionType[];
    return Array.from({ length: 15 }, (_, i) => {
      const randomAction = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const left = Math.random() * 100;
      const duration = 8 + Math.random() * 10;
      const delay = Math.random() * 8;
      const size = 24 + Math.random() * 20;
      return { id: i, type: randomAction, left, duration, delay, size };
    });
  }, [actions]);

  return (
    <div className={classes.commandsRain}>
      {drops.map((drop) => {
        const item = actions[drop.type];
        return (
          <div
            key={drop.id}
            className={classes.commandDrop}
            style={{
              left: `${drop.left}%`,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
              fontSize: `${drop.size}px`,
            }}
          >
            {item.icon}
          </div>
        );
      })}
    </div>
  );
});
