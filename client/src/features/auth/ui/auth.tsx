/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs, Typography } from 'antd';
import { Zap } from 'lucide-react';

import { defer } from '../../../shared/utils';
import { useAuthStore } from '../../../app/providers/store-provider';
import { AuthForm } from './auth-form';
import { Modal, showUserCredentials } from '../../../shared/ui';
import { QuickRegistration } from './quick-registrations';

import classes from './auth.module.css';

export function openAuthForm() {
  return defer((res, container) => (
    <AuthFormModal
      onClose={() => res(undefined)} 
      container={container}
    />
  ));
}

type Props = {
  container: HTMLElement;
  onClose(): void;
};

const AuthFormModal: React.FC<Props> = observer(({ container, onClose }) => {
  const authStore = useAuthStore();
  const [activeTab, setActiveTab] = React.useState('auth');
  const [error, setError] = React.useState<string | null>();

  const authHanlder = async (login: string, password: string) => {
    try {
      await authStore.authorization(login, password);
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const regHandler = async (login: string) => {
    try {
      const userData = await authStore.quickRegister(login);
      onClose();
      showUserCredentials(userData);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const tabs = [
    {
      key: 'auth',
      label: 'Вход',
      children: (
        <AuthForm
          onAuth={authHanlder}
          isLoading={authStore.isLoading}
        />
      )
    },
    {
      key: 'reg',
      label: 'Регистрация',
      children: (
        <QuickRegistration
          onRegistration={regHandler}
          isLoading={authStore.isLoading}
        />
      )
    }
  ];

  const onTabClick = (key: string) => {
    setActiveTab(key);
    setError(null);
  };

  const renderTitle = () => {
    return (
      <div className={classes.title}>
        <div className={classes.titleIcon}>
          <Zap />
        </div>
        <h3>{activeTab === 'auth' ? 'С возвращением' : 'Присоединяйся'}</h3>
      </div>
    );
  };

  return (
    <Modal
      onCancel={onClose}
      getContainer={container}
      cancelText='Отмена'
      footer={null}
      mask={{ blur: true }}
    >
      {renderTitle()}
      <Typography.Text
        type='danger'
        style={{ display: 'block', marginBottom: '10px' }}
        ellipsis
      >
        {error}
      </Typography.Text>
      <Tabs
        type='card'
        items={tabs}
        activeKey={activeTab}
        onTabClick={onTabClick}
      />
    </Modal>
  );
});

