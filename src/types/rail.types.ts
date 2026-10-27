import type { CSSProperties, ReactNode, RefObject } from 'react';

// ── Direction & Layout ──────────────────────────────
export type RailDirection = 'horizontal' | 'vertical';
export type RailEffect = 'slide' | 'fade' | 'cube' | 'flip' | 'coverflow' | 'cards' | 'creative';

// ── Breakpoints ─────────────────────────────────────
export type RailBreakpointConfig = Partial<Omit<RailOptions, 'breakpoints' | 'modules' | 'on'>>;
export type RailBreakpoints = Record<number, RailBreakpointConfig>;

// ── Slide Data ──────────────────────────────────────
export interface SlideData {
  index: number;
  isActive: boolean;
  isVisible: boolean;
  isPrev: boolean;
  isNext: boolean;
  isDuplicate: boolean;
  progress: number;
  offset: number;
}

// ── Touch Data ──────────────────────────────────────
export interface TouchData {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  diffX: number;
  diffY: number;
  startTime: number;
  isTouching: boolean;
  isScrolling: boolean | null;
}

// ── Transition ──────────────────────────────────────
export interface TransitionOptions {
  duration?: number;
  easing?: string;
  delay?: number;
}

// ── Module Factories ────────────────────────────────
export type RailModuleFactory = (instance: RailInstance) => RailModule;

export interface RailModule {
  name: string;
  init: () => void;
  destroy: () => void;
  update?: () => void;
  onSlideChange?: (index: number) => void;
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
  onResize?: () => void;
  onTouchStart?: (data: TouchData) => void;
  onTouchMove?: (data: TouchData) => void;
  onTouchEnd?: (data: TouchData) => void;
}

// ── Event System ────────────────────────────────────
export type RailEventHandler = (...args: unknown[]) => void;

export interface RailEvents {
  init: () => void;
  destroy: () => void;
  slideChange: (index: number, prevIndex: number) => void;
  slideChangeTransitionStart: (index: number) => void;
  slideChangeTransitionEnd: (index: number) => void;
  transitionStart: () => void;
  transitionEnd: () => void;
  touchStart: (data: TouchData) => void;
  touchMove: (data: TouchData) => void;
  touchEnd: (data: TouchData) => void;
  resize: () => void;
  reachBeginning: () => void;
  reachEnd: () => void;
  progress: (progress: number) => void;
  beforeSlideChangeStart: (index: number) => void;
  autoplayStart: () => void;
  autoplayStop: () => void;
  autoplayPause: () => void;
  autoplayResume: () => void;
  click: (event: MouseEvent) => void;
  tap: (event: TouchEvent | MouseEvent) => void;
  breakpoint: (breakpoint: number | null) => void;
  lock: () => void;
  unlock: () => void;
  update: () => void;
  // Story mode events
  storyProgress: (slideIndex: number, progress: number) => void;
  storyComplete: () => void;
  storyPause: () => void;
  storyResume: () => void;
}

// ── Core Options ────────────────────────────────────
export interface RailOptions {
  direction?: RailDirection;
  initialSlide?: number;
  speed?: number;
  spaceBetween?: number;
  slidesPerView?: number | 'auto';
  slidesPerGroup?: number;
  centeredSlides?: boolean;
  loop?: boolean;
  loopAdditionalSlides?: number;
  allowTouchMove?: boolean;
  touchRatio?: number;
  touchAngle?: number;
  threshold?: number;
  resistance?: boolean;
  resistanceRatio?: number;
  grabCursor?: boolean;
  watchOverflow?: boolean;
  watchSlidesProgress?: boolean;
  cssMode?: boolean;
  effect?: RailEffect;
  breakpoints?: RailBreakpoints;
  observer?: boolean;
  observeParents?: boolean;
  preventInteractionOnTransition?: boolean;
  edgeSwipeDetection?: boolean;
  edgeSwipeThreshold?: number;
  freeMode?: FreeModeOptions | boolean;
  autoHeight?: boolean;
  roundLengths?: boolean;
  nested?: boolean;
  uniqueNavElements?: boolean;
  shortSwipes?: boolean;
  longSwipesRatio?: number;
  longSwipesMs?: number;
  followFinger?: boolean;
  simulateTouch?: boolean;

