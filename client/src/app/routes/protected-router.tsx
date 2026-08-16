import { useAuthStore, useUserStore } from '../providers/store-provider';
import { AccessDenied, FullPageSpinner } from '../../shared/ui';

type Props = React.PropsWithChildren;

export function ProtectedRouter(props: Props) {
  const userStore = useUserStore();
  const authStore = useAuthStore();
  
  if (authStore.isLoading) {
    return <FullPageSpinner />;
  }

  if (!userStore.isAuthenticated) {
    return <AccessDenied />;
  }

  return props.children;
}
