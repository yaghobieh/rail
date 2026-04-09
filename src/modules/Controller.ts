import type { RailInstance, RailModule, RailModuleFactory, ControllerOptions } from '../types';

/**
 * Controller module — synchronizes two Rail instances so they move together.
 * Useful for linking a main carousel with a thumbnail carousel.
 *
 * @param instance - The Rail instance to make controllable
 * @returns RailModule that mirrors slide changes to a controlled instance
 *
 * @example
 * ```tsx
 * <Rail modules={[Controller]} controller={{ control: thumbsRailRef }} />
 * ```
 */
export const Controller: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: ControllerOptions = instance.options.controller ?? {};

  function syncControlled(index: number) {
    if (!config.control) return;
    const targets = Array.isArray(config.control) ? config.control : [config.control];
    targets.forEach((target) => {
      if (target === instance || target.state.destroyed) return;
      if (config.by === 'container') {
        const progress = instance.state.progress;
        const maxT = target.state.snapGrid[target.state.snapGrid.length - 1] ?? 0;
        target.setTranslate(-(config.inverse ? 1 - progress : progress) * maxT);
        target.setTransition(instance.options.speed);
      } else {
        const targetIndex = config.inverse ? target.state.slidesCount - 1 - index : index;
        target.slideTo(targetIndex, instance.options.speed, false);
      }
    });
  }

  return {
    name: 'controller',
    init() {},
    destroy() {},
    onSlideChange(index) { syncControlled(index); },
  };
};
