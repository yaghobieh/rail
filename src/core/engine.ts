import type {
  RailOptions,
  RailState,
  RailInstance,
  RailModule,
  RailModuleFactory,
  RailEvents,
  RailDirection,
  TouchData,
} from '../types';
import { DEFAULTS } from '../constants';
import { EventEmitter } from './events';

const ZERO = 0;
const ONE = 1;

function resolveOptions(opts: RailOptions): RailInstance['options'] {
  return { ...DEFAULTS, ...opts } as RailInstance['options'];
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Creates a new Rail carousel engine instance. This is the framework-agnostic
 * core that handles slide positioning, touch/drag, transitions, snapping,
 * breakpoints, and module initialization.
 *
 * @param userOptions - Configuration options merged with defaults
 * @returns A fully initialized RailInstance with lifecycle methods (init, destroy, update)
 *
 * @example
 * ```ts
 * const rail = createRail({ slidesPerView: 3, spaceBetween: 16, loop: true });
 * rail.init(document.querySelector('.carousel'));
 * ```
 */
export function createRail(userOptions: RailOptions = {}): RailInstance {
  const emitter = new EventEmitter();
  const modules = new Map<string, RailModule>();
  let options = resolveOptions(userOptions);
  let animationFrame: number | null = null;

  const state: RailState = {
    activeIndex: options.initialSlide ?? ZERO,
    previousIndex: ZERO,
    realIndex: options.initialSlide ?? ZERO,
    slidesCount: ZERO,
    isBeginning: true,
    isEnd: false,
    isLocked: false,
    isAnimating: false,
    isTouching: false,
    progress: ZERO,
    translate: ZERO,
    snapGrid: [],
    slidesGrid: [],
    slidesSizesGrid: [],
    velocity: ZERO,
    allowSlideNext: true,
    allowSlidePrev: true,
    width: ZERO,
    height: ZERO,
    wrapperEl: null,
    containerEl: null,
    mounted: false,
    destroyed: false,
    virtualData: null,
    autoplayRunning: false,
    autoplayPaused: false,
    storyProgress: ZERO,
  };

  const touch: TouchData = {
    startX: ZERO,
    startY: ZERO,
    currentX: ZERO,
    currentY: ZERO,
    diffX: ZERO,
    diffY: ZERO,
    startTime: ZERO,
    isTouching: false,
    isScrolling: null,
  };

  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;

  // ── Helpers ─────────────────────────────────────────
  const isHorizontal = () => options.direction === 'horizontal';

  function getSlideElements(): HTMLElement[] {
    if (!state.wrapperEl) return [];
    return Array.from(state.wrapperEl.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.classList.contains('rail-slide')
    );
  }

  // ── Size Calculation ────────────────────────────────
  function updateSize(): void {
    if (!state.containerEl) return;
    const rect = state.containerEl.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
  }

  function updateSlides(): void {
    const slides = getSlideElements();
    state.slidesCount = slides.length;
    if (state.slidesCount === ZERO) return;

    const containerSize = isHorizontal() ? state.width : state.height;
    const perView = options.slidesPerView === 'auto' ? ONE : (options.slidesPerView ?? ONE);
    const gap = options.spaceBetween ?? ZERO;
    const slideSize = (containerSize - gap * (perView - ONE)) / perView;

    const sizesGrid: number[] = [];
    const slidesGrid: number[] = [];
    const snapGrid: number[] = [];
    let currentPosition = ZERO;

    for (let i = ZERO; i < state.slidesCount; i++) {
      const size = options.slidesPerView === 'auto'
        ? (isHorizontal() ? slides[i].offsetWidth : slides[i].offsetHeight)
        : slideSize;

      sizesGrid.push(size);
      slidesGrid.push(currentPosition);

      if (i % (options.slidesPerGroup ?? ONE) === ZERO) {
        snapGrid.push(currentPosition);
      }

      const el = slides[i];
      if (isHorizontal()) {
        el.style.width = options.slidesPerView === 'auto' ? '' : `${size}px`;
        el.style.marginRight = i < state.slidesCount - ONE ? `${gap}px` : '';
        el.style.marginBottom = '';
      } else {
        el.style.height = options.slidesPerView === 'auto' ? '' : `${size}px`;
        el.style.marginBottom = i < state.slidesCount - ONE ? `${gap}px` : '';
        el.style.marginRight = '';
      }

      currentPosition += size + gap;
    }

    state.slidesSizesGrid = sizesGrid;
    state.slidesGrid = slidesGrid;
    state.snapGrid = snapGrid;
  }

  function updateProgress(): void {
    if (state.slidesCount === ZERO || state.snapGrid.length === ZERO) return;
    const maxTranslate = state.snapGrid[state.snapGrid.length - ONE] ?? ZERO;
    state.progress = maxTranslate === ZERO ? ZERO : Math.abs(state.translate) / maxTranslate;
    state.isBeginning = state.activeIndex === ZERO;
    state.isEnd = state.activeIndex >= state.slidesCount - (typeof options.slidesPerView === 'number' ? options.slidesPerView : ONE);
    emitter.emit('progress', state.progress);
  }

  function updateSlidesClasses(): void {
    const slides = getSlideElements();
    const perView = options.slidesPerView === 'auto' ? ONE : (options.slidesPerView ?? ONE);

    slides.forEach((el, i) => {
      el.classList.remove('rail-slide-active', 'rail-slide-next', 'rail-slide-prev', 'rail-slide-visible');
      el.removeAttribute('data-rail-slide-index');
      el.setAttribute('data-rail-slide-index', String(i));

      if (i === state.activeIndex) {
        el.classList.add('rail-slide-active');
      }
      if (i === state.activeIndex + ONE) {
        el.classList.add('rail-slide-next');
      }
      if (i === state.activeIndex - ONE) {
        el.classList.add('rail-slide-prev');
      }
      if (i >= state.activeIndex && i < state.activeIndex + perView) {
        el.classList.add('rail-slide-visible');
      }
    });
  }

  // ── Translation ─────────────────────────────────────
  function setTranslate(translate: number): void {
    state.translate = translate;
    if (!state.wrapperEl) return;

    if (options.cssMode) {
      state.wrapperEl.scrollLeft = -translate;
    } else {
      const prop = isHorizontal()
        ? `translate3d(${translate}px, 0, 0)`
        : `translate3d(0, ${translate}px, 0)`;
      state.wrapperEl.style.transform = prop;
    }
  }

  function setTransition(duration: number): void {
    if (!state.wrapperEl) return;
    state.wrapperEl.style.transitionDuration = `${duration}ms`;
    const slides = getSlideElements();
    slides.forEach((el) => {
      el.style.transitionDuration = `${duration}ms`;
    });
  }

  function getTranslate(): number {
    return state.translate;
  }

  // ── Slide Navigation ────────────────────────────────
  function slideTo(index: number, speed?: number, runCallbacks = true): void {
    if (state.destroyed || state.isAnimating) return;

    const spd = speed ?? options.speed;
    let targetIndex = index;

    if (options.loop) {
      targetIndex = ((index % state.slidesCount) + state.slidesCount) % state.slidesCount;
    } else {
      targetIndex = clamp(index, ZERO, Math.max(ZERO, state.slidesCount - (typeof options.slidesPerView === 'number' ? options.slidesPerView : ONE)));
    }

    if (targetIndex === state.activeIndex && !state.isAnimating) return;

    state.previousIndex = state.activeIndex;
    state.activeIndex = targetIndex;
    state.realIndex = targetIndex;

    const targetTranslate = -(state.slidesGrid[targetIndex] ?? ZERO);

    if (options.centeredSlides) {
      const containerSize = isHorizontal() ? state.width : state.height;
      const slideSize = state.slidesSizesGrid[targetIndex] ?? ZERO;
      const centerOffset = (containerSize - slideSize) / 2;
      setTranslate(targetTranslate + centerOffset);
    } else {
      setTranslate(targetTranslate);
    }

    setTransition(spd);
    state.isAnimating = spd > ZERO;

    updateSlidesClasses();
    updateProgress();

    if (runCallbacks) {
      emitter.emit('slideChange', state.activeIndex, state.previousIndex);
      emitter.emit('slideChangeTransitionStart', state.activeIndex);

      if (state.isBeginning && state.previousIndex !== ZERO) {
        emitter.emit('reachBeginning');
      }
      if (state.isEnd) {
        emitter.emit('reachEnd');
      }
    }

    modules.forEach((mod) => mod.onSlideChange?.(state.activeIndex));

    if (spd > ZERO) {
      emitter.emit('transitionStart');
      modules.forEach((mod) => mod.onTransitionStart?.());

      setTimeout(() => {
        state.isAnimating = false;
        setTransition(ZERO);
        emitter.emit('transitionEnd');
        emitter.emit('slideChangeTransitionEnd', state.activeIndex);
        modules.forEach((mod) => mod.onTransitionEnd?.());
      }, spd);
    } else {
      state.isAnimating = false;
    }
  }

  function slideNext(speed?: number, runCallbacks = true): void {
    if (!state.allowSlideNext) return;
    const perGroup = options.slidesPerGroup ?? ONE;
    slideTo(state.activeIndex + perGroup, speed, runCallbacks);
  }

  function slidePrev(speed?: number, runCallbacks = true): void {
    if (!state.allowSlidePrev) return;
    const perGroup = options.slidesPerGroup ?? ONE;
    slideTo(state.activeIndex - perGroup, speed, runCallbacks);
  }

  function slideToLoop(index: number, speed?: number, runCallbacks = true): void {
    slideTo(index, speed, runCallbacks);
  }

  // ── Touch Handling ──────────────────────────────────
  function onTouchStart(e: TouchEvent | MouseEvent): void {
    if (!options.allowTouchMove || state.isLocked) return;
    if (options.preventInteractionOnTransition && state.isAnimating) return;

    const point = 'touches' in e ? e.touches[0] : e;
    touch.startX = point.clientX;
    touch.startY = point.clientY;
    touch.currentX = point.clientX;
    touch.currentY = point.clientY;
    touch.diffX = ZERO;
    touch.diffY = ZERO;
    touch.startTime = Date.now();
    touch.isTouching = true;
    touch.isScrolling = null;
    state.isTouching = true;

    setTransition(ZERO);
    emitter.emit('touchStart', { ...touch });
    modules.forEach((mod) => mod.onTouchStart?.({ ...touch }));
  }

  function onTouchMove(e: TouchEvent | MouseEvent): void {
    if (!touch.isTouching || !options.allowTouchMove) return;

    const point = 'touches' in e ? e.touches[0] : e;
    touch.currentX = point.clientX;
    touch.currentY = point.clientY;
    touch.diffX = touch.currentX - touch.startX;
    touch.diffY = touch.currentY - touch.startY;

    if (touch.isScrolling === null) {
      const angle = Math.abs(Math.atan2(Math.abs(touch.diffY), Math.abs(touch.diffX)) * 180 / Math.PI);
      touch.isScrolling = isHorizontal() ? angle > (options.touchAngle ?? 45) : angle < (90 - (options.touchAngle ?? 45));
    }

    if (touch.isScrolling) return;
    e.preventDefault?.();

    const diff = isHorizontal() ? touch.diffX : touch.diffY;
    const ratio = options.touchRatio ?? ONE;
    let newTranslate = state.translate + diff * ratio;

    if (options.resistance) {
      const resistRatio = options.resistanceRatio ?? 0.85;
      if (newTranslate > ZERO) {
        newTranslate = ZERO + newTranslate * resistRatio;
      }
      const maxTranslate = -(state.snapGrid[state.snapGrid.length - ONE] ?? ZERO);
      if (newTranslate < maxTranslate) {
        newTranslate = maxTranslate + (newTranslate - maxTranslate) * resistRatio;
      }
    }

    if (options.followFinger !== false) {
      setTranslate(newTranslate);
    }

    touch.startX = touch.currentX;
    touch.startY = touch.currentY;

    emitter.emit('touchMove', { ...touch });
    modules.forEach((mod) => mod.onTouchMove?.({ ...touch }));
  }

  function onTouchEnd(): void {
    if (!touch.isTouching) return;
    touch.isTouching = false;
    state.isTouching = false;

    emitter.emit('touchEnd', { ...touch });
    modules.forEach((mod) => mod.onTouchEnd?.({ ...touch }));

    const totalDiff = isHorizontal()
      ? touch.currentX - touch.startX + touch.diffX
      : touch.currentY - touch.startY + touch.diffY;
    const elapsed = Date.now() - touch.startTime;
    const isShortSwipe = elapsed < (options.longSwipesMs ?? 300);
    const threshold = options.threshold ?? 5;

    if (Math.abs(totalDiff) < threshold) {
      slideTo(state.activeIndex);
      return;
    }

    if (isShortSwipe && options.shortSwipes !== false) {
      if (totalDiff < ZERO) slideNext();
      else slidePrev();
    } else {
      const ratio = options.longSwipesRatio ?? 0.5;
      const containerSize = isHorizontal() ? state.width : state.height;
      if (Math.abs(totalDiff) > containerSize * ratio) {
        if (totalDiff < ZERO) slideNext();
        else slidePrev();
      } else {
        slideTo(state.activeIndex);
      }
    }
  }

  // ── Resize ──────────────────────────────────────────
  function onResize(): void {
    updateSize();
    updateSlides();
    slideTo(state.activeIndex, ZERO, false);
    updateProgress();
    emitter.emit('resize');
    modules.forEach((mod) => mod.onResize?.());
    applyBreakpoints();
  }

  // ── Breakpoints ─────────────────────────────────────
  function applyBreakpoints(): void {
    if (!options.breakpoints) return;
    const width = window.innerWidth;
    const breakpoints = Object.keys(options.breakpoints)
      .map(Number)
      .sort((a, b) => a - b);

    let matched: number | null = null;
    for (const bp of breakpoints) {
      if (width >= bp) matched = bp;
    }

    if (matched !== null && options.breakpoints[matched]) {
      const bpOpts = options.breakpoints[matched];
      options = { ...resolveOptions(userOptions), ...bpOpts } as RailInstance['options'];
      updateSlides();
      slideTo(state.activeIndex, ZERO, false);
      emitter.emit('breakpoint', matched);
    }
  }

  // ── Cursor ──────────────────────────────────────────
  function updateCursor(): void {
    if (!state.containerEl) return;
    if (options.grabCursor && options.allowTouchMove && !state.isLocked) {
      state.containerEl.style.cursor = state.isTouching ? 'grabbing' : 'grab';
      state.containerEl.classList.toggle('rail-grabbed', state.isTouching);
    } else {
      state.containerEl.style.cursor = '';
      state.containerEl.classList.remove('rail-grabbed');
    }
  }

  // ── Module Management ───────────────────────────────
  function attachModule(factory: RailModuleFactory): void {
    const mod = factory(instance);
    modules.set(mod.name, mod);
    if (state.mounted) mod.init();
  }

  function detachModule(name: string): void {
    const mod = modules.get(name);
    if (mod) {
      mod.destroy();
      modules.delete(name);
    }
  }

  function getModule<T extends RailModule>(name: string): T | undefined {
    return modules.get(name) as T | undefined;
  }

  // ── Lifecycle ───────────────────────────────────────
  function init(container: HTMLElement): void {
    if (state.mounted) return;
    state.containerEl = container;
    state.wrapperEl = container.querySelector('.rail-wrapper') as HTMLElement;

    if (!state.wrapperEl) {
      const wrapper = document.createElement('div');
      wrapper.className = 'rail-wrapper';
      while (container.firstChild) wrapper.appendChild(container.firstChild);
      container.appendChild(wrapper);
      state.wrapperEl = wrapper;
    }

    container.classList.add('rail-container');
    container.classList.add(isHorizontal() ? 'rail-horizontal' : 'rail-vertical');

    updateSize();
    updateSlides();

    if (options.initialSlide && options.initialSlide > ZERO) {
      slideTo(options.initialSlide, ZERO, false);
    }

    updateSlidesClasses();
    updateProgress();
    updateCursor();

    // Bind events
    if (options.simulateTouch !== false) {
      container.addEventListener('mousedown', onTouchStart, { passive: true });
      document.addEventListener('mousemove', onTouchMove, { passive: false });
      document.addEventListener('mouseup', onTouchEnd, { passive: true });
    }
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    // Resize observer
    resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(container);

    // Mutation observer
    if (options.observer) {
      mutationObserver = new MutationObserver(() => {
        instance.update();
      });
      mutationObserver.observe(state.wrapperEl, { childList: true, subtree: false });
      if (options.observeParents && container.parentElement) {
        mutationObserver.observe(container.parentElement, { childList: true, subtree: false });
      }
    }

    state.mounted = true;

    // Init modules (must come after state.mounted = true so attachModule calls mod.init)
    if (options.modules) {
      options.modules.forEach((factory) => {
        if (!modules.has(factory.name ?? '')) {
          attachModule(factory);
        }
      });
    }

    // Bind user event handlers
    if (options.on) {
      (Object.entries(options.on) as [keyof RailEvents, RailEvents[keyof RailEvents]][]).forEach(([event, handler]) => {
        if (handler) emitter.on(event, handler);
      });
    }
    applyBreakpoints();
    emitter.emit('init');
  }

  function destroy(): void {
    if (state.destroyed) return;

    modules.forEach((mod) => mod.destroy());
    modules.clear();

    if (state.containerEl) {
      state.containerEl.removeEventListener('mousedown', onTouchStart);
      state.containerEl.removeEventListener('touchstart', onTouchStart);
      state.containerEl.removeEventListener('touchmove', onTouchMove);
      state.containerEl.removeEventListener('touchend', onTouchEnd);
    }
    document.removeEventListener('mousemove', onTouchMove);
    document.removeEventListener('mouseup', onTouchEnd);

    resizeObserver?.disconnect();
    mutationObserver?.disconnect();

    if (animationFrame) cancelAnimationFrame(animationFrame);

    emitter.emit('destroy');
    emitter.removeAll();

    state.mounted = false;
    state.destroyed = true;
    state.wrapperEl = null;
    state.containerEl = null;
  }

  function update(): void {
    updateSize();
    updateSlides();
    updateSlidesClasses();
    updateProgress();
    modules.forEach((mod) => mod.update?.());
    emitter.emit('update');
  }

  function enable(): void {
    state.isLocked = false;
    options.allowTouchMove = true;
    updateCursor();
    emitter.emit('unlock');
  }

  function disable(): void {
    state.isLocked = true;
    options.allowTouchMove = false;
    updateCursor();
    emitter.emit('lock');
  }

  function changeDirection(dir: RailDirection): void {
    if (!state.containerEl) return;
    options.direction = dir;
    state.containerEl.classList.remove('rail-horizontal', 'rail-vertical');
    state.containerEl.classList.add(dir === 'horizontal' ? 'rail-horizontal' : 'rail-vertical');
    update();
    slideTo(state.activeIndex, ZERO, false);
  }

  // ── Instance ────────────────────────────────────────
  const instance: RailInstance = {
    get state() { return state; },
    get options() { return options; },

    slideTo,
    slideNext,
    slidePrev,
    slideToLoop,

    update,
    updateSize,
    updateSlides,
    updateProgress,
    updateSlidesClasses,
    changeDirection,

    setTranslate,
    setTransition,
    getTranslate,

    enable,
    disable,
    destroy,
    init,

    on: (event, handler) => emitter.on(event, handler),
    off: (event, handler) => emitter.off(event, handler),
    emit: (event, ...args) => emitter.emit(event, ...args),

    getModule,
    attachModule,
    detachModule,

    autoplayStart: () => emitter.emit('autoplayStart'),
    autoplayStop: () => emitter.emit('autoplayStop'),
    autoplayPause: () => emitter.emit('autoplayPause'),
    autoplayResume: () => emitter.emit('autoplayResume'),
  };

  return instance;
}
