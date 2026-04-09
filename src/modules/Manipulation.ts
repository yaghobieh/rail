import type { RailInstance, RailModule, RailModuleFactory } from '../types';

/**
 * Manipulation module — provides methods to dynamically add, remove,
 * prepend, and append slides at runtime. Exposes standalone functions
 * (`appendSlide`, `prependSlide`, `addSlide`, `removeSlide`, `removeAllSlides`)
 * for direct use.
 *
 * @param instance - The Rail instance to add manipulation methods to
 * @returns RailModule that registers manipulation helpers on the instance
 */
export const Manipulation: RailModuleFactory = (instance: RailInstance): RailModule => {
  return {
    name: 'manipulation',
    init() {},
    destroy() {},
  };
};

export function appendSlide(instance: RailInstance, slides: HTMLElement | HTMLElement[]): void {
  if (!instance.state.wrapperEl) return;
  const els = Array.isArray(slides) ? slides : [slides];
  els.forEach((el) => {
    el.classList.add('rail-slide');
    instance.state.wrapperEl!.appendChild(el);
  });
  instance.update();
}

export function prependSlide(instance: RailInstance, slides: HTMLElement | HTMLElement[]): void {
  if (!instance.state.wrapperEl) return;
  const els = Array.isArray(slides) ? slides : [slides];
  const first = instance.state.wrapperEl.firstChild;
  els.forEach((el) => {
    el.classList.add('rail-slide');
    instance.state.wrapperEl!.insertBefore(el, first);
  });
  instance.update();
}

export function addSlide(instance: RailInstance, index: number, slides: HTMLElement | HTMLElement[]): void {
  if (!instance.state.wrapperEl) return;
  const children = Array.from(instance.state.wrapperEl.children);
  const els = Array.isArray(slides) ? slides : [slides];
  const ref = children[index] ?? null;
  els.forEach((el) => {
    el.classList.add('rail-slide');
    instance.state.wrapperEl!.insertBefore(el, ref);
  });
  instance.update();
}

export function removeSlide(instance: RailInstance, index: number | number[]): void {
  if (!instance.state.wrapperEl) return;
  const children = Array.from(instance.state.wrapperEl.children);
  const indices = Array.isArray(index) ? index : [index];
  indices.sort((a, b) => b - a).forEach((i) => {
    children[i]?.remove();
  });
  instance.update();
}

export function removeAllSlides(instance: RailInstance): void {
  if (!instance.state.wrapperEl) return;
  instance.state.wrapperEl.innerHTML = '';
  instance.update();
}
