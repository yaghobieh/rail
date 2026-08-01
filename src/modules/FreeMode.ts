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

const FRICTION = 0.95;
const MIN_FRAME_VELOCITY = 0.02;
const BOUNCE_FRICTION = 0.55;
const VELOCITY_SCALE = 16;

function resolve(opts: FreeModeOptions | boolean | undefined): FreeModeOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

export const FreeMode: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.freeMode);
  let lastPos = 0;
  let lastTime = 0;
  let velocity = 0;
  let momentumFrame: number | null = null;

  function cancelMomentum() {
    if (momentumFrame !== null) {
      cancelAnimationFrame(momentumFrame);
      momentumFrame = null;
    }
  }

  function getBounds() {
    const maxT = instance.state.snapGrid[instance.state.snapGrid.length - 1] ?? 0;
    return { min: -maxT, max: 0 };
  }

  function snapToClosest() {
    let closest = 0;
    let closestDist = Infinity;
    instance.state.snapGrid.forEach((snap, i) => {
      const dist = Math.abs(-instance.state.translate - snap);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    instance.slideTo(closest);
  }

  function runMomentum(initialVelocity: number) {
    cancelMomentum();
    const ratio = (config.momentumVelocityRatio ?? 1) * (config.momentumRatio ?? 1);
    let currentVelocity = initialVelocity * ratio * VELOCITY_SCALE;

    const tick = () => {
      let next = instance.state.translate + currentVelocity;
      const { min, max } = getBounds();

      if (config.momentumBounce) {
        const bounceR = (config.momentumBounceRatio ?? 1) * BOUNCE_FRICTION;
        if (next > max) {
          next = max + (next - max) * bounceR;
          currentVelocity *= -bounceR;
        } else if (next < min) {
          next = min + (next - min) * bounceR;
          currentVelocity *= -bounceR;
        }
      } else {
        next = Math.max(min, Math.min(max, next));
        if (next === min || next === max) currentVelocity = 0;
      }

      instance.setTransition(0);
      instance.setTranslate(next);
      currentVelocity *= FRICTION;

      if (Math.abs(currentVelocity) < MIN_FRAME_VELOCITY) {
        momentumFrame = null;
        const clamped = Math.max(min, Math.min(max, instance.state.translate));
        if (clamped !== instance.state.translate) instance.setTranslate(clamped);
        if (config.sticky) snapToClosest();
        return;
      }

      momentumFrame = requestAnimationFrame(tick);
    };

    momentumFrame = requestAnimationFrame(tick);
  }

  return {
    name: 'freeMode',
    init() {},
    destroy() {
      cancelMomentum();
    },
    onTouchStart() {
      cancelMomentum();
      lastPos = instance.state.translate;
      lastTime = Date.now();
      velocity = 0;
    },
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
      if (!config.enabled || !config.momentum) {
        if (config.sticky) snapToClosest();
        return;
      }
      const minV = config.minimumVelocity ?? MIN_FRAME_VELOCITY;
      if (Math.abs(velocity) < minV) {
        if (config.sticky) snapToClosest();
        return;
      }
      runMomentum(velocity);
    },
  };
};
