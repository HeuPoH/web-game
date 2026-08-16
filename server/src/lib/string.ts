export function extractParam(inputString: string, paramName: string) {
  const parts = inputString.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(paramName + '=')) {
      return trimmed.slice(Math.max(0, paramName.length + 1));
    }
  }
}
