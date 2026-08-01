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

const ONE = 1;
const ZERO = 0;
const PROGRESS_CLASS = 'rail-pagination-progressbar';
const FRACTION_CLASS = 'rail-pagination-fraction';
const VERTICAL_PROGRESS_CLASS = 'rail-pagination-progressbar-vertical';
const FILL_CLASS = 'rail-pagination-progressbar-fill';
const CURRENT_CLASS = 'rail-pagination-current';
const TOTAL_CLASS = 'rail-pagination-total';
const DEFAULT_EL_CLASS = 'rail-pagination';
const DEFAULT_EL_SELECTOR = '.rail-pagination';

function resolve(opts: PaginationOptions | boolean | undefined): PaginationOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

export const Pagination: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.pagination);
  let el: HTMLElement | null = null;

  function getElement(ref: string | HTMLElement | null | undefined): HTMLElement | null {
    if (!ref) return null;
    if (typeof ref === 'string') {
      return instance.state.containerEl?.querySelector(ref) ?? document.querySelector(ref);
    }
    return ref;
  }

  function getTotals() {
    const group = instance.options.slidesPerGroup ?? ONE;
    const total = Math.max(ONE, Math.ceil(instance.state.slidesCount / group));
    const activeIdx = Math.floor(instance.state.activeIndex / group);
    return { total, activeIdx, group };
  }

  function getContinuousProgress(): number {
    const progress = instance.state.progress;
    if (Number.isFinite(progress)) return Math.min(ONE, Math.max(ZERO, progress));
    const { total, activeIdx } = getTotals();
    return total <= ONE ? ONE : activeIdx / (total - ONE);
  }

  function render() {
    if (!el || !config.enabled) return;
    const { total, activeIdx } = getTotals();
    const bc = config.bulletClass ?? 'rail-pagination-bullet';
    const ac = config.bulletActiveClass ?? 'rail-pagination-bullet-active';
    const isVertical = instance.options.direction === 'vertical';

    switch (config.type) {
      case 'bullets': {
        el.classList.remove(PROGRESS_CLASS, FRACTION_CLASS, VERTICAL_PROGRESS_CLASS);
        el.innerHTML = Array.from({ length: total }, (_, i) => {
          const cls = `${bc}${i === activeIdx ? ` ${ac}` : ''}`;
          if (config.renderBullet) return config.renderBullet(i, cls);
          return `<span class="${cls}" data-index="${i}"></span>`;
        }).join('');
        break;
      }
      case 'fraction': {
        el.classList.remove(PROGRESS_CLASS, VERTICAL_PROGRESS_CLASS);
        el.classList.add(FRACTION_CLASS);
        if (config.renderFraction) {
          el.innerHTML = config.renderFraction(activeIdx + ONE, total);
        } else {
          el.innerHTML = `<span class="${CURRENT_CLASS}">${activeIdx + ONE}</span> / <span class="${TOTAL_CLASS}">${total}</span>`;
        }
        break;
      }
      case 'progressbar': {
        const progress = getContinuousProgress();
        el.classList.remove(FRACTION_CLASS);
        el.classList.add(PROGRESS_CLASS);
        el.classList.toggle(VERTICAL_PROGRESS_CLASS, isVertical);
        if (config.renderProgressbar) {
          el.innerHTML = config.renderProgressbar(progress);
        } else {
          const transform = isVertical
            ? `scaleY(${progress})`
            : `scaleX(${progress})`;
          el.innerHTML = `<span class="${FILL_CLASS}" style="transform: ${transform}"></span>`;
        }
        break;
      }
      default:
        break;
    }
  }

  function onClick(e: Event) {
    const target = e.target as HTMLElement;
    const indexStr = target.getAttribute('data-index');
    if (indexStr !== null && config.clickable) {
      const idx = parseInt(indexStr, 10);
      instance.slideTo(idx * (instance.options.slidesPerGroup ?? ONE));
    }
  }

  function onProgress() {
    if (config.type === 'progressbar') render();
  }

  return {
    name: 'pagination',
    init() {
      if (!config.enabled) return;
      el = getElement(config.el)
        ?? instance.state.containerEl?.querySelector(DEFAULT_EL_SELECTOR)
        ?? null;
      if (!el) {
        el = document.createElement('div');
        el.className = DEFAULT_EL_CLASS;
        instance.state.containerEl?.appendChild(el);
      }
      el.addEventListener('click', onClick);
      instance.on('progress', onProgress);
      render();
    },
    destroy() {
      el?.removeEventListener('click', onClick);
      instance.off('progress', onProgress);
    },
    onSlideChange() { render(); },
    update() { render(); },
  };
};
