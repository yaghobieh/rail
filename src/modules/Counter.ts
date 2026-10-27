import type { CounterOptions, RailInstance, RailModule, RailModuleFactory } from '../types';
import { CSS_CLASSES } from '../constants';

const SEPARATOR = ' / ';

const DEFAULTS: CounterOptions = {
  enabled: true,
  separator: SEPARATOR,
};

const ONE = 1;
const ROLE = 'status';
const ARIA_LIVE = 'aria-live';
const ARIA_LIVE_VALUE = 'polite';
const ARIA_ATOMIC = 'aria-atomic';
const ARIA_ATOMIC_VALUE = 'true';
const SLIDE_WORD = 'Slide';
const OF_WORD = 'of';

function resolve(opts: CounterOptions | boolean | undefined): CounterOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

export const Counter: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.counter);
  let el: HTMLElement | null = null;
  let created = false;

  function findElement(): HTMLElement | null {
    const ref = config.el;
    if (!ref) return null;
    if (typeof ref === 'string') {
      return instance.state.containerEl?.querySelector(ref) ?? document.querySelector(ref);
    }
    return ref;
  }

  function render() {
    if (!el) return;
    const current = instance.state.realIndex + ONE;
    const total = Math.max(instance.state.slidesCount, current);
    const separator = config.separator ?? SEPARATOR;
    el.textContent = `${current}${separator}${total}`;
    el.setAttribute('aria-label', `${SLIDE_WORD} ${current} ${OF_WORD} ${total}`);
  }

  return {
    name: 'counter',
    init() {
      if (!config.enabled || !instance.state.containerEl) return;
      el = findElement();
      if (!el) {
        el = document.createElement('div');
        el.className = CSS_CLASSES.counter;
        instance.state.containerEl.appendChild(el);
        created = true;
      }
      el.setAttribute('role', ROLE);
      el.setAttribute(ARIA_LIVE, ARIA_LIVE_VALUE);
      el.setAttribute(ARIA_ATOMIC, ARIA_ATOMIC_VALUE);
      render();
    },
    onSlideChange() {
      render();
    },
    update() {
      render();
    },
    destroy() {
      if (created) el?.remove();
      el = null;
      created = false;
    },
  };
};
