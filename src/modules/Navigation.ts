import type { RailInstance, RailModule, RailModuleFactory, NavigationOptions, NavArrowStyle, NavArrowIcon } from '../types';

const DEFAULTS: NavigationOptions = {
  enabled: true,
  disabledClass: 'rail-nav-disabled',
  hiddenClass: 'rail-nav-hidden',
  lockClass: 'rail-nav-lock',
  arrowStyle: 'circle',
  arrowIcon: 'chevron',
};

const ARROW_STYLE_CLASSES: Record<NavArrowStyle, string> = {
  circle: 'rail-nav-circle',
  plain: 'rail-nav-plain',
  rounded: 'rail-nav-rounded',
};

const ARROW_ICON_SVG: Record<NavArrowIcon, { prev: string; next: string }> = {
  chevron: {
    prev: '<polyline points="15 18 9 12 15 6"/>',
    next: '<polyline points="9 18 15 12 9 6"/>',
  },
  arrow: {
    prev: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    next: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  },
  chevrons: {
    prev: '<polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>',
    next: '<polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>',
  },
  arrowCircle: {
    prev: '<circle cx="12" cy="12" r="10"/><polyline points="12 8 8 12 12 16"/><line x1="16" y1="12" x2="8" y2="12"/>',
    next: '<circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/>',
  },
  navigate: {
    prev: '<path d="M14 7l-5 5 5 5"/>',
    next: '<path d="M10 7l5 5-5 5"/>',
  },
};

function resolve(opts: NavigationOptions | boolean | undefined): NavigationOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * Navigation module — adds prev/next arrow controls to the carousel.
 * Supports configurable arrow styles (circle, plain, rounded), icon shapes
 * (chevron, arrow, chevrons, arrowCircle, navigate), custom colors, and sizes.
 * Automatically repositions arrows for vertical carousels.
 *
 * @param instance - The Rail instance to attach navigation to
 * @returns RailModule with init, destroy, and slide-change handlers
 *
 * @example
 * ```tsx
 * <Rail modules={[Navigation]} navigation={{ arrowStyle: 'plain', arrowIcon: 'arrow' }} />
 * ```
 */
export const Navigation: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.navigation);
  let nextEl: HTMLElement | null = null;
  let prevEl: HTMLElement | null = null;
  let createdNext = false;
  let createdPrev = false;

  function onNextClick() { instance.slideNext(); }
  function onPrevClick() { instance.slidePrev(); }

  function updateClasses() {
    const dc = config.disabledClass ?? 'rail-nav-disabled';
    if (prevEl) prevEl.classList.toggle(dc, instance.state.isBeginning && !instance.options.loop);
    if (nextEl) nextEl.classList.toggle(dc, instance.state.isEnd && !instance.options.loop);
  }

  function getElement(ref: string | HTMLElement | null | undefined): HTMLElement | null {
    if (!ref) return null;
    if (typeof ref === 'string') return instance.state.containerEl?.querySelector(ref) ?? document.querySelector(ref);
    return ref;
  }

  function createButton(className: string, ariaLabel: string, direction: 'prev' | 'next'): HTMLButtonElement {
    const btn = document.createElement('button');
    const style = config.arrowStyle ?? 'circle';
    btn.className = `${className} ${ARROW_STYLE_CLASSES[style]}`;
    btn.type = 'button';
    btn.setAttribute('aria-label', ariaLabel);

    const size = config.arrowSize;
    if (size) {
      btn.style.width = `${size}px`;
      btn.style.height = `${size}px`;
    }
    if (config.arrowColor) {
      btn.style.color = config.arrowColor;
    }

    const iconType = config.arrowIcon ?? 'chevron';
    const svgContent = ARROW_ICON_SVG[iconType][direction];
    const svgSize = size ? Math.round(size * 0.45) : 20;
    btn.innerHTML = `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${svgContent}</svg>`;
    return btn;
  }

  return {
    name: 'navigation',
    init() {
      if (!config.enabled || !instance.state.containerEl) return;
      nextEl = getElement(config.nextEl) ?? instance.state.containerEl.querySelector('.rail-nav-next') ?? null;
      prevEl = getElement(config.prevEl) ?? instance.state.containerEl.querySelector('.rail-nav-prev') ?? null;

      if (!prevEl) {
        prevEl = createButton('rail-nav-prev', 'Previous slide', 'prev');
        instance.state.containerEl.appendChild(prevEl);
        createdPrev = true;
      }
      if (!nextEl) {
        nextEl = createButton('rail-nav-next', 'Next slide', 'next');
        instance.state.containerEl.appendChild(nextEl);
        createdNext = true;
      }

      nextEl.addEventListener('click', onNextClick);
      prevEl.addEventListener('click', onPrevClick);
      updateClasses();
    },
    destroy() {
      nextEl?.removeEventListener('click', onNextClick);
      prevEl?.removeEventListener('click', onPrevClick);
      if (createdPrev) prevEl?.remove();
      if (createdNext) nextEl?.remove();
      nextEl = null;
      prevEl = null;
      createdPrev = false;
      createdNext = false;
    },
    onSlideChange() { updateClasses(); },
    update() { updateClasses(); },
  };
};
