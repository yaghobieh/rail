import type { RailInstance, RailModule, RailModuleFactory, CardsEffectOptions } from '../types';

const DEFAULTS: CardsEffectOptions = {
  slideShadows: true,
  rotate: true,
  perSlideOffset: 8,
  perSlideRotate: 2,
};

/**
 * Cards Effect module — stacks slides like a deck of cards with configurable
 * rotation, per-slide offset, and shadow effects.
 *
 * @param instance - The Rail instance to apply the cards effect to
 * @returns RailModule with stacked card transforms
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectCards]} effect="cards" cardsEffect={{ perSlideOffset: 8 }} />
 * ```
 */
export const EffectCards: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: CardsEffectOptions = { ...DEFAULTS, ...instance.options.cardsEffect };

  function applyCards() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    slides.forEach((el, i) => {
      const offset = i - instance.state.activeIndex;
      const absOffset = Math.abs(offset);
      const offsetPx = offset * (config.perSlideOffset ?? 8);
      const rotate = config.rotate ? offset * (config.perSlideRotate ?? 2) : 0;
      const scale = 1 - absOffset * 0.05;
      const opacity = absOffset > 3 ? 0 : 1;

      el.style.position = 'absolute';
      el.style.top = '50%';
      el.style.left = '50%';
      el.style.width = '85%';
      el.style.height = '85%';
      el.style.transition = `transform ${instance.options.speed}ms ease, opacity ${instance.options.speed}ms ease`;
      el.style.transform = `translate(-50%, -50%) translateX(${offsetPx}px) rotate(${rotate}deg) scale(${scale})`;
      el.style.zIndex = String(slides.length - absOffset);
      el.style.opacity = String(opacity);
      el.style.borderRadius = '12px';
    });

    if (instance.state.wrapperEl) {
      instance.state.wrapperEl.style.transform = 'none';
      instance.state.wrapperEl.style.overflow = 'visible';
      instance.state.wrapperEl.style.position = 'relative';
    }
  }

  return {
    name: 'effectCards',
    init() { applyCards(); },
    destroy() {
      if (instance.state.wrapperEl) {
        instance.state.wrapperEl.style.overflow = '';
      }
    },
    onSlideChange() { applyCards(); },
    update() { applyCards(); },
  };
};
