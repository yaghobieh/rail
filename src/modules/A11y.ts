import type { RailInstance, RailModule, RailModuleFactory, A11yOptions } from '../types';

const DEFAULTS: A11yOptions = {
  enabled: true,
  prevSlideMessage: 'Previous slide',
  nextSlideMessage: 'Next slide',
  firstSlideMessage: 'This is the first slide',
  lastSlideMessage: 'This is the last slide',
  paginationBulletMessage: 'Go to slide {{index}}',
  slideLabelMessage: '{{index}} / {{slidesLength}}',
  slideRole: 'group',
  containerRole: 'region',
  containerRoleDescriptionMessage: 'carousel',
  containerMessage: '',
  itemRoleDescriptionMessage: 'slide',
  focusOnChange: true,
  rovingTabindex: true,
};

const TABINDEX_FOCUSABLE = '0';
const TABINDEX_HIDDEN = '-1';
const ARIA_TRUE = 'true';
const ARIA_FALSE = 'false';
const LIVE_POLITE = 'polite';
const ROLE_BUTTON = 'button';
const SLIDE_SELECTOR = '.rail-slide';
const NAV_PREV_SELECTOR = '.rail-nav-prev';
const NAV_NEXT_SELECTOR = '.rail-nav-next';
const BULLET_SELECTOR = '.rail-pagination-bullet';

function resolve(opts: A11yOptions | boolean | undefined): A11yOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

export const A11y: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.a11y);
  let previousActiveIndex = instance.state.activeIndex;
  let focusPending = false;

  function getSlides(): Element[] {
    return Array.from(instance.state.wrapperEl?.querySelectorAll(SLIDE_SELECTOR) ?? []);
  }

  function applyAccessibility(shouldFocus = false) {
    const container = instance.state.containerEl;
    if (!container || !config.enabled) return;

    container.setAttribute('role', config.containerRole ?? 'region');
    container.setAttribute(
      'aria-roledescription',
      config.containerRoleDescriptionMessage ?? 'carousel',
    );
    if (config.containerMessage) container.setAttribute('aria-label', config.containerMessage);
    if (config.id) container.setAttribute('id', config.id);
    container.setAttribute('aria-live', LIVE_POLITE);
    container.setAttribute('tabindex', TABINDEX_FOCUSABLE);

    const slides = getSlides();
    const activeIndex = instance.state.activeIndex;
    const useRoving = config.rovingTabindex !== false;

    slides.forEach((el, i) => {
      const isActive = i === activeIndex;
      el.setAttribute('role', config.slideRole ?? 'group');
      el.setAttribute(
        'aria-roledescription',
        config.itemRoleDescriptionMessage ?? 'slide',
      );
      const label = (config.slideLabelMessage ?? '{{index}} / {{slidesLength}}')
        .replace('{{index}}', String(i + 1))
        .replace('{{slidesLength}}', String(instance.state.slidesCount));
      el.setAttribute('aria-label', label);
      el.setAttribute('aria-hidden', isActive ? ARIA_FALSE : ARIA_TRUE);
      if (useRoving) {
        el.setAttribute('tabindex', isActive ? TABINDEX_FOCUSABLE : TABINDEX_HIDDEN);
      }
    });

    const prevBtn = container.querySelector(NAV_PREV_SELECTOR);
    const nextBtn = container.querySelector(NAV_NEXT_SELECTOR);
    prevBtn?.setAttribute('aria-label', config.prevSlideMessage ?? 'Previous slide');
    nextBtn?.setAttribute('aria-label', config.nextSlideMessage ?? 'Next slide');

    if (instance.state.isBeginning && !instance.options.loop) {
      prevBtn?.setAttribute('aria-disabled', ARIA_TRUE);
    } else {
      prevBtn?.removeAttribute('aria-disabled');
    }
    if (instance.state.isEnd && !instance.options.loop) {
      nextBtn?.setAttribute('aria-disabled', ARIA_TRUE);
    } else {
      nextBtn?.removeAttribute('aria-disabled');
    }

    const bullets = container.querySelectorAll(BULLET_SELECTOR);
    bullets.forEach((el, i) => {
      const msg = (config.paginationBulletMessage ?? 'Go to slide {{index}}').replace(
        '{{index}}',
        String(i + 1),
      );
      el.setAttribute('aria-label', msg);
      el.setAttribute('role', ROLE_BUTTON);
      el.setAttribute('tabindex', TABINDEX_FOCUSABLE);
      el.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
    });

    if (
      shouldFocus &&
      config.focusOnChange !== false &&
      useRoving &&
      (focusPending || document.activeElement === container || slides.includes(document.activeElement as Element))
    ) {
      const activeSlide = slides[activeIndex] as HTMLElement | undefined;
      activeSlide?.focus({ preventScroll: true });
    }

    previousActiveIndex = activeIndex;
    focusPending = false;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!config.enabled || instance.state.isLocked) return;
    const container = instance.state.containerEl;
    if (!container) return;
    if (!container.contains(e.target as Node) && e.target !== container) return;

    const isH = instance.options.direction === 'horizontal';
    let handled = false;

    switch (e.key) {
      case 'ArrowLeft':
        if (isH) { focusPending = true; instance.slidePrev(); handled = true; }
        break;
      case 'ArrowRight':
        if (isH) { focusPending = true; instance.slideNext(); handled = true; }
        break;
      case 'ArrowUp':
        if (!isH) { focusPending = true; instance.slidePrev(); handled = true; }
        break;
      case 'ArrowDown':
        if (!isH) { focusPending = true; instance.slideNext(); handled = true; }
        break;
      case 'Home':
        focusPending = true;
        instance.slideTo(0);
        handled = true;
        break;
      case 'End':
        focusPending = true;
        instance.slideTo(instance.state.slidesCount - 1);
        handled = true;
        break;
      default:
        break;
    }

    if (handled) e.preventDefault();
  }

  return {
    name: 'a11y',
    init() {
      applyAccessibility(false);
      instance.state.containerEl?.addEventListener('keydown', onKeyDown);
    },
    destroy() {
      instance.state.containerEl?.removeEventListener('keydown', onKeyDown);
    },
    onSlideChange() {
      const changed = previousActiveIndex !== instance.state.activeIndex;
      applyAccessibility(changed);
    },
    update() {
      applyAccessibility(false);
    },
  };
};
