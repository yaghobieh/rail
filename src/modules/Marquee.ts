import type { MarqueeOptions, RailInstance, RailModule, RailModuleFactory } from '../types';
import { CSS_CLASSES } from '../constants';

const DEFAULT_DURATION_MS = 24000;
const DURATION_VAR = '--rail-marquee-duration';
const CLONE_ATTR = 'data-rail-marquee-clone';
const ARIA_HIDDEN = 'aria-hidden';
const ARIA_HIDDEN_VALUE = 'true';
const MS_UNIT = 'ms';

const DEFAULTS: MarqueeOptions = {
  enabled: true,
  duration: DEFAULT_DURATION_MS,
  reverse: false,
  pauseOnHover: true,
  pauseOnReducedMotion: true,
  fade: false,
  pauseOffscreen: true,
};

function resolve(opts: MarqueeOptions | boolean | undefined): MarqueeOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

export const Marquee: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.marquee);
  const clones: HTMLElement[] = [];
  let observer: IntersectionObserver | null = null;

  function clearClones() {
    clones.forEach((node) => node.remove());
    clones.length = 0;
  }

  function applyClasses() {
    const root = instance.state.containerEl;
    if (!root) return;
    root.classList.add(CSS_CLASSES.marquee);
    root.classList.toggle(CSS_CLASSES.marqueeReverse, config.reverse === true);
    root.classList.toggle(CSS_CLASSES.marqueeNoPause, config.pauseOnHover === false);
    root.classList.toggle(CSS_CLASSES.marqueeMotion, config.pauseOnReducedMotion === false);
    root.classList.toggle(CSS_CLASSES.marqueeFade, config.fade === true);
    root.style.setProperty(DURATION_VAR, `${config.duration ?? DEFAULT_DURATION_MS}${MS_UNIT}`);
  }

  function watchViewport() {
    const root = instance.state.containerEl;
    if (!root || config.pauseOffscreen === false || typeof IntersectionObserver === 'undefined') return;
    observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      root.classList.toggle(CSS_CLASSES.marqueeOffscreen, !visible);
    });
    observer.observe(root);
  }

  function cloneSlides() {
    const track = instance.state.wrapperEl;
    if (!track) return;
    const originals = Array.from(track.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement && !node.hasAttribute(CLONE_ATTR),
    );
    originals.forEach((slide) => {
      const copy = slide.cloneNode(true);
      if (!(copy instanceof HTMLElement)) return;
      copy.setAttribute(CLONE_ATTR, '');
      copy.setAttribute(ARIA_HIDDEN, ARIA_HIDDEN_VALUE);
      track.appendChild(copy);
      clones.push(copy);
    });
  }

  return {
    name: 'marquee',
    init() {
      if (!config.enabled) return;
      applyClasses();
      cloneSlides();
      watchViewport();
    },
    destroy() {
      observer?.disconnect();
      observer = null;
      clearClones();
      const root = instance.state.containerEl;
      root?.classList.remove(
        CSS_CLASSES.marquee,
        CSS_CLASSES.marqueeReverse,
        CSS_CLASSES.marqueeNoPause,
        CSS_CLASSES.marqueeMotion,
        CSS_CLASSES.marqueeFade,
        CSS_CLASSES.marqueeOffscreen,
      );
      root?.style.removeProperty(DURATION_VAR);
    },
  };
};
