import type { RailInstance, RailModule, RailModuleFactory, CoverflowEffectOptions } from '../types';

const DEFAULTS: CoverflowEffectOptions = {
  slideShadows: true,
  rotate: 50,
  stretch: 0,
  depth: 100,
  modifier: 1,
  scale: 1,
};

/**
 * Coverflow Effect module — arranges slides in a 3D "coverflow" arc with
 * perspective rotation and configurable depth, stretch, and scale.
 *
 * @param instance - The Rail instance to apply the coverflow effect to
 * @returns RailModule with 3D coverflow transforms
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectCoverflow]} effect="coverflow" coverflowEffect={{ depth: 100, rotate: 50 }} />
 * ```
 */
export const EffectCoverflow: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: CoverflowEffectOptions = { ...DEFAULTS, ...instance.options.coverflowEffect };

  function applyCoverflow() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    const isH = instance.options.direction === 'horizontal';
    const mod = config.modifier ?? 1;

    slides.forEach((el, i) => {
      const offset = i - instance.state.activeIndex;
      const rotate = offset * (config.rotate ?? 50) * mod;
      const depth = Math.abs(offset) * (config.depth ?? 100) * mod;
      const stretch = offset * (config.stretch ?? 0) * mod;
      const scale = 1 - Math.abs(offset) * (1 - (config.scale ?? 1));

      el.style.transition = `transform ${instance.options.speed}ms ease`;
      el.style.zIndex = String(slides.length - Math.abs(offset));

      if (isH) {
        el.style.transform = `rotateY(${rotate}deg) translateZ(${-depth}px) translateX(${stretch}px) scale(${scale})`;
      } else {
        el.style.transform = `rotateX(${-rotate}deg) translateZ(${-depth}px) translateY(${stretch}px) scale(${scale})`;
      }
    });

    if (instance.state.wrapperEl) {
      instance.state.wrapperEl.style.transform = 'none';
      instance.state.wrapperEl.style.perspective = '1200px';
      instance.state.wrapperEl.style.overflow = 'visible';
    }
  }

  return {
    name: 'effectCoverflow',
    init() { applyCoverflow(); },
    destroy() {
      if (instance.state.wrapperEl) {
        instance.state.wrapperEl.style.perspective = '';
        instance.state.wrapperEl.style.overflow = '';
      }
    },
    onSlideChange() { applyCoverflow(); },
    update() { applyCoverflow(); },
  };
};
