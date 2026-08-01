import type { RailInstance, RailModule, RailModuleFactory, AutoplayOptions } from '../types';

const DEFAULTS: AutoplayOptions = {
  enabled: true,
  delay: 3000,
  stopOnLastSlide: false,
  disableOnInteraction: true,
  reverseDirection: false,
  waitForTransition: true,
  pauseOnMouseEnter: false,
  pauseOnReducedMotion: true,
};

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const DEFAULT_DELAY_MS = 3000;

function resolve(opts: AutoplayOptions | boolean | undefined): AutoplayOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export const Autoplay: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.autoplay);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let paused = false;
  let mediaQuery: MediaQueryList | null = null;

  function clearTimer() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function shouldBlockForMotion(): boolean {
    return config.pauseOnReducedMotion !== false && prefersReducedMotion();
  }

  function start() {
    if (running || !config.enabled) return;
    if (shouldBlockForMotion()) return;
    running = true;
    instance.state.autoplayRunning = true;
    instance.emit('autoplayStart');
    scheduleNext();
  }

  function stop() {
    if (!running) return;
    running = false;
    instance.state.autoplayRunning = false;
    clearTimer();
    instance.emit('autoplayStop');
  }

  function pause() {
    if (paused || !running) return;
    paused = true;
    instance.state.autoplayPaused = true;
    clearTimer();
    instance.emit('autoplayPause');
  }

  function resume() {
    if (!paused || !running) return;
    if (shouldBlockForMotion()) return;
    paused = false;
    instance.state.autoplayPaused = false;
    instance.emit('autoplayResume');
    scheduleNext();
  }

  function scheduleNext() {
    if (!running || paused) return;
    clearTimer();
    timer = setTimeout(() => {
      if (!running || paused || shouldBlockForMotion()) return;
      if (config.stopOnLastSlide && instance.state.isEnd && !instance.options.loop) {
        stop();
        return;
      }
      if (config.reverseDirection) instance.slidePrev();
      else instance.slideNext();
      scheduleNext();
    }, config.delay ?? DEFAULT_DELAY_MS);
  }

  function onMouseEnter() {
    if (config.pauseOnMouseEnter) pause();
  }

  function onMouseLeave() {
    if (config.pauseOnMouseEnter) resume();
  }

  function onTouchStart() {
    if (config.disableOnInteraction) stop();
    else pause();
  }

  function onTouchEnd() {
    if (!config.disableOnInteraction && paused) resume();
  }

  function onMotionChange(event: MediaQueryListEvent) {
    if (config.pauseOnReducedMotion === false) return;
    if (event.matches) {
      if (running) pause();
    } else if (running && paused) {
      resume();
    } else if (config.enabled && !running) {
      start();
    }
  }

  instance.autoplayStart = start;
  instance.autoplayStop = stop;
  instance.autoplayPause = pause;
  instance.autoplayResume = resume;

  return {
    name: 'autoplay',
    init() {
      if (!config.enabled) return;
      const container = instance.state.containerEl;
      container?.addEventListener('mouseenter', onMouseEnter);
      container?.addEventListener('mouseleave', onMouseLeave);
      instance.on('touchStart', onTouchStart);
      instance.on('touchEnd', onTouchEnd);

      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
        mediaQuery.addEventListener('change', onMotionChange);
      }

      if (!shouldBlockForMotion()) start();
    },
    destroy() {
      stop();
      const container = instance.state.containerEl;
      container?.removeEventListener('mouseenter', onMouseEnter);
      container?.removeEventListener('mouseleave', onMouseLeave);
      instance.off('touchStart', onTouchStart);
      instance.off('touchEnd', onTouchEnd);
      mediaQuery?.removeEventListener('change', onMotionChange);
      mediaQuery = null;
    },
    onTransitionEnd() {
      if (config.waitForTransition && running && !paused) scheduleNext();
    },
  };
};
