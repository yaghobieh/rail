import type { RailInstance, RailModule, RailModuleFactory, FreeModeOptions } from '../types';

const DEFAULTS: FreeModeOptions = {
  enabled: true,
  momentum: true,
  momentumRatio: 1,
  momentumBounce: true,
  momentumBounceRatio: 1,
  momentumVelocityRatio: 1,
  sticky: false,
  minimumVelocity: 0.02,
};

function resolve(opts: FreeModeOptions | boolean | undefined): FreeModeOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * FreeMode module — disables snapping so slides scroll freely with momentum.
 * Supports configurable momentum ratio, bounce ratio, and sticky behavior.
 *
 * @param instance - The Rail instance to enable free mode on
 * @returns RailModule with momentum and free-scroll handling
 *
 * @example
 * ```tsx
 * <Rail modules={[FreeMode]} freeMode={{ momentum: true, momentumRatio: 1 }} />
 * ```
 */
export const FreeMode: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.freeMode);
  let lastPos = 0;
  let lastTime = 0;
  let velocity = 0;

  return {
    name: 'freeMode',
    init() {},
    destroy() {},
    onTouchMove() {
      if (!config.enabled) return;
      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (instance.state.translate - lastPos) / dt;
      }
      lastPos = instance.state.translate;
      lastTime = now;
    },
    onTouchEnd() {
      if (!config.enabled || !config.momentum) return;
      const minV = config.minimumVelocity ?? 0.02;
      if (Math.abs(velocity) < minV) {
        if (config.sticky) snapToClosest();
        return;
      }

      const ratio = config.momentumVelocityRatio ?? 1;
      const momentumDistance = velocity * ratio * 300;
      let target = instance.state.translate + momentumDistance;

      const maxT = instance.state.snapGrid[instance.state.snapGrid.length - 1] ?? 0;
      if (config.momentumBounce) {
        const bounceR = config.momentumBounceRatio ?? 1;
        if (target > 0) target = target * bounceR;
        if (target < -maxT) target = -maxT + (target + maxT) * bounceR;
      } else {
        target = Math.max(-maxT, Math.min(0, target));
      }

      instance.setTranslate(target);
      instance.setTransition(600);

      setTimeout(() => {
        instance.setTransition(0);
        if (config.sticky) snapToClosest();
      }, 600);
    },
  };

  function snapToClosest() {
    let closest = 0;
    let closestDist = Infinity;
    instance.state.snapGrid.forEach((snap, i) => {
      const dist = Math.abs(-instance.state.translate - snap);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    instance.slideTo(closest);
  }
};
