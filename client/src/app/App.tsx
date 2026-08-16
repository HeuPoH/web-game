import React from 'react';

import { Routers } from './routes';
import { useAuthStore } from './providers/store-provider';
import { FullPageSpinner } from '../shared/ui';
import { ThemeProvider } from './providers/theme-provider';
import { ErrorBoundary } from './error-boundary';

function App() {
  const [isLoading, setLoading] = React.useState(true);
  const authStore = useAuthStore();

  React.useEffect(() => {
    authStore.checkAuth()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      <ErrorBoundary>
        <ThemeProvider>
          <Routers />
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
