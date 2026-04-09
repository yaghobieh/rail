import type { RailInstance, RailModule, RailModuleFactory, HashNavigationOptions } from '../types';

const DEFAULTS: HashNavigationOptions = { enabled: true, replaceState: false, watchState: true };

function resolve(opts: HashNavigationOptions | boolean | undefined): HashNavigationOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * HashNavigation module — synchronizes the active slide with the URL hash
 * fragment using `data-hash` attributes on slides.
 *
 * @param instance - The Rail instance to link with the URL hash
 * @returns RailModule with hashchange event handling
 *
 * @example
 * ```tsx
 * <Rail modules={[HashNavigation]} hashNavigation={{ watchState: true }}>
 *   <RailSlide data-hash="intro">Intro</RailSlide>
 *   <RailSlide data-hash="features">Features</RailSlide>
 * </Rail>
 * ```
 */
export const HashNavigation: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.hashNavigation);

  function setHash(index: number) {
    if (!config.enabled) return;
    const slide = instance.state.wrapperEl?.querySelectorAll('.rail-slide')[index] as HTMLElement | undefined;
    const hash = slide?.dataset.hash ?? String(index);
    if (config.replaceState) {
      window.history.replaceState(null, '', `#${hash}`);
    } else {
      window.location.hash = hash;
    }
  }

  function onHashChange() {
    if (!config.watchState) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide');
    slides?.forEach((el, i) => {
      if ((el as HTMLElement).dataset.hash === hash || String(i) === hash) {
        instance.slideTo(i);
      }
    });
  }

  return {
    name: 'hashNavigation',
    init() {
      if (!config.enabled) return;
      window.addEventListener('hashchange', onHashChange);
      onHashChange();
    },
    destroy() {
      window.removeEventListener('hashchange', onHashChange);
    },
    onSlideChange(index) { setHash(index); },
  };
};
