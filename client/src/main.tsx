import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { StoreProvider } from './app/providers/store-provider.tsx';
import { SocketProvider } from './app/providers/socket-provider.tsx';
import App from './app/App.tsx';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </SocketProvider>
  </StrictMode>,
);
