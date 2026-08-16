export function appendToBody(): [HTMLElement, () => void] {
  const domNode = document.createElement('div');
  document.body.appendChild(domNode);
  return [domNode, () => removeFromBody(domNode)];
}

export function removeFromBody(domNode: HTMLElement) {
  document.body.removeChild(domNode);
}
