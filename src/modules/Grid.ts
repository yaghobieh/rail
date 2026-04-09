import type { RailInstance, RailModule, RailModuleFactory, GridOptions } from '../types';

const DEFAULTS: GridOptions = { rows: 1, fill: 'column' };

/**
 * Grid module — arranges slides in a multi-row grid layout. Supports
 * column-first or row-first fill order and configurable row count.
 *
 * @param instance - The Rail instance to apply grid layout to
 * @returns RailModule with grid dimension calculations
 *
 * @example
 * ```tsx
 * <Rail modules={[Grid]} grid={{ rows: 2, fill: 'column' }} />
 * ```
 */
export const Grid: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: GridOptions = { ...DEFAULTS, ...instance.options.grid };

  function updateGrid() {
    if (!instance.state.wrapperEl || !config.rows || config.rows <= 1) return;
    const slides = Array.from(instance.state.wrapperEl.querySelectorAll('.rail-slide')) as HTMLElement[];
    const rows = config.rows;
    const isH = instance.options.direction === 'horizontal';
    const gap = instance.options.spaceBetween ?? 0;
    const perView = typeof instance.options.slidesPerView === 'number' ? instance.options.slidesPerView : 1;

    if (isH) {
      const slideWidth = (instance.state.width - gap * (perView - 1)) / perView;
      const slideHeight = (instance.state.height - gap * (rows - 1)) / rows;

      slides.forEach((el, i) => {
        const col = config.fill === 'column' ? Math.floor(i / rows) : i % Math.ceil(slides.length / rows);
        const row = config.fill === 'column' ? i % rows : Math.floor(i / Math.ceil(slides.length / rows));

        el.style.width = `${slideWidth}px`;
        el.style.height = `${slideHeight}px`;
        el.style.marginRight = `${gap}px`;
        el.style.marginBottom = `${gap}px`;
        el.style.position = 'absolute';
        el.style.left = `${col * (slideWidth + gap)}px`;
        el.style.top = `${row * (slideHeight + gap)}px`;
      });

      const totalCols = Math.ceil(slides.length / rows);
      instance.state.wrapperEl.style.width = `${totalCols * (slideWidth + gap)}px`;
      instance.state.wrapperEl.style.height = `${instance.state.height}px`;
      instance.state.wrapperEl.style.position = 'relative';
    }
  }

  return {
    name: 'grid',
    init() { updateGrid(); },
    destroy() {
      if (!instance.state.wrapperEl) return;
      const slides = Array.from(instance.state.wrapperEl.querySelectorAll('.rail-slide')) as HTMLElement[];
      slides.forEach((el) => {
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
      });
    },
    update() { updateGrid(); },
    onResize() { updateGrid(); },
  };
};
