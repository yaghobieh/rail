import type { RailInstance, RailModule, RailModuleFactory } from '../types';

/**
 * Card Stack Effect module — stacks slides on top of each other like a deck
 * of cards, with the active card on top and subsequent cards slightly offset
 * and scaled down.
 *
 * @param instance - The Rail instance
 * @returns RailModule with stacked card transforms
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectStack]} effect="creative" />
 * ```
 */
export const EffectStack: RailModuleFactory = (instance: RailInstance): RailModule => {
  const OFFSET_Y = 10;
  const OFFSET_X = 6;
  const SCALE_STEP = 0.05;
  const MAX_VISIBLE = 5;

  function apply() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    slides.forEach((el, i) => {
      const offset = i - instance.state.activeIndex;

      if (offset < 0) {
        el.style.transform = 'translate3d(0, -100%, 0) scale(0.9)';
        el.style.opacity = '0';
        el.style.zIndex = '0';
      } else if (offset === 0) {
        el.style.transform = 'translate3d(0, 0, 0) scale(1)';
        el.style.opacity = '1';
        el.style.zIndex = String(slides.length);
      } else if (offset <= MAX_VISIBLE) {
        const scale = 1 - offset * SCALE_STEP;
        const ty = offset * OFFSET_Y;
        const tx = offset * OFFSET_X;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
        el.style.opacity = String(1 - offset * 0.12);
        el.style.zIndex = String(slides.length - offset);
      } else {
        el.style.opacity = '0';
      }

      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.transition = `transform ${instance.options.speed}ms ease, opacity ${instance.options.speed}ms ease`;
      el.style.borderRadius = '16px';
      el.style.boxShadow = offset === 0 ? '0 12px 40px rgba(0,0,0,0.4)' : `0 ${4 + offset * 2}px ${12 + offset * 4}px rgba(0,0,0,${0.15 + offset * 0.05})`;
    });

    if (instance.state.wrapperEl) {
      instance.state.wrapperEl.style.transform = 'none';
      instance.state.wrapperEl.style.overflow = 'visible';
      instance.state.wrapperEl.style.position = 'relative';
    }
  }

  return {
    name: 'effectStack',
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
