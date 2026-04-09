import type { RailInstance, RailModule, RailModuleFactory, VirtualOptions, VirtualData } from '../types';

const DEFAULTS: VirtualOptions = {
  enabled: true,
  cache: true,
  addSlidesBefore: 1,
  addSlidesAfter: 1,
};

function resolve(opts: VirtualOptions | boolean | undefined): VirtualOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * Virtual Slides module — renders only the slides currently visible in the
 * viewport for improved performance with large slide sets. Maintains a cache
 * and dynamically adds/removes DOM nodes as the user navigates.
 *
 * @param instance - The Rail instance to virtualize
 * @returns RailModule with virtual rendering lifecycle
 *
 * @example
 * ```tsx
 * <Rail modules={[Virtual]} virtual={{ slides: myLargeArray, renderSlide: (slide) => <Card {...slide} /> }} />
 * ```
 */
export const Virtual: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.virtual);
  const cache = new Map<number, unknown>();

  function computeVirtualData(): VirtualData {
    const slides = config.slides ?? [];
    const total = slides.length;
    const perView = typeof instance.options.slidesPerView === 'number' ? instance.options.slidesPerView : 1;
    const before = config.addSlidesBefore ?? 1;
    const after = config.addSlidesAfter ?? 1;

    const from = Math.max(0, instance.state.activeIndex - before);
    const to = Math.min(total - 1, instance.state.activeIndex + perView + after - 1);

    const visibleSlides: unknown[] = [];
    for (let i = from; i <= to; i++) {
      if (config.cache && cache.has(i)) {
        visibleSlides.push(cache.get(i));
      } else {
        visibleSlides.push(slides[i]);
        if (config.cache) cache.set(i, slides[i]);
      }
    }

    const slideSize = instance.state.slidesSizesGrid[0] ?? 0;
    const gap = instance.options.spaceBetween ?? 0;
    const offset = from * (slideSize + gap);

    return { offset, from, to, slides: visibleSlides };
  }

  function updateVirtual() {
    if (!config.enabled || !config.slides) return;
    const data = computeVirtualData();
    instance.state.virtualData = data;
    instance.state.slidesCount = config.slides.length;

    if (config.renderExternal) {
      config.renderExternal(data);
    }

    if (instance.state.wrapperEl) {
      const isH = instance.options.direction === 'horizontal';
      instance.state.wrapperEl.style[isH ? 'paddingLeft' : 'paddingTop'] = `${data.offset}px`;
    }
  }

  return {
    name: 'virtual',
    init() { updateVirtual(); },
    destroy() { cache.clear(); instance.state.virtualData = null; },
    onSlideChange() { updateVirtual(); },
    update() { updateVirtual(); },
  };
};
