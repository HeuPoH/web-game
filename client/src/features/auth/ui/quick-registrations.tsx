import React from 'react';
import { Form, Input } from 'antd';

import { PinkGradientButton } from '../../../shared/ui';

import classes from './auth.module.css';

type Props = {
  onRegistration(login: string): Promise<void>;
  isLoading: boolean;
};

type State = {
  login: string;
};

export const QuickRegistration: React.FC<Props> = ({ onRegistration, isLoading }) => {
  const [form] = Form.useForm();
  const [state, setState] = React.useState<State>({ login: '' });

  const onFinish = async () => {
    try {
      await onRegistration(state.login);
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
          placeholder='Придумайте логин...'
          value={state.login}
          onChange={(e) => setState({ ...state, login: e.target.value })}
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
        Зарегистрироваться
      </PinkGradientButton>
    </Form>
  );
};
