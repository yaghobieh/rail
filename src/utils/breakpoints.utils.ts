import type { RailBreakpointConfig, RailBreakpoints } from '../types';

export type SlidesPerViewMap = Record<number, number | 'auto'>;

export interface CreateBreakpointsOptions {
  spaceBetween?: number | Record<number, number>;
  overrides?: Record<number, RailBreakpointConfig>;
}

export function createBreakpoints(
  slidesPerViewMap: SlidesPerViewMap,
  options: CreateBreakpointsOptions = {},
): RailBreakpoints {
  const breakpoints: RailBreakpoints = {};
  const widths = Object.keys(slidesPerViewMap)
    .map(Number)
    .sort((a, b) => a - b);

  for (const width of widths) {
    const config: RailBreakpointConfig = {
      slidesPerView: slidesPerViewMap[width],
    };

    if (typeof options.spaceBetween === 'number') {
      config.spaceBetween = options.spaceBetween;
    } else if (options.spaceBetween && options.spaceBetween[width] !== undefined) {
      config.spaceBetween = options.spaceBetween[width];
    }

    if (options.overrides?.[width]) {
      Object.assign(config, options.overrides[width]);
    }

    breakpoints[width] = config;
  }

  return breakpoints;
}

export function slidesPerViewAt(
  breakpoints: RailBreakpoints,
  width: number,
  fallback: number | 'auto' = 1,
): number | 'auto' {
  const keys = Object.keys(breakpoints)
    .map(Number)
    .sort((a, b) => a - b);

  let matched: number | null = null;
  for (const bp of keys) {
    if (width >= bp) matched = bp;
  }

  if (matched === null) return fallback;
  return breakpoints[matched].slidesPerView ?? fallback;
}
