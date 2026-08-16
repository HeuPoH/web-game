import { SimpleError } from './simple-error/simple-error';

export const AccessDenied: React.FC = () => {
  return (
    <SimpleError
      icon='🔒'
      code='403'
      message='У вас нет доступа к этой странице'
    />
  );
};
