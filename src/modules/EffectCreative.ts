import type { RailInstance, RailModule, RailModuleFactory, CreativeEffectOptions } from '../types';

const DEFAULTS: CreativeEffectOptions = {
  prev: { translate: ['-100%', 0, 0], rotate: [0, 0, 0], opacity: 0, scale: 1 },
  next: { translate: ['100%', 0, 0], rotate: [0, 0, 0], opacity: 0, scale: 1 },
  limitProgress: 2,
  progressMultiplier: 1,
  perspective: true,
};

/**
 * Creative Effect module — applies fully customizable transforms (translate,
 * rotate, scale, opacity, shadow) to previous, active, and next slides
 * for bespoke transition animations.
 *
 * @param instance - The Rail instance to apply creative effects to
 * @returns RailModule with configurable per-slide transforms
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectCreative]} effect="creative" creativeEffect={{ prev: { translate: ['-100%', 0, -400] } }} />
 * ```
 */
export const EffectCreative: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: CreativeEffectOptions = { ...DEFAULTS, ...instance.options.creativeEffect };

  function resolveTranslateValue(value: string | number, size: number): number {
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseFloat(value) / 100) * size;
    }
    return Number(value);
  }

  function applyCreative() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    const size = instance.options.direction === 'horizontal' ? instance.state.width : instance.state.height;

    slides.forEach((el, i) => {
      let offset = i - instance.state.activeIndex;
      const limit = config.limitProgress ?? 2;
      offset = Math.max(-limit, Math.min(limit, offset));
      const mult = config.progressMultiplier ?? 1;
      const progress = offset * mult;

      const isActive = offset === 0;
      const isPrev = offset < 0;
      const cfg = isPrev ? config.prev : config.next;

      if (isActive) {
        el.style.transform = 'translate3d(0, 0, 0) scale(1)';
        el.style.opacity = '1';
        el.style.zIndex = String(slides.length);
      } else if (cfg) {
        const t = cfg.translate ?? [0, 0, 0];
        const tx = resolveTranslateValue(t[0], size) * Math.abs(progress);
        const ty = resolveTranslateValue(t[1], size) * Math.abs(progress);
        const tz = Number(t[2]) * Math.abs(progress);
        const r = cfg.rotate ?? [0, 0, 0];
        const rx = r[0] * Math.abs(progress);
        const ry = r[1] * Math.abs(progress);
        const rz = r[2] * Math.abs(progress);
        const scale = 1 - (1 - (cfg.scale ?? 1)) * Math.abs(progress);
        const opacity = 1 - (1 - (cfg.opacity ?? 0)) * Math.abs(progress);

        el.style.transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`;
        el.style.opacity = String(Math.max(0, opacity));
        el.style.zIndex = String(slides.length - Math.abs(Math.round(offset)));
        if (cfg.origin) el.style.transformOrigin = cfg.origin;
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
      if (config.perspective) instance.state.wrapperEl.style.perspective = '1200px';
    }
  }

  return {
    name: 'effectCreative',
    init() { applyCreative(); },
    destroy() {
      if (instance.state.wrapperEl) {
        instance.state.wrapperEl.style.perspective = '';
        instance.state.wrapperEl.style.overflow = '';
      }
    },
    onSlideChange() { applyCreative(); },
    update() { applyCreative(); },
  };
};