  // Module options
  navigation?: NavigationOptions | boolean;
  pagination?: PaginationOptions | boolean;
  scrollbar?: ScrollbarOptions | boolean;
  autoplay?: AutoplayOptions | boolean;
  keyboard?: KeyboardOptions | boolean;
  mousewheel?: MousewheelOptions | boolean;
  virtual?: VirtualOptions | boolean;
  lazy?: LazyOptions | boolean;
  parallax?: ParallaxOptions | boolean;
  grid?: GridOptions;
  zoom?: ZoomOptions | boolean;
  controller?: ControllerOptions;
  a11y?: A11yOptions | boolean;
  history?: HistoryOptions;
  hashNavigation?: HashNavigationOptions | boolean;
  thumbs?: ThumbsOptions;
  fadeEffect?: FadeEffectOptions;
  cubeEffect?: CubeEffectOptions;
  flipEffect?: FlipEffectOptions;
  coverflowEffect?: CoverflowEffectOptions;
  cardsEffect?: CardsEffectOptions;
  creativeEffect?: CreativeEffectOptions;
  storyMode?: StoryModeOptions | boolean;
  marquee?: MarqueeOptions | boolean;
  counter?: CounterOptions | boolean;

  modules?: RailModuleFactory[];
  on?: Partial<{ [K in keyof RailEvents]: RailEvents[K] }>;
}

// ── Rail State ──────────────────────────────────────
export interface RailState {
  activeIndex: number;
  previousIndex: number;
  realIndex: number;
  slidesCount: number;
  isBeginning: boolean;
  isEnd: boolean;
  isLocked: boolean;
  isAnimating: boolean;
  isTouching: boolean;
  progress: number;
  translate: number;
  snapGrid: number[];
  slidesGrid: number[];
  slidesSizesGrid: number[];
  velocity: number;
  allowSlideNext: boolean;
  allowSlidePrev: boolean;
  width: number;
  height: number;
  wrapperEl: HTMLElement | null;
  containerEl: HTMLElement | null;
  mounted: boolean;
  destroyed: boolean;
  // Virtual
  virtualData: VirtualData | null;
  // Autoplay
  autoplayRunning: boolean;
  autoplayPaused: boolean;
  // Story
  storyProgress: number;
}

// ── Rail Instance ───────────────────────────────────
export interface RailInstance {
  readonly state: RailState;
  readonly options: Required<Pick<RailOptions, 'direction' | 'speed' | 'spaceBetween' | 'slidesPerView' | 'slidesPerGroup'>> & RailOptions;

  slideTo: (index: number, speed?: number, runCallbacks?: boolean) => void;
  slideNext: (speed?: number, runCallbacks?: boolean) => void;
  slidePrev: (speed?: number, runCallbacks?: boolean) => void;
  slideToLoop: (index: number, speed?: number, runCallbacks?: boolean) => void;

  update: () => void;
  updateSize: () => void;
  updateSlides: () => void;
  updateProgress: () => void;
  updateSlidesClasses: () => void;
  changeDirection: (direction: RailDirection) => void;

  setTranslate: (translate: number) => void;
  setTransition: (duration: number) => void;
  getTranslate: () => number;

  enable: () => void;
  disable: () => void;
  destroy: () => void;
  init: (container: HTMLElement) => void;

  on: <K extends keyof RailEvents>(event: K, handler: RailEvents[K]) => void;
  off: <K extends keyof RailEvents>(event: K, handler: RailEvents[K]) => void;
  emit: <K extends keyof RailEvents>(event: K, ...args: Parameters<RailEvents[K]>) => void;

  getModule: <T extends RailModule>(name: string) => T | undefined;
  attachModule: (factory: RailModuleFactory) => void;
  detachModule: (name: string) => void;

  // Autoplay methods
  autoplayStart: () => void;
  autoplayStop: () => void;
  autoplayPause: () => void;
  autoplayResume: () => void;
}

// ── Module Options ──────────────────────────────────

