import React, {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import type { RailProps, RailInstance } from '../../types';
import type { RailRef } from './Rail.types';
import { createRail } from '../../core';
import { RailContext } from '../RailContext';
import {
  RAIL_CONTAINER_CLASS,
  RAIL_WRAPPER_CLASS,
  RAIL_HORIZONTAL_CLASS,
  RAIL_VERTICAL_CLASS,
  RAIL_BEM,
  DEFAULT_TAG,
} from './Rail.const';

/**
 * Main Rail carousel component. Initializes the core engine, provides context
 * to child components, and renders the container and wrapper elements.
 *
 * @example
 * ```tsx
 * <Rail modules={[Navigation, Pagination]} slidesPerView={3} spaceBetween={24} navigation>
 *   <RailSlide>Slide 1</RailSlide>
 *   <RailSlide>Slide 2</RailSlide>
 * </Rail>
 * ```
 */
export const Rail = forwardRef<RailRef, RailProps>(function Rail(props, ref) {
  const {
    children,
    className = '',
    wrapperClassName = '',
    style,
    wrapperStyle,
    tag: Tag = DEFAULT_TAG,
    wrapperTag: WrapperTag = DEFAULT_TAG,
    onRail,
    ...options
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<RailInstance | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initRef.current) return;
    initRef.current = true;

    const rail = createRail(options);
    rail.init(containerRef.current);
    setInstance(rail);
    onRail?.(rail);

    return () => {
      rail.destroy();
      initRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({ rail: instance }), [instance]);

  const dirClass = options.direction === 'vertical' ? RAIL_VERTICAL_CLASS : RAIL_HORIZONTAL_CLASS;

  const ContainerEl = Tag as React.ElementType;
  const WrapperEl = WrapperTag as React.ElementType;

  return (
    <RailContext.Provider value={instance}>
      <ContainerEl
        ref={containerRef}
        className={`${RAIL_BEM} ${RAIL_CONTAINER_CLASS} ${dirClass} ${className}`.trim()}
        style={style}
      >
        <WrapperEl
          className={`${RAIL_BEM}__wrapper ${RAIL_WRAPPER_CLASS} ${wrapperClassName}`.trim()}
          style={wrapperStyle}
        >
          {children}
        </WrapperEl>
      </ContainerEl>
    </RailContext.Provider>
  );
});
