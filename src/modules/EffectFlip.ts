import type { RailInstance, RailModule, RailModuleFactory, FlipEffectOptions } from '../types';

const DEFAULTS: FlipEffectOptions = { slideShadows: true, limitRotation: true };

/**
 * Flip Effect module — transitions between slides with a 3D page-flip
 * animation around the Y-axis. Supports slide shadows and rotation limits.
 *
 * @param instance - The Rail instance to apply the flip effect to
 * @returns RailModule with 3D flip rotation transforms
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectFlip]} effect="flip" />
 * ```
 */
export const EffectFlip: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: FlipEffectOptions = { ...DEFAULTS, ...instance.options.flipEffect };

  function applyFlip() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    const isH = instance.options.direction === 'horizontal';

    slides.forEach((el, i) => {
      const offset = i - instance.state.activeIndex;
      let rotate = offset * 180;
      if (config.limitRotation) rotate = Math.max(-180, Math.min(180, rotate));

      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.backfaceVisibility = 'hidden';
      el.style.transition = `transform ${instance.options.speed}ms ease`;
      el.style.transform = isH ? `rotateY(${rotate}deg)` : `rotateX(${-rotate}deg)`;
      el.style.zIndex = i === instance.state.activeIndex ? '1' : '0';
    });

    if (instance.state.wrapperEl) {
      instance.state.wrapperEl.style.transform = 'none';
      instance.state.wrapperEl.style.transformStyle = 'preserve-3d';
      instance.state.wrapperEl.style.perspective = '1200px';
      instance.state.wrapperEl.style.position = 'relative';
    }
  }

  return {
    name: 'effectFlip',
    init() { applyFlip(); },
    destroy() {
      if (instance.state.wrapperEl) {
        instance.state.wrapperEl.style.transformStyle = '';
        instance.state.wrapperEl.style.perspective = '';
      }
    },
    onSlideChange() { applyFlip(); },
    update() { applyFlip(); },
  };
};