export type NavArrowStyle = 'circle' | 'plain' | 'rounded';
export type NavArrowIcon = 'chevron' | 'arrow' | 'chevrons' | 'arrowCircle' | 'navigate';

export interface NavigationOptions {
  enabled?: boolean;
  nextEl?: string | HTMLElement | null;
  prevEl?: string | HTMLElement | null;
  hideOnClick?: boolean;
  disabledClass?: string;
  hiddenClass?: string;
  lockClass?: string;
  arrowStyle?: NavArrowStyle;
  arrowIcon?: NavArrowIcon;
  arrowColor?: string;
  arrowSize?: number;
}

export interface PaginationOptions {
  enabled?: boolean;
  el?: string | HTMLElement | null;
  type?: 'bullets' | 'fraction' | 'progressbar' | 'custom';
  clickable?: boolean;
  dynamicBullets?: boolean;
  dynamicMainBullets?: number;
  hideOnClick?: boolean;
  renderBullet?: PaginationBulletRender;
  renderFraction?: (current: number, total: number) => string;
  renderProgressbar?: (progress: number) => string;
  bulletClass?: string;
  bulletActiveClass?: string;
}

export type PaginationBulletRender = (index: number, className: string) => string;

export interface ScrollbarOptions {
  enabled?: boolean;
  el?: string | HTMLElement | null;
  hide?: boolean;
  draggable?: boolean;
  snapOnRelease?: boolean;
  dragSize?: number | 'auto';
}

export interface AutoplayOptions {
  enabled?: boolean;
  delay?: number;
  stopOnLastSlide?: boolean;
  disableOnInteraction?: boolean;
  reverseDirection?: boolean;
  waitForTransition?: boolean;
  pauseOnMouseEnter?: boolean;
  pauseOnReducedMotion?: boolean;
}

export interface MarqueeOptions {
  enabled?: boolean;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  pauseOnReducedMotion?: boolean;
  /** Fade the left and right edges of the strip. */
  fade?: boolean;
  /** Pause the strip while the carousel is outside the viewport. */
  pauseOffscreen?: boolean;
}

export interface CounterOptions {
  enabled?: boolean;
  el?: string | HTMLElement | null;
  separator?: string;
}

export interface KeyboardOptions {
  enabled?: boolean;
  onlyInViewport?: boolean;
  pageUpDown?: boolean;
}

export interface MousewheelOptions {
  enabled?: boolean;
  forceToAxis?: boolean;
  releaseOnEdges?: boolean;
  invert?: boolean;
  sensitivity?: number;
  eventsTarget?: string | HTMLElement | 'container';
  thresholdDelta?: number | null;
  thresholdTime?: number | null;
}

export interface VirtualOptions {
  enabled?: boolean;
  slides?: unknown[];
  cache?: boolean;
  addSlidesBefore?: number;
  addSlidesAfter?: number;
  renderSlide?: (slide: unknown, index: number) => ReactNode;
  renderExternal?: (data: VirtualData) => void;
}

export interface VirtualData {
  offset: number;
  from: number;
  to: number;
  slides: unknown[];
}

export interface ParallaxOptions {
  enabled?: boolean;
}

export interface FreeModeOptions {
  enabled?: boolean;
  momentum?: boolean;
  momentumRatio?: number;
  momentumBounce?: boolean;
  momentumBounceRatio?: number;
  momentumVelocityRatio?: number;
  sticky?: boolean;
  minimumVelocity?: number;
}

export interface GridOptions {
  rows?: number;
  fill?: 'row' | 'column';
}

export interface ZoomOptions {
  enabled?: boolean;
  maxRatio?: number;
  minRatio?: number;
  toggle?: boolean;
  containerClass?: string;
}

export interface ControllerOptions {
  control?: RailInstance | RailInstance[];
  inverse?: boolean;
  by?: 'slide' | 'container';
}

export interface A11yOptions {
  enabled?: boolean;
  prevSlideMessage?: string;
  nextSlideMessage?: string;
  firstSlideMessage?: string;
  lastSlideMessage?: string;
  paginationBulletMessage?: string;
  slideLabelMessage?: string;
  slideRole?: string;
  containerRole?: string;
  containerRoleDescriptionMessage?: string;
  containerMessage?: string;
  itemRoleDescriptionMessage?: string;
  id?: string;
  focusOnChange?: boolean;
  rovingTabindex?: boolean;
}

