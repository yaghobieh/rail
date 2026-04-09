import type { RailInstance, RailModule, RailModuleFactory } from '../types';

/**
 * GL Effect module — simulates a 3D depth "portal" transition with heavy
 * perspective, z-translation, and rotation for a cinematic feel. Falls back
 * to CSS transforms (no WebGL dependency).
 *
 * @param instance - The Rail instance
 * @returns RailModule with depth-based 3D transforms
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectGL]} effect="creative" />
 * ```
 */
export const EffectGL: RailModuleFactory = (instance: RailInstance): RailModule => {
  const DEPTH_Z = 600;
  const ROTATION_Y = 45;

  function apply() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    slides.forEach((el, i) => {
      const offset = i - instance.state.activeIndex;

      if (offset === 0) {
        el.style.transform = 'translate3d(0, 0, 0) rotateY(0) scale(1)';
        el.style.opacity = '1';
        el.style.zIndex = String(slides.length);
        el.style.filter = 'none';
      } else {
        const dir = offset > 0 ? 1 : -1;
        const absOff = Math.abs(offset);
        const tz = -DEPTH_Z * absOff;
        const ry = dir * ROTATION_Y * Math.min(absOff, 2);
        const scale = Math.max(0.3, 1 - absOff * 0.2);
        const opacity = Math.max(0, 1 - absOff * 0.4);

        el.style.transform = `translate3d(${dir * 30 * absOff}px, 0, ${tz}px) rotateY(${ry}deg) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(slides.length - absOff);
        el.style.filter = `blur(${Math.min(absOff * 2, 6)}px)`;
      }

      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.transition = `transform ${instance.options.speed}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${instance.options.speed}ms ease, filter ${instance.options.speed}ms ease`;
    });

    if (instance.state.wrapperEl) {
      instance.state.wrapperEl.style.transform = 'none';
      instance.state.wrapperEl.style.overflow = 'visible';
      instance.state.wrapperEl.style.position = 'relative';
      instance.state.wrapperEl.style.perspective = '1600px';
      instance.state.wrapperEl.style.perspectiveOrigin = '50% 50%';
    }
  }

  return {
    name: 'effectGL',
    init() { apply(); },
    destroy() {
      if (instance.state.wrapperEl) {
        instance.state.wrapperEl.style.perspective = '';
        instance.state.wrapperEl.style.perspectiveOrigin = '';
        instance.state.wrapperEl.style.overflow = '';
      }
    },
    onSlideChange() { apply(); },
    update() { apply(); },
  };
};
