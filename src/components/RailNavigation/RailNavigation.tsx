import type { FC } from 'react';
import type { RailNavigationProps } from './RailNavigation.types';
import {
  RAIL_NAV_BEM,
  RAIL_NAV_PREV_CLASS,
  RAIL_NAV_NEXT_CLASS,
  PREV_POINTS,
  NEXT_POINTS,
  NAV_ICON_SIZE,
} from './RailNavigation.const';
import { NavArrowSvg } from './helpers/NavArrowSvg';

/**
 * Default navigation component for Rail carousels. Renders prev/next
 * buttons with customizable icons. Accepts any ReactNode as `prevIcon`
 * or `nextIcon`; falls back to built-in SVG chevrons when not provided.
 *
 * @example
 * ```tsx
 * // Default SVG arrows
 * <RailNavigation />
 *
 * // Custom icons (e.g. Bear icons)
 * <RailNavigation
 *   prevIcon={<BearIcons.ChevronLeftIcon size="sm" />}
 *   nextIcon={<BearIcons.ChevronRightIcon size="sm" />}
 * />
 * ```
 */
export const RailNavigation: FC<RailNavigationProps> = ({
  className = '',
  style,
  prevIcon,
  nextIcon,
  iconSize = NAV_ICON_SIZE,
  prevDisabled = false,
  nextDisabled = false,
  prevAriaLabel = 'Previous slide',
  nextAriaLabel = 'Next slide',
  renderPrev,
  renderNext,
}) => {
  const noop = () => {};

  const defaultPrev = prevIcon ?? <NavArrowSvg points={PREV_POINTS} size={iconSize} />;
  const defaultNext = nextIcon ?? <NavArrowSvg points={NEXT_POINTS} size={iconSize} />;

  return (
    <>
      {renderPrev ? (
        renderPrev(noop)
      ) : (
        <button
          className={`${RAIL_NAV_BEM}__prev ${RAIL_NAV_PREV_CLASS} ${className}`.trim()}
          style={style}
          type="button"
          aria-label={prevAriaLabel}
          disabled={prevDisabled}
        >
          {defaultPrev}
        </button>
      )}
      {renderNext ? (
        renderNext(noop)
      ) : (
        <button
          className={`${RAIL_NAV_BEM}__next ${RAIL_NAV_NEXT_CLASS} ${className}`.trim()}
          style={style}
          type="button"
          aria-label={nextAriaLabel}
          disabled={nextDisabled}
        >
          {defaultNext}
        </button>
      )}
    </>
  );
};
