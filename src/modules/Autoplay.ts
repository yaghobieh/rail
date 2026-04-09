import type { RailInstance, RailModule, RailModuleFactory, AutoplayOptions } from '../types';

const DEFAULTS: AutoplayOptions = {
  enabled: true,
  delay: 3000,
  stopOnLastSlide: false,
  disableOnInteraction: true,
  reverseDirection: false,
  waitForTransition: true,
  pauseOnMouseEnter: false,
};

function resolve(opts: AutoplayOptions | boolean | undefined): AutoplayOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * Autoplay module — advances slides automatically on a configurable timer.
 * Supports pause on hover, pause on interaction, reverse direction,
 * and stop-on-last-slide behavior.
 *
 * @param instance - The Rail instance to add autoplay to
 * @returns RailModule with start/stop/pause/resume controls
 *
 * @example
 * ```tsx
 * <Rail modules={[Autoplay]} autoplay={{ delay: 3000, pauseOnMouseEnter: true }} />
 * ```
 */
export const Autoplay: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.autoplay);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let paused = false;

  function start() {
    if (running || !config.enabled) return;
    running = true;
    instance.state.autoplayRunning = true;
    instance.emit('autoplayStart');
    scheduleNext();
  }

  function stop() {
    if (!running) return;
    running = false;
    instance.state.autoplayRunning = false;
    if (timer) { clearTimeout(timer); timer = null; }
    instance.emit('autoplayStop');
  }

  function pause() {
    if (paused || !running) return;
    paused = true;
    instance.state.autoplayPaused = true;
    if (timer) { clearTimeout(timer); timer = null; }
    instance.emit('autoplayPause');
  }

  function resume() {
    if (!paused || !running) return;
    paused = false;
    instance.state.autoplayPaused = false;
    instance.emit('autoplayResume');
    scheduleNext();
  }

  function scheduleNext() {
    if (!running || paused) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (!running || paused) return;
      if (config.stopOnLastSlide && instance.state.isEnd && !instance.options.loop) {
        stop();
        return;
      }
      if (config.reverseDirection) instance.slidePrev();
      else instance.slideNext();
      scheduleNext();
    }, config.delay ?? 3000);
  }

  function onMouseEnter() { if (config.pauseOnMouseEnter) pause(); }
  function onMouseLeave() { if (config.pauseOnMouseEnter) resume(); }

  function onTouchStart() {
    if (config.disableOnInteraction) stop();
    else pause();
  }

  function onTouchEnd() {
    if (!config.disableOnInteraction && paused) resume();
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
      start();
    },
    destroy() {
      stop();
      const container = instance.state.containerEl;
      container?.removeEventListener('mouseenter', onMouseEnter);
      container?.removeEventListener('mouseleave', onMouseLeave);
      instance.off('touchStart', onTouchStart);
      instance.off('touchEnd', onTouchEnd);
    },
    onTransitionEnd() {
      if (config.waitForTransition && running && !paused) scheduleNext();
    },
  };
};
