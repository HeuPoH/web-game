import type { EffectsEventTypes } from '@game/shared-types';

import classes from '../ui/style.module.css';

export class ScreenEffectsController {
  private container: HTMLDivElement | null = null;

  setContainer(element: HTMLDivElement) {
    this.container = element;
  }

  applyEffect(effect: EffectsEventTypes) {
    const container = this.container;
    if (!container) {
      return;
    }

    const className = this.getClassName(effect);
    if (!className) {
      return;
    }

    container.classList.add(className);
    void container.offsetWidth;

    const onAnimationEnd = () => {
      container.classList.remove(className);
    };

    container.addEventListener('animationend', onAnimationEnd, { once: true });
  }

  private getClassName(effect: EffectsEventTypes) {
    switch (effect) {
    case 'JUMP':
      return classes.jumpEffect;
    case 'SHOVE':
      return classes.hitEffect;
    case 'PULL':
      return classes.pullEffect;
    case 'SWAP':
      return classes.swapEffect;
    case 'THROW':
      return classes.hitEffect;
    default:
      return '';
    }
  }
}
