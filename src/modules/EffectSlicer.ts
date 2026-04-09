import type { RailInstance, RailModule, RailModuleFactory } from '../types';

/**
 * Slicer Effect module — creates a sliced/split transition where the outgoing
 * slide appears to fragment as it exits while the incoming slide assembles.
 *
 * @param instance - The Rail instance
 * @returns RailModule with slicer-style transforms
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectSlicer]} effect="creative" />
 * ```
 */
export const EffectSlicer: RailModuleFactory = (instance: RailInstance): RailModule => {
  function apply() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    const isHoriz = instance.options.direction === 'horizontal';
    const size = isHoriz ? instance.state.width : instance.state.height;

    slides.forEach((el, i) => {
      const offset = i - instance.state.activeIndex;

      if (offset === 0) {
        el.style.transform = 'translate3d(0, 0, 0)';
        el.style.opacity = '1';
        el.style.clipPath = 'none';
        el.style.zIndex = String(slides.length);
      } else {
        const dir = offset > 0 ? 1 : -1;
        const absOff = Math.abs(offset);
        const tx = isHoriz ? dir * size * 0.25 * absOff : 0;
        const ty = isHoriz ? 0 : dir * size * 0.25 * absOff;
        const skew = dir * 5 * Math.min(absOff, 2);

        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) skew${isHoriz ? 'X' : 'Y'}(${skew}deg)`;
        el.style.opacity = String(Math.max(0, 1 - absOff * 0.5));
        el.style.clipPath = 'none';
        el.style.zIndex = String(slides.length - absOff);
      }

      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.transition = `transform ${instance.options.speed}ms ease, opacity ${instance.options.speed}ms ease, clip-path ${instance.options.speed}ms ease`;
    });

    if (instance.state.wrapperEl) {
      instance.state.wrapperEl.style.transform = 'none';
      instance.state.wrapperEl.style.overflow = 'visible';
      instance.state.wrapperEl.style.position = 'relative';
    }
  }

  return {
    name: 'effectSlicer',
    init() { apply(); },
    destroy() {
      if (instance.state.wrapperEl) {
        instance.state.wrapperEl.style.overflow = '';
      }
    },
    onSlideChange() { apply(); },
    update() { apply(); },
  };
};
