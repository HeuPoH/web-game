/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRoot } from 'react-dom/client';

import { appendToBody } from './dom';
import { StoreProvider } from '../../app/providers/store-provider';
import { ThemeProvider } from '../../app/providers/theme-provider';
import { SocketProvider } from '../../app/providers/socket-provider';

export type Resolver<T = any> = (value: T) => void | (() => void);
export type Renderer<T = any> = (resolve: Resolver<T>, container: HTMLElement) => React.ReactElement;

export function defer<T = any>(render: Renderer<T>, signal?: AbortSignal): Promise<T> {
  const [container, unmountContainer] = appendToBody();
  const root = createRoot(container);

  const unmount = () => {
    unmountContainer();
    root.unmount();
  };

  const mount = (res: Resolver<T>) => {
    root.render(
      <SocketProvider>
        <StoreProvider>
          <ThemeProvider>
            {render(res, container)}
          </ThemeProvider>
        </StoreProvider>
      </SocketProvider>
    );
  };

  return new Promise<T>((res, rej) => {
    signal?.addEventListener('abort', () => {
      rej();
    });
    mount(res);
  }).finally(unmount);
}
