import type { RailInstance, RailModule, RailModuleFactory, MousewheelOptions } from '../types';

const DEFAULTS: MousewheelOptions = {
  enabled: true,
  forceToAxis: false,
  releaseOnEdges: false,
  invert: false,
  sensitivity: 1,
  eventsTarget: 'container',
  thresholdDelta: null,
  thresholdTime: null,
};

function resolve(opts: MousewheelOptions | boolean | undefined): MousewheelOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * Mousewheel module — enables scroll-wheel navigation for the carousel.
 * Supports axis forcing, edge release, inversion, and delta/time thresholds.
 *
 * @param instance - The Rail instance to attach wheel events to
 * @returns RailModule with wheel event handling
 *
 * @example
 * ```tsx
 * <Rail modules={[Mousewheel]} mousewheel={{ sensitivity: 1, forceToAxis: true }} />
 * ```
 */
export const Mousewheel: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.mousewheel);
  let lastTime = 0;
  let target: HTMLElement | null = null;

  function getTarget(): HTMLElement | null {
    if (config.eventsTarget === 'container') return instance.state.containerEl;
    if (typeof config.eventsTarget === 'string') return document.querySelector(config.eventsTarget);
    return config.eventsTarget as HTMLElement | null;
  }

  function onWheel(e: WheelEvent) {
    if (!config.enabled || instance.state.isLocked) return;

    const now = Date.now();
    if (config.thresholdTime && now - lastTime < config.thresholdTime) return;

    const isH = instance.options.direction === 'horizontal';
    let delta = isH ? (e.deltaX || e.deltaY) : e.deltaY;

    if (config.forceToAxis) {
      delta = isH ? e.deltaX : e.deltaY;
      if (delta === 0) return;
    }

    if (config.invert) delta = -delta;
    if (config.thresholdDelta && Math.abs(delta) < config.thresholdDelta) return;

    if (config.releaseOnEdges) {
      if ((delta < 0 && instance.state.isBeginning) || (delta > 0 && instance.state.isEnd)) return;
    }

    e.preventDefault();
    lastTime = now;

    if (delta > 0) instance.slideNext();
    else instance.slidePrev();
  }

  return {
    name: 'mousewheel',
    init() {
      if (!config.enabled) return;
      target = getTarget();
      target?.addEventListener('wheel', onWheel, { passive: false });
    },
    destroy() {
      target?.removeEventListener('wheel', onWheel);
    },
  };
};
