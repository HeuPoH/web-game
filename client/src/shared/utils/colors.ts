export function toCssColor(hexNumber: number) {
  // Переводим число в 6-значную HEX-строку с ведущими нулями
  const hex = hexNumber.toString(16).toUpperCase().padStart(6, '0');
  return `#${hex}`;
}
