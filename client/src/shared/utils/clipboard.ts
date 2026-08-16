export async function copyToClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Текст скопирован');
      return;
    } catch (err) {
      console.warn('Не удалось скопировать текст', err);
    }
  }
}
