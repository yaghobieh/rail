import type { RailInstance, RailModule, RailModuleFactory, PaginationOptions } from '../types';

const DEFAULTS: PaginationOptions = {
  enabled: true,
  type: 'bullets',
  clickable: true,
  dynamicBullets: false,
  dynamicMainBullets: 1,
  hideOnClick: false,
  bulletClass: 'rail-pagination-bullet',
  bulletActiveClass: 'rail-pagination-bullet-active',
};

function resolve(opts: PaginationOptions | boolean | undefined): PaginationOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * Pagination module — renders bullet, fraction, or progressbar indicators
 * that reflect the current slide position. Supports clickable bullets and
 * custom render functions.
 *
 * @param instance - The Rail instance to attach pagination to
 * @returns RailModule with init, destroy, and render logic
 *
 * @example
 * ```tsx
 * <Rail modules={[Pagination]} pagination={{ clickable: true, type: 'bullets' }} />
 * ```
 */
export const Pagination: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.pagination);
  let el: HTMLElement | null = null;

  function getElement(ref: string | HTMLElement | null | undefined): HTMLElement | null {
    if (!ref) return null;
    if (typeof ref === 'string') return instance.state.containerEl?.querySelector(ref) ?? document.querySelector(ref);
    return ref;
  }

  function render() {
    if (!el || !config.enabled) return;
    const total = Math.ceil(instance.state.slidesCount / (instance.options.slidesPerGroup ?? 1));
    const activeIdx = Math.floor(instance.state.activeIndex / (instance.options.slidesPerGroup ?? 1));
    const bc = config.bulletClass ?? 'rail-pagination-bullet';
    const ac = config.bulletActiveClass ?? 'rail-pagination-bullet-active';

    switch (config.type) {
      case 'bullets': {
        el.innerHTML = Array.from({ length: total }, (_, i) => {
          const cls = `${bc}${i === activeIdx ? ` ${ac}` : ''}`;
          if (config.renderBullet) return config.renderBullet(i, cls);
          return `<span class="${cls}" data-index="${i}"></span>`;
        }).join('');
        break;
      }
      case 'fraction': {
        if (config.renderFraction) {
          el.innerHTML = config.renderFraction(activeIdx + 1, total);
        } else {
          el.innerHTML = `<span class="rail-pagination-current">${activeIdx + 1}</span> / <span class="rail-pagination-total">${total}</span>`;
        }
        el.classList.add('rail-pagination-fraction');
        break;
      }
      case 'progressbar': {
        const progress = total <= 1 ? 1 : activeIdx / (total - 1);
        if (config.renderProgressbar) {
          el.innerHTML = config.renderProgressbar(progress);
        } else {
          el.innerHTML = `<span class="rail-pagination-progressbar-fill" style="transform: scaleX(${progress})"></span>`;
        }
        el.classList.add('rail-pagination-progressbar');
        break;
      }
    }
  }

  function onClick(e: Event) {
    const target = e.target as HTMLElement;
    const indexStr = target.getAttribute('data-index');
    if (indexStr !== null && config.clickable) {
      const idx = parseInt(indexStr, 10);
      instance.slideTo(idx * (instance.options.slidesPerGroup ?? 1));
    }
  }

  return {
    name: 'pagination',
    init() {
      if (!config.enabled) return;
      el = getElement(config.el) ?? instance.state.containerEl?.querySelector('.rail-pagination') ?? null;
      if (!el) {
        el = document.createElement('div');
        el.className = 'rail-pagination';
        instance.state.containerEl?.appendChild(el);
      }
      el.addEventListener('click', onClick);
      render();
    },
    destroy() {
      el?.removeEventListener('click', onClick);
    },
    onSlideChange() { render(); },
    update() { render(); },
  };
};
