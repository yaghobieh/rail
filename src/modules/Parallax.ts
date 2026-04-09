import type { RailInstance, RailModule, RailModuleFactory } from '../types';

/**
 * Parallax module — applies parallax scrolling effects to elements with
 * `data-rail-parallax` attributes, translating them at a fraction of
 * the carousel's movement speed for a layered depth effect.
 *
 * @param instance - The Rail instance to add parallax to
 * @returns RailModule with parallax transform updates
 *
 * @example
 * ```tsx
 * <RailSlide>
 *   <div data-rail-parallax="0.5">Moves at half speed</div>
 * </RailSlide>
 * ```
 */
export const Parallax: RailModuleFactory = (instance: RailInstance): RailModule => {
  function updateParallax() {
    if (!instance.state.wrapperEl) return;
    const elements = instance.state.wrapperEl.querySelectorAll('[data-rail-parallax]');
    const progress = instance.state.progress;
    const isH = instance.options.direction === 'horizontal';

    elements.forEach((el) => {
      const factor = parseFloat((el as HTMLElement).dataset.railParallax ?? '0.5');
      const offset = progress * factor * 100;
      (el as HTMLElement).style.transform = isH
        ? `translate3d(${-offset}%, 0, 0)`
        : `translate3d(0, ${-offset}%, 0)`;
    });
  }

  return {
    name: 'parallax',
    init() { updateParallax(); },
    destroy() {
      if (!instance.state.wrapperEl) return;
      instance.state.wrapperEl.querySelectorAll('[data-rail-parallax]').forEach((el) => {
        (el as HTMLElement).style.transform = '';
      });
    },
    onSlideChange() { updateParallax(); },
    onTransitionEnd() { updateParallax(); },
    update() { updateParallax(); },
  };
};
