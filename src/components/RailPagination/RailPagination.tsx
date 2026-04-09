import type { FC } from 'react';
import type { RailPaginationProps } from './RailPagination.types';
import { RAIL_PAGINATION_BEM, RAIL_PAGINATION_CLASS } from './RailPagination.const';

/**
 * Default pagination component for Rail carousels.
 * Renders a container that the pagination module populates with bullet/fraction indicators.
 *
 * @example
 * ```tsx
 * <RailPagination />
 * ```
 */
export const RailPagination: FC<RailPaginationProps> = ({
  className = '',
  style,
}) => (
  <div
    className={`${RAIL_PAGINATION_BEM} ${RAIL_PAGINATION_CLASS} ${className}`.trim()}
    style={style}
  />
);
