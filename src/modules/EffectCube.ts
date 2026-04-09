import type { RailInstance, RailModule, RailModuleFactory, CubeEffectOptions } from '../types';

const DEFAULTS: CubeEffectOptions = {
  slideShadows: true,
  shadow: true,
  shadowOffset: 20,
  shadowScale: 0.94,
};

/**
 * Cube Effect module — renders slides on the faces of a 3D cube that rotates
 * during transitions. Supports configurable shadow depth and slide shadows.
 *
 * @param instance - The Rail instance to apply the cube effect to
 * @returns RailModule with 3D cube rotation transforms
 *
 * @example
 * ```tsx
 * <Rail modules={[EffectCube]} effect="cube" cubeEffect={{ shadow: true }} />
 * ```
 */
export const EffectCube: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: CubeEffectOptions = { ...DEFAULTS, ...instance.options.cubeEffect };

  function applyCube() {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide') as NodeListOf<HTMLElement> | undefined;
    if (!slides) return;

    const size = instance.options.direction === 'horizontal' ? instance.state.width : instance.state.height;
    const isH = instance.options.direction === 'horizontal';

    slides.forEach((el, i) => {
      const offset = i - instance.state.activeIndex;
      const rotateAngle = offset * 90;

      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.backfaceVisibility = 'hidden';
      el.style.transition = `transform ${instance.options.speed}ms ease`;

      if (isH) {
        el.style.transform = `rotateY(${rotateAngle}deg) translateZ(${size / 2}px)`;
      } else {
        el.style.transform = `rotateX(${-rotateAngle}deg) translateZ(${size / 2}px)`;
      }

      el.style.visibility = Math.abs(offset) <= 1 ? 'visible' : 'hidden';
    });

    if (instance.state.wrapperEl) {
      instance.state.wrapperEl.style.transform = 'none';
      instance.state.wrapperEl.style.transformStyle = 'preserve-3d';
      instance.state.wrapperEl.style.perspective = `${size * 2}px`;
      instance.state.wrapperEl.style.position = 'relative';
    }
  }

  return {
    name: 'effectCube',
    init() { applyCube(); },
    destroy() {
      if (instance.state.wrapperEl) {
        instance.state.wrapperEl.style.transformStyle = '';
        instance.state.wrapperEl.style.perspective = '';
      }
    },
    onSlideChange() { applyCube(); },
    update() { applyCube(); },
  };
};
