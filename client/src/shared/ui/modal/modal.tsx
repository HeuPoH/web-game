import { Modal as AntdModal, type ModalProps } from 'antd';

import { defer } from '../../utils';
import { ThemeProvider } from '../../../app/providers/theme-provider';

type Props = ModalProps;

export const Modal: React.FC<Props> = ({
  cancelText = 'Отмена',
  children,
  ...rest
}) => {
  return (
    <AntdModal
      cancelText={cancelText}
      {...rest}
      mask={{ blur: true, enabled: true }}
      centered
      open
    >
      {children}
    </AntdModal>
  );
};

type Args = {
  onOk: () => void;
  okText: string;
  text: string;
};

export function openConfirmModal(args: Args) {
  return defer((res, container) => (
    <ConfirmModal
      container={container}
      okText={args.okText}
      onOk={() => {
        res(undefined);
        args.onOk();
      }}
    >
      <div>{args.text}</div>
    </ConfirmModal>
  ));
}

type ConfirmModalProps = React.PropsWithChildren & {
  container: HTMLElement;
  okText: string;
  onOk: () => void;
  title?: string | React.JSX.Element;
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, children, container, okText, onOk }) => {
  return (
    <ThemeProvider>
      <AntdModal
        open={true}
        getContainer={container}
        footer={(_, { OkBtn }) => <OkBtn />}
        onOk={onOk}
        okText={okText}
        title={title}
        closable={false}
        centered
      >
        {children}
      </AntdModal>
    </ThemeProvider>
  );
};
