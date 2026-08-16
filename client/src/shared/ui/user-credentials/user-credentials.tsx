import { Flex } from 'antd';

import { CopyButton } from '../copy-button/copy-button';
import type { User } from '../../../entities/user';
import { defer } from '../../utils';
import { Modal } from '../modal/modal';
import { GreenGradientButton } from '../buttons/gradient-buttons';

import classes from './style.module.css';

type UserData = User & { password: string };
export function showUserCredentials(user: UserData) {
  return defer((resolve, container) => (
    <UserCredentialsModal
      user={user}
      onClose={() => resolve(undefined)}
      container={container}
    />
  ));
}

type UserCredentialsProps = {
  user: UserData;
  onClose(): void;
  container: HTMLElement;
};

const UserCredentialsModal: React.FC<UserCredentialsProps> = ({ user, onClose, container }) => {
  return (
    <Modal
      getContainer={container}
      footer={null}
      onCancel={onClose}
      title={<h3 className={classes.title}>Регистрация успешна!</h3>}
    >
      <section className={classes.section}>
        <div className={classes.subtitle}>Сохраните эти данные! Они понадобятся для входа.</div>
        <Flex gap={16} orientation='vertical'>
          <Flex className={classes.field}>
            <span className={classes.fieldLabel}>Логин</span>
            <Flex gap={6} align='center'>
              <div className={classes.fieldValue}>
                {user.login}
              </div>
              <CopyButton text={user.login} className={classes.copyButton} />
            </Flex>
          </Flex>
          <Flex className={classes.field}>
            <span className={classes.fieldLabel}>Пароль</span>
            <Flex gap={6} align='center'>
              <div className={classes.fieldValue}>
                {user.password}
              </div>
              <CopyButton text={user.password} className={classes.copyButton} />
            </Flex>
          </Flex>
        </Flex>
        <GreenGradientButton
          variant='solid'
          size='large'
          onClick={onClose}
        >
          Продолжить
        </GreenGradientButton>
      </section>
    </Modal>
  );
};
