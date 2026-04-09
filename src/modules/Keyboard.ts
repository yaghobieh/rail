import type { RailInstance, RailModule, RailModuleFactory, KeyboardOptions } from '../types';

const DEFAULTS: KeyboardOptions = { enabled: true, onlyInViewport: true, pageUpDown: true };

function resolve(opts: KeyboardOptions | boolean | undefined): KeyboardOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * Keyboard module — enables arrow key, PageUp/PageDown, Home/End navigation
 * for the carousel. Optionally restricts to viewport-visible carousels only.
 *
 * @param instance - The Rail instance to attach keyboard handlers to
 * @returns RailModule with keydown event handling
 *
 * @example
 * ```tsx
 * <Rail modules={[Keyboard]} keyboard={{ onlyInViewport: true }} />
 * ```
 */
export const Keyboard: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.keyboard);

  function isInViewport(): boolean {
    if (!config.onlyInViewport || !instance.state.containerEl) return true;
    const rect = instance.state.containerEl.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!config.enabled || instance.state.isLocked) return;
    if (!isInViewport()) return;
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

    const isH = instance.options.direction === 'horizontal';
    switch (e.key) {
      case 'ArrowLeft': if (isH) { instance.slidePrev(); e.preventDefault(); } break;
      case 'ArrowRight': if (isH) { instance.slideNext(); e.preventDefault(); } break;
      case 'ArrowUp': if (!isH) { instance.slidePrev(); e.preventDefault(); } break;
      case 'ArrowDown': if (!isH) { instance.slideNext(); e.preventDefault(); } break;
      case 'PageUp': if (config.pageUpDown) { instance.slidePrev(); e.preventDefault(); } break;
      case 'PageDown': if (config.pageUpDown) { instance.slideNext(); e.preventDefault(); } break;
      case 'Home': instance.slideTo(0); e.preventDefault(); break;
      case 'End': instance.slideTo(instance.state.slidesCount - 1); e.preventDefault(); break;
    }
  }

  return {
    name: 'keyboard',
    init() { if (config.enabled) document.addEventListener('keydown', onKeyDown); },
    destroy() { document.removeEventListener('keydown', onKeyDown); },
  };
};
