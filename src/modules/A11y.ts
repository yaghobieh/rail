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
};

function resolve(opts: A11yOptions | boolean | undefined): A11yOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * Accessibility (A11y) module — adds ARIA attributes, roles, and screen-reader
 * announcements to the carousel for full keyboard and assistive-technology support.
 *
 * @param instance - The Rail instance to enhance with accessibility features
 * @returns RailModule with ARIA attribute management and live-region announcements
 *
 * @example
 * ```tsx
 * <Rail modules={[A11y]} a11y={{ prevSlideMessage: 'Previous', nextSlideMessage: 'Next' }} />
 * ```
 */
export const A11y: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.a11y);

  function applyAccessibility() {
    const container = instance.state.containerEl;
    if (!container || !config.enabled) return;

    container.setAttribute('role', config.containerRole ?? 'region');
    container.setAttribute('aria-roledescription', config.containerRoleDescriptionMessage ?? 'carousel');
    if (config.containerMessage) container.setAttribute('aria-label', config.containerMessage);
    if (config.id) container.setAttribute('id', config.id);

    container.setAttribute('aria-live', 'polite');

    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide');
    slides?.forEach((el, i) => {
      el.setAttribute('role', config.slideRole ?? 'group');
      el.setAttribute('aria-roledescription', config.itemRoleDescriptionMessage ?? 'slide');
      const label = (config.slideLabelMessage ?? '{{index}} / {{slidesLength}}')
        .replace('{{index}}', String(i + 1))
        .replace('{{slidesLength}}', String(instance.state.slidesCount));
      el.setAttribute('aria-label', label);
      el.setAttribute('tabindex', i === instance.state.activeIndex ? '0' : '-1');
      el.setAttribute('aria-hidden', i === instance.state.activeIndex ? 'false' : 'true');
    });

    const prevBtn = container.querySelector('.rail-nav-prev');
    const nextBtn = container.querySelector('.rail-nav-next');
    prevBtn?.setAttribute('aria-label', config.prevSlideMessage ?? 'Previous slide');
    nextBtn?.setAttribute('aria-label', config.nextSlideMessage ?? 'Next slide');

    const bullets = container.querySelectorAll('.rail-pagination-bullet');
    bullets.forEach((el, i) => {
      const msg = (config.paginationBulletMessage ?? 'Go to slide {{index}}').replace('{{index}}', String(i + 1));
      el.setAttribute('aria-label', msg);
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
    });
  }

  return {
    name: 'a11y',
    init() { applyAccessibility(); },
    destroy() {},
    onSlideChange() { applyAccessibility(); },
    update() { applyAccessibility(); },
  };
};
