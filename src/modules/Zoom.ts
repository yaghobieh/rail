import type { RailInstance, RailModule, RailModuleFactory, ZoomOptions } from '../types';

const DEFAULTS: ZoomOptions = {
  enabled: true,
  maxRatio: 3,
  minRatio: 1,
  toggle: true,
  containerClass: 'rail-zoom-container',
};

function resolve(opts: ZoomOptions | boolean | undefined): ZoomOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * Zoom module — enables pinch-to-zoom and double-tap zoom on slide content
 * wrapped in `.rail-zoom-container`. Supports configurable max ratio
 * and toggle behavior.
 *
 * @param instance - The Rail instance to add zoom to
 * @returns RailModule with zoom-in/zoom-out/toggle controls
 *
 * @example
 * ```tsx
 * <Rail modules={[Zoom]} zoom={{ maxRatio: 3 }}>
 *   <RailSlide zoom><img src="photo.jpg" /></RailSlide>
 * </Rail>
 * ```
 */
export const Zoom: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.zoom);
  let currentScale = 1;
  let isZoomed = false;

  function getActiveZoomContainer(): HTMLElement | null {
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide');
    const active = slides?.[instance.state.activeIndex];
    return active?.querySelector(`.${config.containerClass ?? 'rail-zoom-container'}`) ?? null;
  }

  function zoomIn(ratio?: number) {
    const container = getActiveZoomContainer();
    if (!container) return;
    currentScale = Math.min(ratio ?? (config.maxRatio ?? 3), config.maxRatio ?? 3);
    container.style.transform = `scale(${currentScale})`;
    container.style.transition = 'transform 0.3s ease';
    isZoomed = true;
    instance.disable();
  }

  function zoomOut() {
    const container = getActiveZoomContainer();
    if (!container) return;
    currentScale = 1;
    container.style.transform = `scale(1)`;
    container.style.transition = 'transform 0.3s ease';
    isZoomed = false;
    instance.enable();
  }

  function onDoubleClick(e: MouseEvent) {
    if (!config.enabled || !config.toggle) return;
    const target = e.target as HTMLElement;
    if (!target.closest(`.${config.containerClass ?? 'rail-zoom-container'}`)) return;
    e.preventDefault();
    if (isZoomed) zoomOut();
    else zoomIn();
  }

  return {
    name: 'zoom',
    init() {
      if (!config.enabled) return;
      instance.state.containerEl?.addEventListener('dblclick', onDoubleClick);
    },
    destroy() {
      instance.state.containerEl?.removeEventListener('dblclick', onDoubleClick);
      zoomOut();
    },
    onSlideChange() {
      if (isZoomed) zoomOut();
    },
  };
};
