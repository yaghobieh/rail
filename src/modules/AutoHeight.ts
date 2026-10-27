import type { RailInstance, RailModule, RailModuleFactory } from '../types';
import { CSS_CLASSES } from '../constants';

const ACTIVE_SELECTOR = `.${CSS_CLASSES.slideActive}`;
const PX = 'px';

export const AutoHeight: RailModuleFactory = (instance: RailInstance): RailModule => {
  function apply() {
    const root = instance.state.containerEl;
    const track = instance.state.wrapperEl;
    if (!root || !track) return;
    root.classList.add(CSS_CLASSES.autoHeight);
    const active = track.querySelector(ACTIVE_SELECTOR);
    const target = active instanceof HTMLElement ? active : track.firstElementChild;
    if (!(target instanceof HTMLElement)) return;
    const height = target.offsetHeight;
    if (height <= 0) return;
    track.style.height = `${height}${PX}`;
  }

  return {
    name: 'autoHeight',
    init() {
      apply();
    },
    onSlideChange() {
      apply();
    },
    onTransitionEnd() {
      apply();
    },
    onResize() {
      apply();
    },
    update() {
      apply();
    },
    destroy() {
      const root = instance.state.containerEl;
      const track = instance.state.wrapperEl;
      root?.classList.remove(CSS_CLASSES.autoHeight);
      if (track) track.style.height = '';
    },
  };
};
