import React, { forwardRef, useEffect, useRef, type CSSProperties } from 'react';
import type { RailSlideProps } from '../../types';
import {
  RAIL_SLIDE_BEM,
  RAIL_SLIDE_CLASS,
  RAIL_ZOOM_CONTAINER_CLASS,
  DEFAULT_TAG,
  VIRTUAL_INDEX_ATTR,
  RAIL_LAZY_CLASS,
  RAIL_LAZY_SLIDE_CLASS,
  DATA_SRC_ATTR,
} from './RailSlide.const';

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

  const localRef = useRef<HTMLDivElement | null>(null);

  const setRefs = (node: HTMLDivElement | null) => {
    localRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (!lazy || !localRef.current) return;
    const root = localRef.current;
    const images = root.querySelectorAll('img');
    images.forEach((img) => {
      if (img.getAttribute('src') && !img.getAttribute(DATA_SRC_ATTR) && !img.classList.contains(RAIL_LAZY_CLASS)) {
        img.setAttribute(DATA_SRC_ATTR, img.getAttribute('src') ?? '');
        img.removeAttribute('src');
        img.classList.add(RAIL_LAZY_CLASS);
        img.setAttribute('loading', 'lazy');
      } else if (!img.getAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
        img.classList.add(RAIL_LAZY_CLASS);
      }
    });
  }, [lazy, children]);

  const slideStyle: CSSProperties = { ...style };
  const attrs: Record<string, string | number | undefined> = {};

  if (virtualIndex !== undefined) {
    attrs[VIRTUAL_INDEX_ATTR] = virtualIndex;
  }

  const content = zoom ? (
    <div className={RAIL_ZOOM_CONTAINER_CLASS}>{children}</div>
  ) : children;

  const El = Tag as React.ElementType;
  const lazyClass = lazy ? `${RAIL_LAZY_SLIDE_CLASS} ${RAIL_LAZY_CLASS}` : '';

  return (
    <El
      ref={setRefs}
      className={`${RAIL_SLIDE_BEM} ${RAIL_SLIDE_CLASS} ${lazyClass} ${className}`.trim()}
      style={slideStyle}
      {...attrs}
    >
      {content}
    </El>
  );
});