export interface LazyOptions {
  enabled?: boolean;
  checkInView?: boolean;
  loadPrevNext?: boolean;
  loadOnTransitionStart?: boolean;
  elementClass?: string;
  loadingClass?: string;
  loadedClass?: string;
  preloaderClass?: string;
}

export interface HistoryOptions {
  enabled?: boolean;
  root?: string;
  replaceState?: boolean;
  key?: string;
}

export interface HashNavigationOptions {
  enabled?: boolean;
  replaceState?: boolean;
  watchState?: boolean;
}

export interface ThumbsOptions {
  rail?: RailInstance;
  slideThumbActiveClass?: string;
  thumbsContainerClass?: string;
  multipleActiveThumbs?: boolean;
  autoScrollOffset?: number;
}

// ── Effect Options ──────────────────────────────────

export interface FadeEffectOptions {
  crossFade?: boolean;
}

export interface CubeEffectOptions {
  slideShadows?: boolean;
  shadow?: boolean;
  shadowOffset?: number;
  shadowScale?: number;
}

export interface FlipEffectOptions {
  slideShadows?: boolean;
  limitRotation?: boolean;
}

export interface CoverflowEffectOptions {
  slideShadows?: boolean;
  rotate?: number;
  stretch?: number;
  depth?: number;
  modifier?: number;
  scale?: number;
}

export interface CardsEffectOptions {
  slideShadows?: boolean;
  rotate?: boolean;
  perSlideOffset?: number;
  perSlideRotate?: number;
}

export interface CreativeEffectOptions {
  prev?: {
    translate?: [number | string, number | string, number];
    rotate?: [number, number, number];
    opacity?: number;
    scale?: number;
    shadow?: boolean;
    origin?: string;
  };
  next?: {
    translate?: [number | string, number | string, number];
    rotate?: [number, number, number];
    opacity?: number;
    scale?: number;
    shadow?: boolean;
    origin?: string;
  };
  limitProgress?: number;
  progressMultiplier?: number;
  shadowPerProgress?: boolean;
  perspective?: boolean;
}

// ── Story Mode ──────────────────────────────────────
export interface StorySlide {
  content: ReactNode;
  duration?: number;
  background?: string;
  overlay?: ReactNode;
}

export type ControlVisibility = 'always' | 'hover' | 'none';

export interface StoryModeOptions {
  enabled?: boolean;
  duration?: number;
  pauseOnTap?: boolean;
  pauseOnHold?: boolean;
  tapToNavigate?: boolean;
  showProgress?: boolean;
  progressColor?: string;
  progressHeight?: number;
  closeOnEnd?: boolean;
  disableSwipe?: boolean;
  controlVisibility?: ControlVisibility;
  onComplete?: () => void;
}

// ── React Component Props ───────────────────────────
export interface RailProps extends RailOptions {
  children?: ReactNode;
  className?: string;
  wrapperClassName?: string;
  style?: CSSProperties;
  wrapperStyle?: CSSProperties;
  tag?: keyof JSX.IntrinsicElements;
  wrapperTag?: keyof JSX.IntrinsicElements;
  onRail?: (instance: RailInstance) => void;
}

export interface RailSlideProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  tag?: keyof JSX.IntrinsicElements;
  virtualIndex?: number;
  zoom?: boolean;
  lazy?: boolean;
}

export interface RailRef {
  rail: RailInstance | null;
}

// ── Hook Return ─────────────────────────────────────
export interface UseRailReturn {
  activeIndex: number;
  realIndex: number;
  isBeginning: boolean;
  isEnd: boolean;
  isLocked: boolean;
  progress: number;
  slidesCount: number;
  autoplayRunning: boolean;
  autoplayPaused: boolean;
  slideNext: (speed?: number) => void;
  slidePrev: (speed?: number) => void;
  slideTo: (index: number, speed?: number) => void;
  update: () => void;
  autoplayStart: () => void;
  autoplayStop: () => void;
}
