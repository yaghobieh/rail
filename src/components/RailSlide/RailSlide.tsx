import React, { forwardRef, type CSSProperties } from 'react';
import type { RailSlideProps } from '../../types';
import {
  RAIL_SLIDE_BEM,
  RAIL_SLIDE_CLASS,
  RAIL_ZOOM_CONTAINER_CLASS,
  DEFAULT_TAG,
  VIRTUAL_INDEX_ATTR,
} from './RailSlide.const';

/**
 * Individual slide within a Rail carousel. Supports zoom wrapping,
 * virtual indexing, and lazy loading.
 *
 * @example
 * ```tsx
 * <RailSlide>
 *   <img src="photo.jpg" alt="Gallery image" />
 * </RailSlide>
 * ```
 */
export const RailSlide = forwardRef<HTMLDivElement, RailSlideProps>(function RailSlide(props, ref) {
  const {
    children,
    className = '',
    style,
    tag: Tag = DEFAULT_TAG,
    virtualIndex,
    zoom,
    lazy,
  } = props;

  const slideStyle: CSSProperties = { ...style };
  const attrs: Record<string, string | number | undefined> = {};

  if (virtualIndex !== undefined) {
    attrs[VIRTUAL_INDEX_ATTR] = virtualIndex;
  }

  const content = zoom ? (
    <div className={RAIL_ZOOM_CONTAINER_CLASS}>{children}</div>
  ) : children;

  const El = Tag as React.ElementType;

  return (
    <El
      ref={ref}
      className={`${RAIL_SLIDE_BEM} ${RAIL_SLIDE_CLASS} ${className}`.trim()}
      style={slideStyle}
      {...attrs}
    >
      {content}
    </El>
  );
});
