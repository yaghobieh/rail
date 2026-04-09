import type { RailInstance, RailModule, RailModuleFactory, ScrollbarOptions } from '../types';

const DEFAULTS: ScrollbarOptions = {
  enabled: true,
  hide: true,
  draggable: true,
  snapOnRelease: true,
  dragSize: 'auto',
};

function resolve(opts: ScrollbarOptions | boolean | undefined): ScrollbarOptions {
  if (typeof opts === 'boolean') return { ...DEFAULTS, enabled: opts };
  return { ...DEFAULTS, ...opts };
}

/**
 * Scrollbar module — adds a draggable scrollbar track that mirrors the
 * carousel's scroll position. Supports snap-on-release and auto-sizing.
 *
 * @param instance - The Rail instance to attach the scrollbar to
 * @returns RailModule with drag handling and position updates
 *
 * @example
 * ```tsx
 * <Rail modules={[Scrollbar]} scrollbar={{ draggable: true }} />
 * ```
 */
export const Scrollbar: RailModuleFactory = (instance: RailInstance): RailModule => {
  const config = resolve(instance.options.scrollbar);
  let el: HTMLElement | null = null;
  let dragEl: HTMLElement | null = null;
  let isDragging = false;
  let dragStartPos = 0;
  let scrollStartPos = 0;

  function getContainerSize() {
    return instance.options.direction === 'horizontal' ? instance.state.width : instance.state.height;
  }

  function getMaxTranslate() {
    const grid = instance.state.snapGrid;
    return grid.length > 0 ? grid[grid.length - 1] : 0;
  }

  function updatePosition() {
    if (!el || !dragEl) return;
    const maxT = getMaxTranslate();
    const cSize = getContainerSize();
    if (maxT === 0 || cSize === 0) return;

    const ratio = cSize / (cSize + maxT);
    const dragSize = config.dragSize === 'auto' ? Math.max(ratio * cSize, 40) : (config.dragSize ?? 40);
    const progress = Math.abs(instance.state.translate) / maxT;
    const position = progress * (cSize - dragSize);

    const isH = instance.options.direction === 'horizontal';
    dragEl.style[isH ? 'width' : 'height'] = `${dragSize}px`;
    dragEl.style.transform = isH ? `translateX(${position}px)` : `translateY(${position}px)`;
  }

  function onDragStart(e: MouseEvent | TouchEvent) {
    if (!config.draggable) return;
    isDragging = true;
    const point = 'touches' in e ? e.touches[0] : e;
    const isH = instance.options.direction === 'horizontal';
    dragStartPos = isH ? point.clientX : point.clientY;
    scrollStartPos = instance.state.translate;
    el?.classList.add('rail-scrollbar-dragging');
  }

  function onDragMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return;
    e.preventDefault();
    const point = 'touches' in e ? e.touches[0] : e;
    const isH = instance.options.direction === 'horizontal';
    const current = isH ? point.clientX : point.clientY;
    const diff = current - dragStartPos;
    const maxT = getMaxTranslate();
    const cSize = getContainerSize();
    if (cSize === 0) return;
    const ratio = maxT / cSize;
    instance.setTranslate(scrollStartPos - diff * ratio);
    instance.setTransition(0);
    updatePosition();
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    el?.classList.remove('rail-scrollbar-dragging');
    if (config.snapOnRelease) {
      let closest = 0;
      let closestDist = Infinity;
      instance.state.snapGrid.forEach((snap, i) => {
        const dist = Math.abs(-instance.state.translate - snap);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      instance.slideTo(closest);
    }
  }

  return {
    name: 'scrollbar',
    init() {
      if (!config.enabled) return;
      const ref = config.el;
      el = (typeof ref === 'string' ? document.querySelector(ref) : ref) as HTMLElement | null;
      if (!el) {
        el = document.createElement('div');
        el.className = 'rail-scrollbar';
        instance.state.containerEl?.appendChild(el);
      }
      dragEl = document.createElement('div');
      dragEl.className = 'rail-scrollbar-drag';
      el.appendChild(dragEl);

      dragEl.addEventListener('mousedown', onDragStart);
      dragEl.addEventListener('touchstart', onDragStart, { passive: true });
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('touchmove', onDragMove, { passive: false });
      document.addEventListener('mouseup', onDragEnd);
      document.addEventListener('touchend', onDragEnd);

      updatePosition();
    },
    destroy() {
      dragEl?.removeEventListener('mousedown', onDragStart);
      dragEl?.removeEventListener('touchstart', onDragStart);
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchend', onDragEnd);
    },
    onSlideChange() { updatePosition(); },
    onTransitionEnd() { updatePosition(); },
    update() { updatePosition(); },
  };
};
