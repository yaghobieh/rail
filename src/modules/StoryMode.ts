import type { RailInstance, RailModule, RailModuleFactory, StoryModeOptions } from '../types';
import { STORY_DEFAULTS } from '../constants';

const TAP_ZONE_RATIO = 0.33;
const FULL_PERCENT = 100;
const HOLD_THRESHOLD_MS = 200;

function resolve(opts: StoryModeOptions | boolean | undefined): StoryModeOptions {
  if (typeof opts === 'boolean') return { ...STORY_DEFAULTS, enabled: opts };
  return { ...STORY_DEFAULTS, ...opts };
}

/**
 * Story Mode module — implements Instagram-style story progression with
 * timed auto-advance, progress bars, tap-to-navigate zones (left 1/3 prev,
 * right 2/3 next), hold-to-pause, and configurable play/pause control visibility.
 *
 * @param instance - The Rail instance to convert into story mode
 * @returns RailModule with story timer, progress bar rendering, and tap zone handling
 *
 * @example
 * ```tsx
 * <Rail modules={[StoryMode]} storyMode={{ duration: 5000, controlVisibility: 'hover' }} />
 * ```
 */
export const StoryMode: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.storyMode);
  let timer: ReturnType<typeof setInterval> | null = null;
  let paused = false;
  let progressEl: HTMLElement | null = null;
  let controlEl: HTMLElement | null = null;
  let startTime = 0;
  let elapsed = 0;
  let holdTimeout: ReturnType<typeof setTimeout> | null = null;
  let isHolding = false;
  let savedAllowTouchMove: boolean | undefined;

  const duration = config.duration ?? 5000;
  const TICK_INTERVAL = 50;
  const visibility = config.controlVisibility ?? 'hover';

  function createProgressBars() {
    if (!config.showProgress || !instance.state.containerEl) return;
    progressEl = document.createElement('div');
    progressEl.className = 'rail-story-progress';
    progressEl.style.cssText = `display:flex;gap:4px;padding:8px 12px;position:absolute;top:0;left:0;right:0;z-index:20;`;

    for (let i = 0; i < instance.state.slidesCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'rail-story-progress-bar';
      bar.style.cssText = `flex:1;height:${config.progressHeight ?? 3}px;background:rgba(255,255,255,0.3);border-radius:2px;overflow:hidden;`;
      const fill = document.createElement('div');
      fill.className = 'rail-story-progress-bar-fill';
      fill.style.cssText = `height:100%;width:0%;background:${config.progressColor ?? '#fff'};transition:width ${TICK_INTERVAL}ms linear;border-radius:2px;`;
      bar.appendChild(fill);
      progressEl.appendChild(bar);
    }
    instance.state.containerEl.style.position = 'relative';
    instance.state.containerEl.prepend(progressEl);
  }

  function createPlayPauseControl() {
    if (visibility === 'none' || !instance.state.containerEl) return;

    controlEl = document.createElement('button');
    controlEl.className = 'rail-story-control';
    (controlEl as HTMLButtonElement).type = 'button';
    controlEl.setAttribute('aria-label', 'Play/Pause');

    const baseStyle = [
      'position:absolute',
      'z-index:25',
      'left:50%',
      'top:50%',
      'transform:translate(-50%,-50%)',
      'width:48px',
      'height:48px',
      'border-radius:50%',
      'border:none',
      'background:rgba(0,0,0,0.5)',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'color:#fff',
      'cursor:pointer',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'transition:opacity 0.25s ease, transform 0.2s ease',
    ];

    if (visibility === 'hover') {
      baseStyle.push('opacity:0', 'pointer-events:none');
    }

    controlEl.style.cssText = baseStyle.join(';') + ';';
    updateControlIcon();

    controlEl.addEventListener('click', onControlClick);
    instance.state.containerEl.appendChild(controlEl);

    if (visibility === 'hover') {
      instance.state.containerEl.addEventListener('mouseenter', onContainerMouseEnter);
      instance.state.containerEl.addEventListener('mouseleave', onContainerMouseLeave);
    }
  }

  function updateControlIcon() {
    if (!controlEl) return;
    if (paused) {
      controlEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    } else {
      controlEl.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    }
  }

  function onControlClick(e: Event) {
    e.stopPropagation();
    if (paused) resume();
    else pause();
    updateControlIcon();
  }

  function onContainerMouseEnter() {
    if (controlEl) {
      controlEl.style.opacity = '1';
      controlEl.style.pointerEvents = 'auto';
    }
  }

  function onContainerMouseLeave() {
    if (controlEl && !paused) {
      controlEl.style.opacity = '0';
      controlEl.style.pointerEvents = 'none';
    }
  }

  function updateProgressBars() {
    if (!progressEl) return;
    const bars = progressEl.querySelectorAll('.rail-story-progress-bar-fill') as NodeListOf<HTMLElement>;
    const progress = elapsed / duration;

    bars.forEach((fill, i) => {
      if (i < instance.state.activeIndex) fill.style.width = `${FULL_PERCENT}%`;
      else if (i === instance.state.activeIndex) fill.style.width = `${Math.min(FULL_PERCENT, progress * FULL_PERCENT)}%`;
      else fill.style.width = '0%';
    });

    instance.state.storyProgress = progress;
    instance.emit('storyProgress', instance.state.activeIndex, progress);
  }

  function startTimer() {
    if (timer) clearInterval(timer);
    startTime = Date.now();
    elapsed = 0;
    paused = false;

    timer = setInterval(() => {
      if (paused) return;
      elapsed = Date.now() - startTime;
      updateProgressBars();

      if (elapsed >= duration) {
        if (instance.state.activeIndex >= instance.state.slidesCount - 1) {
          stopTimer();
          instance.emit('storyComplete');
          config.onComplete?.();
        } else {
          instance.slideNext();
        }
      }
    }, TICK_INTERVAL);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function pause() {
    if (paused) return;
    paused = true;
    updateControlIcon();
    instance.emit('storyPause');
  }

  function resume() {
    if (!paused) return;
    paused = false;
    startTime = Date.now() - elapsed;
    updateControlIcon();
    if (visibility === 'hover' && controlEl) {
      controlEl.style.opacity = '0';
      controlEl.style.pointerEvents = 'none';
    }
    instance.emit('storyResume');
  }

  function onPointerDown() {
    holdTimeout = setTimeout(() => {
      isHolding = true;
      pause();
    }, HOLD_THRESHOLD_MS);
  }

  function onPointerUp(e: PointerEvent) {
    if (holdTimeout) { clearTimeout(holdTimeout); holdTimeout = null; }

    if (isHolding) {
      isHolding = false;
      resume();
      return;
    }

    if (!instance.state.containerEl || !config.tapToNavigate) return;

    const rect = instance.state.containerEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const tapZone = rect.width * TAP_ZONE_RATIO;

    if (clickX < tapZone) {
      instance.slidePrev();
    } else {
      instance.slideNext();
    }
  }

  function onPointerLeave() {
    if (holdTimeout) { clearTimeout(holdTimeout); holdTimeout = null; }
    if (isHolding) {
      isHolding = false;
      resume();
    }
  }

  function onTap() {
    if (!config.pauseOnTap) return;
    if (paused) resume();
    else pause();
    updateControlIcon();
  }

  function onExternalPause() { pause(); }
  function onExternalResume() { resume(); }

  return {
    name: 'storyMode',
    init() {
      if (!config.enabled || !instance.state.containerEl) return;

      if (config.disableSwipe) {
        savedAllowTouchMove = instance.options.allowTouchMove;
        instance.options.allowTouchMove = false;
      }

      createProgressBars();
      createPlayPauseControl();
      instance.state.containerEl.classList.add('rail-story-container');

      if (config.pauseOnHold || config.tapToNavigate) {
        instance.state.containerEl.addEventListener('pointerdown', onPointerDown);
        instance.state.containerEl.addEventListener('pointerup', onPointerUp);
        instance.state.containerEl.addEventListener('pointerleave', onPointerLeave);
      }

      if (config.pauseOnTap) {
        instance.state.containerEl.addEventListener('click', onTap);
      }

      instance.on('storyPause', onExternalPause);
      instance.on('storyResume', onExternalResume);

      startTimer();
    },
    destroy() {
      stopTimer();
      if (holdTimeout) clearTimeout(holdTimeout);
      progressEl?.remove();

      if (controlEl) {
        controlEl.removeEventListener('click', onControlClick);
        controlEl.remove();
        controlEl = null;
      }

      if (instance.state.containerEl) {
        instance.state.containerEl.removeEventListener('pointerdown', onPointerDown);
        instance.state.containerEl.removeEventListener('pointerup', onPointerUp);
        instance.state.containerEl.removeEventListener('pointerleave', onPointerLeave);
        instance.state.containerEl.removeEventListener('click', onTap);
        instance.state.containerEl.removeEventListener('mouseenter', onContainerMouseEnter);
        instance.state.containerEl.removeEventListener('mouseleave', onContainerMouseLeave);
        instance.state.containerEl.classList.remove('rail-story-container');
      }

      instance.off('storyPause', onExternalPause);
      instance.off('storyResume', onExternalResume);

      if (config.disableSwipe && savedAllowTouchMove !== undefined) {
        instance.options.allowTouchMove = savedAllowTouchMove;
      }
    },
    onSlideChange() {
      elapsed = 0;
      startTime = Date.now();
      updateProgressBars();
    },
  };
};
