import React from 'react';
import { Form, Input } from 'antd';

import { PinkGradientButton } from '../../../shared/ui';

import classes from './auth.module.css';

type Props = {
  onAuth(login: string, password: string): Promise<void>;
  isLoading: boolean;
};

type State = { login: string; password: string };

export const AuthForm: React.FC<Props> = ({ onAuth, isLoading }) => {
  const [form] = Form.useForm();
  const [state, setState] = React.useState<State>({ login: '', password: '' });

  const onFinish = async () => {
    try {
      await onAuth(state.login, state.password);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={onFinish}
      autoComplete='off'
    >
      <Form.Item
        label='Логин'
        rules={[{ required: true, message: 'Поле не может быть пустым' }]}
        layout='vertical'
        required
      >
        <Input
          placeholder='Введите логин...'
          value={state.login}
          onChange={(e) => setState({ ...state, login: e.target.value })}
          required
        />
      </Form.Item>
      <Form.Item
        label='Пароль'
        rules={[{ required: true, message: 'Поле не может быть пустым' }]}
        layout='vertical'
        required
      >
        <Input.Password
          placeholder='Введите пароль...'
          value={state.password}
          onChange={(e) => setState({ ...state, password: e.target.value })}
          required
        />
      </Form.Item>
      <PinkGradientButton
        type='primary'
        htmlType='submit'
        size='large'
        loading={isLoading}
        className={classes.button}
      >
        Войти
      </PinkGradientButton>
    </Form>
  );
};
