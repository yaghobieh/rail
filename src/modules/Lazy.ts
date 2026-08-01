import type { RailInstance, RailModule, RailModuleFactory, LazyOptions } from '../types';

const DEFAULTS: LazyOptions = {
  enabled: true,
  checkInView: true,
  loadPrevNext: true,
  loadOnTransitionStart: false,
  elementClass: 'rail-lazy',
  loadingClass: 'rail-lazy-loading',
  loadedClass: 'rail-lazy-loaded',
  preloaderClass: 'rail-lazy-preloader',
};

const DATA_SRC = 'data-src';
const DATA_SRCSET = 'data-srcset';
const DATA_POSTER = 'data-poster';
const IMG_SELECTOR = 'img, source, video';
const SLIDE_SELECTOR = '.rail-slide';
const ONE = 1;
const ZERO = 0;

function resolve(opts: LazyOptions | boolean | undefined): LazyOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

export const Lazy: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.lazy);
  const loaded = new Set<Element>();

  function getSlides(): HTMLElement[] {
    if (!instance.state.wrapperEl) return [];
    return Array.from(instance.state.wrapperEl.querySelectorAll(SLIDE_SELECTOR));
  }

  function loadElement(el: Element) {
    if (loaded.has(el) || !(el instanceof HTMLElement)) return;
    const elementClass = config.elementClass ?? 'rail-lazy';
    const loadingClass = config.loadingClass ?? 'rail-lazy-loading';
    const loadedClass = config.loadedClass ?? 'rail-lazy-loaded';

    el.classList.add(loadingClass);

    const dataSrc = el.getAttribute(DATA_SRC);
    const dataSrcset = el.getAttribute(DATA_SRCSET);
    const dataPoster = el.getAttribute(DATA_POSTER);

    if (el instanceof HTMLImageElement) {
      if (dataSrc) el.src = dataSrc;
      if (dataSrcset) el.srcset = dataSrcset;
      el.loading = 'eager';
    } else if (el instanceof HTMLSourceElement) {
      if (dataSrcset) el.srcset = dataSrcset;
      if (dataSrc) el.src = dataSrc;
    } else if (el instanceof HTMLVideoElement) {
      if (dataPoster) el.poster = dataPoster;
      if (dataSrc) el.src = dataSrc;
    }

    el.removeAttribute(DATA_SRC);
    el.removeAttribute(DATA_SRCSET);
    el.removeAttribute(DATA_POSTER);
    el.classList.remove(elementClass, loadingClass);
    el.classList.add(loadedClass);
    loaded.add(el);
  }

  function loadSlide(slide: HTMLElement) {
    const elementClass = config.elementClass ?? 'rail-lazy';
    const targets = slide.querySelectorAll(
      `${IMG_SELECTOR}.${elementClass}, ${IMG_SELECTOR}[${DATA_SRC}], .${elementClass}`,
    );
    targets.forEach((el) => loadElement(el));

    if (slide.classList.contains(elementClass) || slide.hasAttribute(DATA_SRC)) {
      loadElement(slide);
    }
  }

  function loadVisible() {
    if (!config.enabled) return;
    const slides = getSlides();
    if (slides.length === ZERO) return;

    const active = instance.state.activeIndex;
    const perView = typeof instance.options.slidesPerView === 'number'
      ? instance.options.slidesPerView
      : ONE;
    const buffer = config.loadPrevNext === false ? ZERO : ONE;
    const from = Math.max(ZERO, active - buffer);
    const to = Math.min(slides.length - ONE, active + perView + buffer - ONE);

    for (let i = from; i <= to; i++) {
      loadSlide(slides[i]);
    }
  }

  return {
    name: 'lazy',
    init() {
      loadVisible();
    },
    destroy() {
      loaded.clear();
    },
    onSlideChange() {
      if (config.loadOnTransitionStart) return;
      loadVisible();
    },
    onTransitionStart() {
      if (config.loadOnTransitionStart) loadVisible();
    },
    update() {
      loadVisible();
    },
  };
};
