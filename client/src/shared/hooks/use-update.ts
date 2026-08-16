import { useReducer } from 'react';

function updateIncrement(prevState: number) {
  return prevState + 1;
}

export function useUpdate() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, dispatch] = useReducer(updateIncrement, 0);
  return dispatch;
}
