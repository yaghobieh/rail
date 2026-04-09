import type { RailInstance, RailModule, RailModuleFactory } from '../types';

/**
 * Tinder Effect module — simulates a swipe-away card stack where the active
 * card lifts and rotates out while the next card scales up from behind.
 *
 * @param instance - The Rail instance
 * @returns RailModule with Tinder-style card transforms
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectTinder]} effect="creative" />
 * ```
 */
export const EffectTinder: RailModuleFactory = (instance: RailInstance): RailModule => {
  const STACK_OFFSET = 8;
  const STACK_SCALE_STEP = 0.04;
  const MAX_VISIBLE = 4;
  const ROTATION_DEG = 8;

  function apply() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    slides.forEach((el, i) => {
      const offset = i - instance.state.activeIndex;

      if (offset < 0) {
        el.style.transform = `translate3d(-120%, 0, 0) rotate(-${ROTATION_DEG}deg)`;
        el.style.opacity = '0';
        el.style.zIndex = '0';
        el.style.pointerEvents = 'none';
      } else if (offset === 0) {
        el.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        el.style.opacity = '1';
        el.style.zIndex = String(slides.length);
        el.style.pointerEvents = 'auto';
      } else if (offset <= MAX_VISIBLE) {
        const scale = 1 - offset * STACK_SCALE_STEP;
        const ty = offset * STACK_OFFSET;
        el.style.transform = `translate3d(0, ${ty}px, ${-offset * 30}px) scale(${scale})`;
        el.style.opacity = String(1 - offset * 0.15);
        el.style.zIndex = String(slides.length - offset);
        el.style.pointerEvents = 'none';
      } else {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }

      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.transition = `transform ${instance.options.speed}ms ease, opacity ${instance.options.speed}ms ease`;
    });

    if (instance.state.wrapperEl) {
      instance.state.wrapperEl.style.transform = 'none';
      instance.state.wrapperEl.style.overflow = 'visible';
      instance.state.wrapperEl.style.position = 'relative';
      instance.state.wrapperEl.style.perspective = '1200px';
    }
  }

  return {
    name: 'effectTinder',
    init() { apply(); },
    destroy() {
      if (instance.state.wrapperEl) {
        instance.state.wrapperEl.style.perspective = '';
        instance.state.wrapperEl.style.overflow = '';
      }
    },
    onSlideChange() { apply(); },
    update() { apply(); },
  };
};
