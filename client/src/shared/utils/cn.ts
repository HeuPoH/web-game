export function cn(...args: unknown[]): string {
  const res: string[] = [];
  for (const arg of args) {
    if (typeof arg === 'string') {
      res.push(arg);
    }
  }

  return res.join(' ');
}
