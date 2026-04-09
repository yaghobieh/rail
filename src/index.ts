// Core
export { createRail } from './core';
export { EventEmitter } from './core';

// Components
export { Rail, RailSlide, RailNavigation, RailPagination, RailContext, useRailContext, RailVideo } from './components';
export type { RailRef } from './components';
export type { RailNavigationProps } from './components';
export type { RailPaginationProps } from './components';
export type { RailVideoProps } from './components';

// Hooks
export { useRail } from './hooks';

// Modules
export {
  Navigation,
  Pagination,
  Scrollbar,
  Autoplay,
  Keyboard,
  Mousewheel,
  Virtual,
  Parallax,
  FreeMode,
  Grid,
  Manipulation,
  appendSlide,
  prependSlide,
  addSlide,
  removeSlide,
  removeAllSlides,
  Zoom,
  Controller,
  A11y,
  History,
  HashNavigation,
  Thumbs,
  EffectFade,
  EffectCube,
  EffectFlip,
  EffectCoverflow,
  EffectCards,
  EffectCreative,
  EffectTinder,
  EffectStack,
  EffectSlicer,
  EffectGL,
  StoryMode,
} from './modules';

// Constants
export { DEFAULTS, CSS_CLASSES, TRANSITION_DEFAULTS, STORY_DEFAULTS } from './constants';

// Types
export type {
  RailOptions,
  RailState,
  RailInstance,
  RailModule,
  RailModuleFactory,
  RailEvents,
  RailEventHandler,
  RailDirection,
  RailEffect,
  RailBreakpoints,
  RailBreakpointConfig,
  SlideData,
  TouchData,
  TransitionOptions,
  NavigationOptions,
  PaginationOptions,
  PaginationBulletRender,
  ScrollbarOptions,
  AutoplayOptions,
  KeyboardOptions,
  MousewheelOptions,
  VirtualOptions,
  VirtualData,
  ParallaxOptions,
  FreeModeOptions,
  GridOptions,
  ZoomOptions,
  ControllerOptions,
  A11yOptions,
  HistoryOptions,
  HashNavigationOptions,
  ThumbsOptions,
  FadeEffectOptions,
  CubeEffectOptions,
  FlipEffectOptions,
  CoverflowEffectOptions,
  CardsEffectOptions,
  CreativeEffectOptions,
  StoryModeOptions,
  StorySlide,
  ControlVisibility,
  NavArrowStyle,
  NavArrowIcon,
  RailProps,
  RailSlideProps,
  UseRailReturn,
} from './types';
