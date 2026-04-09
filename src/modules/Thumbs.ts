import type { RailInstance, RailModule, RailModuleFactory, ThumbsOptions } from '../types';

/**
 * Thumbs module — links a main carousel with a separate thumbnail carousel.
 * Clicking a thumbnail navigates the main carousel to the corresponding slide.
 *
 * @param instance - The main Rail instance to link with thumbnails
 * @returns RailModule that manages thumb-click handlers and active-class toggling
 *
 * @example
 * ```tsx
 * <Rail modules={[Thumbs]} thumbs={{ rail: thumbsInstance }} />
 * ```
 */
export const Thumbs: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: ThumbsOptions = instance.options.thumbs ?? {};
  const activeClass = config.slideThumbActiveClass ?? 'rail-thumbs-slide-active';

  function updateThumbs(index: number) {
    const thumbsInstance = config.rail;
    if (!thumbsInstance || thumbsInstance.state.destroyed) return;

    const slides = thumbsInstance.state.wrapperEl?.querySelectorAll('.rail-slide');
    slides?.forEach((el, i) => {
      el.classList.toggle(activeClass, config.multipleActiveThumbs
        ? Math.abs(i - index) <= (config.autoScrollOffset ?? 0)
        : i === index);
    });

    thumbsInstance.slideTo(index, thumbsInstance.options.speed, false);
  }

  function onThumbClick(e: Event) {
    const target = (e.target as HTMLElement).closest('.rail-slide') as HTMLElement | null;
    if (!target) return;
    const idx = target.dataset.railSlideIndex;
    if (idx !== undefined) instance.slideTo(parseInt(idx, 10));
  }

  return {
    name: 'thumbs',
    init() {
      if (!config.rail) return;
      config.rail.state.containerEl?.addEventListener('click', onThumbClick);
      updateThumbs(instance.state.activeIndex);
    },
    destroy() {
      config.rail?.state.containerEl?.removeEventListener('click', onThumbClick);
    },
    onSlideChange(index) { updateThumbs(index); },
  };
};
