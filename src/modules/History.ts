import type { RailInstance, RailModule, RailModuleFactory, HistoryOptions } from '../types';

const DEFAULTS: HistoryOptions = { enabled: true, root: '', replaceState: false, key: 'slide' };

/**
 * History module — synchronizes the active slide with the browser's
 * History API, enabling back/forward navigation and shareable URLs.
 *
 * @param instance - The Rail instance to link with browser history
 * @returns RailModule with popstate event handling and URL updates
 *
 * @example
 * ```tsx
 * <Rail modules={[History]} history={{ key: 'slide', replaceState: true }} />
 * ```
 */
export const History: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config: HistoryOptions = { ...DEFAULTS, ...instance.options.history };

  function getSlugForSlide(index: number): string {
    const slide = instance.state.wrapperEl?.querySelectorAll('.rail-slide')[index];
    return (slide as HTMLElement)?.dataset.history ?? String(index);
  }

  function setHistory(index: number) {
    if (!config.enabled) return;
    const slug = getSlugForSlide(index);
    const path = `${config.root ?? ''}/${config.key ?? 'slide'}/${slug}`;
    if (config.replaceState) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
  }

  function onPopState() {
    const path = window.location.pathname;
    const key = config.key ?? 'slide';
    const match = path.match(new RegExp(`${key}/(.+)$`));
    if (!match) return;
    const slug = match[1];
    const slides = instance.state.wrapperEl?.querySelectorAll('.rail-slide');
    slides?.forEach((el, i) => {
      if ((el as HTMLElement).dataset.history === slug || String(i) === slug) {
        instance.slideTo(i);
      }
    });
  }

  return {
    name: 'history',
    init() {
      if (!config.enabled) return;
      window.addEventListener('popstate', onPopState);
    },
    destroy() {
      window.removeEventListener('popstate', onPopState);
    },
    onSlideChange(index) { setHistory(index); },
  };
};
