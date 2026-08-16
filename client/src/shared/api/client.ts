type Args = {
  signal?: AbortSignal;
  headers?: HeadersInit;
};

const baseURL = import.meta.env.VITE_API_URL;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function API() {
  return {
    post: async function <T = any, R = any>(url: string, data?: T, args?: Args) {
      if (args?.signal?.aborted) {
        throw new Error('Запрос отменен');
      }

      const fullUrl = `${baseURL}/${url}`;
      const options: RequestInit = {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          ...args?.headers
        },
        credentials: 'include',
        body: JSON.stringify(data),
        signal: args?.signal
      };

      const response = await fetch(fullUrl, options);

      if (!response.ok) {
        const json = await response.json();
        const errorMsg = json.error ?? response.statusText;
        throw new Error(errorMsg);
      }

      return (await response.json()) as R;
    },
    get: async function<R = any>(url: string, args?: Args) {
      if (args?.signal?.aborted) {
        return;
      }

      const fullUrl = `${baseURL}/${url}`;
      const options: RequestInit = {
        method: 'get',
        credentials: 'include',
        headers: args?.headers,
        signal: args?.signal
      };

      const response = await fetch(fullUrl, options);
      if (!response.ok) {
        const json = await response.json();
        const errorMsg = json.error ?? response.statusText;
        throw new Error(errorMsg);
      }

      try {
        return (await response.json()) as R;
      } catch { /* empty */ }
    }
  };
}
