export function assert<T>(
  value?: T | undefined,
  error = 'Значение не установлено',
): T {
  if (value == undefined) {
    throw new Error(error);
  }

  return value;
}
