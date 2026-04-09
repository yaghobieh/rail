import type { RailInstance, RailModule, RailModuleFactory, FadeEffectOptions } from '../types';

/**
 * Fade Effect module — transitions between slides using an opacity crossfade
 * instead of the default slide transform.
 *
 * @param instance - The Rail instance to apply the fade effect to
 * @returns RailModule with fade transition logic
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectFade]} effect="fade" fadeEffect={{ crossFade: true }} />
 * ```
 */
export const EffectFade: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: FadeEffectOptions = instance.options.fadeEffect ?? {};

  function applyFade() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    slides.forEach((el, i) => {
      const isActive = i === instance.state.activeIndex;
      el.style.opacity = isActive ? '1' : '0';
      el.style.transition = `opacity ${instance.options.speed}ms ease`;
      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.zIndex = isActive ? '1' : '0';

      if (config.crossFade) {
        el.style.pointerEvents = isActive ? 'auto' : 'none';
      } else {
        el.style.visibility = isActive ? 'visible' : 'hidden';
      }
    });

    if (instance.state.wrapperEl) {
      instance.state.wrapperEl.style.transform = 'none';
      instance.state.wrapperEl.style.position = 'relative';
    }
  }

  return {
    name: 'effectFade',
    init() { applyFade(); },
    destroy() {
      const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
      slides?.forEach((el) => {
        el.style.opacity = '';
        el.style.position = '';
        el.style.visibility = '';
        el.style.zIndex = '';
        el.style.pointerEvents = '';
      });
    },
    onSlideChange() { applyFade(); },
    onTransitionStart() { applyFade(); },
    update() { applyFade(); },
  };
};
